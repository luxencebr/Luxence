import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

/* =========================
   Helpers seguros
========================= */
function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  return fallback;
}

export async function GET() {
  try {
    /* =========================
       Conexões ativas
    ========================== */
    const connectionsRaw = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) AS count
      FROM information_schema.PROCESSLIST
      WHERE DB = DATABASE()
    `;

    const connections = toNumber(connectionsRaw[0]?.count);

    /* =========================
       Tamanho do banco
       ⚠️ SUM pode retornar BIGINT
    ========================== */
    const dbSizeRaw = await prisma.$queryRaw<
      Array<{ size_mb: bigint | number }>
    >`
      SELECT
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
    `;

    const databaseSize =
      dbSizeRaw[0]?.size_mb != null
        ? `${toNumber(dbSizeRaw[0].size_mb)} MB`
        : "Unknown";

    /* =========================
       Queries ativas longas
    ========================== */
    const slowQueries = await prisma.$queryRaw<
      Array<{ info: string; time: number }>
    >`
      SELECT
        INFO AS info,
        TIME AS time
      FROM information_schema.PROCESSLIST
      WHERE
        DB = DATABASE()
        AND COMMAND != 'Sleep'
        AND INFO IS NOT NULL
      ORDER BY TIME DESC
      LIMIT 10
    `;

    return NextResponse.json({
      connections,
      databaseSize,
      slowQueries: slowQueries.map((q) => ({
        query: q.info.substring(0, 100),
        duration: `${q.time}s`,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("DB MONITOR ERROR:", error);

    return NextResponse.json(
      {
        connections: null,
        databaseSize: "indisponível",
        slowQueries: [],
        error: "Failed to fetch database metrics",
      },
      { status: 200 } // dashboard nunca quebra
    );
  }
}
