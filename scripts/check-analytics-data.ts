#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verificando dados de analytics...");
  
  try {
    const sessionCount = await prisma.analyticsSession.count();
    console.log(`📊 Total de sessões: ${sessionCount}`);
    
    if (sessionCount > 0) {
      const sessions = await prisma.analyticsSession.findMany({
        take: 5,
        orderBy: { startTime: 'desc' },
        include: {
          pageViews: true,
        },
      });
      
      console.log("\n📋 Últimas 5 sessões:");
      sessions.forEach((session, index) => {
        console.log(`${index + 1}. ID: ${session.id}`);
        console.log(`   SessionId: ${session.sessionId}`);
        console.log(`   País: ${session.country}, Cidade: ${session.city}`);
        console.log(`   Dispositivo: ${session.deviceType} - ${session.browser}`);
        console.log(`   Duração: ${session.duration}s`);
        console.log(`   Page Views: ${session.pageViews.length}`);
        console.log(`   Engajamento: ${session.hasEngagement ? 'Sim' : 'Não'}`);
        console.log(`   Data: ${session.startTime.toISOString()}`);
        console.log("");
      });
      
      // Verificar distribuição por período
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const sessions24h = await prisma.analyticsSession.count({
        where: { startTime: { gte: last24h } }
      });
      
      const sessions7d = await prisma.analyticsSession.count({
        where: { startTime: { gte: last7d } }
      });
      
      console.log(`📈 Distribuição temporal:`);
      console.log(`   - Últimas 24h: ${sessions24h} sessões`);
      console.log(`   - Últimos 7 dias: ${sessions7d} sessões`);
      
      // Verificar agregações
      const hourlyCount = await prisma.analyticsHourly.count();
      const dailyCount = await prisma.analyticsDaily.count();
      
      console.log(`\n📊 Agregações:`);
      console.log(`   - Registros por hora: ${hourlyCount}`);
      console.log(`   - Registros diários: ${dailyCount}`);
    }
    
  } catch (error) {
    console.error("❌ Erro ao verificar dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();