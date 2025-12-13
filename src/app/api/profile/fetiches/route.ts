import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { profileId, fetiches } = await req.json();

    if (!profileId || !Array.isArray(fetiches)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    await prisma.producerFetish.deleteMany({
      where: { profileId },
    });

    await prisma.producerFetish.createMany({
      data: fetiches.map((item: { serviceId: number; status: string }) => ({
        profileId,
        fetishId: item.serviceId,
        status: item.status,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao salvar serviços" },
      { status: 500 }
    );
  }
}
