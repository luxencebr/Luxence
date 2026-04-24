#!/usr/bin/env tsx

/**
 * Script para migrar dados de analytics da memória para o banco
 * Uso: npm run migrate-analytics
 */

import { PrismaClient } from "@prisma/client";
import { getAnalyticsService } from "../src/lib/analytics-service";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando migração de analytics...");
  
  try {
    // Executar agregações iniciais
    console.log("📊 Executando agregações iniciais...");
    
    const analyticsService = getAnalyticsService(prisma);
    await analyticsService.aggregateHourlyData();
    await analyticsService.aggregateDailyData();
    
    console.log("✅ Migração concluída com sucesso!");
    
    // Mostrar estatísticas
    const stats = await prisma.analyticsSession.aggregate({
      _count: { id: true },
      _min: { startTime: true },
      _max: { startTime: true },
    });
    
    console.log(`📈 Estatísticas:`);
    console.log(`   - Total de sessões: ${stats._count.id}`);
    if (stats._min.startTime && stats._max.startTime) {
      console.log(`   - Período: ${stats._min.startTime} até ${stats._max.startTime}`);
    }
    
    const pageViewsCount = await prisma.analyticsPageView.count();
    console.log(`   - Total de page views: ${pageViewsCount}`);
    
  } catch (error) {
    console.error("❌ Erro durante migração:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});