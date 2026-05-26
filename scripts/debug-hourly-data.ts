#!/usr/bin/env tsx

/**
 * Script para debugar dados horários de analytics
 * Verifica se os dados estão sendo criados e consultados corretamente
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugHourlyData() {
  console.log("🔍 Debugando dados horários...");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentHour = now.getHours();

  console.log(`📅 Data atual: ${today.toDateString()}`);
  console.log(`🕐 Hora atual: ${currentHour}h`);
  console.log(`⏰ Timestamp atual: ${now.toISOString()}`);

  // Verificar dados do dia atual
  const dayStart = new Date(today);
  const dayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  console.log(`\n🔎 Buscando sessões entre:`);
  console.log(`   Início: ${dayStart.toISOString()}`);
  console.log(`   Fim: ${dayEnd.toISOString()}`);

  const allSessions = await prisma.analyticsSession.findMany({
    where: {
      startTime: { gte: dayStart, lt: dayEnd },
    },
    select: {
      sessionId: true,
      startTime: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  console.log(`\n📊 Total de sessões encontradas: ${allSessions.length}`);

  if (allSessions.length === 0) {
    console.log("❌ Nenhuma sessão encontrada para hoje!");
    console.log("💡 Execute: npx tsx scripts/test-hourly-data.ts");
    return;
  }

  // Agrupar por hora
  const hourlyData = new Map<number, number>();
  
  // Inicializar todas as horas
  for (let hour = 0; hour <= currentHour; hour++) {
    hourlyData.set(hour, 0);
  }

  // Contar sessões por hora
  allSessions.forEach(session => {
    const hour = session.startTime.getHours();
    if (hour <= currentHour) {
      hourlyData.set(hour, (hourlyData.get(hour) || 0) + 1);
    }
  });

  console.log("\n📈 Distribuição por hora:");
  for (let hour = 0; hour <= currentHour; hour++) {
    const count = hourlyData.get(hour) || 0;
    const hourStr = String(hour).padStart(2, '0');
    const bar = "█".repeat(Math.min(count, 20));
    console.log(`${hourStr}h: ${count.toString().padStart(3)} ${bar}`);
  }

  // Verificar sessões de teste
  const testSessions = allSessions.filter(s => s.sessionId.startsWith('test-'));
  console.log(`\n🧪 Sessões de teste: ${testSessions.length}`);

  // Verificar primeira e última sessão
  if (allSessions.length > 0) {
    const first = allSessions[0];
    const last = allSessions[allSessions.length - 1];
    console.log(`\n⏰ Primeira sessão: ${first.startTime.toISOString()} (${first.startTime.getHours()}h)`);
    console.log(`⏰ Última sessão: ${last.startTime.toISOString()} (${last.startTime.getHours()}h)`);
  }

  // Testar a função do analytics service
  console.log("\n🔧 Testando função getSessionsByHour...");
  
  try {
    // Simular a lógica da função
    const currentHourEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, 59, 59, 999);
    
    const sessions = await prisma.analyticsSession.findMany({
      where: {
        startTime: { gte: dayStart, lte: currentHourEnd },
      },
      select: {
        startTime: true,
      },
    });

    console.log(`📊 Sessões encontradas pela função: ${sessions.length}`);
    
    const hourlyMap = new Map<number, number>();
    for (let hour = 0; hour <= currentHour; hour++) {
      hourlyMap.set(hour, 0);
    }

    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      if (hourlyMap.has(hour)) {
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      }
    });

    console.log("📈 Resultado da função:");
    Array.from(hourlyMap.entries()).forEach(([hour, views]) => {
      const hourStr = String(hour).padStart(2, '0');
      console.log(`${hourStr}h: ${views} sessões`);
    });

  } catch (error) {
    console.error("❌ Erro ao testar função:", error);
  }
}

async function main() {
  try {
    await debugHourlyData();
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}