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

    const producers = await prisma.producer.findMany({
      where: {
        verificationStatus: "GREEN",
        profile: {
          isNot: null,
        },
        user: {
          gender: genderFilter,
        },
      },
      select: {
        id: true,
        birthday: true,

        user: {
          select: {
            name: true,
            gender: true,
            locality: {
              select: {
                city: true,
                neighborhood: true,
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
            reviews: {
              select: {
                id: true,
                rating: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(producers, { status: 200 });
  } catch (error) {
    console.error("[API HOME PRODUCERS]", error);
    return NextResponse.json(
      { error: "Erro ao carregar produtores" },
      { status: 500 }
    );
  }
}
