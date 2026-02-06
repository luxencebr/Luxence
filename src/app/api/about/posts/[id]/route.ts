import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { deleteFromSpaces } from "@/lib/deleteFromSpaces";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "ID da publicação inválido" },
        { status: 400 },
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      // Removido include de comments - funcionalidade desabilitada
    });

    if (!post) {
      return NextResponse.json(
        { error: "Publicação não encontrada" },
        { status: 404 },
      );
    }

    // Incrementar visualizações
    await prisma.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Erro ao buscar post:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar publicação" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "ID da publicação inválido" },
        { status: 400 },
      );
    }

    // Verificar se o post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Publicação não encontrada" },
        { status: 404 },
      );
    }

    // Deletar imagem do Spaces se existir
    if (post.imageUrl) {
      try {
        // Extrair o key da URL (parte após o bucket)
        const url = new URL(post.imageUrl);
        const key = url.pathname.substring(1); // Remove a barra inicial
        await deleteFromSpaces(key);
      } catch (error) {
        console.error("Erro ao deletar imagem do Spaces:", error);
        // Continua com a deleção do post mesmo se a imagem não puder ser deletada
      }
    }

    // Deletar o post (comentários serão deletados automaticamente devido ao onDelete: Cascade)
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: "Publicação deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    return NextResponse.json(
      { error: "Erro interno ao deletar publicação" },
      { status: 500 },
    );
  }
}
