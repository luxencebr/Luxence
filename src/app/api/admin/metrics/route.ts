import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAnalyticsAdapter } from "@/lib/analytics-adapter";

const prisma = new PrismaClient();

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

    // Usar o adaptador simplificado
    const adapter = getAnalyticsAdapter(prisma);
    
    // Obter métricas consolidadas
    const metrics = await adapter.getConsolidatedMetrics(period);
    
    // Obter breakdowns
    const [devices, location] = await Promise.all([
      adapter.getDeviceBreakdown(period),
      adapter.getLocationBreakdown(period),
    ]);

    const response = {
      ...metrics,
      devices,
      location,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 },
    );
  }
}
