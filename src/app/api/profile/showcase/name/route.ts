import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { updateProducerVerificationStatus } from "@/lib/profile-verification";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { profileId, name } = await request.json();

    if (!profileId || !name) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Validação: apenas letras, espaços e acentos são permitidos
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!nameRegex.test(name.trim())) {
      return NextResponse.json(
        { error: "O nome deve conter apenas letras" },
        { status: 400 }
      );
    }

    // Verifica se o perfil pertence ao usuário
    const producer = await prisma.producer.findFirst({
      where: {
        userId: parseInt(session.user.id),
        profile: {
          id: profileId,
        },
      },
    });

    if (!producer) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Atualiza o nome do perfil
    await prisma.producerProfile.update({
      where: { id: profileId },
      data: { name },
    });

    // Atualiza o status de verificação do perfil
    await updateProducerVerificationStatus(producer.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar nome:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar nome" },
      { status: 500 }
    );
  }
}
