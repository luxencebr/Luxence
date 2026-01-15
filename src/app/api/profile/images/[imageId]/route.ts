import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { deleteFromSpaces } from "@/lib/deleteFromSpaces";
import { uploadToSpaces } from "@/lib/uploadToSpaces";
import sharp from "sharp";

interface ProfileImage {
  id: string;
  url?: string;
  originalUrl?: string;
  name?: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom?: number;
  };
}

function isImageArray(value: unknown): value is ProfileImage[] {
  return (
    Array.isArray(value) &&
    value.every((img) => typeof img === "object" && img !== null && "id" in img)
  );
}

/* ========================= DELETE ========================= */

export async function DELETE(req: Request, context: any) {
  try {
    const { imageId } = context.params;

    const profiles = await prisma.producerProfile.findMany();

    const profile = profiles.find(
      (p) =>
        isImageArray(p.images) && p.images.some((img) => img.id === imageId)
    );

    if (!profile || !isImageArray(profile.images)) {
      return NextResponse.json(
        { error: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    const images = profile.images;
    const image = images.find((img) => img.id === imageId);

    if (!image) {
      return NextResponse.json({ error: "Imagem inválida" }, { status: 400 });
    }

    if (typeof image.url === "string") {
      const key = image.url.split(`/${process.env.DO_SPACES_BUCKET}/`)[1];
      await deleteFromSpaces(key);
    }

    if (typeof image.originalUrl === "string") {
      const key = image.originalUrl.split(
        `/${process.env.DO_SPACES_BUCKET}/`
      )[1];
      await deleteFromSpaces(key);
    }

    const updatedImages = images.filter((img) => img.id !== imageId);

    await prisma.producerProfile.update({
      where: { id: profile.id },
      data: { images: updatedImages as any },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao deletar imagem" },
      { status: 500 }
    );
  }
}

/* ========================= PATCH ========================= */

export async function PATCH(req: Request, context: any) {
  try {
    const { imageId } = context.params;
    const { cropData, zoom } = await req.json();

    if (!cropData) {
      return NextResponse.json(
        { error: "Dados de crop inválidos" },
        { status: 400 }
      );
    }

    const profiles = await prisma.producerProfile.findMany();

    const profile = profiles.find(
      (p) =>
        isImageArray(p.images) && p.images.some((img) => img.id === imageId)
    );

    if (!profile || !isImageArray(profile.images)) {
      return NextResponse.json(
        { error: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    const images = profile.images;
    const imageIndex = images.findIndex((img) => img.id === imageId);

    if (imageIndex === -1) {
      return NextResponse.json(
        { error: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    const image = images[imageIndex];
    const originalImageUrl = image.originalUrl ?? image.url;

    if (!originalImageUrl) {
      return NextResponse.json(
        { error: "Imagem original não encontrada" },
        { status: 404 }
      );
    }

    const originalResponse = await fetch(originalImageUrl);
    const originalBuffer = Buffer.from(await originalResponse.arrayBuffer());

    const croppedBuffer = await sharp(originalBuffer)
      .extract({
        left: Math.round(cropData.x),
        top: Math.round(cropData.y),
        width: Math.round(cropData.width),
        height: Math.round(cropData.height),
      })
      .toBuffer();

    if (image.url && image.url !== originalImageUrl) {
      const oldKey = image.url.split(`/${process.env.DO_SPACES_BUCKET}/`)[1];
      await deleteFromSpaces(oldKey);
    }

    const newCroppedUrl = await uploadToSpaces({
      buffer: croppedBuffer,
      filename: `${imageId}-cropped-${image.name ?? "image"}`,
      contentType: "image/jpeg",
      folder: `profiles/${profile.id}`,
    });

    const safeImage: ProfileImage = {
      id: image.id,
      url: image.url,
      originalUrl: image.originalUrl,
      name: image.name,
      cropData: image.cropData,
    };

    const updatedImages: ProfileImage[] = [...images];
    updatedImages[imageIndex] = {
      ...safeImage,
      url: newCroppedUrl,
      originalUrl: originalImageUrl,
      cropData: {
        ...cropData,
        zoom,
      },
    };

    await prisma.producerProfile.update({
      where: { id: profile.id },
      data: { images: updatedImages as any },
    });

    return NextResponse.json(updatedImages[imageIndex]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar crop" },
      { status: 500 }
    );
  }
}
