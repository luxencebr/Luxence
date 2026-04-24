#!/usr/bin/env tsx

/**
 * Job para agregar dados de analytics
 * Deve ser executado via cron a cada hora
 * Uso: npm run aggregate-analytics
 */

import { PrismaClient } from "@prisma/client";
import { getAnalyticsService } from "../src/lib/analytics-service";

const prisma = new PrismaClient();

async function main() {
  console.log("📊 Iniciando agregação de analytics...");
  
  try {
    const analyticsService = getAnalyticsService(prisma);
    
    // Agregar dados por hora
    console.log("⏰ Agregando dados por hora...");
    await analyticsService.aggregateHourlyData();
    
    // Agregar dados diários (apenas se for início do dia)
    const now = new Date();
    if (now.getHours() === 0) {
      console.log("📅 Agregando dados diários...");
      await analyticsService.aggregateDailyData();
    }
    
    // Limpeza de dados antigos (manter apenas 90 dias de dados brutos)
    const cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    console.log("🧹 Limpando dados antigos...");
    const deletedSessions = await prisma.analyticsSession.deleteMany({
      where: {
        startTime: { lt: cutoffDate },
      },
    });
    
    if (deletedSessions.count > 0) {
      console.log(`   - Removidas ${deletedSessions.count} sessões antigas`);
    }
    
    // Limpeza de dados agregados antigos (manter apenas 2 anos)
    const oldCutoffDate = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
    
    const deletedHourly = await prisma.analyticsHourly.deleteMany({
      where: {
        date: { lt: oldCutoffDate },
      },
    });
    
    const deletedDaily = await prisma.analyticsDaily.deleteMany({
      where: {
        date: { lt: oldCutoffDate },
      },
    });
    
    if (deletedHourly.count > 0 || deletedDaily.count > 0) {
      console.log(`   - Removidos ${deletedHourly.count} registros por hora e ${deletedDaily.count} registros diários antigos`);
    }
    
    console.log("✅ Agregação concluída com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro durante agregação:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});