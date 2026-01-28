/**
 * Network and request monitoring utilities
 */

class NetworkMonitor {
  private static instance: NetworkMonitor;
  private requestCounts: Map<string, number> = new Map();
  private requestTimes: Map<string, number[]> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private startTime: number = Date.now();

  static getInstance() {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  /**
   * Record a request
   */
  recordRequest(
    route: string,
    method: string,
    statusCode: number,
    duration: number,
  ) {
    const key = `${method} ${route}`;

    // Count requests
    this.requestCounts.set(key, (this.requestCounts.get(key) || 0) + 1);

    // Record response times
    if (!this.requestTimes.has(key)) {
      this.requestTimes.set(key, []);
    }
    const times = this.requestTimes.get(key)!;
    times.push(duration);

    // Keep only last 100 times per route
    if (times.length > 100) {
      times.shift();
    }

    // Count errors
    if (statusCode >= 400) {
      const errorKey = `${statusCode}`;
      this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    }
  }

  /**
   * Get requests per minute
   */
  getRequestsPerMinute(): number {
    const totalRequests = Array.from(this.requestCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    const uptimeMinutes = (Date.now() - this.startTime) / (1000 * 60);
    return uptimeMinutes > 0 ? Math.round(totalRequests / uptimeMinutes) : 0;
  }

  /**
   * Get route performance statistics
   */
  getRoutePerformance() {
    const routes: Array<{
      route: string;
      count: number;
      avgTime: number;
      maxTime: number;
      minTime: number;
    }> = [];

    for (const [route, times] of this.requestTimes.entries()) {
      if (times.length > 0) {
        const count = this.requestCounts.get(route) || 0;
        const avgTime = Math.round(
          times.reduce((sum, time) => sum + time, 0) / times.length,
        );
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);

        routes.push({
          route,
          count,
          avgTime,
          maxTime: Math.round(maxTime),
          minTime: Math.round(minTime),
        });
      }
    }

    return routes.sort((a, b) => b.avgTime - a.avgTime);
  }

  /**
   * Get overall average response time
   */
  getAverageResponseTime(): number {
    let totalTime = 0;
    let totalRequests = 0;

    for (const times of this.requestTimes.values()) {
      totalTime += times.reduce((sum, time) => sum + time, 0);
      totalRequests += times.length;
    }

    return totalRequests > 0 ? Math.round(totalTime / totalRequests) : 0;
  }

  /**
   * Get latency peaks (routes with max time > threshold)
   */
  getLatencyPeaks(threshold: number = 1000) {
    const peaks: Array<{ route: string; maxTime: number }> = [];

    for (const [route, times] of this.requestTimes.entries()) {
      if (times.length > 0) {
        const maxTime = Math.max(...times);
        if (maxTime > threshold) {
          peaks.push({
            route,
            maxTime: Math.round(maxTime),
          });
        }
      }
    }

    return peaks.sort((a, b) => b.maxTime - a.maxTime);
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const errors4xx = Array.from(this.errorCounts.entries())
      .filter(([code]) => code.startsWith("4"))
      .reduce((sum, [, count]) => sum + count, 0);

    const errors5xx = Array.from(this.errorCounts.entries())
      .filter(([code]) => code.startsWith("5"))
      .reduce((sum, [, count]) => sum + count, 0);

    const totalErrors = Array.from(this.errorCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );

    return {
      errors4xx,
      errors5xx,
      totalErrors,
      errorBreakdown: Object.fromEntries(this.errorCounts),
    };
  }

  /**
   * Get total request count
   */
  getTotalRequests(): number {
    return Array.from(this.requestCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
  }

  /**
   * Reset all statistics
   */
  reset() {
    this.requestCounts.clear();
    this.requestTimes.clear();
    this.errorCounts.clear();
    this.startTime = Date.now();
  }
}

export const networkMonitor = NetworkMonitor.getInstance();
