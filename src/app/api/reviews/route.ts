import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { prisma } from "@/utils/prisma";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

async function sendReviewNotificationEmail(
  email: string,
  producerName: string,
  reviewerName: string,
  profileId: number
) {
  const resend = getResend();

  const reviewLink = `${process.env.NEXTAUTH_URL}/product/${profileId}`;

  await resend.emails.send({
    from: "Luxence <no-reply@luxence.com.br>",
    replyTo: "contato@luxence.com.br",
    to: email,
    subject: "Nova avaliação aguardando aprovação - Luxence",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #1a1a1a; color: #ffffff; padding: 40px 20px; margin: 0;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #2a2a2a; border-radius: 12px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <h1 style="color: #d4af37; margin-bottom: 24px; text-align: center;">Luxence</h1>
            <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 16px;">Nova Avaliação Pendente</h2>
            <p style="color: #e0e0e0; line-height: 1.6; margin-bottom: 16px;">
              Olá, <strong>${producerName}</strong>!
            </p>
            <p style="color: #e0e0e0; line-height: 1.6; margin-bottom: 24px;">
              <strong>${reviewerName}</strong> enviou uma nova avaliação sobre seu perfil. 
              A avaliação está aguardando sua aprovação para ser publicada.
            </p>
            <div style="background-color: #1a1a1a; border-left: 4px solid #d4af37; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #d4af37; font-weight: bold; margin: 0 0 8px 0;">⚠️ Importante:</p>
              <p style="color: #b0b0b0; margin: 0; font-size: 14px; line-height: 1.5;">
                Você pode aprovar ou recusar esta avaliação. Ao aprovar, ela se tornará pública 
                e será exibida em seu perfil. Você poderá visualizar a nota completa após tomar sua decisão.
              </p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${reviewLink}" style="background-color: #d4af37; color: #1a1a1a; padding: 14px 32px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block;">
                Ver Avaliação Pendente
              </a>
            </div>
            <p style="font-size: 12px; color: #666; text-align: center; margin-top: 32px;">
              Este é um email automático. Para suporte, escreva para contato@luxence.com.br
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

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

    const profile = await prisma.producerProfile.findUnique({
      where: { id: parsedProfileId },
      include: {
        producer: {
          include: {
            user: true,
          },
        },
      },
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

    try {
      await sendReviewNotificationEmail(
        profile.producer.user.email,
        profile.producer.name,
        user.name,
        parsedProfileId
      );
    } catch (emailError) {
      // Log error but don't fail the review creation
      console.error("Erro ao enviar email de notificação:", emailError);
    }

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
