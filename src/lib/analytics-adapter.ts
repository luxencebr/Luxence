import { PrismaClient } from "@prisma/client";
import { getAnalyticsService } from "./analytics-service";

/**
 * Adaptador simplificado para analytics
 * Usa exclusivamente o banco de dados para persistência
 */
export class AnalyticsAdapter {
  private prisma: PrismaClient;
  private analyticsService: any;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.analyticsService = getAnalyticsService(prisma);
  }

  /**
   * Obtém métricas consolidadas do banco
   */
  async getConsolidatedMetrics(period: "24h" | "7d" | "30d" | "1y" | "all" = "24h") {
    return await this.analyticsService.getConsolidatedMetrics(period);
  }

  /**
   * Obtém breakdown de dispositivos
   */
  async getDeviceBreakdown(period: "24h" | "7d" | "30d" | "1y" | "all" = "7d") {
    return await this.analyticsService.getDeviceBreakdown(period);
  }

  /**
   * Obtém breakdown de localização
   */
  async getLocationBreakdown(period: "24h" | "7d" | "30d" | "1y" | "all" = "7d") {
    return await this.analyticsService.getLocationBreakdown(period);
  }

  /**
   * Obtém dados de sessões por período
   */
  async getSessionsByDateRange(days: number) {
    return await this.analyticsService.getSessionsByDateRange(days);
  }

  /**
   * Persiste uma sessão no banco
   */
  async persistSession(sessionData: {
    sessionId: string;
    fingerprint: string;
    userId?: number;
    ipAddress: string;
    userAgent: string;
    country: string;
    region: string;
    city: string;
    deviceType: string;
    browser: string;
    browserVersion?: string;
    os: string;
    osVersion?: string;
    viewport?: string;
    language?: string;
    duration?: number;
    pageViewCount?: number;
    hasEngagement?: boolean;
    bounced?: boolean;
  }) {
    try {
      // Verificar se já existe
      const existing = await this.prisma.analyticsSession.findUnique({
        where: { sessionId: sessionData.sessionId },
      });

      if (existing) {
        // Atualizar sessão existente
        return await this.prisma.analyticsSession.update({
          where: { sessionId: sessionData.sessionId },
          data: {
            lastActivity: new Date(),
            duration: sessionData.duration || existing.duration,
            pageViewCount: sessionData.pageViewCount || existing.pageViewCount,
            hasEngagement: sessionData.hasEngagement ?? existing.hasEngagement,
            bounced: sessionData.bounced ?? existing.bounced,
          },
        });
      } else {
        // Criar nova sessão
        return await this.analyticsService.createSession(sessionData);
      }
    } catch (error) {
      console.error("Erro ao persistir sessão:", error);
      return null;
    }
  }
}

// Instância singleton
let analyticsAdapter: AnalyticsAdapter | null = null;

export function getAnalyticsAdapter(prisma: PrismaClient): AnalyticsAdapter {
  if (!analyticsAdapter) {
    analyticsAdapter = new AnalyticsAdapter(prisma);
  }
  return analyticsAdapter;
}