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
  async getConsolidatedMetrics(period: "24h" | "7d" | "30d" | "1y" | "all" = "24h") {
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
  async getDeviceBreakdown(period: "24h" | "7d" | "30d" | "1y" | "all" = "7d") {
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
  async getLocationBreakdown(period: "24h" | "7d" | "30d" | "1y" | "all" = "7d") {
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
   * Utilitário para obter data/hora no fuso horário de Brasília
   */
  private getBrasiliaTime(date: Date = new Date()): Date {
    const brasiliaOffset = -3 * 60; // UTC-3 em minutos
    return new Date(date.getTime() + (brasiliaOffset - date.getTimezoneOffset()) * 60 * 1000);
  }

  /**
   * Utilitário para converter data de Brasília para UTC
   */
  private brasiliaToUTC(brasiliaDate: Date): Date {
    const brasiliaOffset = -3 * 60; // UTC-3 em minutos
    return new Date(brasiliaDate.getTime() - (brasiliaOffset - brasiliaDate.getTimezoneOffset()) * 60 * 1000);
  }

  /**
   * Obtém dados de acesso por período (para gráficos)
   * Agora com agrupamento inteligente baseado no período
   */
  async getSessionsByDateRange(days: number) {
    // Usar fuso horário de Brasília (UTC-3)
    const brasiliaTime = this.getBrasiliaTime();
    
    // Para período de 24h, usar dados horários
    if (days === 1) {
      return this.getSessionsByHour();
    }
    
    // Fim do dia atual em Brasília (23:59:59)
    const endDate = new Date(brasiliaTime.getFullYear(), brasiliaTime.getMonth(), brasiliaTime.getDate(), 23, 59, 59, 999);
    
    // Início do período (00:00:00 do dia N dias atrás)
    const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);

    // Buscar sessões do período (converter de volta para UTC para query)
    const startDateUTC = this.brasiliaToUTC(startDate);
    const endDateUTC = this.brasiliaToUTC(endDate);
    
    const sessions = await this.prisma.analyticsSession.findMany({
      where: {
        startTime: { gte: startDateUTC, lte: endDateUTC },
      },
      select: {
        startTime: true,
      },
    });

    // Determinar agrupamento baseado no período
    if (days <= 7) {
      // 7 dias ou menos: mostrar por dia
      return this.groupSessionsByDay(sessions, startDate, days);
    } else if (days <= 30) {
      // 30 dias: agrupar de 3 em 3 dias (10 pontos)
      return this.groupSessionsByPeriod(sessions, startDate, days, 3);
    } else if (days <= 365) {
      // 1 ano: agrupar por mês (12 pontos)
      return this.groupSessionsByMonth(sessions, startDate, days);
    } else {
      // All time: agrupar por trimestre ou ano dependendo do range
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      if (totalDays > 1095) { // Mais de 3 anos
        return this.groupSessionsByYear(sessions, startDate, totalDays);
      } else {
        return this.groupSessionsByQuarter(sessions, startDate, totalDays);
      }
    }
  }

  /**
   * Obtém dados de sessões por hora para o período de 24h
   * Mostra apenas as horas do dia atual até a hora atual
   */
  private async getSessionsByHour() {
    // Usar horário local do servidor (assumindo que está configurado para Brasília)
    const now = new Date();
    const currentHour = now.getHours();
    
    // Início do dia atual (00:00:00)
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    
    // Fim da hora atual (XX:59:59)
    const currentHourEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, 59, 59, 999);
    
    console.log(`[DEBUG] Buscando sessões de ${dayStart.toISOString()} até ${currentHourEnd.toISOString()}`);
    console.log(`[DEBUG] Hora atual: ${currentHour}h`);
    
    // Buscar sessões do dia atual até a hora atual (usar UTC diretamente)
    const sessions = await this.prisma.analyticsSession.findMany({
      where: {
        startTime: { gte: dayStart, lte: currentHourEnd },
      },
      select: {
        startTime: true,
      },
    });

    console.log(`[DEBUG] Encontradas ${sessions.length} sessões`);

    // Criar mapa de horas (00 até hora atual)
    const hourlyMap = new Map<number, number>();
    
    // Inicializar todas as horas de 00 até a hora atual com 0
    for (let hour = 0; hour <= currentHour; hour++) {
      hourlyMap.set(hour, 0);
    }

    // Preencher com dados reais
    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      console.log(`[DEBUG] Sessão na hora ${hour}h: ${session.startTime.toISOString()}`);
      
      if (hourlyMap.has(hour)) {
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      }
    });

    // Log do resultado
    console.log(`[DEBUG] Dados por hora:`, Array.from(hourlyMap.entries()));

    // Converter para formato esperado pelo gráfico
    return Array.from(hourlyMap.entries()).map(([hour, views]) => {
      const hourStr = String(hour).padStart(2, '0');
      const today = now.toISOString().split('T')[0];
      
      return {
        date: `${today}T${hourStr}:00:00`,
        views,
        label: `${hourStr}h`,
        isHourly: true, // Flag para indicar que são dados horários
      };
    });
  }

  /**
   * Agrupa sessões por dia
   */
  private groupSessionsByDay(sessions: Array<{ startTime: Date }>, startDate: Date, days: number) {
    const dailyMap = new Map<string, number>();
    
    // Inicializar todos os dias com 0 (usando datas em Brasília)
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      // Manter a data em formato local (Brasília) para consistência
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      dailyMap.set(dateStr, 0);
    }

    // Preencher com dados reais (converter para horário de Brasília)
    sessions.forEach(session => {
      // Converter UTC para horário de Brasília
      const brasiliaTime = this.getBrasiliaTime(session.startTime);
      // Usar o mesmo formato de data
      const year = brasiliaTime.getFullYear();
      const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
      const day = String(brasiliaTime.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      if (dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
      }
    });

    return Array.from(dailyMap.entries()).map(([date, views]) => {
      const [year, month, day] = date.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Para períodos semanais, incluir informações do dia da semana
      const dayOfWeek = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayMonth = dateObj.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
      return {
        date,
        views,
        label: dayMonth,
        dayOfWeek: dayOfWeek,
        isWeekly: days <= 7, // Flag para indicar se é período semanal
      };
    });
  }

  /**
   * Agrupa sessões por período de N dias
   */
  private groupSessionsByPeriod(sessions: Array<{ startTime: Date }>, startDate: Date, totalDays: number, groupSize: number) {
    const groups = Math.ceil(totalDays / groupSize);
    const periodMap = new Map<number, number>();
    
    // Inicializar todos os períodos com 0
    for (let i = 0; i < groups; i++) {
      periodMap.set(i, 0);
    }

    // Preencher com dados reais (converter para horário de Brasília)
    sessions.forEach(session => {
      // Converter UTC para horário de Brasília
      const brasiliaTime = this.getBrasiliaTime(session.startTime);
      const daysDiff = Math.floor((brasiliaTime.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      const groupIndex = Math.floor(daysDiff / groupSize);
      if (groupIndex >= 0 && groupIndex < groups) {
        periodMap.set(groupIndex, (periodMap.get(groupIndex) || 0) + 1);
      }
    });

    return Array.from(periodMap.entries()).map(([groupIndex, views]) => {
      // Para o período mensal (30 dias), mostrar o último dia da soma
      const groupEndDate = new Date(startDate.getTime() + (groupIndex + 1) * groupSize * 24 * 60 * 60 * 1000 - 1);
      
      // Usar formato consistente de data
      const year = groupEndDate.getFullYear();
      const month = String(groupEndDate.getMonth() + 1).padStart(2, '0');
      const day = String(groupEndDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      return {
        date: dateStr,
        views,
        label: groupEndDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      };
    });
  }

  /**
   * Agrupa sessões por mês
   */
  private groupSessionsByMonth(sessions: Array<{ startTime: Date }>, startDate: Date, totalDays: number) {
    const monthMap = new Map<string, number>();
    const now = new Date();
    
    // Para o período anual, mostrar apenas os últimos 12 meses contando com o vigente
    // Começar 11 meses atrás e ir até o mês atual
    const startMonth = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Inicializar todos os meses com 0
    let currentMonth = new Date(startMonth);
    while (currentMonth <= endMonth) {
      const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, 0);
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    // Preencher com dados reais (filtrar apenas sessões dos últimos 12 meses)
    sessions.forEach(session => {
      if (session.startTime >= startMonth && session.startTime <= now) {
        const monthKey = `${session.startTime.getFullYear()}-${String(session.startTime.getMonth() + 1).padStart(2, '0')}`;
        if (monthMap.has(monthKey)) {
          monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
        }
      }
    });

    return Array.from(monthMap.entries()).map(([monthKey, views]) => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      
      return {
        date: date.toISOString().split('T')[0],
        views,
        // Para o período anual, mostrar somente o mês abreviado (jan, fev, mar...)
        label: date.toLocaleDateString('pt-BR', { 
          month: 'short'
        }).replace('.', ''),
      };
    });
  }

  /**
   * Agrupa sessões por trimestre
   */
  private groupSessionsByQuarter(sessions: Array<{ startTime: Date }>, startDate: Date, totalDays: number) {
    const quarterMap = new Map<string, number>();
    
    // Calcular quantos trimestres cobrir
    const startQuarter = Math.floor(startDate.getMonth() / 3);
    const startYear = startDate.getFullYear();
    const endDate = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
    const endQuarter = Math.floor(endDate.getMonth() / 3);
    const endYear = endDate.getFullYear();
    
    // Inicializar todos os trimestres com 0
    for (let year = startYear; year <= endYear; year++) {
      const startQ = year === startYear ? startQuarter : 0;
      const endQ = year === endYear ? endQuarter : 3;
      
      for (let quarter = startQ; quarter <= endQ; quarter++) {
        const quarterKey = `${year}-Q${quarter + 1}`;
        quarterMap.set(quarterKey, 0);
      }
    }

    // Preencher com dados reais
    sessions.forEach(session => {
      const quarter = Math.floor(session.startTime.getMonth() / 3);
      const quarterKey = `${session.startTime.getFullYear()}-Q${quarter + 1}`;
      quarterMap.set(quarterKey, (quarterMap.get(quarterKey) || 0) + 1);
    });

    return Array.from(quarterMap.entries()).map(([quarterKey, views]) => {
      const [year, quarterStr] = quarterKey.split('-Q');
      const quarter = parseInt(quarterStr) - 1;
      const date = new Date(parseInt(year), quarter * 3, 1);
      
      return {
        date: date.toISOString().split('T')[0],
        views,
        label: `T${quarter + 1}/${year.slice(-2)}`,
      };
    });
  }

  /**
   * Agrupa sessões por ano
   */
  private groupSessionsByYear(sessions: Array<{ startTime: Date }>, startDate: Date, totalDays: number) {
    const yearMap = new Map<number, number>();
    
    // Calcular quantos anos cobrir
    const startYear = startDate.getFullYear();
    const endDate = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
    const endYear = endDate.getFullYear();
    
    // Inicializar todos os anos com 0
    for (let year = startYear; year <= endYear; year++) {
      yearMap.set(year, 0);
    }

    // Preencher com dados reais
    sessions.forEach(session => {
      const year = session.startTime.getFullYear();
      yearMap.set(year, (yearMap.get(year) || 0) + 1);
    });

    return Array.from(yearMap.entries()).map(([year, views]) => ({
      date: new Date(year, 0, 1).toISOString().split('T')[0],
      views,
      label: year.toString(),
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
  private getStartDate(now: Date, period: "24h" | "7d" | "30d" | "1y" | "all"): Date {
    switch (period) {
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "1y":
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case "all":
        // Para "all time", buscar a primeira sessão registrada
        return new Date(2024, 0, 1); // Ou usar uma data padrão como início do sistema
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