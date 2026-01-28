import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { perfMonitor } from "@/lib/performance-monitor";
import { Diagnostics } from "@/lib/diagnostics";
import { MemoryMonitor } from "@/lib/memory-monitor";
import { cpuMonitor } from "@/lib/cpu-monitor";
import { dbMonitor } from "@/lib/database-monitor";
import { diskMonitor } from "@/lib/disk-monitor";
import { networkMonitor } from "@/lib/network-monitor";
import { systemMemoryMonitor } from "@/lib/system-memory-monitor";

export async function GET() {
  try {
    // Test database connection and measure response time
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStart;

    // Get real system metrics
    const memory = process.memoryUsage();
    const uptime = process.uptime();
    const cpuUsage = cpuMonitor.getCPUUsage();
    const cpuInfo = cpuMonitor.getCPUInfo();
    const memoryComparison = await systemMemoryMonitor.getMemoryComparison();
    const memoryMonitor = MemoryMonitor.getInstance();
    const memorySnapshot = memoryMonitor.getSnapshot();

    // Start monitoring if not already active (for development)
    if (
      !memoryMonitor.isMonitoring() &&
      process.env.NODE_ENV === "development"
    ) {
      memoryMonitor.startMonitoring(120000); // Monitor every 2 minutes in dev
    }

    // Get database metrics
    const dbInfo = await dbMonitor.getConnectionInfo();
    const slowQueries = dbMonitor.getSlowQueries(5);

    // Get disk usage using the disk monitor
    const diskUsage = await diskMonitor.getDiskUsage();
    const appDiskUsage = await diskMonitor.getApplicationDiskUsage();

    // Get network metrics
    const routePerformance = networkMonitor.getRoutePerformance();
    const avgResponseTime = networkMonitor.getAverageResponseTime();
    const latencyPeaks = networkMonitor.getLatencyPeaks(1000);
    const requestsPerMinute = networkMonitor.getRequestsPerMinute();
    const totalRequests = networkMonitor.getTotalRequests();
    const errorStats = networkMonitor.getErrorStats();

    // Get real performance metrics from monitor
    const performanceStats = perfMonitor.getStats();
    const slowestOperations = perfMonitor.getSlowestOperations(5);

    // Get real error logs
    const recentErrors = Diagnostics.getRecentErrors(5);
    const allLogs = Diagnostics.getLogs();

    // Fallback to performance monitor data if network monitor is empty
    const finalRoutePerformance =
      routePerformance.length > 0
        ? routePerformance.slice(0, 10)
        : Object.entries(performanceStats)
            .map(([name, stats]: [string, any]) => ({
              route: name,
              avgTime: Math.round(stats.avg),
              maxTime: Math.round(stats.max),
              minTime: Math.round(stats.min),
              count: stats.count,
            }))
            .sort((a, b) => b.avgTime - a.avgTime)
            .slice(0, 10);

    const finalAvgResponseTime =
      avgResponseTime > 0
        ? avgResponseTime
        : finalRoutePerformance.length > 0
          ? Math.round(
              finalRoutePerformance.reduce(
                (sum, route) => sum + route.avgTime * route.count,
                0,
              ) /
                finalRoutePerformance.reduce(
                  (sum, route) => sum + route.count,
                  0,
                ),
            )
          : 0;

    const performanceData = {
      infrastructure: {
        cpu: {
          usage: Math.round(cpuUsage.total),
          user: Math.round(cpuUsage.user),
          system: Math.round(cpuUsage.system),
          cores: cpuInfo.cores,
          model: cpuInfo.model,
          architecture: cpuInfo.architecture,
        },
        memory: {
          system: {
            total: memoryComparison.system.total,
            used: memoryComparison.system.used,
            available: memoryComparison.system.available,
            usagePercentage: memoryComparison.system.usagePercentage,
            formatted: memoryComparison.system.formatted,
            method: memoryComparison.system.method,
          },
          process: {
            rss: memoryComparison.process.rss,
            heapTotal: memoryComparison.process.heapTotal,
            heapUsed: memoryComparison.process.heapUsed,
            external: memoryComparison.process.external,
            heapPercentage: Math.round(memoryComparison.process.heapPercentage),
            systemPercentage:
              Math.round(memoryComparison.process.systemPercentage * 100) / 100,
            formatted: memoryComparison.process.formatted,
          },
          monitoring: {
            snapshot: memorySnapshot,
            gcAvailable: typeof global.gc !== "undefined",
            monitoringActive: memoryMonitor.isMonitoring(),
          },
        },
        uptime: {
          seconds: Math.round(uptime),
          formatted: formatUptime(uptime),
        },
        disk: {
          system: diskUsage,
          application: appDiskUsage,
        },
      },
      database: {
        avgResponseTime: dbResponseTime,
        connectionPool: dbInfo.connectionPoolEstimate,
        tableStats: dbInfo.tableStats,
        queryStats: dbInfo.queryStats,
        slowQueries:
          slowQueries.length > 0
            ? slowQueries.map((q) => ({
                query: q.query,
                avgTime: q.duration,
                timestamp: new Date(q.timestamp).toISOString(),
              }))
            : slowestOperations.map((op) => ({
                query: op.name,
                avgTime: Math.round(op.duration),
                timestamp: new Date(op.timestamp).toISOString(),
              })),
      },
      application: {
        avgResponseTime: finalAvgResponseTime,
        latencyPeaks,
        requestsPerMinute,
        routePerformance: finalRoutePerformance,
        totalRequests:
          totalRequests > 0
            ? totalRequests
            : finalRoutePerformance.reduce(
                (sum, route) => sum + route.count,
                0,
              ),
      },
      errors: {
        errors4xx: errorStats.errors4xx,
        errors5xx: errorStats.errors5xx,
        totalErrors: errorStats.totalErrors,
        errorBreakdown: errorStats.errorBreakdown,
        recentCritical: recentErrors.map((error) => ({
          message: error.message,
          timestamp: error.timestamp,
          data: error.data,
        })),
      },
      monitoring: {
        performanceMetricsCount: Object.keys(performanceStats).length,
        logCount: allLogs.length,
        networkMonitoringActive: totalRequests > 0,
        systemMonitoringActive: true,
      },
      timestamp: new Date().toISOString(),
    };

    // Record this API call in network monitor
    networkMonitor.recordRequest(
      "/api/admin/performance",
      "GET",
      200,
      Date.now() - dbStart,
    );

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error("Error fetching performance metrics:", error);

    // Record error in network monitor
    networkMonitor.recordRequest("/api/admin/performance", "GET", 500, 0);

    return NextResponse.json(
      { error: "Failed to fetch performance metrics" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const memoryMonitor = MemoryMonitor.getInstance();

    switch (action) {
      case "startMonitoring":
        if (!memoryMonitor.isMonitoring()) {
          memoryMonitor.startMonitoring(60000); // Monitor every minute
          return NextResponse.json({
            success: true,
            message: "Memory monitoring started",
            isMonitoring: true,
          });
        }
        return NextResponse.json({
          success: false,
          message: "Memory monitoring already active",
          isMonitoring: true,
        });

      case "stopMonitoring":
        if (memoryMonitor.isMonitoring()) {
          memoryMonitor.stopMonitoring();
          return NextResponse.json({
            success: true,
            message: "Memory monitoring stopped",
            isMonitoring: false,
          });
        }
        return NextResponse.json({
          success: false,
          message: "Memory monitoring not active",
          isMonitoring: false,
        });

      case "forceGC":
        const beforeGC = process.memoryUsage();
        memoryMonitor.forceGarbageCollection();
        const afterGC = process.memoryUsage();

        return NextResponse.json({
          success: true,
          message: "Garbage collection triggered",
          memoryBefore: {
            heapUsed: Math.round(beforeGC.heapUsed / 1024 / 1024),
            rss: Math.round(beforeGC.rss / 1024 / 1024),
          },
          memoryAfter: {
            heapUsed: Math.round(afterGC.heapUsed / 1024 / 1024),
            rss: Math.round(afterGC.rss / 1024 / 1024),
          },
          freed: {
            heap: Math.round(
              (beforeGC.heapUsed - afterGC.heapUsed) / 1024 / 1024,
            ),
            rss: Math.round((beforeGC.rss - afterGC.rss) / 1024 / 1024),
          },
        });

      case "getSnapshot":
        const snapshot = memoryMonitor.getSnapshot();
        return NextResponse.json({
          success: true,
          snapshot,
          isMonitoring: memoryMonitor.isMonitoring(),
        });

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Use: startMonitoring, stopMonitoring, forceGC, getSnapshot",
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error in memory monitor POST:", error);
    return NextResponse.json(
      { error: "Failed to execute memory monitor action" },
      { status: 500 },
    );
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
