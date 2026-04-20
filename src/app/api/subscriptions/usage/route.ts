import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { logSubscriptionUsage } from '@/lib/subscription';

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
    const { action, resourceId, metadata } = body;

    // Temporariamente permitindo profile_update mas sem efeito
    if (!action || !['photo_upload', 'video_upload', 'profile_update'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida' },
        { status: 400 }
      );
    }

    await logSubscriptionUsage(
      parseInt(session.user.id),
      action,
      resourceId,
      metadata
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar uso da assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}