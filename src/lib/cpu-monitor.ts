/**
 * CPU monitoring utilities for Node.js
 */

class CPUMonitor {
  private static instance: CPUMonitor;
  private lastCpuUsage: NodeJS.CpuUsage | null = null;
  private lastMeasureTime: number = 0;

  static getInstance() {
    if (!CPUMonitor.instance) {
      CPUMonitor.instance = new CPUMonitor();
    }
    return CPUMonitor.instance;
  }

  /**
   * Get CPU usage percentage
   * Returns the CPU usage since the last call to this method
   */
  getCPUUsage(): { user: number; system: number; total: number } {
    const currentUsage = process.cpuUsage(this.lastCpuUsage || undefined);
    const currentTime = Date.now();

    if (this.lastMeasureTime === 0) {
      // First call, initialize and return 0
      this.lastCpuUsage = process.cpuUsage();
      this.lastMeasureTime = currentTime;
      return { user: 0, system: 0, total: 0 };
    }

    const timeDiff = (currentTime - this.lastMeasureTime) * 1000; // Convert to microseconds

    // Calculate percentages
    const userPercent = (currentUsage.user / timeDiff) * 100;
    const systemPercent = (currentUsage.system / timeDiff) * 100;
    const totalPercent = userPercent + systemPercent;

    // Update for next measurement
    this.lastCpuUsage = process.cpuUsage();
    this.lastMeasureTime = currentTime;

    return {
      user: Math.min(100, Math.max(0, userPercent)),
      system: Math.min(100, Math.max(0, systemPercent)),
      total: Math.min(100, Math.max(0, totalPercent)),
    };
  }

  /**
   * Get number of CPU cores
   */
  getCPUCores(): number {
    try {
      const os = require("os");
      return os.cpus().length;
    } catch (error) {
      return 1; // Fallback
    }
  }

  /**
   * Get CPU architecture and model info
   */
  getCPUInfo() {
    try {
      const os = require("os");
      const cpus = os.cpus();
      return {
        model: cpus[0]?.model || "Unknown",
        architecture: os.arch(),
        cores: cpus.length,
      };
    } catch (error) {
      return {
        model: "Unknown",
        architecture: "Unknown",
        cores: 1,
      };
    }
  }
}

export const cpuMonitor = CPUMonitor.getInstance();
