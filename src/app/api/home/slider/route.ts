import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { auth } from "@/auth";
import { uploadToSpaces } from "@/lib/uploadToSpaces";
import sharp from "sharp";
import { randomUUID } from "crypto";

export async function GET() {
  const images = await prisma.homeSliderImage.findMany({
    orderBy: { order: "asc" },
  });

  return NextResponse.json(images);
}

export async function POST(req: Request) {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();

  const file = formData.get("file") as File;
  const cropData = JSON.parse(formData.get("crop") as string);
  const zoom = Number(formData.get("zoom"));

  const buffer = Buffer.from(await file.arrayBuffer());
  const imageId = randomUUID();

  const originalUrl = await uploadToSpaces({
    buffer,
    filename: `${imageId}-original-${file.name}`,
    contentType: file.type,
    folder: "home-slider",
  });

  const croppedBuffer = await sharp(buffer)
    .extract({
      left: Math.round(cropData.x),
      top: Math.round(cropData.y),
      width: Math.round(cropData.width),
      height: Math.round(cropData.height),
    })
    .toBuffer();

  const croppedUrl = await uploadToSpaces({
    buffer: croppedBuffer,
    filename: `${imageId}-cropped-${file.name}`,
    contentType: file.type,
    folder: "home-slider",
  });

  const image = await prisma.homeSliderImage.create({
    data: {
      id: imageId,
      name: file.name,
      url: croppedUrl,
      originalUrl,
      cropX: cropData.x,
      cropY: cropData.y,
      cropWidth: cropData.width,
      cropHeight: cropData.height,
      cropZoom: zoom,
    },
  });

  return NextResponse.json(image);
}
