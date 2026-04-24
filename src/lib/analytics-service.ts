import { PrismaClient } from "@prisma/client";

/**
 * Service centralizado para analytics - fonte única de verdade
 * Consolida dados entre dashboard e metrics, evitando duplicação
 */
export class AnalyticsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Persiste uma sessão de analytics no banco
   */
  async createSession(sessionData: {
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
  }) {
    return await this.prisma.analyticsSession.create({
      data: {
        ...sessionData,
        language: sessionData.language || "pt",
      },
    });
  }

  /**
   * Atualiza uma sessão existente (última atividade, duração, etc.)
   */
  async updateSession(sessionId: string, updates: {
    lastActivity?: Date;
    duration?: number;
    pageViewCount?: number;
    hasEngagement?: boolean;
    bounced?: boolean;
    endTime?: Date;
    isActive?: boolean;
  }) {
    return await this.prisma.analyticsSession.update({
      where: { sessionId },
      data: updates,
    });
  }

  /**
   * Registra uma page view
   */
  async createPageView(pageViewData: {
    sessionId: string;
    path: string;
    referrer?: string;
    duration?: number;
    profileViewed?: boolean;
    contactViewed?: boolean;
  }) {
    // Incrementa contador de page views na sessão
    await this.prisma.analyticsSession.update({
      where: { sessionId: pageViewData.sessionId },
      data: {
        pageViewCount: { increment: 1 },
        lastActivity: new Date(),
      },
    });

    return await this.prisma.analyticsPageView.create({
      data: pageViewData,
    });
  }

  /**
   * Obtém métricas consolidadas para um período
   * Usado tanto pelo dashboard quanto pelas métricas
   */
  async getConsolidatedMetrics(period: "24h" | "7d" | "30d" = "24h") {
    const now = new Date();
    const startDate = this.getStartDate(now, period);

    // Buscar sessões do período
    const sessions = await this.prisma.analyticsSession.findMany({
      where: {
        startTime: { gte: startDate },
      },
      include: {
        user: { select: { id: true, role: true } },
        pageViews: true,
      },
    });

    // Calcular métricas básicas
    const totalSessions = sessions.length;
    const uniqueUsers = new Set(sessions.map(s => s.fingerprint)).size;
    const authenticatedUsers = sessions.filter(s => s.userId).length;
    const anonymousUsers = totalSessions - authenticatedUsers;
    const engagedSessions = sessions.filter(s => s.hasEngagement).length;
    const bouncedSessions = sessions.filter(s => s.bounced).length;
    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

    // Sessões ativas (últimos 5 minutos)
    const activeThreshold = new Date(now.getTime() - 5 * 60 * 1000);
    const activeSessions = sessions.filter(s => 
      s.isActive && s.lastActivity >= activeThreshold
    ).length;

    // Duração média
    const sessionsWithDuration = sessions.filter(s => s.duration > 0);
    const avgSessionDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + s.duration, 0) / sessionsWithDuration.length
      : 0;

    // Total de page views
    const totalPageViews = sessions.reduce((sum, s) => sum + s.pageViewCount, 0);

    return {
      summary: {
        totalSessions,
        uniqueUsers,
        activeSessions,
        totalPageViews,
      },
      users: {
        breakdown: {
          authenticated: authenticatedUsers,
          anonymous: anonymousUsers,
        },
        authenticatedUsers,
        uniqueUsers,
        newVsReturning: {
          new: anonymousUsers, // Simplificação: anônimos = novos
          returning: authenticatedUsers, // Logados = recorrentes
          total: totalSessions,
        },
        retention: {
          rate: totalSessions > 0 ? Math.round((engagedSessions / totalSessions) * 100) : 0,
          retained: engagedSessions,
          total: totalSessions,
        },
      },
      navigation: {
        bounceRate: Math.round(bounceRate * 100) / 100,
        avgSessionDuration: Math.round(avgSessionDuration),
      },
      platform: {
        totalSessions,
        totalPageViews,
        bounceRate: Math.round(bounceRate * 100) / 100,
        avgSessionTime: Math.round(avgSessionDuration),
      },
    };
  }

  /**
   * Obtém breakdown de dispositivos
   */
  async getDeviceBreakdown(period: "24h" | "7d" | "30d" = "7d") {
    const startDate = this.getStartDate(new Date(), period);

    const deviceData = await this.prisma.analyticsSession.groupBy({
      by: ['deviceType', 'browser', 'os'],
      where: {
        startTime: { gte: startDate },
      },
      _count: {
        sessionId: true,
      },
    });

    // Agrupar por tipo de dispositivo
    const deviceTypes = new Map<string, {
      name: string;
      count: number;
      uniqueUsers: number;
      breakdown: Array<{ name: string; count: number; percentage: number }>;
    }>();

    deviceData.forEach(item => {
      const deviceType = item.deviceType;
      const browserInfo = `${item.browser} (${item.os})`;
      
      if (!deviceTypes.has(deviceType)) {
        deviceTypes.set(deviceType, {
          name: deviceType,
          count: 0,
          uniqueUsers: 0,
          breakdown: [],
        });
      }

      const device = deviceTypes.get(deviceType)!;
      device.count += item._count.sessionId;
      device.uniqueUsers += item._count.sessionId; // Aproximação: usar sessionId como proxy
      device.breakdown.push({
        name: browserInfo,
        count: item._count.sessionId,
        percentage: 0, // Será calculado depois
      });
    });

    // Calcular percentuais
    const totalSessions = Array.from(deviceTypes.values())
      .reduce((sum, device) => sum + device.count, 0);

    const result = Array.from(deviceTypes.values()).map(device => ({
      ...device,
      percentage: totalSessions > 0 ? Math.round((device.count / totalSessions) * 100 * 100) / 100 : 0,
      breakdown: device.breakdown.map(item => ({
        ...item,
        percentage: device.count > 0 ? Math.round((item.count / device.count) * 100 * 100) / 100 : 0,
      })),
    }));

    return { deviceTypes: result };
  }

  /**
   * Obtém breakdown de localização
   */
  async getLocationBreakdown(period: "24h" | "7d" | "30d" = "7d") {
    const startDate = this.getStartDate(new Date(), period);

    const locationData = await this.prisma.analyticsSession.groupBy({
      by: ['country', 'region', 'city'],
      where: {
        startTime: { gte: startDate },
      },
      _count: {
        sessionId: true,
      },
    });

    // Agrupar por país
    const countries = new Map<string, {
      name: string;
      count: number;
      uniqueUsers: number;
      cities: Array<{ name: string; count: number; percentage: number }>;
    }>();

    locationData.forEach(item => {
      const country = item.country;
      const cityInfo = `${item.city}, ${item.region}`;
      
      if (!countries.has(country)) {
        countries.set(country, {
          name: country,
          count: 0,
          uniqueUsers: 0,
          cities: [],
        });
      }

      const countryData = countries.get(country)!;
      countryData.count += item._count.sessionId;
      countryData.uniqueUsers += item._count.sessionId; // Aproximação: usar sessionId como proxy
      countryData.cities.push({
        name: cityInfo,
        count: item._count.sessionId,
        percentage: 0, // Será calculado depois
      });
    });

    // Calcular percentuais
    const totalSessions = Array.from(countries.values())
      .reduce((sum, country) => sum + country.count, 0);

    const result = Array.from(countries.values()).map(country => ({
      ...country,
      percentage: totalSessions > 0 ? Math.round((country.count / totalSessions) * 100 * 100) / 100 : 0,
      cities: country.cities.map(city => ({
        ...city,
        percentage: country.count > 0 ? Math.round((city.count / country.count) * 100 * 100) / 100 : 0,
      })),
    }));

    return { countries: result };
  }

  /**
   * Obtém dados de acesso por período (para gráficos)
   */
  async getSessionsByDateRange(days: number) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Buscar sessões agrupadas por dia
    const sessions = await this.prisma.analyticsSession.findMany({
      where: {
        startTime: { gte: startDate, lte: endDate },
      },
      select: {
        startTime: true,
      },
    });

    // Agrupar por dia
    const dailyMap = new Map<string, number>();
    
    // Inicializar todos os dias com 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, 0);
    }

    // Preencher com dados reais
    sessions.forEach(session => {
      const dateStr = session.startTime.toISOString().split('T')[0];
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
    });

    return Array.from(dailyMap.entries()).map(([date, views]) => ({
      date,
      views,
      label: new Date(date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
    }));
  }

  /**
   * Job para agregar dados por hora (deve ser executado a cada hora)
   */
  async aggregateHourlyData() {
    const now = new Date();
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

    const sessions = await this.prisma.analyticsSession.findMany({
      where: {
        startTime: { gte: hourStart, lt: hourEnd },
      },
    });

    const totalSessions = sessions.length;
    const uniqueUsers = new Set(sessions.map(s => s.fingerprint)).size;
    const authenticatedUsers = sessions.filter(s => s.userId).length;
    const anonymousUsers = totalSessions - authenticatedUsers;
    const engagedSessions = sessions.filter(s => s.hasEngagement).length;
    const bouncedSessions = sessions.filter(s => s.bounced).length;
    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

    const sessionsWithDuration = sessions.filter(s => s.duration > 0);
    const avgSessionDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + s.duration, 0) / sessionsWithDuration.length
      : 0;

    const totalPageViews = sessions.reduce((sum, s) => sum + s.pageViewCount, 0);

    await this.prisma.analyticsHourly.upsert({
      where: { date: hourStart },
      update: {
        totalSessions,
        uniqueUsers,
        authenticatedUsers,
        anonymousUsers,
        engagedSessions,
        bouncedSessions,
        bounceRate,
        avgSessionDuration,
        totalPageViews,
      },
      create: {
        date: hourStart,
        totalSessions,
        uniqueUsers,
        authenticatedUsers,
        anonymousUsers,
        engagedSessions,
        bouncedSessions,
        bounceRate,
        avgSessionDuration,
        totalPageViews,
      },
    });
  }

  /**
   * Job para agregar dados diários (deve ser executado diariamente)
   */
  async aggregateDailyData() {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const sessions = await this.prisma.analyticsSession.findMany({
      where: {
        startTime: { gte: dayStart, lt: dayEnd },
      },
    });

    const totalSessions = sessions.length;
    const uniqueUsers = new Set(sessions.map(s => s.fingerprint)).size;
    const authenticatedUsers = sessions.filter(s => s.userId).length;
    const anonymousUsers = totalSessions - authenticatedUsers;
    const engagedSessions = sessions.filter(s => s.hasEngagement).length;
    const bouncedSessions = sessions.filter(s => s.bounced).length;
    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

    const sessionsWithDuration = sessions.filter(s => s.duration > 0);
    const avgSessionDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + s.duration, 0) / sessionsWithDuration.length
      : 0;

    const totalPageViews = sessions.reduce((sum, s) => sum + s.pageViewCount, 0);

    // Calcular pico de atividade por hora
    const hourlyActivity = new Map<number, number>();
    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + 1);
    });

    let peakHour = 0;
    let peakSessions = 0;
    hourlyActivity.forEach((count, hour) => {
      if (count > peakSessions) {
        peakSessions = count;
        peakHour = hour;
      }
    });

    await this.prisma.analyticsDaily.upsert({
      where: { date: dayStart },
      update: {
        totalSessions,
        uniqueUsers,
        authenticatedUsers,
        anonymousUsers,
        engagedSessions,
        bouncedSessions,
        bounceRate,
        avgSessionDuration,
        totalPageViews,
        peakHour: totalSessions > 0 ? peakHour : null,
        peakSessions,
      },
      create: {
        date: dayStart,
        totalSessions,
        uniqueUsers,
        authenticatedUsers,
        anonymousUsers,
        engagedSessions,
        bouncedSessions,
        bounceRate,
        avgSessionDuration,
        totalPageViews,
        peakHour: totalSessions > 0 ? peakHour : null,
        peakSessions,
      },
    });
  }

  /**
   * Utilitário para calcular data de início baseada no período
   */
  private getStartDate(now: Date, period: "24h" | "7d" | "30d"): Date {
    switch (period) {
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }
}

// Instância singleton
let analyticsService: AnalyticsService | null = null;

export function getAnalyticsService(prisma: PrismaClient): AnalyticsService {
  if (!analyticsService) {
    analyticsService = new AnalyticsService(prisma);
  }
  return analyticsService;
}