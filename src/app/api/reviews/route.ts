import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/utils/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profileId, rating, comment } = body;

    if (!userId || !profileId || !rating) {
      return NextResponse.json(
        { error: "userId, profileId e rating são obrigatórios" },
        { status: 400 }
      );
    }

    const parsedUserId = Number(userId);
    const parsedProfileId = Number(profileId);
    const parsedRating = Number(rating);

    if (
      Number.isNaN(parsedUserId) ||
      Number.isNaN(parsedProfileId) ||
      Number.isNaN(parsedRating)
    ) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Validação do rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "A avaliação deve ser entre 1 e 5" },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            "O comentário é obrigatório e deve ter pelo menos 10 caracteres",
        },
        { status: 400 }
      );
    }

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se o perfil do produtor existe
    const profile = await prisma.producerProfile.findUnique({
      where: { id: parsedProfileId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil do produtor não encontrado" },
        { status: 404 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: parsedUserId,
        profileId: parsedProfileId,
        rating: parsedRating,
        comment: comment.trim(),
        hasComment: true,
        isApproved: false,
      },
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

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar review:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Você já avaliou este produtor" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar avaliação" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const userId = searchParams.get("userId");

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId é obrigatório" },
        { status: 400 }
      );
    }

    const profile = await prisma.producerProfile.findUnique({
      where: { id: Number.parseInt(profileId) },
      include: {
        producer: true,
      },
    });

    const isProfileOwner =
      userId && profile?.producer.userId === Number(userId);

    const allReviews = await prisma.review.findMany({
      where: {
        profileId: Number.parseInt(profileId),
        ...(isProfileOwner ? {} : { isApproved: true }),
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(allReviews, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar reviews:", error);
    return NextResponse.json(
      { error: "Erro ao buscar avaliações" },
      { status: 500 }
    );
  }
}
