import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7"; // 7, 30, 365

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Queries principais em paralelo
    const [
      activeUsersToday,
      activeUsersWeek,
      activeUsersMonth,
      usersThisWeek,
      usersLastWeek,
      usersThisMonth,
      usersLastMonth,
      activeAdvertisers,
      inactiveAdvertisers,
      totalAdvertisers,
      planDistribution,
    ] = await Promise.all([
      // Usuários ativos (excluindo soft deleted)
      prisma.user.count({ where: { updatedAt: { gte: today }, isDeleted: false } }),
      prisma.user.count({ where: { updatedAt: { gte: weekAgo }, isDeleted: false } }),
      prisma.user.count({ where: { updatedAt: { gte: monthAgo }, isDeleted: false } }),

      // Crescimento comparativo (excluindo soft deleted)
      prisma.user.count({ where: { createdAt: { gte: weekAgo }, isDeleted: false } }),
      prisma.user.count({
        where: { createdAt: { gte: lastWeek, lt: weekAgo }, isDeleted: false },
      }),
      prisma.user.count({ where: { createdAt: { gte: monthAgo }, isDeleted: false } }),
      prisma.user.count({
        where: { createdAt: { gte: lastMonth, lt: monthAgo }, isDeleted: false },
      }),

      // Anunciantes (excluindo soft deleted)
      prisma.producer.count({
        where: { user: { role: "ADVERTISER", isDeleted: false }, verificationStatus: "GREEN" },
      }),
      prisma.producer.count({
        where: {
          user: { role: "ADVERTISER", isDeleted: false },
          verificationStatus: { in: ["RED", "YELLOW"] },
        },
      }),
      prisma.producer.count({ where: { user: { role: "ADVERTISER", isDeleted: false } } }),

      // Distribuição de planos (excluindo soft deleted)
      prisma.producer.groupBy({
        by: ["signature"],
        where: { user: { role: "ADVERTISER", isDeleted: false } },
        _count: { signature: true },
      }),
    ]);

    // Acessos por período
    const generateDailyAccess = async (days: number) => {
      const dailyAccess = [];
      const periodDays = parseInt(period);

      // Primeiro, vamos verificar o período com dados no banco
      const firstView = await prisma.profileView.findFirst({
        orderBy: { viewedAt: "asc" },
        select: { viewedAt: true },
      });

      if (!firstView) {
        return []; // Sem dados no banco
      }

      const firstDataDate = new Date(
        firstView.viewedAt.getFullYear(),
        firstView.viewedAt.getMonth(),
        firstView.viewedAt.getDate(),
      );

      if (periodDays === 7) {
        // 7 dias: Mostrar os últimos 7 dias (incluindo 0s)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);

          // Só incluir se a data for >= primeira data com dados
          if (date >= firstDataDate) {
            const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

            const views = await prisma.profileView.count({
              where: {
                viewedAt: {
                  gte: date,
                  lt: nextDate,
                },
              },
            });

            dailyAccess.push({
              date: date.toISOString().split("T")[0],
              views,
              label: date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              }),
            });
          }
        }
      } else if (periodDays === 30) {
        // 30 dias: Agrupar de 3 em 3 dias, 10 pontos
        for (let i = 9; i >= 0; i--) {
          const endDate = new Date(
            today.getTime() - i * 3 * 24 * 60 * 60 * 1000,
          );
          const startDate = new Date(
            endDate.getTime() - 3 * 24 * 60 * 60 * 1000,
          );

          // Só incluir se o período tem interseção com dados
          if (endDate >= firstDataDate) {
            const views = await prisma.profileView.count({
              where: {
                viewedAt: {
                  gte: startDate,
                  lt: endDate,
                },
              },
            });

            // Incluir mesmo se views = 0, desde que esteja no período com dados
            dailyAccess.push({
              date: startDate.toISOString().split("T")[0],
              views,
              label: `${startDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              })}`,
            });
          }
        }
      } else {
        // 1 ano: Agrupar por mês (30 dias), 12 pontos
        for (let i = 11; i >= 0; i--) {
          const endDate = new Date(
            today.getTime() - i * 30 * 24 * 60 * 60 * 1000,
          );
          const startDate = new Date(
            endDate.getTime() - 30 * 24 * 60 * 60 * 1000,
          );

          // Só incluir se o período tem interseção com dados
          if (endDate >= firstDataDate) {
            const views = await prisma.profileView.count({
              where: {
                viewedAt: {
                  gte: startDate,
                  lt: endDate,
                },
              },
            });

            // Incluir mesmo se views = 0, desde que esteja no período com dados
            dailyAccess.push({
              date: startDate.toISOString().split("T")[0],
              views,
              label: startDate
                .toLocaleDateString("pt-BR", {
                  month: "short",
                })
                .replace(".", ""),
            });
          }
        }
      }

      return dailyAccess;
    };

    const dailyAccess = await generateDailyAccess(parseInt(period));

    // Performance do sistema
    const memory = process.memoryUsage();
    const uptime = Math.round(process.uptime());

    // Teste de conexão com banco
    let dbStatus = "connected";
    let dbResponseTime = 0;
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - start;
    } catch (error) {
      dbStatus = "error";
    }

    const systemPerformance = {
      memory: {
        used: Math.round(memory.heapUsed / 1024 / 1024),
        percentage: Math.round((memory.heapUsed / memory.heapTotal) * 100),
      },
      uptime: {
        formatted:
          uptime > 3600
            ? `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
            : `${Math.floor(uptime / 60)}m ${uptime % 60}s`,
      },
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
    };

    // Top reviews das producers (com mais reviews aprovadas, excluindo soft deleted)
    const topReviews = await prisma.producerProfile.findMany({
      where: {
        producer: {
          user: { role: "ADVERTISER", isDeleted: false },
        },
      },
      include: {
        producer: {
          include: {
            user: { select: { name: true } },
          },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
      orderBy: {
        reviews: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Top views (anunciantes com mais views, excluindo soft deleted)
    const topViews = await prisma.producerProfile.findMany({
      where: {
        producer: {
          user: { role: "ADVERTISER", isDeleted: false },
        },
      },
      include: {
        producer: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { views: "desc" },
      take: 5,
    });

    // Calcular percentuais de crescimento
    const weekGrowth =
      usersLastWeek > 0
        ? ((usersThisWeek - usersLastWeek) / usersLastWeek) * 100
        : 0;
    const monthGrowth =
      usersLastMonth > 0
        ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
        : 0;

    const dashboard = {
      activeUsers: {
        today: activeUsersToday,
        week: activeUsersWeek,
        month: activeUsersMonth,
      },
      growth: {
        week: {
          percentage: Math.round(weekGrowth * 100) / 100,
          current: usersThisWeek,
          previous: usersLastWeek,
        },
        month: {
          percentage: Math.round(monthGrowth * 100) / 100,
          current: usersThisMonth,
          previous: usersLastMonth,
        },
      },
      advertisers: {
        active: activeAdvertisers,
        inactive: inactiveAdvertisers,
        total: totalAdvertisers,
      },
      planDistribution: planDistribution.map((plan) => ({
        plan: plan.signature,
        count: plan._count.signature,
      })),
      dailyAccess,
      systemPerformance,
      topReviews: topReviews
        .map((profile) => {
          const approvedReviews = profile.reviews;
          const avgRating =
            approvedReviews.length > 0
              ? approvedReviews.reduce(
                  (sum, review) => sum + review.rating,
                  0,
                ) / approvedReviews.length
              : 0;

          return {
            name: profile.producer.user.name,
            producerName: profile.producer.name,
            avgRating: Math.round(avgRating * 100) / 100,
            approvedReviews: approvedReviews.length,
          };
        })
        .filter((item) => item.approvedReviews > 0),
      topViews: topViews.map((profile) => ({
        name: profile.producer.user.name,
        producerName: profile.producer.name,
        views: profile.views,
      })),
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Erro ao buscar dados da dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
