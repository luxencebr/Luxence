import { NextRequest, NextResponse } from "next/server";
import { analyticsMonitor } from "@/lib/analytics-monitor";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageViewId, duration } = body;

    analyticsMonitor.updatePageViewDuration(pageViewId, duration);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics duration update error:", error);
    return NextResponse.json(
      { error: "Failed to update page view duration" },
      { status: 500 },
    );
  }
}
