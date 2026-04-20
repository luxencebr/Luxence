import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAbacatePayClient } from '@/lib/abacatepay';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const { planSignature } = body;

    // Validar plano
    if (!planSignature || !['SILVER', 'GOLD', 'DIAMOND'].includes(planSignature)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    // Buscar dados do usuário e produtor
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: {
        producer: {
          select: {
            document: true,
            phone: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (!user.producer) {
      return NextResponse.json(
        { error: 'Cadastro de anunciante não encontrado. Complete seu cadastro primeiro.' },
        { status: 400 }
      );
    }

    // Buscar o plano
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { signature: planSignature },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já tem assinatura ativa do mesmo plano
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        plan: true,
      },
    });

    if (activeSubscription && activeSubscription.plan.signature === planSignature) {
      return NextResponse.json(
        { error: 'Você já possui uma assinatura ativa deste plano' },
        { status: 400 }
      );
    }

    // Verificar se as URLs estão definidas
    if (!process.env.NEXTAUTH_URL) {
      throw new Error('NEXTAUTH_URL não está definido nas variáveis de ambiente');
    }

    // Verificar se o preço é válido
    const priceInCents = Math.round(plan.price.toNumber() * 100);
    if (priceInCents <= 0) {
      throw new Error(`Preço inválido para o plano ${planSignature}: ${plan.price.toNumber()}`);
    }

    // Validar dados obrigatórios para AbacatePay
    if (!user.producer.phone) {
      return NextResponse.json(
        { error: 'Número de telefone é obrigatório para processar o pagamento. Por favor, atualize seu perfil.' },
        { status: 400 }
      );
    }

    if (!user.producer.document) {
      return NextResponse.json(
        { error: 'Documento (CPF/CNPJ) é obrigatório para processar o pagamento. Por favor, complete seu cadastro de anunciante.' },
        { status: 400 }
      );
    }

    // Formatar telefone (remover caracteres especiais)
    const cleanPhone = user.producer.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json(
        { error: 'Número de telefone inválido. Por favor, atualize seu perfil com um número válido.' },
        { status: 400 }
      );
    }

    // Formatar documento (remover caracteres especiais)
    const cleanDocument = user.producer.document.replace(/\D/g, '');
    if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
      return NextResponse.json(
        { error: 'Documento inválido. Por favor, verifique seu CPF/CNPJ.' },
        { status: 400 }
      );
    }

    // Criar cobrança PIX
    const client = getAbacatePayClient();
    
    const billing = await client.createBilling({
      products: [{
        externalId: `plano-${planSignature.toLowerCase()}-1mes`,
        name: `Plano ${plan.name} - 1 Mês`,
        description: `Assinatura mensal do plano ${plan.name}`,
        quantity: 1,
        price: priceInCents,
      }],
      customer: {
        name: user.name,
        email: user.email,
        cellphone: cleanPhone,
        taxId: cleanDocument,
      },
      externalId: `subscription-${user.id}-${planSignature}-${Date.now()}`,
      returnUrl: `${process.env.NEXTAUTH_URL}/profile/signature?payment=success`,
      completionUrl: `${process.env.NEXTAUTH_URL}/profile/signature?payment=completed`,
    });

    // Retornar dados do pagamento
    return NextResponse.json({
      success: true,
      payment: {
        id: billing.id,
        status: billing.status,
        amount: billing.amount,
        amountFormatted: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(billing.amount / 100),
        plan: {
          signature: planSignature,
          name: plan.name,
          price: plan.price.toNumber(),
        },
        paymentUrl: billing.url,
        devMode: billing.devMode,
      },
    });

  } catch (error) {
    console.error('Erro ao criar cobrança PIX:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const billingId = searchParams.get('billingId');

    if (!billingId) {
      return NextResponse.json(
        { error: 'ID da cobrança é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar cobrança no banco de dados local
    const payment = await prisma.payment.findFirst({
      where: {
        externalId: billingId,
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Cobrança não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.externalId,
        status: payment.status,
        amount: payment.amount.toNumber() * 100, // Converter para centavos
        amountFormatted: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(payment.amount.toNumber()),
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        plan: payment.subscription ? {
          name: payment.subscription.plan.name,
          signature: payment.subscription.plan.signature,
        } : null,
      },
    });

  } catch (error) {
    console.error('Erro ao consultar cobrança PIX:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}