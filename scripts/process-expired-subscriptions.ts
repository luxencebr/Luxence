import { PrismaClient } from '@prisma/client';
import { processExpiredSubscriptions } from '@/lib/subscription';

const prisma = new PrismaClient();

async function runExpirationJob() {
  console.log('🔄 Processando assinaturas expiradas...');
  
  try {
    await processExpiredSubscriptions();
    console.log('✅ Processamento concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar assinaturas expiradas:', error);
    throw error;
  }
}

if (require.main === module) {
  runExpirationJob()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}