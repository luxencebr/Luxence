import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { getSubscriptionStats } from '@/lib/subscription';
import { sendWelcomeSubscriptionEmail } from '@/lib/subscription-notifications';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const planId = searchParams.get('planId');

    const skip = (page - 1) * limit;

    // Filtros
    const where: any = {};
    if (status) where.status = status;
    if (planId) where.planId = parseInt(planId);

    // Buscar assinaturas
    const [subscriptions, total, stats] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          plan: {
            select: {
              name: true,
              signature: true,
              price: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
      getSubscriptionStats(),
    ]);

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, planId, planSignature, durationMonths = 1, action } = body;

    if (action === 'create' || action === 'create_by_signature') {
      let plan;
      
      if (action === 'create_by_signature' && planSignature) {
        // Buscar plano pela signature
        plan = await prisma.subscriptionPlan.findUnique({
          where: { signature: planSignature },
        });
      } else if (planId) {
        // Buscar plano pelo ID
        plan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId },
        });
      }

      if (!plan) {
        return NextResponse.json(
          { error: 'Plano não encontrado' },
          { status: 404 }
        );
      }

      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);

      // Cancelar assinatura ativa anterior (marretada - força cancelamento)
      await prisma.subscription.updateMany({
        where: {
          userId,
          status: 'ACTIVE',
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      // Criar nova assinatura (marretada - força criação)
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
          // Inicializar contadores zerados
          photosUsed: 0,
          videosUsed: 0,
          profileUpdatesUsed: 0,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          plan: true,
        },
      });

      // Atualizar signature do produtor (marretada - força atualização)
      await prisma.producer.updateMany({
        where: { userId },
        data: { signature: plan.signature },
      });

      // Enviar email de boas-vindas (não bloquear a resposta)
      sendWelcomeSubscriptionEmail(subscription as any).catch(error => {
        console.error('Erro ao enviar email de boas-vindas:', error);
      });

      return NextResponse.json({ subscription });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao gerenciar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}