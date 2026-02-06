import { prisma } from "@/utils/prisma";
import { type NextRequest, NextResponse } from "next/server";

function getStartOfCurrentWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para segunda-feira
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getLastWeekRange(): { start: Date; end: Date } {
  const startOfCurrentWeek = getStartOfCurrentWeek();
  const endOfLastWeek = new Date(startOfCurrentWeek);
  endOfLastWeek.setMilliseconds(-1); // Domingo 23:59:59.999 da semana passada

  const startOfLastWeek = new Date(startOfCurrentWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7); // Segunda-feira da semana passada

  return { start: startOfLastWeek, end: endOfLastWeek };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
        { status: 404 },
      );
    }

    const profileId = producer.profile!.id;
    const startOfCurrentWeek = getStartOfCurrentWeek();
    const lastUpdated = producer.profile!.lastWeekViewsUpdatedAt;

    // Atualiza apenas se nunca foi calculado OU se a semana mudou
    const needsUpdate = !lastUpdated || lastUpdated < startOfCurrentWeek;

    let lastWeekViews = producer.profile!.lastWeekViews;

    if (needsUpdate) {
      const { start, end } = getLastWeekRange();

      // Conta visitas da semana passada
      const viewCount = await prisma.profileView.count({
        where: {
          profileId,
          viewedAt: {
            gte: start,
            lte: end,
          },
        },
      });

      lastWeekViews = viewCount;

      // Atualiza o cache
      await prisma.producerProfile.update({
        where: { id: profileId },
        data: {
          lastWeekViews: viewCount,
          lastWeekViewsUpdatedAt: startOfCurrentWeek,
        },
      });
    }

    await prisma.$transaction([
      prisma.profileView.create({
        data: { profileId },
      }),
      prisma.producerProfile.update({
        where: { id: profileId },
        data: { views: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(
      {
        ...producer,
        profile: {
          ...producer.profile,
          lastWeekViews,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[v0] Erro ao buscar produtor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
