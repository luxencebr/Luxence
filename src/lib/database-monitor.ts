/**
 * Database monitoring utilities
 */

import { prisma } from "@/utils/prisma";

class DatabaseMonitor {
  private static instance: DatabaseMonitor;
  private queryTimes: number[] = [];
  private maxQueryTimes = 100; // Keep last 100 query times

  static getInstance() {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor();
    }
    return DatabaseMonitor.instance;
  }

  /**
   * Measure and record a database query
   */
  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await queryFn();
      const duration = Date.now() - start;
      this.recordQueryTime(duration);

      if (duration > 1000) {
        console.warn(
          `[DB] Slow query detected: ${queryName} took ${duration}ms`,
        );
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordQueryTime(duration);
      throw error;
    }
  }

  private recordQueryTime(duration: number) {
    this.queryTimes.push(duration);
    if (this.queryTimes.length > this.maxQueryTimes) {
      this.queryTimes.shift();
    }
  }

  /**
   * Get database connection info
   * Note: Prisma doesn't expose connection pool metrics directly,
   * but we can infer some information
   */
  async getConnectionInfo() {
    try {
      // Test multiple concurrent connections to estimate pool usage
      const connectionTests = Array(5)
        .fill(null)
        .map(async (_, index) => {
          const start = Date.now();
          await prisma.$queryRaw`SELECT ${index} as test_connection`;
          return Date.now() - start;
        });

      const results = await Promise.all(connectionTests);
      const avgConnectionTime =
        results.reduce((sum, time) => sum + time, 0) / results.length;

      // Get some basic database stats
      const [userCount, producerCount, reviewCount] = await Promise.all([
        prisma.user.count(),
        prisma.producer.count(),
        prisma.review.count(),
      ]);

      return {
        avgConnectionTime: Math.round(avgConnectionTime),
        connectionPoolEstimate: {
          // These are estimates based on typical Prisma behavior
          maxConnections: 10, // Default Prisma pool size
          estimatedActive: Math.min(
            5,
            Math.max(1, Math.ceil(avgConnectionTime / 10)),
          ),
          estimatedIdle: Math.max(0, 10 - Math.ceil(avgConnectionTime / 10)),
        },
        tableStats: {
          users: userCount,
          producers: producerCount,
          reviews: reviewCount,
          totalRecords: userCount + producerCount + reviewCount,
        },
        queryStats: {
          avgQueryTime:
            this.queryTimes.length > 0
              ? Math.round(
                  this.queryTimes.reduce((sum, time) => sum + time, 0) /
                    this.queryTimes.length,
                )
              : 0,
          slowQueries: this.queryTimes.filter((time) => time > 1000).length,
          totalQueries: this.queryTimes.length,
        },
      };
    } catch (error) {
      console.error("Error getting database connection info:", error);
      return {
        avgConnectionTime: 0,
        connectionPoolEstimate: {
          maxConnections: 10,
          estimatedActive: 0,
          estimatedIdle: 0,
        },
        tableStats: {
          users: 0,
          producers: 0,
          reviews: 0,
          totalRecords: 0,
        },
        queryStats: {
          avgQueryTime: 0,
          slowQueries: 0,
          totalQueries: 0,
        },
      };
    }
  }

  /**
   * Get slow queries from recent history
   */
  getSlowQueries(limit = 5) {
    return this.queryTimes
      .map((time, index) => ({ time, index }))
      .filter(({ time }) => time > 100) // Queries slower than 100ms
      .sort((a, b) => b.time - a.time)
      .slice(0, limit)
      .map(({ time, index }) => ({
        duration: time,
        query: `Database operation #${index}`,
        timestamp: Date.now() - (this.queryTimes.length - index) * 1000, // Approximate timestamp
      }));
  }
}

export const dbMonitor = DatabaseMonitor.getInstance();
