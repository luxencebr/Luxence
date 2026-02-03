import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST(
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

    const { content } = await request.json();

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Conteúdo é obrigatório" },
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

    // Atualizar o conteúdo do post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { content: content.trim() },
      // Removido include de comments - funcionalidade desabilitada
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Erro ao atualizar conteúdo:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar conteúdo" },
      { status: 500 },
    );
  }
}
