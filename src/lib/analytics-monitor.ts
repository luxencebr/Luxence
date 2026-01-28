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
  device: PageView["device"];
  location: {
    country?: string;
    region?: string;
    city?: string;
  };
}

// Simple in-memory store that persists across hot reloads
declare global {
  var __analyticsData:
    | {
        pageViews: Map<string, PageView>;
        sessions: Map<string, UserSession>;
      }
    | undefined;
}

class AnalyticsMonitor {
  private static instance: AnalyticsMonitor;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Initialize global store if it doesn't exist
    if (!(globalThis as any).__analyticsData) {
      (globalThis as any).__analyticsData = {
        pageViews: new Map<string, PageView>(),
        sessions: new Map<string, UserSession>(),
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

  /**
   * Track a page view
   */
  trackPageView(
    data: Omit<PageView, "id" | "timestamp" | "device"> & {
      userAgent: string;
      viewport?: { width: number; height: number };
    },
  ) {
    const id = `pv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const device = this.parseUserAgent(data.userAgent, data.viewport);

    const pageView: PageView = {
      id,
      userId: data.userId,
      sessionId: data.sessionId,
      path: data.path,
      referrer: data.referrer,
      timestamp: Date.now(),
      userAgent: data.userAgent,
      ip: data.ip,
      country: data.country,
      region: data.region,
      city: data.city,
      language: data.language,
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
   * Get user metrics
   */
  getUserMetrics() {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Active sessions (last 30 minutes)
    const activeSessions = Array.from(this.sessions.values()).filter(
      (session: UserSession) =>
        session.lastActivity > now - this.sessionTimeout,
    );

    // Page views in different periods
    const pageViewsToday = Array.from(this.pageViews.values()).filter(
      (pv: PageView) => pv.timestamp > oneDayAgo,
    );

    const pageViewsWeek = Array.from(this.pageViews.values()).filter(
      (pv: PageView) => pv.timestamp > oneWeekAgo,
    );

    const pageViewsMonth = Array.from(this.pageViews.values()).filter(
      (pv: PageView) => pv.timestamp > oneMonthAgo,
    );

    // Unique users
    const uniqueUsersToday = new Set(
      pageViewsToday.map((pv: PageView) => pv.userId || pv.sessionId),
    ).size;
    const uniqueUsersWeek = new Set(
      pageViewsWeek.map((pv: PageView) => pv.userId || pv.sessionId),
    ).size;
    const uniqueUsersMonth = new Set(
      pageViewsMonth.map((pv: PageView) => pv.userId || pv.sessionId),
    ).size;

    // New vs returning users (based on sessions)
    const sessionsToday = Array.from(this.sessions.values()).filter(
      (session: UserSession) => session.startTime > oneDayAgo,
    );

    const userSessionCounts = new Map<string, number>();
    sessionsToday.forEach((session: UserSession) => {
      const userId = session.userId?.toString() || session.sessionId;
      userSessionCounts.set(userId, (userSessionCounts.get(userId) || 0) + 1);
    });

    const newUsers = Array.from(userSessionCounts.values()).filter(
      (count) => count === 1,
    ).length;
    const returningUsers = Array.from(userSessionCounts.values()).filter(
      (count) => count > 1,
    ).length;

    return {
      activeUsers: activeSessions.length,
      uniqueUsers: {
        today: uniqueUsersToday,
        week: uniqueUsersWeek,
        month: uniqueUsersMonth,
      },
      newVsReturning: {
        new: newUsers,
        returning: returningUsers,
        total: newUsers + returningUsers,
      },
      retention: this.calculateRetention(),
    };
  }

  /**
   * Get device metrics
   */
  getDeviceMetrics() {
    const recentPageViews = Array.from(this.pageViews.values()).filter(
      (pv: PageView) => pv.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000,
    ); // Last week

    const deviceTypes = new Map<string, number>();
    const operatingSystems = new Map<string, number>();
    const browsers = new Map<string, number>();

    recentPageViews.forEach((pv: PageView) => {
      // Device types
      deviceTypes.set(
        pv.device.type,
        (deviceTypes.get(pv.device.type) || 0) + 1,
      );

      // Operating systems
      operatingSystems.set(
        pv.device.os,
        (operatingSystems.get(pv.device.os) || 0) + 1,
      );

      // Browsers
      browsers.set(
        pv.device.browser,
        (browsers.get(pv.device.browser) || 0) + 1,
      );
    });

    const total = recentPageViews.length;

    return {
      deviceTypes: this.mapToPercentages(deviceTypes, total),
      operatingSystems: this.mapToPercentages(operatingSystems, total),
      browsers: this.mapToPercentages(browsers, total),
      totalPageViews: total,
    };
  }

  /**
   * Get navigation metrics
   */
  getNavigationMetrics() {
    const recentPageViews = Array.from(this.pageViews.values()).filter(
      (pv: PageView) => pv.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000,
    ); // Last week

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

    // Calculate bounce rate (sessions with only 1 page view)
    const sessionsWithPageCounts = new Map<string, number>();
    recentPageViews.forEach((pv: PageView) => {
      sessionsWithPageCounts.set(
        pv.sessionId,
        (sessionsWithPageCounts.get(pv.sessionId) || 0) + 1,
      );
    });

    const totalSessions = sessionsWithPageCounts.size;
    const bouncedSessions = Array.from(sessionsWithPageCounts.values()).filter(
      (count) => count === 1,
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
      totalSessions,
    };
  }

  /**
   * Get location metrics
   */
  getLocationMetrics() {
    const recentPageViews = Array.from(this.pageViews.values()).filter(
      (pv: PageView) => pv.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000,
    ); // Last week

    const countries = new Map<string, number>();
    const regions = new Map<string, number>();
    const cities = new Map<string, number>();
    const languages = new Map<string, number>();

    recentPageViews.forEach((pv: PageView) => {
      if (pv.country)
        countries.set(pv.country, (countries.get(pv.country) || 0) + 1);
      if (pv.region) regions.set(pv.region, (regions.get(pv.region) || 0) + 1);
      if (pv.city) cities.set(pv.city, (cities.get(pv.city) || 0) + 1);
      if (pv.language)
        languages.set(pv.language, (languages.get(pv.language) || 0) + 1);
    });

    const total = recentPageViews.length;

    return {
      countries: this.mapToPercentages(countries, total, 10),
      regions: this.mapToPercentages(regions, total, 10),
      cities: this.mapToPercentages(cities, total, 10),
      languages: this.mapToPercentages(languages, total, 5),
      totalPageViews: total,
    };
  }

  private updateSession(sessionId: string, pageView: PageView) {
    let session = this.sessions.get(sessionId);

    if (!session) {
      console.log(`📊 Creating new session: ${sessionId}`);
      session = {
        sessionId,
        userId: pageView.userId,
        startTime: pageView.timestamp,
        lastActivity: pageView.timestamp,
        pageViews: [pageView.id],
        isActive: true,
        device: pageView.device,
        location: {
          country: pageView.country,
          region: pageView.region,
          city: pageView.city,
        },
      };
    } else {
      console.log(
        `📊 Updating existing session: ${sessionId} (${session.pageViews.length + 1} page views)`,
      );
      session.lastActivity = pageView.timestamp;
      session.pageViews.push(pageView.id);
      session.isActive = true;
    }

    this.sessions.set(sessionId, session);
  }

  private parseUserAgent(
    userAgent: string,
    viewport?: { width: number; height: number },
  ) {
    // Simple user agent parsing
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);

    let deviceType: "mobile" | "desktop" | "tablet" = "desktop";
    if (isTablet) deviceType = "tablet";
    else if (isMobile) deviceType = "mobile";

    // If we have viewport info, use it to refine device type
    if (viewport) {
      if (viewport.width <= 768) deviceType = "mobile";
      else if (viewport.width <= 1024) deviceType = "tablet";
    }

    // Extract OS
    let os = "Unknown";
    if (/Windows/.test(userAgent)) os = "Windows";
    else if (/Mac OS/.test(userAgent)) os = "macOS";
    else if (/Linux/.test(userAgent)) os = "Linux";
    else if (/Android/.test(userAgent)) os = "Android";
    else if (/iOS|iPhone|iPad/.test(userAgent)) os = "iOS";

    // Extract browser
    let browser = "Unknown";
    if (/Chrome/.test(userAgent)) browser = "Chrome";
    else if (/Firefox/.test(userAgent)) browser = "Firefox";
    else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent))
      browser = "Safari";
    else if (/Edge/.test(userAgent)) browser = "Edge";

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
   * Get all metrics
   */
  getAllMetrics() {
    const now = Date.now();

    // Update session active status based on timeout
    this.sessions.forEach((session: UserSession) => {
      session.isActive = session.lastActivity > now - this.sessionTimeout;
    });

    const activeSessions = Array.from(this.sessions.values()).filter(
      (s: UserSession) => s.isActive,
    );

    return {
      users: this.getUserMetrics(),
      devices: this.getDeviceMetrics(),
      navigation: this.getNavigationMetrics(),
      location: this.getLocationMetrics(),
      summary: {
        totalPageViews: this.pageViews.size,
        totalSessions: this.sessions.size,
        activeSessions: activeSessions.length,
      },
    };
  }
}

export const analyticsMonitor = AnalyticsMonitor.getInstance();
