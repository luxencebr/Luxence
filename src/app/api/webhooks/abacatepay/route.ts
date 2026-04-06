import { NextRequest, NextResponse } from 'next/server';
import { 
  parseWebhookEvent,
  type AbacatePayWebhookPayload,
  type BillingWebhookData
} from '@/lib/abacatepay';
import { PrismaClient } from '@prisma/client';
import { sendWelcomeSubscriptionEmail } from '@/lib/subscription-notifications';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Ler o corpo da requisição como texto
    const rawBody = await request.text();
    
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Corpo da requisição vazio' },
        { status: 400 }
      );
    }

    // Parse do evento de webhook
    const webhookEvent = parseWebhookEvent(rawBody);

    // Processar baseado no tipo de evento
    switch (webhookEvent.event) {
      case 'billing.paid':
        await handlePaymentConfirmed(webhookEvent);
        break;
        
      case 'billing.expired':
        await handlePaymentExpired(webhookEvent);
        break;
        
      case 'billing.cancelled':
        await handlePaymentCancelled(webhookEvent);
        break;
        
      default:
        break;
    }

    return NextResponse.json({ 
      success: true,
      event: webhookEvent.event,
      billingId: webhookEvent.data.id,
    });

  } catch (error) {
    console.error('❌ Erro ao processar webhook AbacatePay:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// ========== HANDLERS ==========

async function handlePaymentConfirmed(event: AbacatePayWebhookPayload<BillingWebhookData>) {
  const { data } = event;
  
  // Extrair metadados do externalId ou buscar no banco
  let userId: number | null = null;
  let planType: 'SILVER' | 'GOLD' | 'DIAMOND' | null = null;
  
  // Tentar extrair do externalId (formato: subscription-{userId}-{planType}-{timestamp})
  if (data.externalId) {
    const parts = data.externalId.split('-');
    if (parts.length >= 3 && parts[0] === 'subscription') {
      userId = parseInt(parts[1]);
      planType = parts[2].toUpperCase() as 'SILVER' | 'GOLD' | 'DIAMOND';
    }
  }
  
  if (!userId || !planType) {
    return;
  }

  try {
    // Buscar o plano correspondente
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { signature: planType },
    });

    if (!plan) {
      return;
    }

    // Cancelar assinatura ativa anterior
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

    // Criar nova assinatura
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 mês

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: 'ACTIVE',
        startDate,
        endDate,
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

    // Atualizar signature do produtor
    await prisma.producer.updateMany({
      where: { userId },
      data: { signature: plan.signature },
    });

    // Registrar pagamento no sistema
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: data.amount / 100, // Converter centavos para reais
        currency: 'BRL',
        method: 'PIX',
        status: 'COMPLETED',
        externalId: data.id,
        gatewayData: {
          provider: 'abacatepay',
          billingId: data.id,
          externalId: data.externalId,
          paidAmount: data.paidAmount,
          webhookEvent: event.event,
          devMode: event.devMode,
        },
        paidAt: new Date(),
      },
    });

    // Enviar email de boas-vindas (não bloquear)
    sendWelcomeSubscriptionEmail(subscription as any).catch(() => {
      // Silenciar erro de email
    });

  } catch (error) {
    throw error;
  }
}

async function handlePaymentExpired(event: AbacatePayWebhookPayload<BillingWebhookData>) {
  // Processar expiração se necessário
}

async function handlePaymentCancelled(event: AbacatePayWebhookPayload<BillingWebhookData>) {
  // Processar cancelamento se necessário
}