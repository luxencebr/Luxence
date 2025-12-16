import { MemoryMonitor } from "@/lib/memory-monitor";

export async function GET() {
  const monitor = MemoryMonitor.getInstance();
  const snapshot = monitor.getSnapshot();

  return Response.json({
    memory: snapshot,
    uptime: `${Math.round(process.uptime() / 60)} minutes`,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const { action } = await request.json();

  if (action === "gc") {
    const monitor = MemoryMonitor.getInstance();
    monitor.forceGarbageCollection();
    return Response.json({ success: true, message: "GC triggered" });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
