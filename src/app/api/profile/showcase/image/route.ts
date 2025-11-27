import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

// POST - Upload new image
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const profileId = Number(formData.get("profileId"));

    if (!file || !profileId) {
      return NextResponse.json(
        { error: "Arquivo e profileId são obrigatórios" },
        { status: 400 }
      );
    }

    // Get current images from profile
    const profile = await prisma.producerProfile.findUnique({
      where: { id: profileId },
      select: { images: true },
    });

    const currentImages =
      (profile?.images as Array<{ name: string; url: string }>) || [];

    // Convert file to base64 data URL (in production, use cloud storage like S3/Cloudinary)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const newImage = {
      name: file.name,
      url: dataUrl,
    };

    // Add new image to array
    await prisma.producerProfile.update({
      where: { id: profileId },
      data: {
        images: [...currentImages, newImage],
      },
    });

    return NextResponse.json({
      success: true,
      id: currentImages.length,
      url: dataUrl,
      name: file.name,
    });
  } catch (error) {
    console.error("IMAGE POST ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload da imagem", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Replace existing image
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const profileId = Number(formData.get("profileId"));
    const replaceIndex = Number(formData.get("replaceIndex"));

    if (!file || !profileId || isNaN(replaceIndex)) {
      return NextResponse.json(
        { error: "Arquivo, profileId e replaceIndex são obrigatórios" },
        { status: 400 }
      );
    }

    // Get current images
    const profile = await prisma.producerProfile.findUnique({
      where: { id: profileId },
      select: { images: true },
    });

    const currentImages =
      (profile?.images as Array<{ name: string; url: string }>) || [];

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const newImage = {
      name: file.name,
      url: dataUrl,
    };

    // Replace image at index
    currentImages[replaceIndex] = newImage;

    await prisma.producerProfile.update({
      where: { id: profileId },
      data: { images: currentImages },
    });

    return NextResponse.json({
      success: true,
      id: replaceIndex,
      url: dataUrl,
      name: file.name,
    });
  } catch (error) {
    console.error("IMAGE PUT ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao substituir imagem", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Remove image
export async function DELETE(req: Request) {
  try {
    const { profileId, imageIndex } = await req.json();

    if (!profileId || imageIndex === undefined) {
      return NextResponse.json(
        { error: "profileId e imageIndex são obrigatórios" },
        { status: 400 }
      );
    }

    // Get current images
    const profile = await prisma.producerProfile.findUnique({
      where: { id: profileId },
      select: { images: true },
    });

    const currentImages =
      (profile?.images as Array<{ name: string; url: string }>) || [];

    // Remove image at index
    currentImages.splice(imageIndex, 1);

    await prisma.producerProfile.update({
      where: { id: profileId },
      data: { images: currentImages },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("IMAGE DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao deletar imagem", details: String(error) },
      { status: 500 }
    );
  }
}
