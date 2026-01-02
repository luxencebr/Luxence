import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { deleteFromSpaces } from "@/lib/deleteFromSpaces";

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  try {
    const { imageId } = params;

    // 1. Buscar o profile que contém essa imagem
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

    // 2. Separar a imagem
    const image = profile.images.find((img: any) => img.id === imageId);

    if (
      !image ||
      typeof image !== "object" ||
      !("url" in image) ||
      !image.url
    ) {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    // 3. Extrair key do Spaces a partir da URL
    // Ex: https://nyc3.digitaloceanspaces.com/bucket/profiles/1/img.png
    if (typeof image.url !== "string") {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }
    const key = image.url.split(`/${process.env.DO_SPACES_BUCKET}/`)[1];

    // 4. Deletar do Spaces
    await deleteFromSpaces(key);

    // 5. Atualizar o banco removendo a imagem
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
