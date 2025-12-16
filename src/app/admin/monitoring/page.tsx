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

interface HistoricalDataPoint {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  heapPercentage: number;
  connections: number;
  rss: number;
}

export default function MonitoringDashboard() {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [leakCheck, setLeakCheck] = useState<LeakCheck | null>(null);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [triggeringGC, setTriggeringGC] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>(
    []
  );
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("1h");

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [memory, leak, db] = await Promise.all([
        fetch("/api/health/memory").then((r) => r.json()),
        fetch("/api/debug/memory-leak-check").then((r) => r.json()),
        fetch("/api/debug/connections").then((r) => r.json()),
      ]);

      setMemoryStats(memory);
      setLeakCheck(leak);
      setDbStats(db);

      if (memory && db) {
        const dataPoint: HistoricalDataPoint = {
          timestamp: Date.now(),
          heapUsed: Number.parseFloat(memory.memory.heapUsed),
          heapTotal: Number.parseFloat(memory.memory.heapTotal),
          heapPercentage: Number.parseFloat(memory.memory.heapPercentage),
          connections: db.connections,
          rss: Number.parseFloat(memory.memory.rss),
        };

        setHistoricalData((prev) => {
          const updated = [...prev, dataPoint];
          // Keep last 100 data points
          return updated.slice(-100);
        });
      }
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
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
    setTriggeringGC(true);
    try {
      await fetch("/api/health/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "gc" }),
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to trigger GC:", error);
    } finally {
      setTimeout(() => setTriggeringGC(false), 1000);
    }
  };

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

  const getFilteredData = () => {
    const now = Date.now();
    let cutoffTime = now;

    switch (timeRange) {
      case "1h":
        cutoffTime = now - 60 * 60 * 1000;
        break;
      case "6h":
        cutoffTime = now - 6 * 60 * 60 * 1000;
        break;
      case "24h":
        cutoffTime = now - 24 * 60 * 60 * 1000;
        break;
    }

    return historicalData.filter((point) => point.timestamp >= cutoffTime);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getChartPoints = (data: number[], height: number) => {
    if (data.length === 0) return [];

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    return data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * 100;
      const y = height - ((value - min) / range) * height;
      return { x, y, value };
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loader}></div>
        <p>Carregando dados de monitoramento...</p>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const heapUsedData = filteredData.map((d) => d.heapUsed);
  const connectionsData = filteredData.map((d) => d.connections);
  const timestamps = filteredData.map((d) => d.timestamp);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Monitoring Dashboard</h1>
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.buttonOutline} ${
              autoRefresh ? styles.buttonActive : ""
            }`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Desativar" : "Ativar"} Auto-refresh
          </button>
          <button
            className={`${styles.button} ${styles.buttonPrimary} ${
              refreshing ? styles.buttonLoading : ""
            }`}
            onClick={fetchData}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <span className={styles.spinner}></span>
                Atualizando...
              </>
            ) : (
              "Atualizar Agora"
            )}
          </button>
          <button
            className={`${styles.button} ${styles.buttonDanger} ${
              triggeringGC ? styles.buttonLoading : ""
            }`}
            onClick={triggerGC}
            disabled={triggeringGC}
          >
            {triggeringGC ? (
              <>
                <span className={styles.spinner}></span>
                Processando...
              </>
            ) : (
              "Forçar GC"
            )}
          </button>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.cardHeader}>
          <div className={styles.chartHeaderRow}>
            <div>
              <h2 className={styles.cardTitle}>
                Uso de Memória ao Longo do Tempo
              </h2>
              <p className={styles.cardDescription}>
                Monitoramento histórico de heap e conexões
              </p>
            </div>
            <div className={styles.timeRangeSelector}>
              <button
                className={`${styles.timeRangeButton} ${
                  timeRange === "1h" ? styles.timeRangeActive : ""
                }`}
                onClick={() => setTimeRange("1h")}
              >
                1h
              </button>
              <button
                className={`${styles.timeRangeButton} ${
                  timeRange === "6h" ? styles.timeRangeActive : ""
                }`}
                onClick={() => setTimeRange("6h")}
              >
                6h
              </button>
              <button
                className={`${styles.timeRangeButton} ${
                  timeRange === "24h" ? styles.timeRangeActive : ""
                }`}
                onClick={() => setTimeRange("24h")}
              >
                24h
              </button>
            </div>
          </div>
        </div>
        <div className={styles.cardContent}>
          {filteredData.length === 0 ? (
            <div className={styles.noDataMessage}>
              Aguardando coleta de dados históricos...
            </div>
          ) : (
            <>
              {/* Memory Chart */}
              <div className={styles.chartContainer}>
                <div className={styles.chartLabel}>Heap Usado (MB)</div>
                <svg
                  className={styles.chart}
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                >
                  {/* Grid lines */}
                  <line
                    x1="0"
                    y1="10"
                    x2="100"
                    y2="10"
                    className={styles.gridLine}
                  />
                  <line
                    x1="0"
                    y1="20"
                    x2="100"
                    y2="20"
                    className={styles.gridLine}
                  />
                  <line
                    x1="0"
                    y1="30"
                    x2="100"
                    y2="30"
                    className={styles.gridLine}
                  />

                  {/* Memory line */}
                  <polyline
                    points={getChartPoints(heapUsedData, 40)
                      .map((p) => `${p.x},${p.y}`)
                      .join(" ")}
                    className={styles.chartLine}
                  />

                  {/* Area fill */}
                  <polygon
                    points={`0,40 ${getChartPoints(heapUsedData, 40)
                      .map((p) => `${p.x},${p.y}`)
                      .join(" ")} 100,40`}
                    className={styles.chartArea}
                  />

                  {/* Data points */}
                  {getChartPoints(heapUsedData, 40).map((point, idx) => (
                    <circle
                      key={idx}
                      cx={point.x}
                      cy={point.y}
                      r="0.5"
                      className={styles.chartPoint}
                    >
                      <title>
                        {point.value.toFixed(2)} MB às{" "}
                        {formatTime(timestamps[idx])}
                      </title>
                    </circle>
                  ))}
                </svg>
                <div className={styles.chartStats}>
                  <span>Min: {Math.min(...heapUsedData).toFixed(2)} MB</span>
                  <span>Máx: {Math.max(...heapUsedData).toFixed(2)} MB</span>
                  <span>
                    Média:{" "}
                    {(
                      heapUsedData.reduce((a, b) => a + b, 0) /
                      heapUsedData.length
                    ).toFixed(2)}{" "}
                    MB
                  </span>
                </div>
              </div>

              {/* Connections Chart */}
              <div className={styles.chartContainer}>
                <div className={styles.chartLabel}>Conexões do Banco</div>
                <svg
                  className={styles.chart}
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                >
                  {/* Grid lines */}
                  <line
                    x1="0"
                    y1="10"
                    x2="100"
                    y2="10"
                    className={styles.gridLine}
                  />
                  <line
                    x1="0"
                    y1="20"
                    x2="100"
                    y2="20"
                    className={styles.gridLine}
                  />
                  <line
                    x1="0"
                    y1="30"
                    x2="100"
                    y2="30"
                    className={styles.gridLine}
                  />

                  {/* Connections line */}
                  <polyline
                    points={getChartPoints(connectionsData, 40)
                      .map((p) => `${p.x},${p.y}`)
                      .join(" ")}
                    className={styles.chartLineSecondary}
                  />

                  {/* Area fill */}
                  <polygon
                    points={`0,40 ${getChartPoints(connectionsData, 40)
                      .map((p) => `${p.x},${p.y}`)
                      .join(" ")} 100,40`}
                    className={styles.chartAreaSecondary}
                  />

                  {/* Data points */}
                  {getChartPoints(connectionsData, 40).map((point, idx) => (
                    <circle
                      key={idx}
                      cx={point.x}
                      cy={point.y}
                      r="0.5"
                      className={styles.chartPointSecondary}
                    >
                      <title>
                        {point.value} conexões às {formatTime(timestamps[idx])}
                      </title>
                    </circle>
                  ))}
                </svg>
                <div className={styles.chartStats}>
                  <span>Min: {Math.min(...connectionsData)}</span>
                  <span>Máx: {Math.max(...connectionsData)}</span>
                  <span>
                    Média:{" "}
                    {(
                      connectionsData.reduce((a, b) => a + b, 0) /
                      connectionsData.length
                    ).toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className={styles.timeline}>
                <div className={styles.timelineLabel}>Linha do Tempo</div>
                <div className={styles.timelineBar}>
                  {filteredData.map((point, idx) => {
                    const percentage =
                      (idx / (filteredData.length - 1 || 1)) * 100;
                    const isWarning = point.heapPercentage > 70;
                    const isCritical = point.heapPercentage > 85;

                    return (
                      <div
                        key={point.timestamp}
                        className={`${styles.timelinePoint} ${
                          isCritical
                            ? styles.timelinePointCritical
                            : isWarning
                            ? styles.timelinePointWarning
                            : styles.timelinePointHealthy
                        }`}
                        style={{ left: `${percentage}%` }}
                        title={`${formatTime(
                          point.timestamp
                        )}: ${point.heapPercentage.toFixed(1)}% heap`}
                      />
                    );
                  })}
                </div>
                <div className={styles.timelineLabels}>
                  {filteredData.length > 0 && (
                    <>
                      <span>{formatTime(filteredData[0].timestamp)}</span>
                      <span>
                        {formatTime(
                          filteredData[filteredData.length - 1].timestamp
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
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
                {leakCheck?.growth.bytesPerSecond.toLocaleString()} bytes
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
