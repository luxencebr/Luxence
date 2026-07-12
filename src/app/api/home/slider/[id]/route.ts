import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { deleteFromSpaces } from "@/lib/deleteFromSpaces";
import { uploadToSpaces } from "@/lib/uploadToSpaces";
import { auth } from "@/auth";
import sharp from "sharp";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const image = await prisma.homeSliderImage.findUnique({
    where: { id },
  });

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (image.url) {
    const key = image.url.split(`/${process.env.DO_SPACES_BUCKET}/`)[1];
    await deleteFromSpaces(key);
  }

  if (image.originalUrl) {
    const key = image.originalUrl.split(`/${process.env.DO_SPACES_BUCKET}/`)[1];
    await deleteFromSpaces(key);
  }

  await prisma.homeSliderImage.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { cropData, zoom } = await _req.json();
  const { id } = await params;

  const image = await prisma.homeSliderImage.findUnique({
    where: { id },
  });

  const response = await fetch(image!.originalUrl!);
  const buffer = Buffer.from(await response.arrayBuffer());

  const croppedBuffer = await sharp(buffer)
    .extract({
      left: cropData.x,
      top: cropData.y,
      width: cropData.width,
      height: cropData.height,
    })
    .toBuffer();

  const newUrl = await uploadToSpaces({
    buffer: croppedBuffer,
    filename: `${id}-cropped.jpg`,
    contentType: "image/jpeg",
    folder: "home-slider",
  });

  const updated = await prisma.homeSliderImage.update({
    where: { id },
    data: {
      url: newUrl,
      cropX: cropData.x,
      cropY: cropData.y,
      cropWidth: cropData.width,
      cropHeight: cropData.height,
      cropZoom: zoom,
    },
  });

  return NextResponse.json(updated);
}
