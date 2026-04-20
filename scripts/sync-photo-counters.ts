#!/usr/bin/env tsx

/**
 * Script para sincronizar os contadores de fotos das assinaturas com a contagem real
 * 
 * Este script corrige inconsistências que podem ter ocorrido quando fotos foram
 * removidas sem atualizar os contadores da assinatura.
 */

import { PrismaClient } from '@prisma/client';
import { countUserPhotos, syncSubscriptionCounters } from '../src/lib/subscription-helpers';

const prisma = new PrismaClient();

async function syncAllPhotoCounters() {
  console.log('🔄 Iniciando sincronização dos contadores de fotos...');
  
  try {
    // Buscar todas as assinaturas ativas
    const activeSubscriptions = await (prisma as any).subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    console.log(`📊 Encontradas ${activeSubscriptions.length} assinaturas ativas para sincronizar`);

    let syncedCount = 0;
    let errorCount = 0;

    for (const subscription of activeSubscriptions) {
      try {
        const userId = subscription.userId;
        const currentCounterValue = subscription.photosUsed;
        const realPhotosCount = await countUserPhotos(userId);

        if (currentCounterValue !== realPhotosCount) {
          console.log(`🔧 Usuário ${subscription.user.email}: ${currentCounterValue} → ${realPhotosCount} fotos`);
          await syncSubscriptionCounters(userId);
          syncedCount++;
        } else {
          console.log(`✅ Usuário ${subscription.user.email}: contador já correto (${realPhotosCount} fotos)`);
        }
      } catch (error) {
        console.error(`❌ Erro ao sincronizar usuário ${subscription.user.email}:`, error);
        errorCount++;
      }
    }

    console.log('\n📈 Resumo da sincronização:');
    console.log(`✅ Sincronizados: ${syncedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total processados: ${activeSubscriptions.length}`);
    
    if (syncedCount > 0) {
      console.log('\n🎉 Sincronização concluída! Os contadores foram atualizados.');
    } else {
      console.log('\n✨ Todos os contadores já estavam corretos!');
    }

  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
if (require.main === module) {
  syncAllPhotoCounters()
    .then(() => {
      console.log('✅ Script finalizado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script falhou:', error);
      process.exit(1);
    });
}

export { syncAllPhotoCounters };