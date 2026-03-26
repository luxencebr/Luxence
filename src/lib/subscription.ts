import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Verifica se o usuário pode fazer upload de fotos
 */
export async function canUploadPhotos(userId: number): Promise<{ canUpload: boolean; reason?: string }> {
  const { getUserSubscriptionInfo } = await import('./subscription-helpers');
  const info = await getUserSubscriptionInfo(userId);
  
  if (info.isExpired) {
    return { canUpload: false, reason: 'Assinatura expirada' };
  }
  
  if (!info.canUpload.photos) {
    return { 
      canUpload: false, 
      reason: `Limite de fotos atingido (${info.usage.photosUsed}/${info.limits.maxPhotos})` 
    };
  }
  
  return { canUpload: true };
}

/**
 * Verifica se o usuário pode fazer upload de vídeos
 */
export async function canUploadVideos(userId: number): Promise<{ canUpload: boolean; reason?: string }> {
  const { getUserSubscriptionInfo } = await import('./subscription-helpers');
  const info = await getUserSubscriptionInfo(userId);
  
  if (info.isExpired) {
    return { canUpload: false, reason: 'Assinatura expirada' };
  }
  
  if (!info.canUpload.videos) {
    return { 
      canUpload: false, 
      reason: `Limite de vídeos atingido (${info.usage.videosUsed}/${info.limits.maxVideos})` 
    };
  }
  
  return { canUpload: true };
}

/**
 * Verifica se o usuário pode atualizar o perfil
 */
export async function canUpdateProfile(userId: number): Promise<{ canUpdate: boolean; reason?: string }> {
  const { getUserSubscriptionInfo } = await import('./subscription-helpers');
  const info = await getUserSubscriptionInfo(userId);
  
  if (info.isExpired) {
    return { canUpdate: false, reason: 'Assinatura expirada' };
  }
  
  if (!info.canUpdateProfile) {
    return { 
      canUpdate: false, 
      reason: `Limite de atualizações atingido (${info.usage.profileUpdatesUsed}/${info.limits.maxProfileUpdates})` 
    };
  }
  
  return { canUpdate: true };
}

/**
 * Registra o uso de um recurso da assinatura
 */
export async function logSubscriptionUsage(
  userId: number, 
  action: 'photo_upload' | 'video_upload' | 'profile_update',
  resourceId?: string,
  metadata?: any
): Promise<void> {
  try {
    const activeSubscription = await (prisma as any).subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (!activeSubscription) {
      return; // Plano gratuito não precisa rastrear uso
    }

    // Registrar log de uso
    await (prisma as any).subscriptionUsageLog.create({
      data: {
        subscriptionId: activeSubscription.id,
        action,
        resourceId,
        metadata,
      },
    });

    // Atualizar contadores na assinatura
    const updateData: any = {};
    
    switch (action) {
      case 'photo_upload':
        updateData.photosUsed = { increment: 1 };
        break;
      case 'video_upload':
        updateData.videosUsed = { increment: 1 };
        break;
      case 'profile_update':
        updateData.profileUpdatesUsed = { increment: 1 };
        break;
    }

    await (prisma as any).subscription.update({
      where: { id: activeSubscription.id },
      data: updateData,
    });
  } catch (error) {
    console.error('Erro ao registrar uso da assinatura:', error);
  }
}

/**
 * Processa assinaturas expiradas
 */
export async function processExpiredSubscriptions(): Promise<void> {
  try {
    const expiredSubscriptions = await (prisma as any).subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: new Date(),
        },
      },
    });

    for (const subscription of expiredSubscriptions) {
      await (prisma as any).subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });
    }

    console.log(`Processadas ${expiredSubscriptions.length} assinaturas expiradas`);
  } catch (error) {
    console.error('Erro ao processar assinaturas expiradas:', error);
  }
}

/**
 * Obtém estatísticas das assinaturas para admin
 */
export async function getSubscriptionStats() {
  try {
    const stats = await (prisma as any).subscription.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const planStats = await (prisma as any).subscription.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });

    const planCounts = planStats.reduce((acc: any, sub: any) => {
      const signature = sub.plan.signature || 'COPPER';
      acc[signature] = (acc[signature] || 0) + 1;
      return acc;
    }, {});

    return {
      byStatus: stats.reduce((acc: any, stat: any) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {}),
      byPlan: planCounts,
      total: stats.reduce((sum: number, stat: any) => sum + stat._count.id, 0),
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas das assinaturas:', error);
    return {
      byStatus: {},
      byPlan: {},
      total: 0,
    };
  }
}