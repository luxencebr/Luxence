import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAnalyticsAdapter } from "@/lib/analytics-adapter";

const prisma = new PrismaClient();

// Force Node.js runtime to avoid edge runtime issues
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "24h") as "24h" | "7d" | "30d" | "1y" | "all";

    // Validate period parameter
    if (!["24h", "7d", "30d", "1y", "all"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Use 24h, 7d, 30d, 1y, or all" },
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

    // Obter dados de sessões por período para o gráfico
    let dailyAccess;
    if (period === "all") {
      // Para "all time", calcular desde o início do sistema
      const firstSession = await prisma.analyticsSession.findFirst({
        orderBy: { startTime: 'asc' },
        select: { startTime: true }
      });
      
      if (firstSession) {
        const now = new Date();
        const daysSinceFirst = Math.ceil((now.getTime() - firstSession.startTime.getTime()) / (24 * 60 * 60 * 1000));
        dailyAccess = await adapter.getSessionsByDateRange(daysSinceFirst);
      } else {
        dailyAccess = [];
      }
    } else {
      // Converter período para dias
      const periodToDays = {
        "24h": 1,
        "7d": 7,
        "30d": 30,
        "1y": 365
      };
      dailyAccess = await adapter.getSessionsByDateRange(periodToDays[period] || 7);
    }

    const response = {
      ...metrics,
      devices,
      location,
      dailyAccess,
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
