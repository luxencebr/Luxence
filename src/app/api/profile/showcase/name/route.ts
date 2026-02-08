import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { updateProducerVerificationStatus } from "@/lib/profile-verification";

export async function POST(req: Request) {
  try {
    const { producerId, name } = await req.json();

    if (!producerId || !name) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    await prisma.producer.update({
      where: { id: producerId },
      data: { name },
    });

    // Atualiza o status de verificação do perfil
    await updateProducerVerificationStatus(producerId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar nome" }, { status: 500 });
  }
}
