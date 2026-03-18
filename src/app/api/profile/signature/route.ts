import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Buscar dados do produtor (se existir)
    const producer = await prisma.producer.findUnique({
      where: { userId },
      select: {
        signature: true,
      },
    });

    return NextResponse.json({
      signature: producer?.signature || "COPPER",
      hasProducerProfile: !!producer,
    });
  } catch (error) {
    console.error("Erro ao buscar dados da assinatura:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}