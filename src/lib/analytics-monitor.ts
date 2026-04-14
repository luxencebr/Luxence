/**
 * Analytics monitoring system
 * Tracks user behavior, devices, navigation patterns, and location data
 */

interface PageView {
  id: string;
  userId?: number;
  sessionId: string;
  path: string;
  referrer: string;
  timestamp: number;
  duration?: number;
  userAgent: string;
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  language: string;
  fingerprint: string; // Unique browser fingerprint
  device: {
    type: "mobile" | "desktop" | "tablet";
    os: string;
    browser: string;
    viewport: {
      width: number;
      height: number;
    };
  };
}

interface UserSession {
  sessionId: string;
  userId?: number;
  startTime: number;
  lastActivity: number;
  pageViews: string[];
  isActive: boolean;
  fingerprint: string; // Browser fingerprint for anonymous users
  device: PageView["device"];
  location: {
    country?: string;
    region?: string;
    city?: string;
  };
  ip: string;
}

// Simple in-memory store that persists across hot reloads
declare global {
  var __analyticsData:
    | {
        pageViews: Map<string, PageView>;
        sessions: Map<string, UserSession>;
        userFingerprints: Map<string, string>; // fingerprint -> unique user ID
        sessionConsolidation: Map<string, number>; // sessionId -> userId mapping
      }
    | undefined;
}

class AnalyticsMonitor {
  private static instance: AnalyticsMonitor;
  private sessionTimeout = 5 * 60 * 1000; // 5 minutes (mais realista)
  private cleanupInterval = 10 * 60 * 1000; // 10 minutes
  private lastCleanup = Date.now();

  constructor() {
    // Initialize global store if it doesn't exist
    if (!(globalThis as any).__analyticsData) {
      (globalThis as any).__analyticsData = {
        pageViews: new Map<string, PageView>(),
        sessions: new Map<string, UserSession>(),
        userFingerprints: new Map<string, string>(),
        sessionConsolidation: new Map<string, number>(),
      };
    }
  }

  static getInstance() {
    if (!AnalyticsMonitor.instance) {
      AnalyticsMonitor.instance = new AnalyticsMonitor();
    }
    return AnalyticsMonitor.instance;
  }

  private get pageViews(): Map<string, PageView> {
    return (globalThis as any).__analyticsData.pageViews;
  }

  private get sessions(): Map<string, UserSession> {
    return (globalThis as any).__analyticsData.sessions;
  }

  private get userFingerprints(): Map<string, string> {
    if (!(globalThis as any).__analyticsData.userFingerprints) {
      (globalThis as any).__analyticsData.userFingerprints = new Map<string, string>();
    }
    return (globalThis as any).__analyticsData.userFingerprints;
  }

  private get sessionConsolidation(): Map<string, number> {
    if (!(globalThis as any).__analyticsData.sessionConsolidation) {
      (globalThis as any).__analyticsData.sessionConsolidation = new Map<string, number>();
    }
    return (globalThis as any).__analyticsData.sessionConsolidation;
  }

  /**
   * Generate browser fingerprint for anonymous user identification
   */
  private generateFingerprint(
    userAgent: string,
    ip: string,
    viewport?: { width: number; height: number },
    language?: string,
  ): string {
    const components = [
      userAgent,
      ip,
      viewport ? `${viewport.width}x${viewport.height}` : "unknown",
      language || "unknown",
    ];
    
    // Create a more stable fingerprint
    const fingerprint = btoa(components.join("|")).replace(/[^a-zA-Z0-9]/g, "");
    return `fp_${fingerprint.substring(0, 16)}`;
  }

  /**
   * Get unique user identifier with improved precision
   */
  private getUniqueUserId(pageView: PageView): string {
    // Priority 1: Authenticated user
    if (pageView.userId) {
      // Consolidate any previous anonymous sessions for this user
      this.consolidateUserSessions(pageView.sessionId, pageView.userId);
      return `user_${pageView.userId}`;
    }

    // Priority 2: Check if this session was previously consolidated
    try {
      const consolidatedUserId = this.sessionConsolidation.get(pageView.sessionId);
      if (consolidatedUserId) {
        return `user_${consolidatedUserId}`;
      }
    } catch (error) {
      console.warn("Error accessing sessionConsolidation:", error);
    }

    // Priority 3: Check if we've seen this fingerprint before
    try {
      const existingUserId = this.userFingerprints.get(pageView.fingerprint);
      if (existingUserId) {
        return existingUserId;
      }
    } catch (error) {
      console.warn("Error accessing userFingerprints:", error);
    }

    // Priority 4: Create new unique identifier based on fingerprint
    const uniqueId = `anon_${pageView.fingerprint}`;
    try {
      this.userFingerprints.set(pageView.fingerprint, uniqueId);
    } catch (error) {
      console.warn("Error setting userFingerprint:", error);
    }
    return uniqueId;
  }

