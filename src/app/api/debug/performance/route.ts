import { NextResponse } from "next/server";
import { perfMonitor } from "@/lib/performance-monitor";

export async function GET() {
  try {
    const stats = perfMonitor.getStats();
    const slowest = perfMonitor.getSlowestOperations(20);

    // Convert to array for easier consumption
    const statsArray = Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      avg: Number(data.avg.toFixed(2)),
      max: Number(data.max.toFixed(2)),
      min: Number(data.min.toFixed(2)),
    }));

    // Sort by average duration
    statsArray.sort((a, b) => b.avg - a.avg);

    return NextResponse.json({
      summary: {
        totalOperations: statsArray.reduce((sum, s) => sum + s.count, 0),
        uniqueOperations: statsArray.length,
      },
      statistics: statsArray,
      slowest: slowest.map((m) => ({
        name: m.name,
        duration: Number(m.duration.toFixed(2)),
        timestamp: new Date(m.timestamp).toISOString(),
        metadata: m.metadata,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch performance metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Clear metrics
export async function DELETE() {
  perfMonitor.clear();
  return NextResponse.json({ success: true, message: "Metrics cleared" });
}
