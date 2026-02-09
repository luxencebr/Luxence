import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    
    // Obter preferências de gênero do usuário logado
    const userPreferences = session?.user?.preferences || [];
    
    // Se o usuário não tem preferências definidas, mostrar apenas mulheres (FEMALE)
    const genderFilter = userPreferences.length > 0 
      ? { in: userPreferences }
      : "FEMALE";

    // Obter localidade do usuário para a row "Perto de Você"
    const userCity = session?.user?.locality?.city;
    const userState = session?.user?.locality?.state;

    // Filtro base para todos os produtores
    const baseWhere = {
      verificationStatus: "GREEN" as const,
      profile: {
        isNot: null,
      },
      user: {
        gender: genderFilter,
      },
    };

    const selectFields = {
      id: true,
      name: true,
      birthday: true,
      user: {
        select: {
          gender: true,
          locality: {
            select: {
              city: true,
              neighborhood: true,
              state: true,
            },
          },
          createdAt: true,
        },
      },
      profile: {
        select: {
          slogan: true,
          hasLocal: true,
          images: true,
          views: true,
          prices: {
            select: {
              value: true,
              option: {
                select: {
                  label: true,
                },
              },
            },
            orderBy: {
              value: 'asc' as const,
            },
            take: 1,
          },
          reviews: {
            where: {
              isApproved: true,
            },
            select: {
              id: true,
              rating: true,
            },
          },
        },
      },
    };

    // 1. Novidades - Últimos perfis adicionados
    const newProducers = await prisma.producer.findMany({
      where: baseWhere,
      select: selectFields,
      orderBy: {
        user: {
          createdAt: 'desc',
        },
      },
      take: 30,
    });

    // 2. Top Views - Perfis com mais visualizações
    const topViewsProducers = await prisma.producer.findMany({
      where: baseWhere,
      select: selectFields,
      orderBy: {
        profile: {
          views: 'desc',
        },
      },
      take: 10,
    });

    // 3. Top Reviews - Perfis mais bem avaliados
    const allProducersForReviews = await prisma.producer.findMany({
      where: baseWhere,
      select: selectFields,
    });

    // 4. Perto de Você - Perfis da mesma cidade/estado
    let nearbyProducers = [];
    if (userCity && userState) {
      nearbyProducers = await prisma.producer.findMany({
        where: {
          ...baseWhere,
          user: {
            ...baseWhere.user,
            locality: {
              city: userCity,
              state: userState,
            },
          },
        },
        select: selectFields,
        take: 30,
      });
    }

    // Se não houver perfis na mesma cidade, buscar do mesmo estado
    if (nearbyProducers.length === 0 && userState) {
      nearbyProducers = await prisma.producer.findMany({
        where: {
          ...baseWhere,
          user: {
            ...baseWhere.user,
            locality: {
              state: userState,
            },
          },
        },
        select: selectFields,
        take: 30,
      });
    }

    return NextResponse.json({
      new: newProducers,
      topViews: topViewsProducers,
      topReviews: allProducersForReviews,
      nearby: nearbyProducers,
    }, { status: 200 });
  } catch (error) {
    console.error("[API HOME PRODUCERS]", error);
    return NextResponse.json(
      { error: "Erro ao carregar produtores" },
      { status: 500 }
    );
  }
}
