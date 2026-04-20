import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uf: string }> },
) {
  try {
    const { uf } = await params;
    const state = uf.toUpperCase();
    
    // Parâmetros de paginação
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const whereClause = {
      verificationStatus: "GREEN" as const,
      profile: {
        isNot: null,
      },
      user: {
        locality: {
          state,
        },
        isDeleted: false, // Excluir usuários com soft delete
      },
    };

    // Buscar total de produtores para calcular se há mais páginas
    const totalCount = await prisma.producer.count({
      where: whereClause,
    });

    const producers = await prisma.producer.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            locality: true,
          },
        },
        profile: {
          include: {
            local: {
              include: {
                amenities: {
                  include: {
                    option: true,
                  },
                },
              },
            },
            appearance: {
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
            reviews: {
              where: {
                isApproved: true,
              },
              include: { 
                user: { 
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    gender: true,
                    createdAt: true,
                    updatedAt: true,
                  }
                } 
              },
            },
          },
        },
      },
      skip,
      take: limit,
    });

    // Buscar assinaturas ativas separadamente para ordenação por prioridade
    const userIds = producers.map(p => p.userId);
    const activeSubscriptions = await (prisma as any).subscription.findMany({
      where: {
        userId: { in: userIds },
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: {
        plan: true,
      },
      orderBy: {
        endDate: 'desc',
      },
    });

    // Criar mapa de assinaturas por usuário
    const subscriptionMap = new Map();
    activeSubscriptions.forEach((sub: any) => {
      if (!subscriptionMap.has(sub.userId)) {
        subscriptionMap.set(sub.userId, sub);
      }
    });

    // Ordenar por prioridade do plano (DIAMOND > GOLD > SILVER > COPPER)
    const priorityOrder = { 'DIAMOND': 4, 'GOLD': 3, 'SILVER': 2, 'COPPER': 1 };
    
    const sortedProducers = producers.sort((a, b) => {
      const aSubscription = subscriptionMap.get(a.userId);
      const bSubscription = subscriptionMap.get(b.userId);
      
      const aPriority = aSubscription?.plan?.signature 
        ? priorityOrder[aSubscription.plan.signature as keyof typeof priorityOrder] || 1
        : 1; // COPPER como padrão
        
      const bPriority = bSubscription?.plan?.signature 
        ? priorityOrder[bSubscription.plan.signature as keyof typeof priorityOrder] || 1
        : 1; // COPPER como padrão
      
      // Ordenação decrescente (maior prioridade primeiro)
      return bPriority - aPriority;
    });

    const hasMore = skip + producers.length < totalCount;

    return NextResponse.json({
      producers: sortedProducers,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("[API CATALOG]", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtores" },
      { status: 500 },
    );
  }
}
