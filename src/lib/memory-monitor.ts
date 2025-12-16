// Memory monitoring utility
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private intervalId?: NodeJS.Timeout;

  static getInstance() {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  startMonitoring(intervalMs = 60000) {
    // Monitor every minute by default
    this.intervalId = setInterval(() => {
      const usage = process.memoryUsage();

      console.log("[v0] Memory Usage:", {
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`, // Resident Set Size
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`,
        timestamp: new Date().toISOString(),
      });

      // Alert if heap usage is above 80%
      const heapPercentage = (usage.heapUsed / usage.heapTotal) * 100;
      if (heapPercentage > 80) {
        console.warn(
          "[v0] WARNING: High heap usage detected:",
          heapPercentage.toFixed(2) + "%"
        );
      }
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  forceGarbageCollection() {
    if (global.gc) {
      console.log("[v0] Running manual garbage collection...");
      global.gc();
      const usage = process.memoryUsage();
      console.log("[v0] Memory after GC:", {
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      });
    } else {
      console.warn(
        "[v0] Garbage collection not exposed. Run Node with --expose-gc flag."
      );
    }
  }

  getSnapshot() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapPercentage: ((usage.heapUsed / usage.heapTotal) * 100).toFixed(2),
    };
  }
}

// API endpoint to check memory
export async function GET() {
  const monitor = MemoryMonitor.getInstance();
  const snapshot = monitor.getSnapshot();

  return Response.json({
    memory: snapshot,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
