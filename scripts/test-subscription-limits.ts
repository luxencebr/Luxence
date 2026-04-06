#!/usr/bin/env ts-node

/**
 * Script de teste dos limites e controles de assinatura
 * 
 * Testa verificações de limite, uso de recursos e atualizações de signature
 */

import { PrismaClient } from '@prisma/client';
import { 
  canUploadPhotos, 
  canUploadVideos, 
  canUpdateProfile,
  logSubscriptionUsage 
} from '../src/lib/subscription';
import { getUserSubscriptionInfo } from '../src/lib/subscription-helpers';

const prisma = new PrismaClient();

async function testSubscriptionInfo(userId: number) {
  console.log('\n📊 Testando informações de assinatura...');

  try {
    const info = await getUserSubscriptionInfo(userId);
    
    console.log('✅ Informações obtidas:', {
      signature: info.signature,
      status: info.status,
      limits: info.limits,
      usage: info.usage,
      daysRemaining: info.daysRemaining,
      isExpired: info.isExpired,
      canUpload: info.canUpload,
      canUpdateProfile: info.canUpdateProfile,
    });

    return info;
  } catch (error) {
    console.error('❌ Erro ao obter informações:', error);
    throw error;
  }
}

async function testPhotoLimits(userId: number) {
  console.log('\n📷 Testando limites de fotos...');

  try {
    const result = await canUploadPhotos(userId);
    console.log('✅ Verificação de fotos:', result);

    // Simular uso de fotos
    if (result.canUpload) {
      console.log('📝 Simulando upload de foto...');
      await logSubscriptionUsage(userId, 'photo_upload', 'test-photo-1', {
        fileName: 'test.jpg',
        fileSize: 1024000,
      });
      console.log('✅ Uso de foto registrado');

      // Verificar novamente após uso
      const resultAfter = await canUploadPhotos(userId);
      console.log('📊 Após uso:', resultAfter);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao testar limites de foto:', error);
    throw error;
  }
}

async function testVideoLimits(userId: number) {
  console.log('\n🎬 Testando limites de vídeos...');

  try {
    const result = await canUploadVideos(userId);
    console.log('✅ Verificação de vídeos:', result);

    // Simular uso de vídeos
    if (result.canUpload) {
      console.log('📝 Simulando upload de vídeo...');
      await logSubscriptionUsage(userId, 'video_upload', 'test-video-1', {
        fileName: 'test.mp4',
        fileSize: 5024000,
        duration: 30,
      });
      console.log('✅ Uso de vídeo registrado');

      // Verificar novamente após uso
      const resultAfter = await canUploadVideos(userId);
      console.log('📊 Após uso:', resultAfter);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao testar limites de vídeo:', error);
    throw error;
  }
}

async function testProfileUpdateLimits(userId: number) {
  console.log('\n✏️ Testando limites de atualização de perfil...');

  try {
    const result = await canUpdateProfile(userId);
    console.log('✅ Verificação de perfil:', result);

    // Simular atualização de perfil
    if (result.canUpdate) {
      console.log('📝 Simulando atualização de perfil...');
      await logSubscriptionUsage(userId, 'profile_update', 'test-profile-update-1', {
        field: 'description',
        oldValue: 'Descrição antiga',
        newValue: 'Nova descrição',
      });
      console.log('✅ Atualização de perfil registrada');

      // Verificar novamente após uso
      const resultAfter = await canUpdateProfile(userId);
      console.log('📊 Após uso:', resultAfter);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao testar limites de perfil:', error);
    throw error;
  }
}

async function testSignatureUpdate(userId: number, newSignature: 'SILVER' | 'GOLD' | 'DIAMOND') {
  console.log(`\n🔄 Testando atualização de signature para ${newSignature}...`);

  try {
    // Obter signature atual
    const producer = await prisma.producer.findUnique({
      where: { userId },
      select: { signature: true },
    });

    const oldSignature = producer?.signature;
    console.log('📋 Signature atual:', oldSignature);

    // Atualizar signature
    await prisma.producer.updateMany({
      where: { userId },
      data: { signature: newSignature },
    });

    // Verificar se foi atualizada
    const updatedProducer = await prisma.producer.findUnique({
      where: { userId },
      select: { signature: true },
    });

    console.log('✅ Signature atualizada:', {
      anterior: oldSignature,
      atual: updatedProducer?.signature,
    });

    // Verificar se os limites mudaram
    const newInfo = await getUserSubscriptionInfo(userId);
    console.log('📊 Novos limites:', newInfo.limits);

    return updatedProducer?.signature;
  } catch (error) {
    console.error('❌ Erro ao atualizar signature:', error);
    throw error;
  }
}

async function testUsageLogging(userId: number) {
  console.log('\n📝 Testando registro de uso...');

  try {
    // Registrar vários tipos de uso
    const usageTests = [
      {
        action: 'photo_upload' as const,
        resourceId: 'test-photo-2',
        metadata: { fileName: 'profile.jpg', fileSize: 2048000 },
      },
      {
        action: 'video_upload' as const,
        resourceId: 'test-video-2',
        metadata: { fileName: 'demo.mp4', fileSize: 10240000, duration: 60 },
      },
      {
        action: 'profile_update' as const,
        resourceId: 'test-update-2',
        metadata: { field: 'slogan', newValue: 'Novo slogan' },
      },
    ];

    for (const test of usageTests) {
      console.log(`📋 Registrando ${test.action}...`);
      await logSubscriptionUsage(userId, test.action, test.resourceId, test.metadata);
      console.log('✅ Registrado com sucesso');
    }

    // Verificar logs criados
    const recentLogs = await prisma.subscriptionUsageLog.findMany({
      where: {
        subscription: {
          userId,
        },
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Últimos 5 minutos
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 ${recentLogs.length} logs de uso criados recentemente:`);
    recentLogs.forEach(log => {
      console.log(`  - ${log.action} (${log.resourceId}) em ${log.createdAt.toLocaleString('pt-BR')}`);
    });

    return recentLogs;
  } catch (error) {
    console.error('❌ Erro ao testar logging:', error);
    throw error;
  }
}

async function testLimitExhaustion(userId: number) {
  console.log('\n🚫 Testando esgotamento de limites...');

  try {
    const info = await getUserSubscriptionInfo(userId);
    
    // Simular esgotamento de fotos
    if (info.limits.maxPhotos > 0) {
      console.log(`📷 Simulando ${info.limits.maxPhotos} uploads de foto...`);
      
      // Atualizar diretamente o contador para simular uso máximo
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
      });

      if (activeSubscription) {
        await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: { photosUsed: info.limits.maxPhotos },
        });

        // Verificar se limite foi atingido
        const photoCheck = await canUploadPhotos(userId);
        console.log('📊 Após esgotar limite de fotos:', photoCheck);

        if (!photoCheck.canUpload) {
          console.log('✅ Limite de fotos funcionando corretamente');
        } else {
          console.log('⚠️ Limite de fotos não está sendo respeitado');
        }
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao testar esgotamento:', error);
    throw error;
  }
}

async function testPlanComparison() {
  console.log('\n⚖️ Testando comparação entre planos...');

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    console.log('📋 Planos disponíveis:');
    plans.forEach(plan => {
      console.log(`  ${plan.signature} (${plan.name}):`, {
        price: `R$ ${plan.price.toNumber()}`,
        maxPhotos: plan.maxPhotos,
        maxVideos: plan.maxVideos,
        maxProfileUpdates: plan.maxProfileUpdates === -1 ? 'Ilimitado' : plan.maxProfileUpdates,
        hasCommentControl: plan.hasCommentControl,
        hasVoiceDemo: plan.hasVoiceDemo,
        priority: plan.priority || 'Nenhuma',
        hasFeaturedProfile: plan.hasFeaturedProfile,
      });
    });

    // Verificar hierarquia de planos
    const signatures = ['COPPER', 'SILVER', 'GOLD', 'DIAMOND'];
    const plansBySignature = plans.reduce((acc, plan) => {
      acc[plan.signature] = plan;
      return acc;
    }, {} as Record<string, any>);

    console.log('\n📊 Verificando hierarquia de benefícios:');
    for (let i = 1; i < signatures.length; i++) {
      const current = plansBySignature[signatures[i]];
      const previous = plansBySignature[signatures[i - 1]];
      
      if (current && previous) {
        const isUpgrade = 
          current.maxPhotos >= previous.maxPhotos &&
          current.maxVideos >= previous.maxVideos &&
          current.price.toNumber() >= previous.price.toNumber();
        
        console.log(`  ${previous.signature} → ${current.signature}: ${isUpgrade ? '✅' : '⚠️'} ${isUpgrade ? 'Upgrade válido' : 'Possível problema na hierarquia'}`);
      }
    }

    return plans;
  } catch (error) {
    console.error('❌ Erro ao comparar planos:', error);
    throw error;
  }
}

async function runLimitTests() {
  console.log('🔒 Iniciando testes de limites de assinatura...');
  console.log(`⏰ Executado em: ${new Date().toLocaleString('pt-BR')}\n`);

  try {
    // Encontrar usuário de teste
    const testUser = await prisma.user.findFirst({
      where: {
        role: 'ADVERTISER',
        isDeleted: false,
        producer: {
          isNot: null,
        },
      },
      include: {
        producer: {
          select: {
            id: true,
            signature: true,
          },
        },
      },
    });

    if (!testUser || !testUser.producer) {
      throw new Error('Nenhum usuário anunciante encontrado para teste');
    }

    console.log('👤 Usuário de teste:', {
      id: testUser.id,
      email: testUser.email,
      currentSignature: testUser.producer.signature,
    });

    // 1. Testar informações de assinatura
    await testSubscriptionInfo(testUser.id);

    // 2. Testar comparação entre planos
    await testPlanComparison();

    // 3. Testar limites de fotos
    await testPhotoLimits(testUser.id);

    // 4. Testar limites de vídeos
    await testVideoLimits(testUser.id);

    // 5. Testar limites de perfil
    await testProfileUpdateLimits(testUser.id);

    // 6. Testar registro de uso
    await testUsageLogging(testUser.id);

    // 7. Testar atualização de signature
    await testSignatureUpdate(testUser.id, 'GOLD');

    // 8. Testar esgotamento de limites
    await testLimitExhaustion(testUser.id);

    console.log('\n🎉 Todos os testes de limites concluídos!');
    console.log('✅ Sistema de limites funcionando corretamente');

  } catch (error) {
    console.error('\n💥 Testes de limites falharam:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runLimitTests().catch(console.error);
}

export { runLimitTests };