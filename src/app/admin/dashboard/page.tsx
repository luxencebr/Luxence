"use client";

import { useState, useEffect, ReactElement } from "react";
import styles from "./dashboard.module.css";
import {
  Users,
  TrendingUp,
  UserCheck,
  Activity,
  AlertTriangle,
  Eye,
  Heart,
  Server,
  Globe,
  LogIn,
  HatGlasses,
  User,
  Smartphone,
} from "lucide-react";

// Esta página é dinâmica e não precisa de generateStaticParams
export const dynamic = "force-dynamic";

interface DashboardData {
  activeUsers: {
    today: number;
    week: number;
    month: number;
    now: number; // Usuários online agora
    authenticated: number; // Usuários logados
    anonymous: number; // Usuários anônimos
  };
  growth: {
    week: {
      percentage: number;
      current: number;
      previous: number;
    };
    month: {
      percentage: number;
      current: number;
      previous: number;
    };
  };
  advertisers: {
    active: number;
    inactive: number;
    total: number;
    verified: number;
    pending: number;
  };
  platform: {
    totalSessions: number;
    totalPageViews: number;
    bounceRate: number;
    avgSessionTime: number;
  };
  planDistribution: Array<{
    plan: string;
    count: number;
  }>;
  dailyAccess: Array<{
    date: string;
    views: number;
    label: string;
  }>;
  systemPerformance: {
    memory: {
      used: number;
      percentage: number;
    };
    uptime: {
      formatted: string;
    };
    database: {
      status: string;
      responseTime: number;
    };
  };
  topReviews: Array<{
    name: string;
    producerName: string;
    avgRating: number;
    approvedReviews: number;
  }>;
  topViews: Array<{
    name: string;
    producerName: string;
    views: number;
  }>;
}

const PLAN_LABELS = {
  COPPER: "Cobre",
  SILVER: "Prata",
  GOLD: "Ouro",
  DIAMOND: "Diamante",
} as const;

