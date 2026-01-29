"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

interface DashboardData {
  activeUsers: {
    today: number;
    week: number;
    month: number;
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        <button
          onClick={refreshDashboard}
          className={styles.refreshButton}
          disabled={loading}
        >
          <Activity size={16} className={loading ? styles.spinning : ""} />
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </header>

      <div className={styles.content}>
        {/* Cards principais */}
        <div className={styles.cardsGrid}>
          {/* Usuários ativos */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Users className={styles.cardIcon} />
              <h3>Usuários Ativos</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.metric}>
                <span className={styles.value}>{data.activeUsers.today}</span>
                <span className={styles.label}>Hoje</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.value}>{data.activeUsers.week}</span>
                <span className={styles.label}>Esta semana</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.value}>{data.activeUsers.month}</span>
                <span className={styles.label}>Este mês</span>
              </div>
            </div>
          </div>

          {/* Crescimento */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <TrendingUp className={styles.cardIcon} />
              <h3>Novos Usuários</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.metric}>
                <span
                  className={`${styles.value} ${getGrowthColor(data.growth.week.percentage)}`}
                >
                  {data.growth.week.percentage > 0 ? "+" : ""}
                  {data.growth.week.percentage}%
                </span>
                <span className={styles.label}>
                  crescimento semanal ({data.growth.week.current} novos)
                </span>
              </div>
              <div className={styles.metric}>
                <span
                  className={`${styles.value} ${getGrowthColor(data.growth.month.percentage)}`}
                >
                  {data.growth.month.percentage > 0 ? "+" : ""}
                  {data.growth.month.percentage}%
                </span>
                <span className={styles.label}>
                  crescimento mensal ({data.growth.month.current} novos)
                </span>
              </div>
            </div>
          </div>

          {/* Anunciantes */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <UserCheck className={styles.cardIcon} />
              <h3>Anunciantes</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.metric}>
                <span className={`${styles.value} ${styles.positive}`}>
                  {data.advertisers.active}
                </span>
                <span className={styles.label}>Ativos</span>
              </div>
              <div className={styles.metric}>
                <span className={`${styles.value} ${styles.warning}`}>
                  {data.advertisers.inactive}
                </span>
                <span className={styles.label}>Inativos</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.value}>{data.advertisers.total}</span>
                <span className={styles.label}>Total</span>
              </div>
            </div>
          </div>

          {/* Performance do Sistema */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Server className={styles.cardIcon} />
              <h3>Performance</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.metric}>
                <span
                  className={`${styles.value} ${getPerformanceColor(data.systemPerformance.memory.percentage)}`}
                >
                  {data.systemPerformance.memory.used}MB
                </span>
                <span className={styles.label}>
                  Memória ({data.systemPerformance.memory.percentage}%)
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.value}>
                  {data.systemPerformance.uptime.formatted}
                </span>
                <span className={styles.label}>Uptime</span>
              </div>
              <div className={styles.metric}>
                <span
                  className={`${styles.value} ${getDbStatusColor(data.systemPerformance.database.status)}`}
                >
                  {data.systemPerformance.database.responseTime}ms
                </span>
                <span className={styles.label}>DB Response</span>
              </div>
            </div>
          </div>

          {/* Top Reviews */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Heart className={styles.cardIcon} fill="currentColor" />
              <h3>Top Reviews</h3>
            </div>
            <div className={styles.cardContent}>
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

          {/* Top Views */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Eye className={styles.cardIcon} />
              <h3>Top Views</h3>
            </div>
            <div className={styles.cardContent}>
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

        {/* Gráficos */}
        <div className={styles.chartsGrid}>
          {/* Acessos por dia */}
          <div className={styles.chartCard}>
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
                          stroke="var(--dark-complementary-color)"
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
                        index % Math.ceil(data.dailyAccess.length / 8) === 0 ||
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

          {/* Distribuição de planos */}
          <div className={styles.chartCard}>
            <h3>Distribuição de Planos</h3>
            <div className={styles.planChart}>
              {data.planDistribution.map((plan, index) => (
                <div key={index} className={styles.planItem}>
                  <div
                    className={styles.planColor}
                    style={{
                      backgroundColor:
                        PLAN_COLORS[plan.plan as keyof typeof PLAN_COLORS],
                    }}
                  ></div>
                  <span className={styles.planLabel}>
                    {PLAN_LABELS[plan.plan as keyof typeof PLAN_LABELS]}
                  </span>
                  <span className={styles.planCount}>{plan.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
