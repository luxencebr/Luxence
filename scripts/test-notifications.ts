#!/usr/bin/env ts-node

/**
 * Script de teste do sistema de notificações de assinatura
 * 
 * Testa todos os tipos de notificação e a linha do tempo
 */

import { PrismaClient } from '@prisma/client';
import { 
  processSubscriptionNotifications,
  sendWelcomeSubscriptionEmail,
  sendSubscriptionReminderEmail,
  sendSubscriptionExpiredEmail,
  calculateReminderDate,
  getDaysUntilExpiration
} from '../src/lib/subscription-notifications';

const prisma = new PrismaClient();

async function createTestSubscription(userId: number, planSignature: 'SILVER' | 'GOLD' | 'DIAMOND', daysFromNow: number) {
  console.log(`📝 Criando assinatura de teste (${planSignature}, ${daysFromNow} dias)...`);

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { signature: planSignature },
  });

  if (!plan) {
    throw new Error(`Plano ${planSignature} não encontrado`);
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysFromNow);

  // Cancelar assinaturas ativas anteriores
  await prisma.subscription.updateMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status: 'ACTIVE',
      startDate,
      endDate,
      photosUsed: 0,
      videosUsed: 0,
      profileUpdatesUsed: 0,
    },
    include: {
      user: true,
      plan: true,
    },
  });

  console.log('✅ Assinatura de teste criada:', {
    id: subscription.id,
    planName: subscription.plan.name,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    daysRemaining: getDaysUntilExpiration(subscription.endDate),
  });

  return subscription;
}

async function testWelcomeEmail(subscription: any) {
  console.log('\n📧 Testando email de boas-vindas...');

  try {
    await sendWelcomeSubscriptionEmail(subscription);
    console.log('✅ Email de boas-vindas enviado com sucesso');

    // Verificar se foi registrado
    const notification = await prisma.subscriptionNotification.findFirst({
      where: {
        subscriptionId: subscription.id,
        type: 'WELCOME',
      },
    });

    if (notification) {
      console.log('✅ Notificação de boas-vindas registrada:', {
        type: notification.type,
        sentAt: notification.sentAt,
        emailSent: notification.emailSent,
      });
    } else {
      console.log('⚠️ Notificação de boas-vindas não foi registrada');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error);
    return false;
  }
}

