/**
 * Utilitários para gerenciamento de pagamentos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Verifica se o usuário tem pagamentos pendentes
 */
export async function hasPendingPayments(userId: number): Promise<boolean> {
  const pendingPayments = await prisma.payment.findMany({
    where: {
      subscription: {
        userId,
      },
      status: 'PENDING',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
      },
    },
  });

  return pendingPayments.length > 0;
}

/**
 * Busca pagamentos pendentes do usuário
 */
export async function getPendingPayments(userId: number) {
  return prisma.payment.findMany({
    where: {
      subscription: {
        userId,
      },
      status: 'PENDING',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
      },
    },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Formatar status de pagamento para exibição
 */
export function formatPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendente',
    'COMPLETED': 'Pago',
    'PAID': 'Pago',
    'FAILED': 'Falhou',
    'REFUNDED': 'Reembolsado',
    'CANCELLED': 'Cancelado',
  };

  return statusMap[status] || status;
}

/**
 * Obter cor do status para UI
 */
export function getPaymentStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'PENDING': '#f59e0b', // amarelo
    'COMPLETED': '#10b981', // verde
    'PAID': '#10b981', // verde
    'FAILED': '#ef4444', // vermelho
    'REFUNDED': '#6b7280', // cinza
    'CANCELLED': '#6b7280', // cinza
  };

  return colorMap[status] || '#6b7280';
}