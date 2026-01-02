import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { uploadToSpaces } from "@/lib/uploadToSpaces";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const profileId = Number(formData.get("profileId"));

    if (!file || !profileId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const imageId = randomUUID();

    const url = await uploadToSpaces({
      buffer,
      filename: `${imageId}-${file.name}`,
      contentType: file.type,
      folder: `profiles/${profileId}`,
    });

    const profile = await prisma.producerProfile.findUnique({
      where: { id: profileId },
      select: { images: true },
    });

    const images = Array.isArray(profile?.images) ? profile.images : [];

    const newImage = {
      id: imageId,
      name: file.name,
      url,
    };

    await prisma.producerProfile.update({
      where: { id: profileId },
      data: {
        images: [...images, newImage],
      },
    });

    return NextResponse.json(newImage);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