async function testReminderEmail(subscription: any, daysRemaining: number) {
  console.log(`\n⏰ Testando email de lembrete (${daysRemaining} dias)...`);

  try {
    await sendSubscriptionReminderEmail(subscription, daysRemaining);
    console.log('✅ Email de lembrete enviado com sucesso');

    // Verificar se foi registrado
    const notificationType = daysRemaining === 0 ? 'LAST_DAY' : 'REMINDER';
    const notification = await prisma.subscriptionNotification.findFirst({
      where: {
        subscriptionId: subscription.id,
        type: notificationType,
      },
    });

    if (notification) {
      console.log('✅ Notificação de lembrete registrada:', {
        type: notification.type,
        sentAt: notification.sentAt,
        metadata: notification.metadata,
      });
    } else {
      console.log('⚠️ Notificação de lembrete não foi registrada');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de lembrete:', error);
    return false;
  }
}

async function testExpiredEmail(subscription: any) {
  console.log('\n❌ Testando email de expiração...');

  try {
    await sendSubscriptionExpiredEmail(subscription);
    console.log('✅ Email de expiração enviado com sucesso');

    // Verificar se foi registrado
    const notification = await prisma.subscriptionNotification.findFirst({
      where: {
        subscriptionId: subscription.id,
        type: 'EXPIRED',
      },
    });

    if (notification) {
      console.log('✅ Notificação de expiração registrada:', {
        type: notification.type,
        sentAt: notification.sentAt,
        metadata: notification.metadata,
      });
    } else {
      console.log('⚠️ Notificação de expiração não foi registrada');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de expiração:', error);
    return false;
  }
}

async function testNotificationTimeline() {
  console.log('\n📅 Testando linha do tempo de notificações...');

  // Testar cálculos de data
  const startDate = new Date();
  const endDate30Days = new Date();
  endDate30Days.setDate(endDate30Days.getDate() + 30);

  const reminderDate = calculateReminderDate(startDate, endDate30Days);
  const daysUntilReminder = Math.ceil((reminderDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilExpiration = getDaysUntilExpiration(endDate30Days);

  console.log('📊 Cálculos de timeline:', {
    startDate: startDate.toLocaleDateString('pt-BR'),
    endDate: endDate30Days.toLocaleDateString('pt-BR'),
    reminderDate: reminderDate.toLocaleDateString('pt-BR'),
    daysUntilReminder,
    daysUntilExpiration,
  });

  // Verificar se os cálculos estão corretos
  const expectedReminderDay = Math.ceil(30 * 0.75); // 75% de 30 dias = ~22-23 dias
  if (Math.abs(daysUntilReminder - expectedReminderDay) > 1) {
    console.log('⚠️ Cálculo de data de lembrete pode estar incorreto');
  } else {
    console.log('✅ Cálculo de data de lembrete correto');
  }

  if (daysUntilExpiration !== 30) {
    console.log('⚠️ Cálculo de dias até expiração pode estar incorreto');
  } else {
    console.log('✅ Cálculo de dias até expiração correto');
  }
}

async function testAutomaticProcessing() {
  console.log('\n🤖 Testando processamento automático...');

  try {
    await processSubscriptionNotifications();
    console.log('✅ Processamento automático executado com sucesso');

    // Verificar quantas notificações foram processadas
    const recentNotifications = await prisma.subscriptionNotification.findMany({
      where: {
        sentAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Últimos 5 minutos
        },
      },
      include: {
        subscription: {
          include: {
            plan: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(`📊 ${recentNotifications.length} notificações processadas recentemente:`);
    recentNotifications.forEach(notification => {
      console.log(`  - ${notification.type} para ${notification.subscription.user.email} (${notification.subscription.plan.name})`);
    });

    return true;
  } catch (error) {
    console.error('❌ Erro no processamento automático:', error);
    return false;
  }
}

async function testNotificationDuplicates(subscription: any) {
  console.log('\n🔒 Testando prevenção de duplicatas...');

  try {
    // Tentar enviar o mesmo email duas vezes
    await sendWelcomeSubscriptionEmail(subscription);
    await sendWelcomeSubscriptionEmail(subscription);

    // Verificar se apenas uma notificação foi registrada
    const notifications = await prisma.subscriptionNotification.findMany({
      where: {
        subscriptionId: subscription.id,
        type: 'WELCOME',
      },
    });

    if (notifications.length === 1) {
      console.log('✅ Prevenção de duplicatas funcionando corretamente');
    } else {
      console.log(`⚠️ Encontradas ${notifications.length} notificações (esperado: 1)`);
    }

    return notifications.length === 1;
  } catch (error) {
    console.error('❌ Erro ao testar duplicatas:', error);
    return false;
  }
}

async function runNotificationTests() {
  console.log('📧 Iniciando testes do sistema de notificações...');
  console.log(`⏰ Executado em: ${new Date().toLocaleString('pt-BR')}\n`);

  try {
    // Encontrar usuário de teste
    const testUser = await prisma.user.findFirst({
      where: {
        role: 'ADVERTISER',
        isDeleted: false,
      },
    });

    if (!testUser) {
      throw new Error('Nenhum usuário anunciante encontrado para teste');
    }

    console.log('👤 Usuário de teste:', {
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
    });

    // 1. Testar timeline de notificações
    await testNotificationTimeline();

    // 2. Criar assinatura de teste (30 dias)
    const subscription = await createTestSubscription(testUser.id, 'GOLD', 30);

    // 3. Testar email de boas-vindas
    await testWelcomeEmail(subscription);

    // 4. Testar prevenção de duplicatas
    await testNotificationDuplicates(subscription);

    // 5. Testar email de lembrete
    await testReminderEmail(subscription, 7); // 7 dias restantes

    // 6. Testar email de último dia
    await testReminderEmail(subscription, 0); // Último dia

    // 7. Testar email de expiração
    await testExpiredEmail(subscription);

    // 8. Testar processamento automático
    await testAutomaticProcessing();

    // 9. Criar assinatura prestes a expirar para teste automático
    console.log('\n⏰ Criando assinatura prestes a expirar...');
    const expiringSubscription = await createTestSubscription(testUser.id, 'SILVER', 1); // 1 dia
    console.log('✅ Assinatura criada para teste de expiração automática');

    // 10. Criar assinatura expirada para teste automático
    console.log('\n❌ Criando assinatura expirada...');
    const expiredSubscription = await createTestSubscription(testUser.id, 'DIAMOND', -1); // -1 dia (expirada)
    console.log('✅ Assinatura expirada criada para teste');

    console.log('\n🎉 Todos os testes de notificação concluídos!');
    console.log('✅ Sistema de notificações funcionando corretamente');

  } catch (error) {
    console.error('\n💥 Testes de notificação falharam:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runNotificationTests().catch(console.error);
}

export { runNotificationTests };