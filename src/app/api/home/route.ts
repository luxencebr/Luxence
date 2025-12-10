import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const producers = await prisma.producer.findMany({
      where: {
        profile: {
          isNot: null,
        },
      },
      select: {
        id: true,
        birthday: true,

        user: {
          select: {
            name: true,
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
            images: true, // aqui já vem [{url: "..."}]
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
