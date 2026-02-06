import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { uploadToSpaces } from "@/lib/uploadToSpaces";
import { deleteFromSpaces } from "@/lib/deleteFromSpaces";
import { randomUUID } from "crypto";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "ID da publicação inválido" },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhuma imagem fornecida" },
        { status: 400 },
      );
    }

    // Verificar se o post existe
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Publicação não encontrada" },
        { status: 404 },
      );
    }

    // Se já existe uma imagem, deletar a antiga
    if (existingPost.imageUrl) {
      try {
        const url = new URL(existingPost.imageUrl);
        const key = url.pathname.substring(1);
        await deleteFromSpaces(key);
      } catch (error) {
        console.error("Erro ao deletar imagem antiga:", error);
        // Continua mesmo se não conseguir deletar a imagem antiga
      }
    }

    // Upload da nova imagem
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split(".").pop() || "jpg";
    const filename = `${randomUUID()}.${fileExtension}`;

    const imageUrl = await uploadToSpaces({
      buffer,
      filename,
      contentType: file.type,
      folder: "blog",
    });

    // Atualizar o post com a nova imagem
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { imageUrl },
      // Removido include de comments - funcionalidade desabilitada
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    return NextResponse.json(
      { error: "Erro interno ao fazer upload da imagem" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const postId = parseInt(params.id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "ID da publicação inválido" },
        { status: 400 },
      );
    }

    // Verificar se o post existe
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Publicação não encontrada" },
        { status: 404 },
      );
    }

    // Se existe uma imagem, deletar do Spaces
    if (existingPost.imageUrl) {
      try {
        const url = new URL(existingPost.imageUrl);
        const key = url.pathname.substring(1);
        await deleteFromSpaces(key);
      } catch (error) {
        console.error("Erro ao deletar imagem do Spaces:", error);
        // Continua mesmo se não conseguir deletar a imagem
      }
    }

    // Remover a imageUrl do post (definir como null)
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { imageUrl: null },
      // Removido include de comments - funcionalidade desabilitada
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Erro ao remover imagem:", error);
    return NextResponse.json(
      { error: "Erro interno ao remover imagem" },
      { status: 500 },
    );
  }
}
