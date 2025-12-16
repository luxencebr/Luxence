/**
 * Performance monitoring utilities
 * Tracks slow operations and potential bottlenecks
 */

type PerformanceMetric = {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
};

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure async operation
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - start;

      this.addMetric({ name, duration, timestamp: Date.now(), metadata });

      // Log slow operations
      if (duration > 1000) {
        console.warn(
          `[v0] Slow operation detected: ${name} took ${duration.toFixed(2)}ms`
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.addMetric({
        name: `${name} (failed)`,
        duration,
        timestamp: Date.now(),
        metadata: {
          ...metadata,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
      throw error;
    }
  }

  // Measure sync operation
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, unknown>
  ): T {
    const start = performance.now();

    try {
      const result = fn();
      const duration = performance.now() - start;

      this.addMetric({ name, duration, timestamp: Date.now(), metadata });

      if (duration > 100) {
        console.warn(
          `[v0] Slow sync operation: ${name} took ${duration.toFixed(2)}ms`
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.addMetric({
        name: `${name} (failed)`,
        duration,
        timestamp: Date.now(),
        metadata: {
          ...metadata,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
      throw error;
    }
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getSlowestOperations(limit = 10) {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getAverageDuration(name: string) {
    const filtered = this.metrics.filter((m) => m.name === name);
    if (filtered.length === 0) return 0;

    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  getStats() {
    const byName = this.metrics.reduce(
      (acc, metric) => {
        if (!acc[metric.name]) {
          acc[metric.name] = {
            count: 0,
            total: 0,
            avg: 0,
            max: 0,
            min: Number.POSITIVE_INFINITY,
          };
        }

        const stats = acc[metric.name];
        stats.count++;
        stats.total += metric.duration;
        stats.max = Math.max(stats.max, metric.duration);
        stats.min = Math.min(stats.min, metric.duration);
        stats.avg = stats.total / stats.count;

        return acc;
      },
      {} as Record<
        string,
        {
          count: number;
          total: number;
          avg: number;
          max: number;
          min: number;
        }
      >
    );

    return byName;
  }

  clear() {
    this.metrics = [];
  }
}

export const perfMonitor = PerformanceMonitor.getInstance();

// Utility function for API routes
export function withPerformanceMonitoring<T>(
  name: string,
  handler: () => Promise<T>
): Promise<T> {
  return perfMonitor.measure(name, handler);
}
