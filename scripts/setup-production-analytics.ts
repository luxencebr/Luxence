#!/usr/bin/env tsx

/**
 * Script para configurar analytics em produção
 * Remove dados de teste e configura o sistema
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Configurando analytics para produção...");
  
  try {
    // Verificar se há dados de teste
    const testSessions = await prisma.analyticsSession.count({
      where: {
        OR: [
          { sessionId: { startsWith: "test_session_" } },
          { sessionId: { startsWith: "validation_test_" } },
          { sessionId: { startsWith: "sess_" } }
        ]
      }
    });
    
    if (testSessions > 0) {
      console.log(`🧹 Removendo ${testSessions} sessões de teste...`);
      
      // Remover page views de teste primeiro (devido à foreign key)
      await prisma.analyticsPageView.deleteMany({
        where: {
          session: {
            OR: [
              { sessionId: { startsWith: "test_session_" } },
              { sessionId: { startsWith: "validation_test_" } },
              { sessionId: { startsWith: "sess_" } }
            ]
          }
        }
      });
      
      // Remover sessões de teste
      await prisma.analyticsSession.deleteMany({
        where: {
          OR: [
            { sessionId: { startsWith: "test_session_" } },
            { sessionId: { startsWith: "validation_test_" } },
            { sessionId: { startsWith: "sess_" } }
          ]
        }
      });
      
      console.log("✅ Dados de teste removidos");
    } else {
      console.log("ℹ️  Nenhum dado de teste encontrado");
    }
    
    // Limpar agregações de teste
    await prisma.analyticsHourly.deleteMany();
    await prisma.analyticsDaily.deleteMany();
    console.log("✅ Agregações de teste limpas");
    
    // Verificar estado final
    const finalStats = {
      sessions: await prisma.analyticsSession.count(),
      pageViews: await prisma.analyticsPageView.count(),
      hourlyAggregations: await prisma.analyticsHourly.count(),
      dailyAggregations: await prisma.analyticsDaily.count(),
    };
    
    console.log("\n📊 Estado final do sistema:");
    console.log(`   - Sessões: ${finalStats.sessions}`);
    console.log(`   - Page Views: ${finalStats.pageViews}`);
    console.log(`   - Agregações por hora: ${finalStats.hourlyAggregations}`);
    console.log(`   - Agregações diárias: ${finalStats.dailyAggregations}`);
    
    console.log("\n🎯 Sistema pronto para produção!");
    console.log("\n📋 Próximos passos:");
    console.log("   1. Configure o cron job: ./cron-setup.sh");
    console.log("   2. Os dados serão coletados automaticamente");
    console.log("   3. Agregações executarão a cada hora");
    
  } catch (error) {
    console.error("❌ Erro na configuração:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});