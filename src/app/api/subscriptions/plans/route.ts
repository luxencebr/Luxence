import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      signature: plan.signature,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      benefits: {
        maxPhotos: plan.maxPhotos,
        maxVideos: plan.maxVideos,
        maxProfileUpdates: plan.maxProfileUpdates,
        hasCommentControl: plan.hasCommentControl,
        hasVoiceDemo: plan.hasVoiceDemo,
        priority: plan.priority,
        hasFeaturedProfile: plan.hasFeaturedProfile,
      },
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}