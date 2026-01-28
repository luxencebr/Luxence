/**
 * Disk usage monitoring utilities
 */

import { execSync } from "child_process";
import { statSync } from "fs";
import { join } from "path";

class DiskMonitor {
  private static instance: DiskMonitor;

  static getInstance() {
    if (!DiskMonitor.instance) {
      DiskMonitor.instance = new DiskMonitor();
    }
    return DiskMonitor.instance;
  }

  /**
   * Get disk usage information
   * Uses different methods depending on the OS
   */
  async getDiskUsage() {
    try {
      const platform = process.platform;

      if (platform === "win32") {
        return this.getWindowsDiskUsageOptimized();
      } else if (platform === "linux" || platform === "darwin") {
        return this.getUnixDiskUsage();
      } else {
        return this.getFallbackDiskUsage();
      }
    } catch (error) {
      console.error("Error getting disk usage:", error);
      return this.getFallbackDiskUsage();
    }
  }

  private getWindowsDiskUsageOptimized() {
    try {
      // Use a faster PowerShell command with timeout
      const currentDrive = process.cwd().split(":")[0] + ":";
      const command = `powershell -Command "& {$drive = Get-WmiObject -Class Win32_LogicalDisk -Filter \\"DeviceID='${currentDrive}'\\" | Select-Object Size,FreeSpace; Write-Output \\"$($drive.Size),$($drive.FreeSpace)\\"}"`;

      const output = execSync(command, {
        encoding: "utf8",
        timeout: 5000, // 5 second timeout
      });

      const parts = output.trim().split(",");
      if (parts.length === 2) {
        const totalSpace = parseInt(parts[0]) || 0;
        const freeSpace = parseInt(parts[1]) || 0;
        const usedSpace = totalSpace - freeSpace;

        return {
          total: this.formatBytes(totalSpace),
          used: this.formatBytes(usedSpace),
          available: this.formatBytes(freeSpace),
          percentage:
            totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0,
          path: currentDrive,
          method: "powershell-optimized",
        };
      }
    } catch (error) {
      console.error("Optimized Windows disk usage error:", error);
    }

    return this.getFallbackDiskUsage();
  }

  private getWindowsDiskUsage() {
    try {
      // Get disk usage for the current drive (usually C:)
      const currentDrive = process.cwd().split(":")[0] + ":";
      const command = `wmic logicaldisk where "DeviceID='${currentDrive}'" get Size,FreeSpace /format:csv`;
      const output = execSync(command, { encoding: "utf8" });

      const lines = output.split("\n").filter((line) => line.includes(","));
      if (lines.length > 0) {
        const parts = lines[0].split(",");
        const freeSpace = parseInt(parts[1]) || 0;
        const totalSpace = parseInt(parts[2]) || 0;
        const usedSpace = totalSpace - freeSpace;

        return {
          total: this.formatBytes(totalSpace),
          used: this.formatBytes(usedSpace),
          available: this.formatBytes(freeSpace),
          percentage:
            totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0,
          path: currentDrive,
          method: "wmic",
        };
      }
    } catch (error) {
      console.error("Windows disk usage error:", error);
    }

    return this.getFallbackDiskUsage();
  }

  private getUnixDiskUsage() {
    try {
      // Use df command to get disk usage
      const output = execSync("df -h .", { encoding: "utf8" });
      const lines = output.split("\n");

      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        const total = parts[1];
        const used = parts[2];
        const available = parts[3];
        const percentage = parseInt(parts[4].replace("%", "")) || 0;

        return {
          total,
          used,
          available,
          percentage,
          path: parts[5] || ".",
          method: "df",
        };
      }
    } catch (error) {
      console.error("Unix disk usage error:", error);
    }

    return this.getFallbackDiskUsage();
  }

  private getFallbackDiskUsage() {
    try {
      // Fallback: get basic file system stats
      const stats = statSync(".");

      return {
        total: "N/A",
        used: "N/A",
        available: "N/A",
        percentage: 0,
        path: process.cwd(),
        method: "fallback",
        note: "Limited disk info available. Install system monitoring tools for detailed metrics.",
      };
    } catch (error) {
      return {
        total: "Error",
        used: "Error",
        available: "Error",
        percentage: 0,
        path: "Unknown",
        method: "error",
        note: "Unable to access disk information",
      };
    }
  }

  /**
   * Get application-specific disk usage (optimized)
   */
  async getApplicationDiskUsage() {
    try {
      // Only check key directories to avoid slow operations
      const paths = [
        { path: "node_modules", priority: "high" },
        { path: ".next", priority: "high" },
        { path: "src", priority: "medium" },
        { path: "public", priority: "low" },
      ];

      const sizes = await Promise.all(
        paths.map(async ({ path, priority }) => {
          try {
            // Skip slow operations for low priority paths
            if (priority === "low") {
              return { path, size: 0, formatted: "Skipped", priority };
            }

            const size = await this.getDirectorySizeOptimized(path);
            return { path, size, formatted: this.formatBytes(size), priority };
          } catch (error) {
            return { path, size: 0, formatted: "Error", priority };
          }
        }),
      );

      const totalSize = sizes.reduce((sum, { size }) => sum + size, 0);

      return {
        directories: sizes,
        totalApplicationSize: this.formatBytes(totalSize),
        totalSizeBytes: totalSize,
        note: "Some directories skipped for performance",
      };
    } catch (error) {
      console.error("Error getting application disk usage:", error);
      return {
        directories: [],
        totalApplicationSize: "0 B",
        totalSizeBytes: 0,
        note: "Unable to calculate application size",
      };
    }
  }

  private async getDirectorySizeOptimized(dirPath: string): Promise<number> {
    try {
      const platform = process.platform;
      let command: string;

      if (platform === "win32") {
        // Use faster PowerShell command with timeout
        command = `powershell -Command "& {try { (Get-ChildItem -Path '${dirPath}' -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum } catch { 0 }}"`;
      } else {
        command = `timeout 10s du -sb "${dirPath}" 2>/dev/null | cut -f1 || echo 0`;
      }

      const output = execSync(command, {
        encoding: "utf8",
        timeout: 10000, // 10 second timeout
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      console.warn(
        `Failed to get size for ${dirPath}:`,
        (error as Error).message || error,
      );
      return 0;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

export const diskMonitor = DiskMonitor.getInstance();
