import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { processSubscriptionNotifications } from '@/lib/subscription-notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    console.log('🔄 Processamento manual de notificações iniciado por:', session.user.email);
    
    await processSubscriptionNotifications();

    return NextResponse.json({ 
      success: true,
      message: 'Notificações processadas com sucesso',
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao processar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}