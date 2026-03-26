import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserSubscriptionInfo } from '@/lib/subscription-helpers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const subscriptionInfo = await getUserSubscriptionInfo(parseInt(session.user.id));
    
    return NextResponse.json(subscriptionInfo);
  } catch (error) {
    console.error('Erro ao buscar informações da assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { signature, durationMonths = 1 } = body;

    if (!signature || !['SILVER', 'GOLD', 'DIAMOND'].includes(signature)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    // Verificar se o plano existe
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { signature },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    // Por enquanto, apenas retornar informações do plano
    // A implementação do pagamento será feita posteriormente
    return NextResponse.json({
      plan: {
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
      },
      message: 'Sistema de pagamento será implementado em breve',
    });
  } catch (error) {
    console.error('Erro ao processar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}