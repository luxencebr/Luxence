import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const subscriptionId = id;
    const body = await request.json();
    const { action, reason } = body;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: true,
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'cancel':
        updateData = {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        };
        
        // Atualizar produtor para COPPER
        await prisma.producer.updateMany({
          where: { userId: subscription.userId },
          data: { signature: 'COPPER' },
        });
        break;

      case 'suspend':
        updateData = {
          status: 'SUSPENDED',
        };
        
        // Atualizar produtor para COPPER
        await prisma.producer.updateMany({
          where: { userId: subscription.userId },
          data: { signature: 'COPPER' },
        });
        break;

      case 'reactivate':
        updateData = {
          status: 'ACTIVE',
          cancelledAt: null,
        };
        
        // Atualizar produtor para o plano da assinatura
        await prisma.producer.updateMany({
          where: { userId: subscription.userId },
          data: { signature: subscription.plan.signature },
        });
        break;

      case 'extend':
        const { months = 1 } = body;
        const newEndDate = new Date(subscription.endDate);
        newEndDate.setMonth(newEndDate.getMonth() + months);
        
        updateData = {
          endDate: newEndDate,
          status: 'ACTIVE',
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        );
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        plan: true,
      },
    });

    return NextResponse.json({ subscription: updatedSubscription });
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}