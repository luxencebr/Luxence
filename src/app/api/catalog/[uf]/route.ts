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

    const hasMore = skip + producers.length < totalCount;

    return NextResponse.json({
      producers,
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
