"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface MemoryStats {
  memory: {
    rss: string;
    heapUsed: string;
    heapTotal: string;
    heapPercentage: string;
  };
  uptime: string;
  timestamp: string;
}

interface LeakCheck {
  status: string;
  memory: {
    heapUsed: string;
    heapTotal: string;
    heapPercentage: string;
  };
  growth: {
    bytesPerSecond: number;
    mbPerMinute: string;
    mbPerHour: string;
  };
  recommendations: string[];
}

interface DbStats {
  connections: number;
  databaseSize: string;
  slowQueries: Array<{ query: string; duration: string }>;
}

export default function MonitoringDashboard() {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [leakCheck, setLeakCheck] = useState<LeakCheck | null>(null);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      const [memory, leak, db] = await Promise.all([
        fetch("/api/health/memory").then((r) => r.json()),
        fetch("/api/debug/memory-leak-check").then((r) => r.json()),
        fetch("/api/debug/connections").then((r) => r.json()),
      ]);

      setMemoryStats(memory);
      setLeakCheck(leak);
      setDbStats(db);
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const triggerGC = async () => {
    try {
      await fetch("/api/health/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "gc" }),
      });
      fetchData();
    } catch (error) {
      console.error("Failed to trigger GC:", error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loader}></div>
        <p>Carregando dados de monitoramento...</p>
      </div>
    );
  }

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "healthy":
        return styles.statusHealthy;
      case "warning":
        return styles.statusWarning;
      case "critical":
        return styles.statusCritical;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Monitoring Dashboard</h1>
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.buttonOutline}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Desativar" : "Ativar"} Auto-refresh
          </button>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={fetchData}
          >
            Atualizar Agora
          </button>
          <button
            className={`${styles.button} ${styles.buttonDanger}`}
            onClick={triggerGC}
          >
            Forçar GC
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Memory Usage Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Uso de Memória</h2>
            <p className={styles.cardDescription}>
              Estatísticas atuais de memória
            </p>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Heap Usado:</span>
              <span className={styles.statValue}>
                {memoryStats?.memory.heapUsed}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Heap Total:</span>
              <span className={styles.statValue}>
                {memoryStats?.memory.heapTotal}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>RSS:</span>
              <span className={styles.statValue}>
                {memoryStats?.memory.rss}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Uso:</span>
              <span
                className={`${styles.statValue} ${
                  styles.statBold
                } ${getStatusClass(leakCheck?.status)}`}
              >
                {memoryStats?.memory.heapPercentage}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Uptime:</span>
              <span className={styles.statValue}>{memoryStats?.uptime}</span>
            </div>
          </div>
        </div>

        {/* Memory Growth Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Crescimento de Memória</h2>
            <p
              className={`${styles.cardDescription} ${getStatusClass(
                leakCheck?.status
              )}`}
            >
              Status: {leakCheck?.status?.toUpperCase()}
            </p>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Por Segundo:</span>
              <span className={styles.statValue}>
                {leakCheck?.growth?.bytesPerSecond != null
                  ? leakCheck.growth.bytesPerSecond.toLocaleString()
                  : "—"}{" "}
                bytes
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Por Minuto:</span>
              <span className={styles.statValue}>
                {leakCheck?.growth.mbPerMinute} MB
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Por Hora:</span>
              <span className={styles.statValue}>
                {leakCheck?.growth.mbPerHour} MB
              </span>
            </div>
          </div>
        </div>

        {/* Database Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Banco de Dados</h2>
            <p className={styles.cardDescription}>Pool de conexões e tamanho</p>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Conexões Ativas:</span>
              <span className={styles.statValue}>{dbStats?.connections}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Tamanho do DB:</span>
              <span className={styles.statValue}>{dbStats?.databaseSize}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Queries Lentas:</span>
              <span className={styles.statValue}>
                {dbStats?.slowQueries?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Recomendações</h2>
          <p className={styles.cardDescription}>
            Análise automatizada e sugestões
          </p>
        </div>
        <div className={styles.cardContent}>
          <ul className={styles.recommendationsList}>
            {leakCheck?.recommendations?.map((rec, idx) => (
              <li key={idx} className={styles.recommendation}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Slow Queries Card */}
      {dbStats?.slowQueries && dbStats.slowQueries.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Queries Lentas</h2>
            <p className={styles.cardDescription}>
              Queries demorando mais que o esperado
            </p>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.queriesList}>
              {dbStats.slowQueries.map((query, idx) => (
                <div key={idx} className={styles.queryItem}>
                  <p className={styles.queryText}>{query.query}...</p>
                  <p className={styles.queryDuration}>
                    Duração: {query.duration}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Ações Rápidas</h2>
        </div>
        <div className={styles.cardContent}>
          <p className={styles.endpointsIntro}>
            Para monitorar em tempo real, acesse os seguintes endpoints:
          </p>
          <ul className={styles.endpointsList}>
            <li>• GET /api/health - Health check geral</li>
            <li>• GET /api/health/memory - Estatísticas de memória</li>
            <li>• GET /api/debug/memory-leak-check - Análise de vazamentos</li>
            <li>• GET /api/debug/connections - Conexões do banco</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
