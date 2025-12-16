import { NextResponse } from "next/server";

// Track request counts to identify potential leaks
const requestCounts = new Map<string, number>();
const startTime = Date.now();

export async function GET() {
  const memory = process.memoryUsage();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  // Calculate memory growth rate
  const memoryPerSecond = memory.heapUsed / uptime;

  // Get top routes by request count
  const topRoutes = Array.from(requestCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([route, count]) => ({
      route,
      count,
      avgPerSecond: (count / uptime).toFixed(2),
    }));

  const analysis = {
    status:
      memoryPerSecond < 100000
        ? "healthy"
        : memoryPerSecond < 500000
        ? "warning"
        : "critical",
    memory: {
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memory.external / 1024 / 1024)}MB`,
      rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
      heapPercentage:
        ((memory.heapUsed / memory.heapTotal) * 100).toFixed(2) + "%",
    },
    growth: {
      bytesPerSecond: Math.round(memoryPerSecond),
      mbPerMinute: ((memoryPerSecond * 60) / 1024 / 1024).toFixed(2),
      mbPerHour: ((memoryPerSecond * 3600) / 1024 / 1024).toFixed(2),
    },
    uptime: {
      seconds: uptime,
      formatted: `${Math.floor(uptime / 3600)}h ${Math.floor(
        (uptime % 3600) / 60
      )}m ${uptime % 60}s`,
    },
    topRoutes,
    recommendations: getRecommendations(memory, memoryPerSecond),
  };

  return NextResponse.json(analysis);
}

function getRecommendations(memory: NodeJS.MemoryUsage, growthRate: number) {
  const recommendations: string[] = [];

  const heapPercentage = (memory.heapUsed / memory.heapTotal) * 100;

  if (heapPercentage > 80) {
    recommendations.push(
      "⚠️ Heap usage above 80% - consider increasing memory limit or optimizing code"
    );
  }

  if (growthRate > 500000) {
    recommendations.push(
      "🔴 High memory growth rate detected - potential memory leak"
    );
    recommendations.push("- Check for unclosed connections or event listeners");
    recommendations.push("- Review recent code changes");
    recommendations.push("- Consider restarting the application");
  } else if (growthRate > 100000) {
    recommendations.push("⚠️ Moderate memory growth - monitor closely");
  } else {
    recommendations.push("✅ Memory growth rate is normal");
  }

  if (memory.external > 50 * 1024 * 1024) {
    recommendations.push(
      "⚠️ High external memory usage - check Buffer allocations"
    );
  }

  const rssVsHeap = memory.rss / memory.heapTotal;
  if (rssVsHeap > 2) {
    recommendations.push(
      "⚠️ RSS significantly higher than heap - possible memory fragmentation"
    );
  }

  return recommendations;
}

// Track requests for analysis
export async function POST(request: Request) {
  try {
    const { route } = await request.json();
    if (route) {
      requestCounts.set(route, (requestCounts.get(route) || 0) + 1);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
