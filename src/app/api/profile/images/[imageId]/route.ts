import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { deleteFromSpaces } from "@/lib/deleteFromSpaces";
import { uploadToSpaces } from "@/lib/uploadToSpaces";
import sharp from "sharp";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const { imageId } = params;

    const profiles = await prisma.producerProfile.findMany();
    const profile = profiles.find(
      (p) =>
        Array.isArray(p.images) &&
        p.images.some((img: any) => img.id === imageId)
    );

    if (!profile || !Array.isArray(profile.images)) {
      return NextResponse.json(
        { error: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    const image = profile.images.find((img: any) => img.id === imageId);

    if (!image || typeof image !== "object") {
      return NextResponse.json({ error: "Imagem inválida" }, { status: 400 });
    }

    if ("url" in image && typeof image.url === "string") {
      const croppedKey = image.url.split(
        `/${process.env.DO_SPACES_BUCKET}/`
      )[1];
      await deleteFromSpaces(croppedKey);
    }

    if ("originalUrl" in image && typeof image.originalUrl === "string") {
      const originalKey = image.originalUrl.split(
        `/${process.env.DO_SPACES_BUCKET}/`
      )[1];
      await deleteFromSpaces(originalKey);
    }

    const updatedImages = profile.images.filter(
      (img: any) => img.id !== imageId
    );

    await prisma.producerProfile.update({
      where: { id: profile.id },
      data: {
        images: updatedImages,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao deletar imagem" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const { imageId } = params;

    const body = await req.json();
    const { cropData, zoom } = body;

    if (!cropData) {
      return NextResponse.json(
        { error: "Dados de crop inválidos" },
        { status: 400 }
      );
    }

    const profiles = await prisma.producerProfile.findMany();
    const profile = profiles.find(
      (p) =>
        Array.isArray(p.images) &&
        p.images.some((img: any) => img.id === imageId)
    );

    if (!profile || !Array.isArray(profile.images)) {
      return NextResponse.json(
        { error: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    const imageIndex = profile.images.findIndex(
      (img: any) => img.id === imageId
    );
    const image = profile.images[imageIndex];

    if (!image || typeof image !== "object") {
      return NextResponse.json(
        { error: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    const originalImageUrl =
      "originalUrl" in image && image.originalUrl
        ? image.originalUrl
        : "url" in image && image.url
        ? image.url
        : null;

    if (!originalImageUrl) {
      return NextResponse.json(
        { error: "Imagem original não encontrada" },
        { status: 404 }
      );
    }

    const originalResponse = await fetch(originalImageUrl as string);
    const originalBuffer = Buffer.from(await originalResponse.arrayBuffer());

    const croppedBuffer = await sharp(originalBuffer)
      .extract({
        left: Math.round(cropData.x),
        top: Math.round(cropData.y),
        width: Math.round(cropData.width),
        height: Math.round(cropData.height),
      })
      .toBuffer();

    if (
      "url" in image &&
      typeof image.url === "string" &&
      image.url !== originalImageUrl
    ) {
      const oldCroppedKey = image.url.split(
        `/${process.env.DO_SPACES_BUCKET}/`
      )[1];
      await deleteFromSpaces(oldCroppedKey);
    }

    const timestamp = Date.now();
    const newCroppedUrl = await uploadToSpaces({
      buffer: croppedBuffer,
      filename: `${imageId}-cropped-${timestamp}-${
        typeof image === "object" && image !== null && "name" in image
          ? (image.name as string)
          : "image"
      }`,
      contentType: "image/jpeg",
      folder: `profiles/${profile.id}`,
    });

    const updatedImages = [...profile.images];
    updatedImages[imageIndex] = {
      ...image,
      url: newCroppedUrl,
      originalUrl: originalImageUrl,
      cropData: {
        x: cropData.x,
        y: cropData.y,
        width: cropData.width,
        height: cropData.height,
        zoom,
      },
    };

    await prisma.producerProfile.update({
      where: { id: profile.id },
      data: {
        images: updatedImages,
      },
    });

    return NextResponse.json(updatedImages[imageIndex] as object);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao atualizar crop" },
      { status: 500 }
    );
  }
}
