import { PrismaClient, Subscription, SubscriptionPlan, User, NOTIFICATION_TYPE } from "@prisma/client";
import { sendEmail } from "./email";
import {
  createWelcomeSubscriptionEmail,
  createSubscriptionReminderEmail,
  createSubscriptionExpiredEmail,
} from "./subscription-emails";

const prisma = new PrismaClient();

export interface SubscriptionWithDetails extends Subscription {
  user: User;
  plan: SubscriptionPlan;
}

async function hasNotificationBeenSent(
  subscriptionId: string,
  type: NOTIFICATION_TYPE
): Promise<boolean> {
  const notification = await prisma.subscriptionNotification.findUnique({
    where: {
      subscriptionId_type: {
        subscriptionId,
        type,
      },
    },
  });
  
  return !!notification;
}

async function markNotificationAsSent(
  subscriptionId: string,
  type: NOTIFICATION_TYPE,
  metadata?: any
): Promise<void> {
  await prisma.subscriptionNotification.create({
    data: {
      subscriptionId,
      type,
      metadata,
    },
  });
}

export async function sendWelcomeSubscriptionEmail(
  subscription: SubscriptionWithDetails
): Promise<void> {
  try {
    // Verificar se já foi enviado
    if (await hasNotificationBeenSent(subscription.id, 'WELCOME')) {
      console.log(`⏭️  Email de boas-vindas já foi enviado para ${subscription.user.email}`);
      return;
    }

    const template = createWelcomeSubscriptionEmail(
      subscription.user.name,
      subscription.plan,
      subscription.endDate
    );

    await sendEmail(subscription.user.email, template);
    await markNotificationAsSent(subscription.id, 'WELCOME', {
      planName: subscription.plan.name,
      expirationDate: subscription.endDate,
    });
    
    console.log(`✅ Email de boas-vindas enviado para ${subscription.user.email}`);
  } catch (error) {
    console.error(`❌ Erro ao enviar email de boas-vindas para ${subscription.user.email}:`, error);
    throw error;
  }
}

export async function sendSubscriptionReminderEmail(
  subscription: SubscriptionWithDetails,
  daysRemaining: number
): Promise<void> {
  try {
    const notificationType: NOTIFICATION_TYPE = daysRemaining === 0 ? 'LAST_DAY' : 'REMINDER';
    
    // Verificar se já foi enviado
    if (await hasNotificationBeenSent(subscription.id, notificationType)) {
      console.log(`⏭️  Email de lembrete (${daysRemaining} dias) já foi enviado para ${subscription.user.email}`);
      return;
    }

    const template = createSubscriptionReminderEmail(
      subscription.user.name,
      subscription.plan,
      daysRemaining,
      subscription.endDate
    );

    await sendEmail(subscription.user.email, template);
    await markNotificationAsSent(subscription.id, notificationType, {
      daysRemaining,
      planName: subscription.plan.name,
      expirationDate: subscription.endDate,
    });
    
    console.log(`✅ Email de lembrete (${daysRemaining} dias) enviado para ${subscription.user.email}`);
  } catch (error) {
    console.error(`❌ Erro ao enviar email de lembrete para ${subscription.user.email}:`, error);
    throw error;
  }
}

export async function sendSubscriptionExpiredEmail(
  subscription: SubscriptionWithDetails
): Promise<void> {
  try {
    // Verificar se já foi enviado
    if (await hasNotificationBeenSent(subscription.id, 'EXPIRED')) {
      console.log(`⏭️  Email de expiração já foi enviado para ${subscription.user.email}`);
      return;
    }

    const template = createSubscriptionExpiredEmail(
      subscription.user.name,
      subscription.plan
    );

    await sendEmail(subscription.user.email, template);
    await markNotificationAsSent(subscription.id, 'EXPIRED', {
      planName: subscription.plan.name,
      expiredAt: new Date(),
    });
    
    console.log(`✅ Email de expiração enviado para ${subscription.user.email}`);
  } catch (error) {
    console.error(`❌ Erro ao enviar email de expiração para ${subscription.user.email}:`, error);
    throw error;
  }
}

export function calculateReminderDate(startDate: Date, endDate: Date): Date {
  const totalDuration = endDate.getTime() - startDate.getTime();
  const quarterDuration = totalDuration * 0.75; // 3/4 do tempo (faltando 1/4)
  
  return new Date(startDate.getTime() + quarterDuration);
}

export function getDaysUntilExpiration(endDate: Date): number {
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function processSubscriptionNotifications(): Promise<void> {
  console.log('🔄 Processando notificações de assinatura...');

  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar assinaturas ativas
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        user: true,
        plan: true,
      },
    });

    console.log(`📊 Encontradas ${activeSubscriptions.length} assinaturas ativas`);

    for (const subscription of activeSubscriptions) {
      const daysRemaining = getDaysUntilExpiration(subscription.endDate);
      const reminderDate = calculateReminderDate(subscription.startDate, subscription.endDate);
      
      // Verificar se deve enviar lembrete de 1/4 do tempo
      if (now >= reminderDate && now < subscription.endDate) {
        // Verificar se já foi enviado (podemos adicionar uma tabela de log depois)
        const reminderDays = Math.max(1, daysRemaining);
        await sendSubscriptionReminderEmail(subscription, reminderDays);
      }
      
      // Verificar se é o último dia
      if (daysRemaining === 0) {
        await sendSubscriptionReminderEmail(subscription, 0);
      }
      
      // Verificar se expirou
      if (now > subscription.endDate) {
        await sendSubscriptionExpiredEmail(subscription);
        
        // Atualizar status para expirado
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'EXPIRED' },
        });
        
        // Atualizar signature do produtor para COPPER
        await prisma.producer.updateMany({
          where: { userId: subscription.userId },
          data: { signature: 'COPPER' },
        });
        
        console.log(`📋 Assinatura ${subscription.id} marcada como expirada`);
      }
    }

    console.log('✅ Processamento de notificações concluído');
  } catch (error) {
    console.error('❌ Erro ao processar notificações:', error);
    throw error;
  }
}