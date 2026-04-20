import { PrismaClient, SIGNATURE } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSubscriptions() {
  console.log('🔄 Iniciando migração de assinaturas...');

  try {
    // Migrar produtores existentes para o sistema de assinaturas
    console.log('👥 Migrando produtores existentes...');
    
    const producers = await prisma.producer.findMany({
      include: {
        user: true,
      },
    });

    let migratedCount = 0;

    for (const producer of producers) {
      // Verificar se já tem assinatura ativa
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: producer.userId,
          status: 'ACTIVE',
        },
      });

      if (existingSubscription) {
        console.log(`⏭️  Usuário ${producer.user.email} já tem assinatura ativa`);
        continue;
      }

      // Buscar o plano correspondente à signature atual
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { signature: producer.signature },
      });

      if (!plan) {
        console.log(`⚠️  Plano ${producer.signature} não encontrado para ${producer.user.email}`);
        continue;
      }

      // Criar assinatura baseada na signature atual
      const startDate = producer.user.createdAt;
      const endDate = plan.price.toNumber() === 0 
        ? new Date(2099, 11, 31) // Data muito no futuro para plano gratuito
        : new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 dias para planos pagos

      // Contar fotos reais do usuário
      const { countUserPhotos } = await import('../src/lib/subscription-helpers');
      const realPhotosCount = await countUserPhotos(producer.userId);

      await prisma.subscription.create({
        data: {
          userId: producer.userId,
          planId: plan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
          photosUsed: realPhotosCount, // Usar contagem real
          videosUsed: 0,
          profileUpdatesUsed: 0,
        },
      });

      migratedCount++;
      console.log(`✅ Migrado: ${producer.user.email} (${producer.signature})`);
    }

    console.log(`🎉 Migração concluída! ${migratedCount} produtores migrados.`);

    // Estatísticas finais
    const stats = await prisma.subscription.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    console.log('\n📊 Estatísticas das assinaturas:');
    stats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count.id}`);
    });

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateSubscriptions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { migrateSubscriptions };