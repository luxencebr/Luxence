import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { updateProducerVerificationStatus } from "@/lib/profile-verification";

export async function POST(req: Request) {
  try {
    const { profileId, prices, payments } = await req.json();

    if (!profileId || !Array.isArray(prices) || !Array.isArray(payments)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Validação: se houver preços, deve haver pelo menos um método de pagamento
    if (prices.length > 0 && payments.length === 0) {
      return NextResponse.json(
        { error: "É necessário selecionar pelo menos um método de pagamento quando há valores cadastrados" },
        { status: 400 }
      );
    }

    await prisma.producerPrice.deleteMany({
      where: { profileId },
    });

    await prisma.producerPrice.createMany({
      data: prices.map((item: { priceId: number; value: number }) => ({
        profileId,
        priceId: item.priceId,
        value: item.value,
      })),
    });

    await prisma.producerPayment.deleteMany({
      where: { profileId },
    });

    await prisma.producerPayment.createMany({
      data: payments.map((p: { paymentId: number }) => ({
        profileId,
        paymentId: p.paymentId,
      })),
    });

    // Busca o producerId para atualizar o status
    const profile = await prisma.producerProfile.findUnique({
      where: { id: profileId },
      select: { producerId: true },
    });

    if (profile) {
      await updateProducerVerificationStatus(profile.producerId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao salvar preços e métodos de pagamento" },
      { status: 500 }
    );
  }
}
