import { NextResponse } from "next/server";
import { Diagnostics } from "@/lib/diagnostics";

export async function GET() {
  const snapshot = Diagnostics.createSnapshot();
  const logs = Diagnostics.getLogs();

  return NextResponse.json({
    ...snapshot,
    recentLogs: logs.slice(-50).map((log) => ({
      ...log,
      timestamp: new Date(log.timestamp).toISOString(),
    })),
  });
}

export async function DELETE() {
  Diagnostics.clearLogs();
  return NextResponse.json({ success: true, message: "Logs cleared" });
}
