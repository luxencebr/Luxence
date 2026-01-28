import { NextResponse } from "next/server";
import { analyticsMonitor } from "@/lib/analytics-monitor";

export async function GET() {
  try {
    const metrics = analyticsMonitor.getAllMetrics();

    console.log("📊 Metrics requested:", {
      totalPageViews: metrics.summary.totalPageViews,
      totalSessions: metrics.summary.totalSessions,
      activeSessions: metrics.summary.activeSessions,
    });

    return NextResponse.json({
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 },
    );
  }
}