  /**
   * Consolidate anonymous sessions when user logs in
   */
  private consolidateUserSessions(sessionId: string, userId: number) {
    try {
      // Mark this session as belonging to the authenticated user
      this.sessionConsolidation.set(sessionId, userId);

      // Update all pageViews from this session to have the userId
      this.pageViews.forEach((pv) => {
        if (pv.sessionId === sessionId && !pv.userId) {
          pv.userId = userId;
        }
      });

      // Update the session record
      const session = this.sessions.get(sessionId);
      if (session && !session.userId) {
        session.userId = userId;
        this.sessions.set(sessionId, session);
      }
    } catch (error) {
      console.warn("Error consolidating user sessions:", error);
    }
  }
  /**
   * Track a page view
   */
  trackPageView(
    data: Omit<PageView, "id" | "timestamp" | "device" | "fingerprint"> & {
      userAgent: string;
      viewport?: { width: number; height: number };
      timestamp?: number; // Permitir timestamp customizado para testes
    },
  ) {
    const id = `pv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const device = this.parseUserAgent(data.userAgent, data.viewport);
    const fingerprint = this.generateFingerprint(
      data.userAgent,
      data.ip,
      data.viewport,
      data.language,
    );

    const pageView: PageView = {
      id,
      userId: data.userId,
      sessionId: data.sessionId,
      path: data.path,
      referrer: data.referrer,
      timestamp: data.timestamp || Date.now(), // Usar timestamp customizado se fornecido
      userAgent: data.userAgent,
      ip: data.ip,
      country: data.country,
      region: data.region,
      city: data.city,
      language: data.language,
      fingerprint,
      device,
    };

    this.pageViews.set(id, pageView);
    this.updateSession(data.sessionId, pageView);

    console.log(
      `📊 Analytics: Tracked page view ${id}, total views: ${this.pageViews.size}, sessions: ${this.sessions.size}`,
    );

    return id;
  }

  /**
   * Update page view duration when user leaves
   */
  updatePageViewDuration(pageViewId: string, duration: number) {
    const pageView = this.pageViews.get(pageViewId);
    if (pageView) {
      pageView.duration = duration;
      this.pageViews.set(pageViewId, pageView);
    }
  }

  /**
   * Get user metrics with improved precision
   */
  getUserMetrics(period: "24h" | "7d" | "30d" = "24h") {
    const now = Date.now();
    let periodMs: number;
    
    switch (period) {
      case "24h":
        periodMs = 24 * 60 * 60 * 1000;
        break;
      case "7d":
        periodMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        periodMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        periodMs = 24 * 60 * 60 * 1000;
    }

    const periodStart = now - periodMs;

    // Active sessions (last 5 minutes) - usuários online agora
    const activeSessions = Array.from(this.sessions.values()).filter(
      (session: UserSession) =>
        session.lastActivity > now - this.sessionTimeout,
    );

    // Separar sessões ativas entre logadas e anônimas
    const activeAuthenticatedSessions = activeSessions.filter(session => session.userId);
    const activeAnonymousSessions = activeSessions.filter(session => !session.userId);

    // Page views in the specified period
    const pageViewsInPeriod = Array.from(this.pageViews.values()).filter(
      (pv: PageView) => pv.timestamp > periodStart,
    );

    // Calculate unique users with improved precision (para o período)
    const uniqueUserIds = new Set<string>();
    const periodAuthenticatedUserIds = new Set<number>();
    const uniqueSessions = new Set<string>();

    pageViewsInPeriod.forEach((pv: PageView) => {
      try {
        const uniqueId = this.getUniqueUserId(pv);
        uniqueUserIds.add(uniqueId);
        
        // Track authenticated users in period
        if (pv.userId) {
          periodAuthenticatedUserIds.add(pv.userId);
        }
        
        // Track unique sessions
        uniqueSessions.add(pv.sessionId);
      } catch (error) {
        console.warn("Error processing page view for metrics:", error);
        // Fallback to basic identification
        const fallbackId = pv.userId ? `user_${pv.userId}` : `session_${pv.sessionId}`;
        uniqueUserIds.add(fallbackId);
        if (pv.userId) {
          periodAuthenticatedUserIds.add(pv.userId);
        }
        uniqueSessions.add(pv.sessionId);
      }
    });

    // Calculate new vs returning users for the period
    const sessionsInPeriod = Array.from(this.sessions.values()).filter(
      (session: UserSession) => session.startTime > periodStart,
    );

    const userSessionCounts = new Map<string, number>();
    sessionsInPeriod.forEach((session: UserSession) => {
      try {
        const uniqueId = session.userId 
          ? `user_${session.userId}` 
          : this.userFingerprints.get(session.fingerprint) || `anon_${session.fingerprint}`;
        
        userSessionCounts.set(uniqueId, (userSessionCounts.get(uniqueId) || 0) + 1);
      } catch (error) {
        console.warn("Error processing session for new vs returning:", error);
        // Fallback to session ID
        const fallbackId = session.userId ? `user_${session.userId}` : `session_${session.sessionId}`;
        userSessionCounts.set(fallbackId, (userSessionCounts.get(fallbackId) || 0) + 1);
      }
    });

    const newUsers = Array.from(userSessionCounts.values()).filter(
      (count) => count === 1,
    ).length;
    const returningUsers = Array.from(userSessionCounts.values()).filter(
      (count) => count > 1,
    ).length;

    return {
      period,
      activeUsers: activeSessions.length,
      uniqueUsers: uniqueUserIds.size,
      // Usuários logados ATIVOS no momento (sessões ativas com userId)
      authenticatedUsers: activeAuthenticatedSessions.length,
      uniqueSessions: uniqueSessions.size,
      newVsReturning: {
        new: newUsers,
        returning: returningUsers,
        total: newUsers + returningUsers,
      },
      retention: this.calculateRetention(),
      breakdown: {
        // Breakdown baseado em sessões ativas no momento
        authenticated: activeAuthenticatedSessions.length,
        anonymous: activeAnonymousSessions.length,
      },
    };
  }

  /**
   * Get device metrics with hierarchical breakdown based on unique users
   */
  getDeviceMetrics(period: "24h" | "7d" | "30d" = "7d") {
    const now = Date.now();
    let periodMs: number;
    
    switch (period) {
      case "24h":
        periodMs = 24 * 60 * 60 * 1000;
        break;
      case "7d":
        periodMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        periodMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        periodMs = 7 * 24 * 60 * 60 * 1000;
    }

    const periodStart = now - periodMs;

    const recentPageViews = Array.from(this.pageViews.values()).filter(
      (pv: PageView) => pv.timestamp > periodStart,
    );

    // Group by unique users instead of counting all page views
    const uniqueUserDevices = new Map<string, { device: PageView["device"]; userId: string }>();
    const deviceTypes = new Map<string, { count: number; osBreakdown: Map<string, number>; users: Set<string> }>();
    const operatingSystems = new Map<string, Set<string>>();
    const browsers = new Map<string, Set<string>>();

    recentPageViews.forEach((pv: PageView) => {
      const uniqueUserId = this.getUniqueUserId(pv);
      
      // Only count each unique user once per device type
      if (!uniqueUserDevices.has(uniqueUserId)) {
        uniqueUserDevices.set(uniqueUserId, { device: pv.device, userId: uniqueUserId });
        
        // Device types with OS breakdown (count unique users)
        const deviceType = pv.device.type;
        if (!deviceTypes.has(deviceType)) {
          deviceTypes.set(deviceType, { count: 0, osBreakdown: new Map(), users: new Set() });
        }
        const deviceData = deviceTypes.get(deviceType)!;
        
        if (!deviceData.users.has(uniqueUserId)) {
          deviceData.users.add(uniqueUserId);
          deviceData.count++;
          
          // Count OS breakdown by unique users
          if (!deviceData.osBreakdown.has(pv.device.os)) {
            deviceData.osBreakdown.set(pv.device.os, 0);
          }
          deviceData.osBreakdown.set(pv.device.os, deviceData.osBreakdown.get(pv.device.os)! + 1);
        }

        // Operating systems (unique users)
        if (!operatingSystems.has(pv.device.os)) {
          operatingSystems.set(pv.device.os, new Set());
        }
        operatingSystems.get(pv.device.os)!.add(uniqueUserId);

        // Browsers (unique users)
        if (!browsers.has(pv.device.browser)) {
          browsers.set(pv.device.browser, new Set());
        }
        browsers.get(pv.device.browser)!.add(uniqueUserId);
      }
    });

    const totalUniqueUsers = uniqueUserDevices.size;

    // Convert device types to the expected format with breakdown
    const deviceTypesArray = Array.from(deviceTypes.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([deviceType, data]) => ({
        name: deviceType === 'mobile' ? 'Mobile' : 
              deviceType === 'desktop' ? 'Desktop' : 
              deviceType === 'tablet' ? 'Tablet' : deviceType,
        count: data.count,
        percentage: totalUniqueUsers > 0 ? Math.round((data.count / totalUniqueUsers) * 100) : 0,
        breakdown: Array.from(data.osBreakdown.entries())
          .sort(([, a], [, b]) => b - a)
          .map(([os, count]) => ({
            name: os,
            count,
            percentage: data.count > 0 ? Math.round((count / data.count) * 100) : 0,
          }))
      }));

    // Convert OS and browsers to count unique users
    const osArray = Array.from(operatingSystems.entries())
      .sort(([, a], [, b]) => b.size - a.size)
      .map(([os, users]) => ({
        name: os,
        count: users.size,
        percentage: totalUniqueUsers > 0 ? Math.round((users.size / totalUniqueUsers) * 100) : 0,
      }));

    const browsersArray = Array.from(browsers.entries())
      .sort(([, a], [, b]) => b.size - a.size)
      .map(([browser, users]) => ({
        name: browser,
        count: users.size,
        percentage: totalUniqueUsers > 0 ? Math.round((users.size / totalUniqueUsers) * 100) : 0,
      }));

    return {
      deviceTypes: deviceTypesArray,
      operatingSystems: osArray,
      browsers: browsersArray,
      totalPageViews: recentPageViews.length, // Keep for reference
      totalUniqueUsers: totalUniqueUsers, // Add this for clarity
    };
  }

  /**
   * Get navigation metrics
   */
  getNavigationMetrics(period: "24h" | "7d" | "30d" = "7d") {
    const now = Date.now();
    let periodMs: number;
    
    switch (period) {
      case "24h":
        periodMs = 24 * 60 * 60 * 1000;
        break;
      case "7d":
        periodMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        periodMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        periodMs = 7 * 24 * 60 * 60 * 1000;
    }

    const periodStart = now - periodMs;

    const recentPageViews = Array.from(this.pageViews.values()).filter(
      (pv: PageView) => pv.timestamp > periodStart,
    );

    // Most accessed pages
    const pageViews = new Map<string, number>();
    const pageDurations = new Map<string, number[]>();

    recentPageViews.forEach((pv: PageView) => {
      pageViews.set(pv.path, (pageViews.get(pv.path) || 0) + 1);

      if (pv.duration) {
        if (!pageDurations.has(pv.path)) {
          pageDurations.set(pv.path, []);
        }
        pageDurations.get(pv.path)!.push(pv.duration);
      }
    });

    // Calculate average time per page
    const avgTimePerPage = new Map<string, number>();
    pageDurations.forEach((durations, path) => {
      const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      avgTimePerPage.set(path, Math.round(avg / 1000)); // Convert to seconds
    });

    // Most accessed pages (top 10)
    const topPages = Array.from(pageViews.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, views]) => ({
        path,
        views,
        avgTime: avgTimePerPage.get(path) || 0,
      }));

    // Calculate bounce rate baseado em sessões reais, não apenas page views
    const sessionsInPeriod = Array.from(this.sessions.values()).filter(
      (session: UserSession) => session.startTime > periodStart,
    );

    const totalSessions = sessionsInPeriod.length;
    const bouncedSessions = sessionsInPeriod.filter(
      (session: UserSession) => session.pageViews.length === 1,
    ).length;
    
    const bounceRate =
      totalSessions > 0
        ? Math.round((bouncedSessions / totalSessions) * 100)
        : 0;

    // Navigation funnels
    const funnels = this.calculateFunnels();

    return {
      topPages,
      bounceRate,
      funnels,
      totalPageViews: recentPageViews.length,
      totalSessions: totalSessions, // Usar sessões do período, não todas
    };
  }

  /**
   * Get location metrics with hierarchical breakdown based on unique users
   */
  getLocationMetrics(period: "24h" | "7d" | "30d" = "7d") {
    const now = Date.now();
    let periodMs: number;
    
    switch (period) {
      case "24h":
        periodMs = 24 * 60 * 60 * 1000;
        break;
      case "7d":
        periodMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        periodMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        periodMs = 7 * 24 * 60 * 60 * 1000;
    }

    const periodStart = now - periodMs;

    const recentPageViews = Array.from(this.pageViews.values()).filter(
      (pv: PageView) => pv.timestamp > periodStart,
    );

    // Group by unique users instead of counting all page views
    const uniqueUserLocations = new Map<string, { country?: string; region?: string; city?: string; language?: string }>();
    const countries = new Map<string, { count: number; cityBreakdown: Map<string, number>; users: Set<string> }>();
    const regions = new Map<string, Set<string>>();
    const cities = new Map<string, Set<string>>();
    const languages = new Map<string, Set<string>>();

    recentPageViews.forEach((pv: PageView) => {
      const uniqueUserId = this.getUniqueUserId(pv);
      
      // Only count each unique user once per location
      if (!uniqueUserLocations.has(uniqueUserId)) {
        uniqueUserLocations.set(uniqueUserId, {
          country: pv.country,
          region: pv.region,
          city: pv.city,
          language: pv.language
        });

        // Countries with city breakdown (count unique users)
        if (pv.country) {
          if (!countries.has(pv.country)) {
            countries.set(pv.country, { count: 0, cityBreakdown: new Map(), users: new Set() });
          }
          const countryData = countries.get(pv.country)!;
          
          if (!countryData.users.has(uniqueUserId)) {
            countryData.users.add(uniqueUserId);
            countryData.count++;
            
            if (pv.city) {
              if (!countryData.cityBreakdown.has(pv.city)) {
                countryData.cityBreakdown.set(pv.city, 0);
              }
              countryData.cityBreakdown.set(pv.city, countryData.cityBreakdown.get(pv.city)! + 1);
            }
          }
        }

        // Regions (unique users)
        if (pv.region) {
          if (!regions.has(pv.region)) {
            regions.set(pv.region, new Set());
          }
          regions.get(pv.region)!.add(uniqueUserId);
        }

        // Cities (unique users)
        if (pv.city) {
          if (!cities.has(pv.city)) {
            cities.set(pv.city, new Set());
          }
          cities.get(pv.city)!.add(uniqueUserId);
        }

        // Languages (unique users)
        if (pv.language) {
          if (!languages.has(pv.language)) {
            languages.set(pv.language, new Set());
          }
          languages.get(pv.language)!.add(uniqueUserId);
        }
      }
    });

    const totalUniqueUsers = uniqueUserLocations.size;

    // Convert countries to the expected format with city breakdown
    const countriesArray = Array.from(countries.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([country, data]) => ({
        name: country,
        count: data.count,
        percentage: totalUniqueUsers > 0 ? Math.round((data.count / totalUniqueUsers) * 100) : 0,
        cities: Array.from(data.cityBreakdown.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5) // Top 5 cities per country
          .map(([city, count]) => ({
            name: city,
            count,
            percentage: data.count > 0 ? Math.round((count / data.count) * 100) : 0,
          }))
      }));

    // Convert other metrics to count unique users
    const regionsArray = Array.from(regions.entries())
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, 10)
      .map(([region, users]) => ({
        name: region,
        count: users.size,
        percentage: totalUniqueUsers > 0 ? Math.round((users.size / totalUniqueUsers) * 100) : 0,
      }));

    const citiesArray = Array.from(cities.entries())
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, 10)
      .map(([city, users]) => ({
        name: city,
        count: users.size,
        percentage: totalUniqueUsers > 0 ? Math.round((users.size / totalUniqueUsers) * 100) : 0,
      }));

    const languagesArray = Array.from(languages.entries())
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, 5)
      .map(([language, users]) => ({
        name: language,
        count: users.size,
        percentage: totalUniqueUsers > 0 ? Math.round((users.size / totalUniqueUsers) * 100) : 0,
      }));

    return {
      countries: countriesArray,
      regions: regionsArray,
      cities: citiesArray,
      languages: languagesArray,
      totalPageViews: recentPageViews.length, // Keep for reference
      totalUniqueUsers: totalUniqueUsers, // Add this for clarity
    };
  }

  private updateSession(sessionId: string, pageView: PageView) {
    let session = this.sessions.get(sessionId);

    if (!session) {
      console.log(`📊 Creating new session: ${sessionId}`);
      session = {
        sessionId,
        userId: pageView.userId,
        startTime: pageView.timestamp, // Usar timestamp do pageView
        lastActivity: pageView.timestamp, // Usar timestamp do pageView
        pageViews: [pageView.id],
        isActive: true,
        fingerprint: pageView.fingerprint,
        device: pageView.device,
        location: {
          country: pageView.country,
          region: pageView.region,
          city: pageView.city,
        },
        ip: pageView.ip,
      };
    } else {
      console.log(
        `📊 Updating existing session: ${sessionId} (${session.pageViews.length + 1} page views)`,
      );
      session.lastActivity = pageView.timestamp; // Usar timestamp do pageView
      session.pageViews.push(pageView.id);
      session.isActive = true;
      
      // Update userId if user logged in during session
      if (pageView.userId && !session.userId) {
        session.userId = pageView.userId;
        this.consolidateUserSessions(sessionId, pageView.userId);
      }
    }

    this.sessions.set(sessionId, session);
  }

  private parseUserAgent(
    userAgent: string,
    viewport?: { width: number; height: number },
  ) {
    // Detecção mais precisa de dispositivos
    const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    let deviceType: "mobile" | "desktop" | "tablet" = "desktop";
    
    // Usar viewport para refinar a detecção
    if (viewport) {
      if (viewport.width <= 480) {
        deviceType = "mobile";
      } else if (viewport.width <= 1024 && (isTablet || isMobile)) {
        deviceType = "tablet";
      } else if (viewport.width > 1024) {
        deviceType = "desktop";
      } else if (isMobile && !isTablet) {
        deviceType = "mobile";
      } else if (isTablet) {
        deviceType = "tablet";
      }
    } else {
      // Fallback sem viewport
      if (isTablet) {
        deviceType = "tablet";
      } else if (isMobile) {
        deviceType = "mobile";
      } else {
        deviceType = "desktop";
      }
    }

    // Detecção mais precisa do sistema operacional
    let os = "Unknown";
    if (/Windows NT 10/i.test(userAgent)) os = "Windows 10";
    else if (/Windows NT 6\.3/i.test(userAgent)) os = "Windows 8.1";
    else if (/Windows NT 6\.2/i.test(userAgent)) os = "Windows 8";
    else if (/Windows NT 6\.1/i.test(userAgent)) os = "Windows 7";
    else if (/Windows/i.test(userAgent)) os = "Windows";
    else if (/iPhone OS (\d+)[._](\d+)/i.test(userAgent)) {
      const match = userAgent.match(/iPhone OS (\d+)[._](\d+)/i);
      os = match ? `iOS ${match[1]}.${match[2]}` : "iOS";
    }
    else if (/OS (\d+)[._](\d+)/i.test(userAgent) && /iPad|iPhone|iPod/i.test(userAgent)) {
      const match = userAgent.match(/OS (\d+)[._](\d+)/i);
      os = match ? `iOS ${match[1]}.${match[2]}` : "iOS";
    }
    else if (/iPad|iPhone|iPod/i.test(userAgent)) os = "iOS";
    else if (/Android (\d+\.?\d*)/i.test(userAgent)) {
      const match = userAgent.match(/Android (\d+\.?\d*)/i);
      os = match ? `Android ${match[1]}` : "Android";
    }
    else if (/Mac OS X 10[._](\d+)/i.test(userAgent) && !/iPad|iPhone|iPod/i.test(userAgent)) {
      const match = userAgent.match(/Mac OS X 10[._](\d+)/i);
      os = match ? `macOS 10.${match[1]}` : "macOS";
    }
    else if (/Mac OS X/i.test(userAgent) && !/iPad|iPhone|iPod/i.test(userAgent)) os = "macOS";
    else if (/Linux/i.test(userAgent)) os = "Linux";
    else if (/CrOS/i.test(userAgent)) os = "Chrome OS";

    // Detecção mais precisa do navegador
    let browser = "Unknown";
    if (/Edg\//i.test(userAgent)) browser = "Microsoft Edge";
    else if (/Chrome\//i.test(userAgent) && !/Chromium/i.test(userAgent)) browser = "Chrome";
    else if (/Chromium\//i.test(userAgent)) browser = "Chromium";
    else if (/Firefox\//i.test(userAgent)) browser = "Firefox";
    else if (/Safari\//i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = "Safari";
    else if (/Opera|OPR\//i.test(userAgent)) browser = "Opera";
    else if (/SamsungBrowser\//i.test(userAgent)) browser = "Samsung Internet";
    else if (/UCBrowser\//i.test(userAgent)) browser = "UC Browser";

    return {
      type: deviceType,
      os,
      browser,
      viewport: viewport || { width: 0, height: 0 },
    };
  }

  private calculateRetention() {
    // Simple retention calculation based on returning sessions
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const usersLastWeek = new Set(
      Array.from(this.pageViews.values())
        .filter(
          (pv: PageView) =>
            pv.timestamp > oneWeekAgo &&
            pv.timestamp <= oneWeekAgo + 7 * 24 * 60 * 60 * 1000,
        )
        .map((pv: PageView) => pv.userId || pv.sessionId),
    );

    const usersThisWeek = new Set(
      Array.from(this.pageViews.values())
        .filter((pv: PageView) => pv.timestamp > oneWeekAgo)
        .map((pv: PageView) => pv.userId || pv.sessionId),
    );

    const retainedUsers = Array.from(usersLastWeek).filter((user) =>
      usersThisWeek.has(user),
    ).length;
    const retentionRate =
      usersLastWeek.size > 0
        ? Math.round((retainedUsers / usersLastWeek.size) * 100)
        : 0;

    return {
      rate: retentionRate,
      retained: retainedUsers,
      total: usersLastWeek.size,
    };
  }

  private calculateFunnels() {
    // Define common funnels
    const funnels = [
      {
        name: "Home → Catalog → Product",
        steps: ["/", "/catalog", "/product"],
      },
      {
        name: "Home → Profile → Contact",
        steps: ["/", "/profile", "/contact"],
      },
      {
        name: "Catalog → Product → Contact",
        steps: ["/catalog", "/product", "/contact"],
      },
    ];

    return funnels.map((funnel) => {
      const stepCounts = funnel.steps.map(() => 0);

      // Analyze sessions for funnel completion
      this.sessions.forEach((session: UserSession) => {
        const sessionPageViews = session.pageViews
          .map((pvId: string) => this.pageViews.get(pvId))
          .filter(
            (pv: PageView | undefined): pv is PageView => pv !== undefined,
          )
          .sort((a: PageView, b: PageView) => a.timestamp - b.timestamp);

        // Track which steps this session has completed
        const completedSteps = new Set<number>();

        sessionPageViews.forEach((pv: PageView) => {
          for (
            let stepIndex = 0;
            stepIndex < funnel.steps.length;
            stepIndex++
          ) {
            if (
              pv.path.startsWith(funnel.steps[stepIndex]) &&
              !completedSteps.has(stepIndex)
            ) {
              completedSteps.add(stepIndex);
              stepCounts[stepIndex]++;
              break; // Only count the first matching step for this page view
            }
          }
        });
      });

      const conversionRates = stepCounts.map((count, index) => {
        if (index === 0) return stepCounts[0] > 0 ? 100 : 0;
        return stepCounts[0] > 0
          ? Math.round((count / stepCounts[0]) * 100)
          : 0;
      });

      return {
        name: funnel.name,
        steps: funnel.steps.map((step, index) => ({
          path: step,
          users: stepCounts[index],
          conversionRate: conversionRates[index],
        })),
      };
    });
  }

  private mapToPercentages(
    map: Map<string, number>,
    total: number,
    limit?: number,
  ) {
    const entries = Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit || 20);

    return entries.map(([key, count]) => ({
      name: key,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }

  /**
   * Get all metrics with database integration
   */
  async getAllMetricsWithDB(period: "24h" | "7d" | "30d" = "24h", prisma?: any) {
    const now = Date.now();

    // Limpar sessões antigas periodicamente
    this.cleanupInactiveSessions();

    // Update session active status based on timeout
    this.sessions.forEach((session: UserSession) => {
      session.isActive = session.lastActivity > now - this.sessionTimeout;
    });

    const activeSessions = Array.from(this.sessions.values()).filter(
      (s: UserSession) => s.isActive,
    );

    const baseMetrics = {
      users: this.getUserMetrics(period),
      devices: this.getDeviceMetrics(period),
      location: this.getLocationMetrics(period),
      navigation: this.getNavigationMetrics(period),
      summary: {
        totalPageViews: this.pageViews.size,
        totalSessions: this.sessions.size,
        activeSessions: activeSessions.length,
      },
    };

    // Se o Prisma foi fornecido, adicionar dados de cadastros
    if (prisma) {
      try {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const lastWeek = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

        const [
          usersThisWeek,
          usersLastWeek,
          usersThisMonth,
          usersLastMonth,
        ] = await Promise.all([
          prisma.user.count({ where: { createdAt: { gte: weekAgo }, isDeleted: false } }),
          prisma.user.count({ where: { createdAt: { gte: lastWeek, lt: weekAgo }, isDeleted: false } }),
          prisma.user.count({ where: { createdAt: { gte: monthAgo }, isDeleted: false } }),
          prisma.user.count({ where: { createdAt: { gte: lastMonth, lt: monthAgo }, isDeleted: false } }),
        ]);

        // Calcular crescimento
        const weekGrowth = usersLastWeek > 0 ? ((usersThisWeek - usersLastWeek) / usersLastWeek) * 100 : 0;
        const monthGrowth = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0;

        // Adicionar dados de cadastros aos usuários
        baseMetrics.users = {
          ...baseMetrics.users,
          registrations: {
            thisWeek: usersThisWeek,
            lastWeek: usersLastWeek,
            thisMonth: usersThisMonth,
            lastMonth: usersLastMonth,
            weekGrowth: Math.round(weekGrowth * 100) / 100,
            monthGrowth: Math.round(monthGrowth * 100) / 100,
          }
        };
      } catch (error) {
        console.warn("Error fetching registration data:", error);
      }
    }

    return baseMetrics;
  }
  // Método para obter sessões únicas agrupadas por data
  getSessionsByDateRange(days: number): Array<{ date: string; views: number; label: string }> {
    const now = Date.now();
    const result: Array<{ date: string; views: number; label: string }> = [];

    // Obter todas as sessões do período
    const periodStart = now - (days * 24 * 60 * 60 * 1000);
    const sessionsInPeriod = Array.from(this.sessions.values()).filter(
      (session: UserSession) => session.startTime > periodStart
    );

    if (days === 7) {
      // 7 dias: dados diários
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000;

        const daySessions = sessionsInPeriod.filter(
          session => session.startTime >= dayStart && session.startTime < dayEnd
        ).length;

        result.push({
          date: date.toISOString().split("T")[0],
          views: daySessions,
          label: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
        });
      }
    } else if (days === 30) {
      // 30 dias: agrupar de 3 em 3 dias, 10 pontos
      for (let i = 9; i >= 0; i--) {
        const endDate = new Date(now - i * 3 * 24 * 60 * 60 * 1000);
        const startDate = new Date(endDate.getTime() - 3 * 24 * 60 * 60 * 1000);

        const periodSessions = sessionsInPeriod.filter(
          session => session.startTime >= startDate.getTime() && session.startTime < endDate.getTime()
        ).length;

        result.push({
          date: endDate.toISOString().split("T")[0],
          views: periodSessions,
          label: endDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
        });
      }
    } else {
      // 365 dias: agrupar por mês (30 dias), 12 pontos
      for (let i = 11; i >= 0; i--) {
        const endDate = new Date(now - i * 30 * 24 * 60 * 60 * 1000);
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        const monthSessions = sessionsInPeriod.filter(
          session => session.startTime >= startDate.getTime() && session.startTime < endDate.getTime()
        ).length;

        result.push({
          date: endDate.toISOString().split("T")[0],
          views: monthSessions,
          label: endDate
            .toLocaleDateString("pt-BR", {
              month: "short",
            })
            .replace(".", ""),
        });
      }
    }

    return result;
  }
  // Método para obter visualizações agrupadas por data
  // Método para obter sessões únicas agrupadas por data
    getSessionsByDateRange(days: number): Array<{ date: string; views: number; label: string }> {
      const now = Date.now();
      const result: Array<{ date: string; views: number; label: string }> = [];

      // Obter todas as sessões do período
      const periodStart = now - (days * 24 * 60 * 60 * 1000);
      const sessionsInPeriod = Array.from(this.sessions.values()).filter(
        (session: UserSession) => session.startTime > periodStart
      );

      if (days === 7) {
        // 7 dias: dados diários
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
          const dayEnd = dayStart + 24 * 60 * 60 * 1000;

          const daySessions = sessionsInPeriod.filter(
            session => session.startTime >= dayStart && session.startTime < dayEnd
          ).length;

          result.push({
            date: date.toISOString().split("T")[0],
            views: daySessions,
            label: date.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            }),
          });
        }
      } else if (days === 30) {
        // 30 dias: agrupar de 3 em 3 dias, 10 pontos
        for (let i = 9; i >= 0; i--) {
          const endDate = new Date(now - i * 3 * 24 * 60 * 60 * 1000);
          const startDate = new Date(endDate.getTime() - 3 * 24 * 60 * 60 * 1000);

          const periodSessions = sessionsInPeriod.filter(
            session => session.startTime >= startDate.getTime() && session.startTime < endDate.getTime()
          ).length;

          result.push({
            date: endDate.toISOString().split("T")[0],
            views: periodSessions,
            label: endDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            }),
          });
        }
      } else {
        // 365 dias: agrupar por mês (30 dias), 12 pontos
        for (let i = 11; i >= 0; i--) {
          const endDate = new Date(now - i * 30 * 24 * 60 * 60 * 1000);
          const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

          const monthSessions = sessionsInPeriod.filter(
            session => session.startTime >= startDate.getTime() && session.startTime < endDate.getTime()
          ).length;

          result.push({
            date: endDate.toISOString().split("T")[0],
            views: monthSessions,
            label: endDate
              .toLocaleDateString("pt-BR", {
                month: "short",
              })
              .replace(".", ""),
          });
        }
      }

  }

  /**
   * Get all metrics (backward compatibility)
   */
  getAllMetrics(period: "24h" | "7d" | "30d" = "24h") {
    const now = Date.now();

    // Limpar sessões antigas periodicamente
    this.cleanupInactiveSessions();

    // Update session active status based on timeout
    this.sessions.forEach((session: UserSession) => {
      session.isActive = session.lastActivity > now - this.sessionTimeout;
    });

    const activeSessions = Array.from(this.sessions.values()).filter(
      (s: UserSession) => s.isActive,
    );

    return {
      users: this.getUserMetrics(period),
      devices: this.getDeviceMetrics(period),
      location: this.getLocationMetrics(period),
      navigation: this.getNavigationMetrics(period),
      summary: {
        totalPageViews: this.pageViews.size,
        totalSessions: this.sessions.size,
        activeSessions: activeSessions.length,
      },
    };
  }

  private cleanupInactiveSessions() {
    const now = Date.now();
    
    // Só limpar se passou tempo suficiente desde a última limpeza
    if (now - this.lastCleanup < this.cleanupInterval) {
      return;
    }

    console.log('🧹 Limpando sessões inativas...');
    
    const sessionsToRemove: string[] = [];
    const pageViewsToRemove: string[] = [];
    
    // Identificar sessões inativas (mais de 1 hora sem atividade)
    const inactiveThreshold = now - (60 * 60 * 1000); // 1 hora
    
    this.sessions.forEach((session, sessionId) => {
      if (session.lastActivity < inactiveThreshold) {
        sessionsToRemove.push(sessionId);
        
        // Marcar page views desta sessão para remoção
        session.pageViews.forEach(pageViewId => {
          pageViewsToRemove.push(pageViewId);
        });
      }
    });

    // Remover sessões inativas
    sessionsToRemove.forEach(sessionId => {
      this.sessions.delete(sessionId);
    });

    // Remover page views de sessões inativas
    pageViewsToRemove.forEach(pageViewId => {
      this.pageViews.delete(pageViewId);
    });

    if (sessionsToRemove.length > 0) {
      console.log(`🧹 Removidas ${sessionsToRemove.length} sessões inativas e ${pageViewsToRemove.length} page views`);
    }

    this.lastCleanup = now;
  }
  // Método para obter sessões únicas agrupadas por data
  getSessionsByDateRange(days: number): Array<{ date: string; views: number; label: string }> {
    const now = Date.now();
    const result: Array<{ date: string; views: number; label: string }> = [];

    // Obter todas as sessões do período
    const periodStart = now - (days * 24 * 60 * 60 * 1000);
    const sessionsInPeriod = Array.from(this.sessions.values()).filter(
      (session: UserSession) => session.startTime > periodStart
    );

    if (days === 7) {
      // 7 dias: dados diários
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000;

        const daySessions = sessionsInPeriod.filter(
          session => session.startTime >= dayStart && session.startTime < dayEnd
        ).length;

        result.push({
          date: date.toISOString().split("T")[0],
          views: daySessions,
          label: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
        });
      }
    } else if (days === 30) {
      // 30 dias: agrupar de 3 em 3 dias, 10 pontos
      for (let i = 9; i >= 0; i--) {
        const endDate = new Date(now - i * 3 * 24 * 60 * 60 * 1000);
        const startDate = new Date(endDate.getTime() - 3 * 24 * 60 * 60 * 1000);

        const periodSessions = sessionsInPeriod.filter(
          session => session.startTime >= startDate.getTime() && session.startTime < endDate.getTime()
        ).length;

        result.push({
          date: endDate.toISOString().split("T")[0],
          views: periodSessions,
          label: endDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
        });
      }
    } else {
      // 365 dias: agrupar por mês (30 dias), 12 pontos
      for (let i = 11; i >= 0; i--) {
        const endDate = new Date(now - i * 30 * 24 * 60 * 60 * 1000);
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        const monthSessions = sessionsInPeriod.filter(
          session => session.startTime >= startDate.getTime() && session.startTime < endDate.getTime()
        ).length;

        result.push({
          date: endDate.toISOString().split("T")[0],
          views: monthSessions,
          label: endDate
            .toLocaleDateString("pt-BR", {
              month: "short",
            })
            .replace(".", ""),
        });
      }
    }

    return result;
  }
}

export const analyticsMonitor = AnalyticsMonitor.getInstance();
