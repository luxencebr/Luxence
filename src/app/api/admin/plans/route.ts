import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search");

    const searchConditions = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery } },
            { description: { contains: searchQuery } },
          ],
        }
      : {};

    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        ...searchConditions,
      },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: {
                status: {
                  in: ["ACTIVE", "PENDING"],
                },
              },
            },
          },
        },
      },
      orderBy: [
        { isActive: "desc" }, // Ativos primeiro
        { signature: "asc" }, // Depois por ordem de assinatura
      ],
    });

    // Processar os planos para o formato esperado pelo frontend
    const processedPlans = plans.map((plan) => ({
      ...plan,
      price: parseFloat(plan.price.toString()), // Converter Decimal para number
    }));

    return NextResponse.json(processedPlans);
  } catch (error) {
    console.error("Erro ao buscar planos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      signature,
      name,
      description,
      price,
      maxPhotos,
      maxVideos,
      maxProfileUpdates,
      hasCommentControl,
      hasVoiceDemo,
      priority,
      hasFeaturedProfile,
      isActive,
    } = body;

    // Validações básicas
    if (!signature || !name || price === undefined) {
      return NextResponse.json(
        { error: "Campos obrigatórios: signature, name, price" },
        { status: 400 }
      );
    }

    // Verificar se já existe um plano com essa signature
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { signature },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: "Já existe um plano com essa assinatura" },
        { status: 400 }
      );
    }

    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        signature,
        name,
        description: description || null,
        price,
        maxPhotos: maxPhotos || 0,
        maxVideos: maxVideos || 0,
        maxProfileUpdates: maxProfileUpdates || 0,
        hasCommentControl: hasCommentControl || false,
        hasVoiceDemo: hasVoiceDemo || false,
        priority: priority || null,
        hasFeaturedProfile: hasFeaturedProfile || false,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: {
                status: {
                  in: ["ACTIVE", "PENDING"],
                },
              },
            },
          },
        },
      },
    });

    const processedPlan = {
      ...newPlan,
      price: parseFloat(newPlan.price.toString()),
    };

    return NextResponse.json(processedPlan, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar plano:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}