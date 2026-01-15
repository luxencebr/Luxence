import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

// Definimos um tipo para facilitar a manutenção
type RouteParams = { params: Promise<{ reviewId: string }> };

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams // 1. Mudança na tipagem
) {
  try {
    const { reviewId } = await params; // 2. Adicionado await
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        profile: {
          include: {
            producer: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
      );
    }

    const isReviewOwner = review.userId === Number(userId);
    const isProfileOwner = review.profile.producer.userId === Number(userId);

    if (!isReviewOwner && !isProfileOwner) {
      return NextResponse.json(
        { error: "Você não tem permissão para deletar esta avaliação" },
        { status: 403 }
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json(
      { message: "Avaliação deletada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar review:", error);
    return NextResponse.json(
      { error: "Erro ao deletar avaliação" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams // 1. Mudança na tipagem
) {
  try {
    const { reviewId } = await params; // 2. Adicionado await
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "preview") {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        select: {
          id: true,
          comment: true,
          createdAt: true,
          isApproved: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Avaliação não encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(review, { status: 200 });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao buscar review:", error);
    return NextResponse.json(
      { error: "Erro ao buscar avaliação" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams // 1. Mudança na tipagem
) {
  try {
    const { reviewId } = await params; // 2. Adicionado await
    const body = await request.json();
    const { userId, isApproved } = body;

    if (!userId || typeof isApproved !== "boolean") {
      return NextResponse.json(
        { error: "userId e isApproved são obrigatórios" },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        profile: {
          include: {
            producer: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
      );
    }

    if (review.profile.producer.userId !== Number(userId)) {
      return NextResponse.json(
        { error: "Você não tem permissão para aprovar esta avaliação" },
        { status: 403 }
      );
    }

    if (!isApproved) {
      await prisma.review.delete({
        where: { id: reviewId },
      });

      return NextResponse.json(
        { message: "Avaliação rejeitada e removida" },
        { status: 200 }
      );
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            gender: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReview, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar review:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar avaliação" },
      { status: 500 }
    );
  }
}
