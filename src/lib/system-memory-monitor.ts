/**
 * System memory monitoring utilities
 * Monitors total system RAM usage, not just Node.js process
 */

import { execSync } from "child_process";
import os from "os";

class SystemMemoryMonitor {
  private static instance: SystemMemoryMonitor;

  static getInstance() {
    if (!SystemMemoryMonitor.instance) {
      SystemMemoryMonitor.instance = new SystemMemoryMonitor();
    }
    return SystemMemoryMonitor.instance;
  }

  /**
   * Get system memory usage information
   */
  async getSystemMemoryUsage() {
    try {
      const platform = process.platform;

      if (platform === "win32") {
        return this.getWindowsMemoryUsage();
      } else if (platform === "linux") {
        return this.getLinuxMemoryUsage();
      } else if (platform === "darwin") {
        return this.getMacMemoryUsage();
      } else {
        return this.getFallbackMemoryUsage();
      }
    } catch (error) {
      console.error("Error getting system memory usage:", error);
      return this.getFallbackMemoryUsage();
    }
  }

  private getWindowsMemoryUsage() {
    try {
      // Get total and available memory using wmic
      const totalMemoryCmd =
        "wmic computersystem get TotalPhysicalMemory /format:value";
      const availableMemoryCmd =
        "wmic OS get AvailablePhysicalMemory /format:value";

      const totalOutput = execSync(totalMemoryCmd, { encoding: "utf8" });
      const availableOutput = execSync(availableMemoryCmd, {
        encoding: "utf8",
      });

      // Parse the output
      const totalMatch = totalOutput.match(/TotalPhysicalMemory=(\d+)/);
      const availableMatch = availableOutput.match(
        /AvailablePhysicalMemory=(\d+)/,
      );

      if (totalMatch && availableMatch) {
        const totalBytes = parseInt(totalMatch[1]);
        const availableBytes = parseInt(availableMatch[1]) * 1024; // Available is in KB
        const usedBytes = totalBytes - availableBytes;
        const usagePercentage = (usedBytes / totalBytes) * 100;

        return {
          total: totalBytes,
          used: usedBytes,
          available: availableBytes,
          usagePercentage: Math.round(usagePercentage),
          formatted: {
            total: this.formatBytes(totalBytes),
            used: this.formatBytes(usedBytes),
            available: this.formatBytes(availableBytes),
          },
          method: "wmic",
        };
      }
    } catch (error) {
      console.error("Windows memory usage error:", error);
    }

    return this.getFallbackMemoryUsage();
  }

  private getLinuxMemoryUsage() {
    try {
      // Read /proc/meminfo
      const meminfo = execSync("cat /proc/meminfo", { encoding: "utf8" });
      const lines = meminfo.split("\n");

      const getMemValue = (key: string) => {
        const line = lines.find((l) => l.startsWith(key));
        if (line) {
          const match = line.match(/(\d+)/);
          return match ? parseInt(match[1]) * 1024 : 0; // Convert KB to bytes
        }
        return 0;
      };

      const totalBytes = getMemValue("MemTotal:");
      const availableBytes =
        getMemValue("MemAvailable:") ||
        getMemValue("MemFree:") +
          getMemValue("Buffers:") +
          getMemValue("Cached:");
      const usedBytes = totalBytes - availableBytes;
      const usagePercentage =
        totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;

      return {
        total: totalBytes,
        used: usedBytes,
        available: availableBytes,
        usagePercentage: Math.round(usagePercentage),
        formatted: {
          total: this.formatBytes(totalBytes),
          used: this.formatBytes(usedBytes),
          available: this.formatBytes(availableBytes),
        },
        method: "proc/meminfo",
      };
    } catch (error) {
      console.error("Linux memory usage error:", error);
    }

    return this.getFallbackMemoryUsage();
  }

  private getMacMemoryUsage() {
    try {
      // Use vm_stat command for macOS
      const vmStat = execSync("vm_stat", { encoding: "utf8" });
      const pageSize = 4096; // Default page size on macOS

      const getPages = (key: string) => {
        const match = vmStat.match(new RegExp(`${key}:\\s*(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      };

      const freePages = getPages("Pages free");
      const activePages = getPages("Pages active");
      const inactivePages = getPages("Pages inactive");
      const wiredPages = getPages("Pages wired down");
      const compressedPages = getPages("Pages stored in compressor");

      const totalPages =
        freePages + activePages + inactivePages + wiredPages + compressedPages;
      const usedPages =
        activePages + inactivePages + wiredPages + compressedPages;

      const totalBytes = totalPages * pageSize;
      const usedBytes = usedPages * pageSize;
      const availableBytes = freePages * pageSize;
      const usagePercentage =
        totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;

      return {
        total: totalBytes,
        used: usedBytes,
        available: availableBytes,
        usagePercentage: Math.round(usagePercentage),
        formatted: {
          total: this.formatBytes(totalBytes),
          used: this.formatBytes(usedBytes),
          available: this.formatBytes(availableBytes),
        },
        method: "vm_stat",
      };
    } catch (error) {
      console.error("macOS memory usage error:", error);
    }

    return this.getFallbackMemoryUsage();
  }

  private getFallbackMemoryUsage() {
    try {
      // Use Node.js os module as fallback
      const totalBytes = os.totalmem();
      const freeBytes = os.freemem();
      const usedBytes = totalBytes - freeBytes;
      const usagePercentage =
        totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;

      return {
        total: totalBytes,
        used: usedBytes,
        available: freeBytes,
        usagePercentage: Math.round(usagePercentage),
        formatted: {
          total: this.formatBytes(totalBytes),
          used: this.formatBytes(usedBytes),
          available: this.formatBytes(freeBytes),
        },
        method: "os.totalmem/freemem",
      };
    } catch (error) {
      console.error("Fallback memory usage error:", error);
      return {
        total: 0,
        used: 0,
        available: 0,
        usagePercentage: 0,
        formatted: {
          total: "0 B",
          used: "0 B",
          available: "0 B",
        },
        method: "error",
      };
    }
  }

  /**
   * Get memory usage comparison between system and Node.js process
   */
  async getMemoryComparison() {
    const systemMemory = await this.getSystemMemoryUsage();
    const processMemory = process.memoryUsage();

    const processRssPercentage =
      systemMemory.total > 0
        ? (processMemory.rss / systemMemory.total) * 100
        : 0;

    return {
      system: systemMemory,
      process: {
        rss: processMemory.rss,
        heapTotal: processMemory.heapTotal,
        heapUsed: processMemory.heapUsed,
        external: processMemory.external,
        heapPercentage:
          (processMemory.heapUsed / processMemory.heapTotal) * 100,
        systemPercentage: processRssPercentage,
        formatted: {
          rss: this.formatBytes(processMemory.rss),
          heapTotal: this.formatBytes(processMemory.heapTotal),
          heapUsed: this.formatBytes(processMemory.heapUsed),
          external: this.formatBytes(processMemory.external),
        },
      },
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

export const systemMemoryMonitor = SystemMemoryMonitor.getInstance();
