import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Conta o número real de fotos no perfil do usuário
 */
export async function countUserPhotos(userId: number): Promise<number> {
  try {
    const producer = await prisma.producer.findUnique({
      where: { userId },
      include: {
        profile: true,
      },
    });

    if (!producer?.profile?.images) {
      return 0;
    }

    try {
      const images = Array.isArray(producer.profile.images) 
        ? producer.profile.images 
        : JSON.parse(producer.profile.images as string);
      return Array.isArray(images) ? images.length : 0;
    } catch (error) {
      console.error('Erro ao contar fotos do perfil:', error);
      return 0;
    }
  } catch (error) {
    console.error('Erro ao buscar dados do produtor:', error);
    return 0;
  }
}

/**
 * Cria uma nova assinatura inicializando os contadores corretamente
 */
export async function createSubscriptionWithCorrectCounters(
  userId: number,
  planId: number,
  startDate: Date,
  endDate: Date
) {
  // Contar recursos reais do usuário
  const currentPhotosCount = await countUserPhotos(userId);
  
  // TODO: Implementar contagem de vídeos e atualizações de perfil quando necessário
  const currentVideosCount = 0;
  const currentProfileUpdatesCount = 0;

  return await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'ACTIVE',
      startDate,
      endDate,
      photosUsed: currentPhotosCount,
      videosUsed: currentVideosCount,
      profileUpdatesUsed: currentProfileUpdatesCount,
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
}

/**
 * Obtém informações completas da assinatura do usuário
 */
export async function getUserSubscriptionInfo(userId: number) {
  try {
    // Buscar assinatura ativa
    const activeSubscription = await (prisma as any).subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        plan: true,
      },
      orderBy: {
        endDate: 'desc',
      },
    });

    // Contar fotos reais
    const photosUsed = await countUserPhotos(userId);

    // Se não tem assinatura ativa, usar plano COPPER
    if (!activeSubscription) {
      return {
        signature: 'COPPER',
        status: 'ACTIVE',
        limits: {
          maxPhotos: 3,
          maxVideos: 0,
          maxProfileUpdates: 2,
          hasCommentControl: false,
          hasVoiceDemo: false,
          priority: '',
          hasFeaturedProfile: false,
        },
        usage: {
          photosUsed,
          videosUsed: 0,
          profileUpdatesUsed: 0,
        },
        startDate: new Date().toISOString(),
        endDate: new Date(2099, 11, 31).toISOString(),
        daysRemaining: 999999,
        isExpired: false,
        canUpload: {
          photos: photosUsed < 3,
          videos: false,
        },
        canUpdateProfile: true,
      };
    }

    // Assinatura ativa encontrada
    const now = new Date();
    const daysRemaining = Math.ceil((activeSubscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = now.getTime() > activeSubscription.endDate.getTime();

    return {
      signature: (activeSubscription.plan as any).signature || 'COPPER',
      status: activeSubscription.status,
      limits: {
        maxPhotos: activeSubscription.plan.maxPhotos,
        maxVideos: activeSubscription.plan.maxVideos,
        maxProfileUpdates: (activeSubscription.plan as any).maxProfileUpdates || (activeSubscription.plan as any).maxUpdates || 2,
        hasCommentControl: activeSubscription.plan.hasCommentControl,
        hasVoiceDemo: activeSubscription.plan.hasVoiceDemo,
        priority: (activeSubscription.plan as any).priority || '',
        hasFeaturedProfile: (activeSubscription.plan as any).hasFeaturedProfile || false,
      },
      usage: {
        photosUsed: activeSubscription.photosUsed,
        videosUsed: activeSubscription.videosUsed,
        profileUpdatesUsed: activeSubscription.profileUpdatesUsed,
      },
      startDate: activeSubscription.startDate.toISOString(),
      endDate: activeSubscription.endDate.toISOString(),
      daysRemaining: Math.max(0, daysRemaining),
      isExpired,
      canUpload: {
        photos: activeSubscription.photosUsed < activeSubscription.plan.maxPhotos,
        videos: activeSubscription.videosUsed < activeSubscription.plan.maxVideos,
      },
      canUpdateProfile: ((activeSubscription.plan as any).maxProfileUpdates || (activeSubscription.plan as any).maxUpdates) === -1 || 
                       activeSubscription.profileUpdatesUsed < ((activeSubscription.plan as any).maxProfileUpdates || (activeSubscription.plan as any).maxUpdates || 2),
    };
  } catch (error) {
    console.error('Erro ao buscar informações da assinatura:', error);
    
    // Fallback com contagem real de fotos
    const photosUsed = await countUserPhotos(userId);
    
    return {
      signature: 'COPPER',
      status: 'ACTIVE',
      limits: {
        maxPhotos: 3,
        maxVideos: 0,
        maxProfileUpdates: 2,
        hasCommentControl: false,
        hasVoiceDemo: false,
        priority: '',
        hasFeaturedProfile: false,
      },
      usage: {
        photosUsed,
        videosUsed: 0,
        profileUpdatesUsed: 0,
      },
      startDate: new Date().toISOString(),
      endDate: new Date(2099, 11, 31).toISOString(),
      daysRemaining: 999999,
      isExpired: false,
      canUpload: {
        photos: photosUsed < 3,
        videos: false,
      },
      canUpdateProfile: true,
    };
  }
}

/**
 * Cria uma assinatura gratuita COPPER para novos usuários
 */
export async function createFreeSubscription(userId: number): Promise<void> {
  try {
    // Verificar se já existe uma assinatura ativa
    const existingSubscription = await (prisma as any).subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (existingSubscription) {
      return; // Já tem assinatura ativa
    }

    // Buscar o plano COPPER
    const copperPlan = await (prisma as any).subscriptionPlan.findFirst({
      where: {
        signature: 'COPPER',
      },
    });

    if (!copperPlan) {
      console.error('Plano COPPER não encontrado');
      return;
    }

    // Criar assinatura gratuita permanente
    await (prisma as any).subscription.create({
      data: {
        userId,
        planId: copperPlan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(2099, 11, 31), // Data muito distante no futuro
        photosUsed: 0,
        videosUsed: 0,
        profileUpdatesUsed: 0,
      },
    });
  } catch (error) {
    console.error('Erro ao criar assinatura gratuita:', error);
  }
}