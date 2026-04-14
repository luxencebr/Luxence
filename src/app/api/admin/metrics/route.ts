import { NextRequest, NextResponse } from "next/server";
import { analyticsMonitor } from "@/lib/analytics-monitor";

// Force Node.js runtime to avoid edge runtime issues
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "24h") as "24h" | "7d" | "30d";

    // Validate period parameter
    if (!["24h", "7d", "30d"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Use 24h, 7d, or 30d" },
        { status: 400 },
      );
    }

    const metrics = analyticsMonitor.getAllMetrics(period);

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
