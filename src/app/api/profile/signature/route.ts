import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { getUserSubscriptionInfo } from "@/lib/subscription-helpers";

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

    // Buscar informações completas da assinatura
    const subscriptionInfo = await getUserSubscriptionInfo(userId);

    return NextResponse.json({
      signature: producer?.signature || "COPPER",
      hasProducerProfile: !!producer,
      subscriptionInfo,
    });
  } catch (error) {
    console.error("Erro ao buscar dados da assinatura:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}