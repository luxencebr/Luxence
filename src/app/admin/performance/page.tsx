"use client";

import React, { useState, useEffect } from "react";
import styles from "./performance.module.css";

interface PerformanceData {
  infrastructure: {
    cpu: {
      usage: number;
      user: number;
      system: number;
      cores: number;
      model: string;
      architecture: string;
    };
    memory: {
      system: {
        total: number;
        used: number;
        available: number;
        usagePercentage: number;
        formatted: {
          total: string;
          used: string;
          available: string;
        };
        method: string;
      };
      process: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        heapPercentage: number;
        systemPercentage: number;
        formatted: {
          rss: string;
          heapTotal: string;
          heapUsed: string;
          external: string;
        };
      };
      monitoring: {
        snapshot: {
          rss: number;
          heapTotal: number;
          heapUsed: number;
          heapPercentage: string;
        };
        gcAvailable: boolean;
        monitoringActive: boolean;
      };
    };
    uptime: { seconds: number; formatted: string };
    disk: {
      system: any;
      application: any;
    };
  };
  database: {
    avgResponseTime: number;
    connectionPool: any;
    tableStats: any;
    queryStats: any;
    slowQueries: Array<{ query: string; avgTime: number; timestamp: string }>;
  };
  application: {
    avgResponseTime: number;
    latencyPeaks: Array<{ route: string; maxTime: number }>;
    requestsPerMinute: number;
    routePerformance: Array<{
      route: string;
      avgTime: number;
      maxTime: number;
      minTime: number;
      count: number;
    }>;
    totalRequests: number;
  };
  errors: {
    errors4xx: number;
    errors5xx: number;
    totalErrors: number;
    errorBreakdown: any;
    recentCritical: Array<{ message: string; timestamp: number; data?: any }>;
  };
  monitoring: {
    performanceMetricsCount: number;
    logCount: number;
    networkMonitoringActive: boolean;
    systemMonitoringActive: boolean;
  };
  timestamp: string;
}

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/performance");
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (percentage: number) => {
    if (percentage > 80) return styles.critical;
    if (percentage > 60) return styles.warning;
    return styles.good;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Carregando métricas de performance...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Erro ao carregar dados: {error}</div>
        <button onClick={fetchData} className={styles.retryButton}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Performance do Sistema</h1>
        <div className={styles.controls}>
          <label className={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (30s)
          </label>
          <button onClick={fetchData} className={styles.refreshButton}>
            Atualizar
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Infraestrutura */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Infraestrutura</h2>
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <h3>CPU</h3>
              <div className={styles.metricValue}>
                <span className={getStatusColor(data.infrastructure.cpu.usage)}>
                  {data.infrastructure.cpu.usage}%
                </span>
                <small>
                  User: {data.infrastructure.cpu.user}% | System:{" "}
                  {data.infrastructure.cpu.system}%
                </small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>RAM do Sistema</h3>
              <div className={styles.metricValue}>
                <span
                  className={getStatusColor(
                    data.infrastructure.memory.system.usagePercentage,
                  )}
                >
                  {data.infrastructure.memory.system.usagePercentage}%
                </span>
                <small>
                  {data.infrastructure.memory.system.formatted.used} /{" "}
                  {data.infrastructure.memory.system.formatted.total}
                </small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>RAM Disponível</h3>
              <div className={styles.metricValue}>
                <span
                  className={
                    data.infrastructure.memory.system.usagePercentage < 80
                      ? styles.good
                      : styles.warning
                  }
                >
                  {data.infrastructure.memory.system.formatted.available}
                </span>
                <small>Memória livre do sistema</small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Uptime</h3>
              <div className={styles.metricValue}>
                <span>{data.infrastructure.uptime.formatted}</span>
                <small>{data.infrastructure.uptime.seconds} segundos</small>
              </div>
            </div>
          </div>

          {/* Seção de Memória do Processo */}
          <div className={styles.processMemory}>
            <h3>Memória do Processo Node.js</h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <h3>Heap Usage</h3>
                <div className={styles.metricValue}>
                  <span
                    className={getStatusColor(
                      data.infrastructure.memory.process.heapPercentage,
                    )}
                  >
                    {data.infrastructure.memory.process.heapPercentage}%
                  </span>
                  <small>
                    {data.infrastructure.memory.process.formatted.heapUsed} /{" "}
                    {data.infrastructure.memory.process.formatted.heapTotal}
                  </small>
                </div>
              </div>

              <div className={styles.metric}>
                <h3>RSS (Resident Set)</h3>
                <div className={styles.metricValue}>
                  <span>
                    {data.infrastructure.memory.process.formatted.rss}
                  </span>
                  <small>
                    {data.infrastructure.memory.process.systemPercentage.toFixed(
                      2,
                    )}
                    % do sistema
                  </small>
                </div>
              </div>

              <div className={styles.metric}>
                <h3>Memória Externa</h3>
                <div className={styles.metricValue}>
                  <span>
                    {data.infrastructure.memory.process.formatted.external}
                  </span>
                  <small>C++ objects bound to JS</small>
                </div>
              </div>

              <div className={styles.metric}>
                <h3>Arquitetura</h3>
                <div className={styles.metricValue}>
                  <span>{data.infrastructure.cpu.architecture}</span>
                  <small>{data.infrastructure.cpu.cores} cores</small>
                </div>
              </div>
            </div>

            {/* Memory Monitoring Controls */}
            <div className={styles.memoryControls}>
              <h4>Controles de Monitoramento</h4>
              <div className={styles.controlsGrid}>
                <div className={styles.controlItem}>
                  <span className={styles.controlLabel}>Status do Monitor</span>
                  <span
                    className={
                      data.infrastructure.memory.monitoring.monitoringActive
                        ? styles.good
                        : styles.warning
                    }
                  >
                    {data.infrastructure.memory.monitoring.monitoringActive
                      ? "Ativo"
                      : "Inativo"}
                  </span>
                </div>

                <div className={styles.controlItem}>
                  <span className={styles.controlLabel}>
                    Garbage Collection
                  </span>
                  <span
                    className={
                      data.infrastructure.memory.monitoring.gcAvailable
                        ? styles.good
                        : styles.critical
                    }
                  >
                    {data.infrastructure.memory.monitoring.gcAvailable
                      ? "Disponível"
                      : "Não disponível"}
                  </span>
                </div>

                <div className={styles.controlItem}>
                  <span className={styles.controlLabel}>Snapshot Heap</span>
                  <span>
                    {
                      data.infrastructure.memory.monitoring.snapshot
                        .heapPercentage
                    }
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Disk Usage */}
          {data.infrastructure.disk.system && (
            <div className={styles.diskUsage}>
              <h3>Uso de Disco</h3>
              <div className={styles.diskInfo}>
                <div className={styles.diskItem}>
                  <span className={styles.diskLabel}>
                    Sistema ({data.infrastructure.disk.system.path})
                  </span>
                  <div className={styles.diskStats}>
                    {data.infrastructure.disk.system.percentage > 0 && (
                      <span
                        className={getStatusColor(
                          data.infrastructure.disk.system.percentage,
                        )}
                      >
                        {data.infrastructure.disk.system.percentage}%
                      </span>
                    )}
                    <span>
                      {data.infrastructure.disk.system.used} /{" "}
                      {data.infrastructure.disk.system.total}
                    </span>
                    <small>
                      Disponível: {data.infrastructure.disk.system.available}
                    </small>
                  </div>
                </div>
                {data.infrastructure.disk.application && (
                  <div className={styles.diskItem}>
                    <span className={styles.diskLabel}>Aplicação Total</span>
                    <div className={styles.diskStats}>
                      <span>
                        {
                          data.infrastructure.disk.application
                            .totalApplicationSize
                        }
                      </span>
                      {data.infrastructure.disk.application.note && (
                        <small>
                          {data.infrastructure.disk.application.note}
                        </small>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Application Directory Breakdown */}
              {data.infrastructure.disk.application &&
                data.infrastructure.disk.application.directories &&
                data.infrastructure.disk.application.directories.length > 0 && (
                  <div className={styles.appDirectories}>
                    <h4>Detalhamento da Aplicação</h4>
                    <div className={styles.directoryList}>
                      {data.infrastructure.disk.application.directories.map(
                        (dir: any, index: number) => (
                          <div key={index} className={styles.directoryItem}>
                            <span className={styles.directoryName}>
                              {dir.path}
                            </span>
                            <div className={styles.directoryStats}>
                              <span className={styles.directorySize}>
                                {dir.formatted}
                              </span>
                              <span
                                className={`${styles.directoryPriority} ${styles[dir.priority]}`}
                              >
                                {dir.priority}
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </section>

        {/* Banco de Dados */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Banco de Dados</h2>
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <h3>Tempo de Resposta</h3>
              <div className={styles.metricValue}>
                <span
                  className={getStatusColor(
                    data.database.avgResponseTime > 100 ? 80 : 20,
                  )}
                >
                  {data.database.avgResponseTime}ms
                </span>
                <small>Última consulta</small>
              </div>
            </div>

            {data.database.connectionPool && (
              <>
                <div className={styles.metric}>
                  <h3>Conexões Ativas</h3>
                  <div className={styles.metricValue}>
                    <span>{data.database.connectionPool.estimatedActive}</span>
                    <small>
                      de {data.database.connectionPool.maxConnections} total
                    </small>
                  </div>
                </div>

                <div className={styles.metric}>
                  <h3>Pool Usage</h3>
                  <div className={styles.metricValue}>
                    <span
                      className={getStatusColor(
                        (data.database.connectionPool.estimatedActive /
                          data.database.connectionPool.maxConnections) *
                          100,
                      )}
                    >
                      {Math.round(
                        (data.database.connectionPool.estimatedActive /
                          data.database.connectionPool.maxConnections) *
                          100,
                      )}
                      %
                    </span>
                    <small>
                      {data.database.connectionPool.estimatedActive} /{" "}
                      {data.database.connectionPool.maxConnections}
                    </small>
                  </div>
                </div>
              </>
            )}

            {data.database.queryStats && (
              <div className={styles.metric}>
                <h3>Queries Monitoradas</h3>
                <div className={styles.metricValue}>
                  <span>{data.database.queryStats.totalQueries}</span>
                  <small>Avg: {data.database.queryStats.avgQueryTime}ms</small>
                </div>
              </div>
            )}
          </div>

          {data.database.tableStats && (
            <div className={styles.tableStats}>
              <h3>Estatísticas das Tabelas</h3>
              <div className={styles.tableList}>
                <div className={styles.tableItem}>
                  <span>Usuários: {data.database.tableStats.users}</span>
                </div>
                <div className={styles.tableItem}>
                  <span>Produtores: {data.database.tableStats.producers}</span>
                </div>
                <div className={styles.tableItem}>
                  <span>Reviews: {data.database.tableStats.reviews}</span>
                </div>
                <div className={styles.tableItem}>
                  <span>
                    Total: {data.database.tableStats.totalRecords} registros
                  </span>
                </div>
              </div>
            </div>
          )}

          {data.database.slowQueries.length > 0 && (
            <div className={styles.slowQueries}>
              <h3>Operações Mais Lentas (Top 5)</h3>
              <div className={styles.queryList}>
                {data.database.slowQueries.map((query, index) => (
                  <div key={index} className={styles.queryItem}>
                    <div className={styles.queryText}>{query.query}</div>
                    <div className={styles.queryStats}>
                      <span className={styles.queryTime}>
                        {query.avgTime}ms
                      </span>
                      <span className={styles.queryCount}>
                        {new Date(query.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Performance da Aplicação */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Performance da Aplicação</h2>
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <h3>Tempo Médio de Resposta</h3>
              <div className={styles.metricValue}>
                <span
                  className={getStatusColor(
                    data.application.avgResponseTime > 500 ? 80 : 20,
                  )}
                >
                  {data.application.avgResponseTime}ms
                </span>
                <small>Média geral</small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Total de Requests</h3>
              <div className={styles.metricValue}>
                <span>{data.application.totalRequests}</span>
                <small>Desde o início</small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Requests por Minuto</h3>
              <div className={styles.metricValue}>
                <span>{data.application.requestsPerMinute}</span>
                <small>RPM médio</small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Picos de Latência</h3>
              <div className={styles.metricValue}>
                <span className={styles.critical}>
                  {data.application.latencyPeaks.length}
                </span>
                <small>rotas &gt; 1000ms</small>
              </div>
            </div>
          </div>

          {data.application.routePerformance.length > 0 && (
            <div className={styles.routePerformance}>
              <h3>Performance por Rota (Top 10)</h3>
              <div className={styles.routeList}>
                {data.application.routePerformance.map((route, index) => (
                  <div key={index} className={styles.routeItem}>
                    <div className={styles.routeName}>{route.route}</div>
                    <div className={styles.routeStats}>
                      <span className={styles.routeAvg}>
                        Avg: {route.avgTime}ms
                      </span>
                      <span className={styles.routeMax}>
                        Max: {route.maxTime}ms
                      </span>
                      <span className={styles.routeCount}>
                        {route.count} calls
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Erros */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Erros</h2>
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <h3>Erros 4xx</h3>
              <div className={styles.metricValue}>
                <span
                  className={data.errors.errors4xx > 0 ? styles.warning : ""}
                >
                  {data.errors.errors4xx}
                </span>
                <small>Client errors</small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Erros 5xx</h3>
              <div className={styles.metricValue}>
                <span
                  className={data.errors.errors5xx > 0 ? styles.critical : ""}
                >
                  {data.errors.errors5xx}
                </span>
                <small>Server errors</small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Total de Erros</h3>
              <div className={styles.metricValue}>
                <span>{data.errors.totalErrors}</span>
                <small>Todos os tipos</small>
              </div>
            </div>
          </div>

          {data.errors.recentCritical.length > 0 && (
            <div className={styles.recentErrors}>
              <h3>Últimos Erros Críticos</h3>
              <div className={styles.errorList}>
                {data.errors.recentCritical.map((error, index) => (
                  <div key={index} className={styles.errorItem}>
                    <div className={styles.errorMessage}>{error.message}</div>
                    <div className={styles.errorTime}>
                      {new Date(error.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Status do Monitoramento */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Status do Monitoramento</h2>
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <h3>Sistema de Performance</h3>
              <div className={styles.metricValue}>
                <span
                  className={
                    data.monitoring.systemMonitoringActive
                      ? styles.good
                      : styles.critical
                  }
                >
                  {data.monitoring.systemMonitoringActive ? "Ativo" : "Inativo"}
                </span>
                <small>
                  {data.monitoring.performanceMetricsCount} métricas coletadas
                </small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Monitoramento de Rede</h3>
              <div className={styles.metricValue}>
                <span
                  className={
                    data.monitoring.networkMonitoringActive
                      ? styles.good
                      : styles.warning
                  }
                >
                  {data.monitoring.networkMonitoringActive
                    ? "Ativo"
                    : "Inicializando"}
                </span>
                <small>
                  {data.application.totalRequests} requests registrados
                </small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Sistema de Logs</h3>
              <div className={styles.metricValue}>
                <span className={styles.good}>Ativo</span>
                <small>{data.monitoring.logCount} logs armazenados</small>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.footer}>
        <small>
          Última atualização: {new Date(data.timestamp).toLocaleString()} |
          Dados coletados em tempo real do sistema
        </small>
      </div>
    </div>
  );
}
