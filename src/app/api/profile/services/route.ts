import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { profileId, services } = await req.json();

    if (!profileId || !Array.isArray(services)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    await prisma.producerService.deleteMany({
      where: { profileId },
    });

    await prisma.producerService.createMany({
      data: services.map((item: { serviceId: number; status: string }) => ({
        profileId,
        serviceId: item.serviceId,
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
