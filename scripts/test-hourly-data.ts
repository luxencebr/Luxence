#!/usr/bin/env tsx

/**
 * Script para testar dados horários de analytics
 * Cria sessões de teste para o dia atual em diferentes horas
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestHourlyData() {
  console.log("🕐 Criando dados de teste para análise horária...");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentHour = now.getHours();

  console.log(`📅 Data atual: ${today.toDateString()}`);
  console.log(`🕐 Hora atual: ${currentHour}h`);

  // Limpar dados de teste anteriores do dia atual
  const dayStart = new Date(today);
  const dayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  
  const deletedCount = await prisma.analyticsSession.deleteMany({
    where: {
      sessionId: { startsWith: "test-" },
      startTime: { gte: dayStart, lt: dayEnd },
    },
  });
  
  console.log(`🗑️ Removidos ${deletedCount.count} dados de teste anteriores`);

  // Criar sessões para cada hora do dia atual até a hora atual
  const testSessions = [];

  for (let hour = 0; hour <= currentHour; hour++) {
    // Número variável de sessões por hora (simulando padrões reais)
    const sessionsInHour = Math.floor(Math.random() * 15) + 1; // 1-15 sessões por hora
    
    console.log(`⏰ Criando ${sessionsInHour} sessões para ${String(hour).padStart(2, '0')}h`);
    
    for (let i = 0; i < sessionsInHour; i++) {
      const sessionTime = new Date(today);
      sessionTime.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      
      const sessionId = `test-${hour}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fingerprint = `fp-${hour}-${i}-${Math.random().toString(36).substr(2, 9)}`;
      
      testSessions.push({
        sessionId,
        fingerprint,
        userId: Math.random() > 0.7 ? Math.floor(Math.random() * 100) + 1 : null, // 30% logados
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (Test Browser)",
        country: "Brasil",
        region: "São Paulo",
        city: "São Paulo",
        deviceType: Math.random() > 0.6 ? "Desktop" : Math.random() > 0.5 ? "Mobile" : "Tablet",
        browser: Math.random() > 0.5 ? "Chrome" : "Firefox",
        browserVersion: "120.0",
        os: Math.random() > 0.5 ? "Windows" : "Linux",
        osVersion: "10",
        viewport: "1920x1080",
        language: "pt-BR",
        startTime: sessionTime,
        lastActivity: new Date(sessionTime.getTime() + Math.random() * 3600000), // Até 1h depois
        duration: Math.floor(Math.random() * 1800), // 0-30 minutos
        pageViewCount: Math.floor(Math.random() * 10) + 1,
        hasEngagement: Math.random() > 0.4, // 60% com engajamento
        bounced: Math.random() > 0.7, // 30% bounce
        isActive: hour === currentHour && Math.random() > 0.5, // Alguns ativos na hora atual
      });
    }
  }

  console.log(`📊 Criando ${testSessions.length} sessões de teste para ${currentHour + 1} horas...`);

  // Inserir sessões em lotes para melhor performance
  const batchSize = 50;
  for (let i = 0; i < testSessions.length; i += batchSize) {
    const batch = testSessions.slice(i, i + batchSize);
    
    try {
      await prisma.analyticsSession.createMany({
        data: batch,
        skipDuplicates: true,
      });
      console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} inserido (${batch.length} sessões)`);
    } catch (error) {
      console.error(`❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`, error);
    }
  }

  // Mostrar resumo por hora
  console.log("\n📈 Resumo de sessões por hora:");
  for (let hour = 0; hour <= currentHour; hour++) {
    const hourSessions = testSessions.filter(s => s.startTime.getHours() === hour);
    const hourStr = String(hour).padStart(2, '0');
    console.log(`${hourStr}h: ${hourSessions.length} sessões`);
  }

  console.log("\n🎉 Dados de teste criados com sucesso!");
  console.log("💡 Acesse /admin/metrics e selecione '24h' para ver os dados horários");
  console.log(`🕐 Dados criados de 00h até ${currentHour}h (hora atual)`);
}

async function main() {
  try {
    await createTestHourlyData();
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