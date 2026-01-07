import { prisma } from "@/utils/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const producerId = Number.parseInt(id, 10);

    if (isNaN(producerId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const producer = await prisma.producer.findUnique({
      where: { id: producerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            gender: true,
            locality: true,
          },
        },
        profile: {
          include: {
            appearance: {
              include: { option: true },
            },
            contacts: {
              include: { option: true },
            },
            prices: {
              include: { option: true },
            },
            services: {
              include: { option: true },
            },
            fetiches: {
              include: { option: true },
            },
            audience: {
              include: { option: true },
            },
            locations: {
              include: { option: true },
            },
            payments: {
              include: { option: true },
            },
            local: {
              include: { amenities: { include: { option: true } } },
            },
            reviews: {
              include: {
                user: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!producer) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    await prisma.producerProfile.update({
      where: { id: producer.profile!.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(producer, { status: 200 });
  } catch (error) {
    console.error("[v0] Erro ao buscar produtor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
