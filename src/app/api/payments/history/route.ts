import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
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

    const userId = parseInt(session.user.id);

    // Buscar histórico de pagamentos do usuário
    const payments = await prisma.payment.findMany({
      where: {
        subscription: {
          userId,
        },
      },
      include: {
        subscription: {
          include: {
            plan: {
              select: {
                name: true,
                signature: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Últimos 20 pagamentos
    });

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      externalId: payment.externalId,
      amount: payment.amount.toNumber(),
      amountFormatted: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(payment.amount.toNumber()),
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      plan: payment.subscription ? {
        name: payment.subscription.plan.name,
        signature: payment.subscription.plan.signature,
      } : null,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
      dueDate: payment.dueDate,
    }));

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
    });

  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}