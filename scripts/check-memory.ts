/**
 * Script para verificar uso de memória da aplicação
 * Execute com: npx tsx scripts/check-memory.ts
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface MemoryReport {
  timestamp: string;
  memory: {
    heapUsed: string;
    heapTotal: string;
    heapPercentage: string;
  };
  growth: {
    mbPerHour: string;
  };
  status: string;
}

async function checkMemory() {
  try {
    console.log("🔍 Verificando uso de memória...\n");

    const response = await fetch(`${API_URL}/api/debug/memory-leak-check`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as MemoryReport;

    console.log(
      "📊 Status:",
      getStatusEmoji(data.status),
      data.status.toUpperCase()
    );
    console.log("\n💾 Uso de Memória:");
    console.log(`  Heap Usado: ${data.memory.heapUsed}`);
    console.log(`  Heap Total: ${data.memory.heapTotal}`);
    console.log(`  Percentual: ${data.memory.heapPercentage}`);

    console.log("\n📈 Taxa de Crescimento:");
    console.log(`  Por Hora: ${data.growth.mbPerHour} MB/h`);

    const growthMb = Number.parseFloat(data.growth.mbPerHour);
    if (growthMb > 50) {
      console.log("\n⚠️  ATENÇÃO: Alta taxa de crescimento de memória!");
      console.log("   Possível memory leak detectado.");
      console.log("   Recomendações:");
      console.log("   1. Revise event listeners não removidos");
      console.log("   2. Verifique timers (setInterval/setTimeout)");
      console.log("   3. Confira conexões abertas com o banco");
      console.log("   4. Considere reiniciar a aplicação");
    } else if (growthMb > 20) {
      console.log("\n⚠️  Taxa de crescimento moderada - monitore de perto");
    } else {
      console.log("\n✅ Taxa de crescimento normal");
    }

    console.log("\n🕐 Timestamp:", new Date(data.timestamp).toLocaleString());

    process.exit(growthMb > 50 ? 1 : 0);
  } catch (error) {
    console.error("❌ Erro ao verificar memória:", error);
    process.exit(1);
  }
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case "healthy":
      return "✅";
    case "warning":
      return "⚠️";
    case "critical":
      return "🔴";
    default:
      return "❓";
  }
}

checkMemory();
