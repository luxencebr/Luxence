import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { uploadToSpaces } from "@/lib/uploadToSpaces";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { type Signature } from "@/utils/signatureLimits";
import { updateProducerVerificationStatus } from "@/lib/profile-verification";
import { canUploadPhotos, logSubscriptionUsage } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

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
    const profile = await prisma.producerProfile.findFirst({
      where: { 
        id: profileId,
        producer: {
          userId: parseInt(session.user.id)
        }
      },
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
        { error: "Perfil não encontrado ou não autorizado" },
        { status: 404 },
      );
    }

    const images = Array.isArray(profile.images) ? profile.images : [];
    const currentImageCount = images.length;
    
    // Usar novo sistema de verificação de assinatura
    const { canUpload, reason } = await canUploadPhotos(parseInt(session.user.id));
    
    if (!canUpload) {
      return NextResponse.json(
        {
          error: reason || 'Não é possível fazer upload de fotos',
          current: currentImageCount,
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

    // Registrar uso da assinatura
    await logSubscriptionUsage(parseInt(session.user.id), 'photo_upload', imageId, {
      fileName: file.name,
      fileSize: buffer.length,
    });

    // Atualiza o status de verificação do perfil
    await updateProducerVerificationStatus(profile.producerId);

    return NextResponse.json(newImage);
  } catch (err) {
    console.error("Erro no upload:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
