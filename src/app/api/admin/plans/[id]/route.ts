import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const planId = parseInt(id);

    if (isNaN(planId)) {
      return NextResponse.json(
        { error: "ID do plano deve ser um número válido" },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
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

    if (!plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    const processedPlan = {
      ...plan,
      price: parseFloat(plan.price.toString()),
    };

    return NextResponse.json(processedPlan);
  } catch (error) {
    console.error("Erro ao buscar plano:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const planId = parseInt(id);

    if (isNaN(planId)) {
      return NextResponse.json(
        { error: "ID do plano deve ser um número válido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
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

    // Verificar se o plano existe
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    // Preparar os dados para atualização (apenas campos fornecidos)
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (maxPhotos !== undefined) updateData.maxPhotos = maxPhotos;
    if (maxVideos !== undefined) updateData.maxVideos = maxVideos;
    if (maxProfileUpdates !== undefined) updateData.maxProfileUpdates = maxProfileUpdates;
    if (hasCommentControl !== undefined) updateData.hasCommentControl = hasCommentControl;
    if (hasVoiceDemo !== undefined) updateData.hasVoiceDemo = hasVoiceDemo;
    if (priority !== undefined) updateData.priority = priority;
    if (hasFeaturedProfile !== undefined) updateData.hasFeaturedProfile = hasFeaturedProfile;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: updateData,
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
      ...updatedPlan,
      price: parseFloat(updatedPlan.price.toString()),
    };

    return NextResponse.json(processedPlan);
  } catch (error) {
    console.error("Erro ao atualizar plano:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const planId = parseInt(id);

    if (isNaN(planId)) {
      return NextResponse.json(
        { error: "ID do plano deve ser um número válido" },
        { status: 400 }
      );
    }

    // Verificar se o plano existe
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
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

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se há assinantes ativos
    if (existingPlan._count.subscriptions > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir um plano com assinantes ativos" },
        { status: 400 }
      );
    }

    await prisma.subscriptionPlan.delete({
      where: { id: planId },
    });

    return NextResponse.json(
      { message: "Plano excluído com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir plano:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}