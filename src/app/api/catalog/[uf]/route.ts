import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uf: string }> }
) {
  try {
    const { uf } = await params;
    const state = uf.toUpperCase();

    const producers = await prisma.producer.findMany({
      where: {
        profile: {
          isNot: null,
        },
        user: {
          locality: {
            state,
          },
        },
      },
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
              include: {
                option: true,
              },
            },
            prices: {
              include: {
                option: true,
              },
            },
            services: {
              include: {
                option: true,
              },
            },
            fetiches: {
              include: {
                option: true,
              },
            },
            audience: {
              include: {
                option: true,
              },
            },
            locations: {
              include: {
                option: true,
              },
            },
            payments: {
              include: {
                option: true,
              },
            },
            reviews: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(producers, { status: 200 });
  } catch (error) {
    console.error("[API CATALOG]", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtores" },
      { status: 500 }
    );
  }
}
