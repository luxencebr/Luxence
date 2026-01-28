import { NextRequest, NextResponse } from "next/server";
import { analyticsMonitor } from "@/lib/analytics-monitor";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer, sessionId } = body;

    // Extract analytics data from request
    const userAgent = request.headers.get("user-agent") || "";
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const acceptLanguage = request.headers.get("accept-language") || "en";
    const language = acceptLanguage.split(",")[0].split("-")[0];

    // Track the page view
    const pageViewId = analyticsMonitor.trackPageView({
      sessionId:
        sessionId ||
        `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      path,
      referrer: referrer || "",
      userAgent,
      ip,
      language,
    });

    return NextResponse.json({ success: true, pageViewId });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 },
    );
  }
}
