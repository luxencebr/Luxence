import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    const memory = process.memoryUsage();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
        heapPercentage:
          ((memory.heapUsed / memory.heapTotal) * 100).toFixed(2) + "%",
      },
      database: "connected",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
