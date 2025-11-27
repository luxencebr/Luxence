import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { profileId, prices, payments } = await req.json();

    if (!profileId || !Array.isArray(prices) || !Array.isArray(payments)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao salvar preços e métodos de pagamento" },
      { status: 500 }
    );
  }
}
