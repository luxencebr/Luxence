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

    const { profileId, age } = await request.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Valida a idade se fornecida
    if (age !== null && age !== undefined) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
        return NextResponse.json(
          { error: "Idade deve estar entre 18 e 99 anos" },
          { status: 400 }
        );
      }
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

    // Atualiza a idade do perfil
    await prisma.producerProfile.update({
      where: { id: profileId },
      data: { age: age ? parseInt(age) : null },
    });

    // Atualiza o status de verificação do perfil
    await updateProducerVerificationStatus(producer.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar idade:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar idade" },
      { status: 500 }
    );
  }
}
