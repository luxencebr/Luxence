/**
 * Diagnostic utilities for production debugging
 */

export class Diagnostics {
  private static logs: Array<{
    timestamp: number;
    level: string;
    message: string;
    data?: any;
  }> = [];
  private static maxLogs = 500;

  static log(level: "info" | "warn" | "error", message: string, data?: any) {
    const entry = {
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Also log to console with prefix
    const prefix = `[v0:${level}]`;
    if (level === "error") {
      console.error(prefix, message, data);
    } else if (level === "warn") {
      console.warn(prefix, message, data);
    } else {
      console.log(prefix, message, data);
    }
  }

  static getLogs() {
    return this.logs;
  }

  static getRecentErrors(count = 10) {
    return this.logs.filter((log) => log.level === "error").slice(-count);
  }

  static clearLogs() {
    this.logs = [];
  }

  static createSnapshot() {
    const memory = process.memoryUsage();

    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external,
        heapPercentage: (memory.heapUsed / memory.heapTotal) * 100,
      },
      recentErrors: this.getRecentErrors(5),
      logCount: this.logs.length,
    };
  }
}

// Auto-log uncaught errors
if (typeof process !== "undefined") {
  process.on("uncaughtException", (error) => {
    Diagnostics.log("error", "Uncaught exception", {
      message: error.message,
      stack: error.stack,
    });
  });

  process.on("unhandledRejection", (reason) => {
    Diagnostics.log("error", "Unhandled rejection", { reason });
  });
}