const PLAN_COLORS = {
  COPPER: "#cd7f32",
  SILVER: "#c0c0c0",
  GOLD: "#ffd700",
  DIAMOND: "#b9f2ff",
} as const;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState("7");
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchDashboardData(), 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, chartPeriod]);

  const fetchDashboardData = async (period?: string) => {
    try {
      const isChartUpdate = !!period;
      if (isChartUpdate) {
        setChartLoading(true);
      } else {
        setLoading(true);
      }

      const periodParam = period || chartPeriod;
      const response = await fetch(
        `/api/admin/dashboard?period=${periodParam}`,
      );
      if (!response.ok) throw new Error("Falha ao carregar dados");

      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  };

  const refreshDashboard = () => {
    fetchDashboardData(); // Atualiza tudo com o período atual
  };

  const handlePeriodChange = (period: string) => {
    if (period === chartPeriod) return;
    setChartPeriod(period);
    fetchDashboardData(period);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return styles.positive;
    if (growth < 0) return styles.negative;
    return styles.neutral;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage < 70) return styles.positive;
    if (percentage < 85) return styles.warning;
    return styles.negative;
  };

  const getDbStatusColor = (status: string) => {
    if (status === "connected") return styles.positive;
    return styles.negative;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertTriangle size={48} />
          <h2>Erro ao carregar dashboard</h2>
          <p>{error}</p>
          <button onClick={refreshDashboard} className={styles.retryButton}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Visão geral do sistema</p>
        </div>
        <div className={styles.controls}>
          <label className={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (1min)
          </label>
          <button
            onClick={refreshDashboard}
            className={styles.refreshButton}
            disabled={loading}
          >
            <Activity size={16} className={loading ? styles.spinning : ""} />
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {/* Resumo Geral */}

        {/* Seção Usuários */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <Users className={styles.sectionIcon} />
              <h3>Usuários</h3>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <Globe className={styles.cardIcon} />
                  <span className={styles.cardLabel}>Visualizações</span>
                </div>
                <div className={styles.cardValue}>
                  <span className={styles.primaryValue}>
                    {data.platform.totalSessions}
                  </span>
                  <span className={styles.cardDescription}>
                    Sessões registradas
                  </span>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <Activity className={styles.cardIcon} />
                  <span className={styles.cardLabel}>Usuários Online</span>
                </div>
                <div className={styles.cardValue}>
                  <span className={styles.primaryValue}>
                    {data.activeUsers.now}
                  </span>
                  <span className={styles.cardDescription}>
                    Usuários ativos agora
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.chartHeader}>
                <h3>Acessos por Período</h3>
                <div className={styles.periodButtons}>
                  <button
                    className={`${styles.periodButton} ${chartPeriod === "7" ? styles.periodActive : ""}`}
                    onClick={() => handlePeriodChange("7")}
                  >
                    7 dias
                  </button>
                  <button
                    className={`${styles.periodButton} ${chartPeriod === "30" ? styles.periodActive : ""}`}
                    onClick={() => handlePeriodChange("30")}
                  >
                    30 dias
                  </button>
                  <button
                    className={`${styles.periodButton} ${chartPeriod === "365" ? styles.periodActive : ""}`}
                    onClick={() => handlePeriodChange("365")}
                  >
                    1 ano
                  </button>
                </div>
              </div>
              <div className={styles.lineChart}>
                {chartLoading ? (
                  <div className={styles.chartLoading}>
                    <div className={styles.spinner}></div>
                    <span>Carregando dados...</span>
                  </div>
                ) : (
                  <>
                    <svg className={styles.chartSvg} viewBox="0 0 400 200">
                      {/* Grid lines */}
                      <defs>
                        <pattern
                          id="grid"
                          width="40"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 40 0 L 0 0 0 20"
                            fill="none"
                            stroke="var(--dark-color)"
                            strokeWidth="0.5"
                            opacity="0.3"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Chart line */}
                      {(() => {
                        if (!data.dailyAccess.length) return null;

                        const maxViews = Math.max(
                          ...data.dailyAccess.map((d) => d.views),
                          1,
                        );
                        const stepX =
                          350 / Math.max(data.dailyAccess.length - 1, 1);

                        const points = data.dailyAccess
                          .map((day, index) => {
                            const x = 25 + index * stepX;
                            const y = 180 - (day.views / maxViews) * 140;
                            return `${x},${y}`;
                          })
                          .join(" ");

                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke="var(--primary-color)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                            />
                            {/* Data points */}
                            {data.dailyAccess.map((day, index) => {
                              const x = 25 + index * stepX;
                              const y = 180 - (day.views / maxViews) * 140;
                              return (
                                <g key={index}>
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="var(--primary-color)"
                                    stroke="var(--dark-color)"
                                    strokeWidth="2"
                                  />
                                  <text
                                    x={x}
                                    y={y - 10}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fill="var(--primary-color)"
                                    fontWeight="600"
                                  >
                                    {day.views}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>

                    {/* X-axis labels */}
                    <div className={styles.chartLabels}>
                      {data.dailyAccess.map((day, index) => {
                        // Mostrar apenas algumas labels para evitar sobreposição
                        const showLabel =
                          data.dailyAccess.length <= 10 ||
                          index % Math.ceil(data.dailyAccess.length / 8) ===
                            0 ||
                          index === data.dailyAccess.length - 1;

                        return (
                          <span
                            key={index}
                            className={styles.chartLabel}
                            style={{
                              opacity: showLabel ? 1 : 0,
                              flex: `0 0 ${100 / data.dailyAccess.length}%`,
                            }}
                          >
                            {day.label}
                          </span>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Seção Anunciantes */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <UserCheck className={styles.sectionIcon} />
              <h3>Anunciantes</h3>
            </div>
          </div>

          <div className={styles.userMetricsGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <Users className={styles.cardIcon} />
                <span className={styles.cardLabel}>Total de Anunciantes</span>
              </div>
              <div className={styles.cardValue}>
                <span className={styles.primaryValue}>
                  {data.advertisers.total}
                </span>
                <span className={styles.cardDescription}>
                  Todos os anunciantes cadastrados
                </span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <UserCheck className={styles.cardIcon} />
                <span className={styles.cardLabel}>Anunciantes Ativos</span>
              </div>
              <div className={styles.cardValue}>
                <span className={`${styles.primaryValue} ${styles.positive}`}>
                  {data.advertisers.active}
                </span>
                <span className={styles.cardDescription}>
                  Verificados e operando
                </span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <AlertTriangle className={styles.cardIcon} />
                <span className={styles.cardLabel}>Anunciantes Inativos</span>
              </div>
              <div className={styles.cardValue}>
                <span className={`${styles.primaryValue} ${styles.warning}`}>
                  {data.advertisers.inactive}
                </span>
                <span className={styles.cardDescription}>
                  Pendentes ou com problemas
                </span>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className={styles.chartsGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <Heart className={styles.cardIcon} fill="currentColor" />
                <span className={styles.cardLabel}>Top Reviews</span>
              </div>
              <div className={styles.cardValue}>
                <div className={styles.topPerformers}>
                  {data.topReviews.slice(0, 3).map((performer, index) => (
                    <div key={index} className={styles.performerItem}>
                      <div className={styles.performerRank}>#{index + 1}</div>
                      <div className={styles.performerInfo}>
                        <span className={styles.performerName}>
                          {performer.name}
                        </span>
                        <span className={styles.performerProducerName}>
                          ({performer.producerName})
                        </span>
                      </div>
                      <div className={styles.performerStats}>
                        <div className={styles.performerRating}>
                          {performer.avgRating.toFixed(1)}
                        </div>
                        <div className={styles.performerCount}>
                          {performer.approvedReviews} reviews
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <Eye className={styles.cardIcon} />
                <span className={styles.cardLabel}>Top Views</span>
              </div>
              <div className={styles.cardValue}>
                <div className={styles.topPerformers}>
                  {data.topViews.slice(0, 3).map((performer, index) => (
                    <div key={index} className={styles.performerItem}>
                      <div className={styles.performerRank}>#{index + 1}</div>
                      <div className={styles.performerInfo}>
                        <span className={styles.performerName}>
                          {performer.name}
                        </span>
                        <span className={styles.performerProducerName}>
                          ({performer.producerName})
                        </span>
                      </div>
                      <div className={styles.performerViews}>
                        {performer.views.toLocaleString()} views
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Plataforma */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <Server className={styles.sectionIcon} />
              <h3>Plataforma</h3>
            </div>
          </div>

          <div className={styles.userMetricsGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <Activity className={styles.cardIcon} />
                <span className={styles.cardLabel}>Uptime do Sistema</span>
              </div>
              <div className={styles.cardValue}>
                <span className={styles.primaryValue}>
                  {data.systemPerformance.uptime.formatted}
                </span>
                <span className={styles.cardDescription}>
                  Tempo online ininterrupto
                </span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <Server className={styles.cardIcon} />
                <span className={styles.cardLabel}>Memória do Sistema</span>
              </div>
              <div className={styles.cardValue}>
                <span
                  className={`${styles.primaryValue} ${getPerformanceColor(data.systemPerformance.memory.percentage)}`}
                >
                  {data.systemPerformance.memory.used}MB
                </span>
                <span className={styles.cardDescription}>
                  {data.systemPerformance.memory.percentage}% em uso
                </span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <Globe className={styles.cardIcon} />
                <span className={styles.cardLabel}>Resposta do Banco</span>
              </div>
              <div className={styles.cardValue}>
                <span
                  className={`${styles.primaryValue} ${getDbStatusColor(data.systemPerformance.database.status)}`}
                >
                  {data.systemPerformance.database.responseTime}ms
                </span>
                <span className={styles.cardDescription}>
                  Status:{" "}
                  {data.systemPerformance.database.status === "connected"
                    ? "Conectado"
                    : "Erro"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.footer}>
        <small>
          Última atualização: {new Date().toLocaleString()} | Dados coletados em
          tempo real da aplicação
        </small>
      </div>
    </div>
  );
}
