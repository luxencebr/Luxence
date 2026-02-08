import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { uploadToSpaces } from "@/lib/uploadToSpaces";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { SIGNATURE_LIMITS, type Signature } from "@/utils/signatureLimits";
import { updateProducerVerificationStatus } from "@/lib/profile-verification";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const profileId = Number(formData.get("profileId"));
    const cropDataStr = formData.get("crop") as string;
    const zoom = Number(formData.get("zoom"));

    if (!file || !profileId || !cropDataStr) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const cropData = JSON.parse(cropDataStr);

    // Buscar o perfil com informações do produtor e assinatura
    const profile = await prisma.producerProfile.findUnique({
      where: { id: profileId },
      select: {
        images: true,
        producerId: true,
        producer: {
          select: {
            signature: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 },
      );
    }

    const images = Array.isArray(profile.images) ? profile.images : [];
    const currentImageCount = images.length;
    const signature = profile.producer.signature as Signature;
    const maxImages = SIGNATURE_LIMITS[signature];

    // Verificar se já atingiu o limite
    if (currentImageCount >= maxImages) {
      return NextResponse.json(
        {
          error: `Limite de imagens atingido. Seu plano ${signature} permite até ${maxImages} imagens.`,
          limit: maxImages,
          current: currentImageCount,
          signature,
        },
        { status: 403 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageId = randomUUID();

    const originalUrl = await uploadToSpaces({
      buffer,
      filename: `${imageId}-original-${file.name}`,
      contentType: file.type,
      folder: `profiles/${profileId}`,
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
      folder: `profiles/${profileId}`,
    });

    const newImage = {
      id: imageId,
      name: file.name,
      url: croppedUrl, // URL da versão cortada (exibição)
      originalUrl, // URL da versão original
      cropData: {
        x: cropData.x,
        y: cropData.y,
        width: cropData.width,
        height: cropData.height,
        zoom,
      },
    };

    if (
      cropData.x < 0 ||
      cropData.y < 0 ||
      cropData.width <= 0 ||
      cropData.height <= 0
    ) {
      return NextResponse.json({ error: "Crop inválido" }, { status: 400 });
    }

    await prisma.producerProfile.update({
      where: { id: profileId },
      data: {
        images: [...images, newImage],
      },
    });

    // Atualiza o status de verificação do perfil
    await updateProducerVerificationStatus(profile.producerId);

    return NextResponse.json(newImage);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
