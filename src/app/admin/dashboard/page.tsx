"use client";

import { useState, useEffect, ReactElement } from "react";
import styles from "./dashboard.module.css";
import commonStyles from "../admin-common.module.css";
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
  RotateCw,
} from "lucide-react";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import Card from "@/components/ui/Card/Card";

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
  const [cardLoading, setCardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardPeriod, setCardPeriod] = useState("7");
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchDashboardData(), 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, cardPeriod]);

  const fetchDashboardData = async (period?: string) => {
    try {
      const isCardUpdate = !!period;
      if (isCardUpdate) {
        setCardLoading(true);
      } else {
        setLoading(true);
      }

      const periodParam = period || cardPeriod;
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
      setCardLoading(false);
    }
  };

  const refreshDashboard = () => {
    fetchDashboardData(); // Atualiza tudo com o período atual
  };

  const handlePeriodChange = (period: string) => {
    if (period === cardPeriod) return;
    setCardPeriod(period);
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
      <div className={commonStyles.container}>
        <div className={commonStyles.loading}>
          <div className={commonStyles.spinner}></div>
          <span>Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={commonStyles.container}>
        <div className={commonStyles.error}>
          <AlertTriangle size={48} />
          <h2>Erro ao carregar dashboard</h2>
          <p>{error}</p>
          <button
            onClick={refreshDashboard}
            className={commonStyles.retryButton}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={commonStyles.container}>
      <header className={commonStyles.header}>
        <div className={commonStyles.headerContent}>
          <h1 className={commonStyles.title}>Dashboard</h1>
          <p className={commonStyles.subtitle}>Visão geral do sistema</p>
        </div>
        <div className={commonStyles.controls}>
          <button
            onClick={refreshDashboard}
            className={commonStyles.refreshButton}
            disabled={loading}
          >
            <RotateCw
              size={16}
              className={loading ? commonStyles.spinning : ""}
            />
            <span className={commonStyles.refreshText}>
              {loading ? "Atualizando..." : "Atualizar"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile timestamp */}
      <div className={commonStyles.mobileTimestamp}>
        <small>Última atualização: {new Date().toLocaleString()}</small>
      </div>

      <div className={commonStyles.content}>
        {/* Resumo Geral */}

        {/* Seção Usuários */}
        <section className={commonStyles.section}>
          <div className={commonStyles.sectionHeader}>
            <div className={commonStyles.sectionTitle}>
              <Users className={commonStyles.sectionIcon} />
              <h3>Usuários</h3>
            </div>
          </div>

          <div className={commonStyles.summaryGrid}>
            <div className={commonStyles.summaryGrid}>
              <Card className={commonStyles.summaryCard}>
                <div className={commonStyles.cardHeader}>
                  <Globe className={commonStyles.cardIcon} />
                  <span className={commonStyles.cardLabel}>Visualizações</span>
                </div>
                <div className={commonStyles.cardValue}>
                  <span className={commonStyles.primaryValue}>
                    {data.platform.totalSessions}
                  </span>
                  <span className={commonStyles.cardDescription}>
                    Sessões registradas
                  </span>
                </div>
              </Card>

              <Card className={commonStyles.summaryCard}>
                <div className={commonStyles.cardHeader}>
                  <Activity className={commonStyles.cardIcon} />
                  <span className={commonStyles.cardLabel}>
                    Usuários Online
                  </span>
                </div>
                <div className={commonStyles.cardValue}>
                  <span className={commonStyles.primaryValue}>
                    {data.activeUsers.now}
                  </span>
                  <span className={commonStyles.cardDescription}>
                    Usuários ativos agora
                  </span>
                </div>
              </Card>
            </div>

            <Card className={commonStyles.summaryCard}>
              <div className={styles.cardHeader}>
                <h3>Acessos por Período</h3>
                <div className={styles.cardPeriodSelector}>
                  <div className={styles.cardPeriodDropdown}>
                    <Dropdown
                      trigger={
                        <div className={commonStyles.dropdownTrigger}>
                          {cardPeriod === "7"
                            ? "7 dias"
                            : cardPeriod === "30"
                              ? "30 dias"
                              : "1 ano"}
                        </div>
                      }
                      containerClassName={commonStyles.dropdownContainer}
                      triggerClassName={commonStyles.dropdownTriggerStyle}
                      menuClassName={commonStyles.dropdownMenu}
                    >
                      <button
                        type="button"
                        onClick={() => handlePeriodChange("7")}
                        className={`${commonStyles.dropdownOption} ${cardPeriod === "7" ? commonStyles.dropdownOptionSelected : ""}`}
                      >
                        7 dias
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePeriodChange("30")}
                        className={`${commonStyles.dropdownOption} ${cardPeriod === "30" ? commonStyles.dropdownOptionSelected : ""}`}
                      >
                        30 dias
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePeriodChange("365")}
                        className={`${commonStyles.dropdownOption} ${cardPeriod === "365" ? commonStyles.dropdownOptionSelected : ""}`}
                      >
                        1 ano
                      </button>
                    </Dropdown>
                  </div>
                  <div className={styles.cardPeriodButtons}>
                    <button
                      className={`${commonStyles.periodButton} ${cardPeriod === "7" ? commonStyles.periodActive : ""}`}
                      onClick={() => handlePeriodChange("7")}
                    >
                      7 dias
                    </button>
                    <button
                      className={`${commonStyles.periodButton} ${cardPeriod === "30" ? commonStyles.periodActive : ""}`}
                      onClick={() => handlePeriodChange("30")}
                    >
                      30 dias
                    </button>
                    <button
                      className={`${commonStyles.periodButton} ${cardPeriod === "365" ? commonStyles.periodActive : ""}`}
                      onClick={() => handlePeriodChange("365")}
                    >
                      1 ano
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.chartContainer}>
                {cardLoading ? (
                  <div className={styles.chartLoading}>
                    <div className={commonStyles.spinner}></div>
                    <span>Carregando dados...</span>
                  </div>
                ) : (
                  <>
                    <svg className={styles.chartSvg} viewBox="0 0 400 240">
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

                      {/* Chart content */}
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
                            {/* Data points with hover effects */}
                            {data.dailyAccess.map((day, index) => {
                              const x = 25 + index * stepX;
                              const y = 180 - (day.views / maxViews) * 140;
                              return (
                                <g
                                  key={`point-${index}`}
                                  className={styles.chartPointGroup}
                                >
                                  {/* Extended hover area (covers entire vertical line) */}
                                  <rect
                                    x={x - 15}
                                    y={40}
                                    width="30"
                                    height="200"
                                    fill="transparent"
                                    className={styles.chartHoverArea}
                                  />

                                  {/* Vertical dashed line (highlighted on hover) */}
                                  <line
                                    x1={x}
                                    y1={40}
                                    x2={x}
                                    y2={180}
                                    stroke="var(--dark-complementary-color)"
                                    strokeWidth="1"
                                    strokeDasharray="4,4"
                                    className={styles.chartVerticalLine}
                                  />

                                  {/* Actual data point */}
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="var(--primary-color)"
                                    stroke="var(--dark-color)"
                                    strokeWidth="2"
                                    className={styles.chartPoint}
                                  />

                                  {/* Value label (always visible) */}
                                  <text
                                    x={x}
                                    y={y - 15}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fill="var(--primary-color)"
                                    fontWeight="600"
                                    className={styles.chartPointValue}
                                  >
                                    {day.views}
                                  </text>

                                  {/* Date/Month label below the chart */}
                                  <text
                                    x={x}
                                    y={200}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="var(--light-complementary-color)"
                                    fontWeight="500"
                                    className={styles.chartDateLabel}
                                  >
                                    {day.label}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Chart line */}
                            <polyline
                              fill="none"
                              stroke="var(--primary-color)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                            />
                          </>
                        );
                      })()}
                    </svg>
                  </>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* Seção Anunciantes */}
        <section className={commonStyles.section}>
          <div className={commonStyles.sectionHeader}>
            <div className={commonStyles.sectionTitle}>
              <UserCheck className={commonStyles.sectionIcon} />
              <h3>Anunciantes</h3>
            </div>
          </div>

          <div className={commonStyles.summaryGrid}>
            <Card className={commonStyles.summaryCard}>
              <div className={commonStyles.cardHeader}>
                <Users className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>
                  Total de Anunciantes
                </span>
              </div>
              <div className={commonStyles.cardValue}>
                <span className={commonStyles.primaryValue}>
                  {data.advertisers.total}
                </span>
                <span className={commonStyles.cardDescription}>
                  Todos os anunciantes cadastrados
                </span>
              </div>
            </Card>

            <Card className={commonStyles.summaryCard}>
              <div className={commonStyles.cardHeader}>
                <UserCheck className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>
                  Anunciantes Ativos
                </span>
              </div>
              <div className={commonStyles.cardValue}>
                <span
                  className={`${commonStyles.primaryValue} ${commonStyles.good}`}
                >
                  {data.advertisers.active}
                </span>
                <span className={commonStyles.cardDescription}>
                  Verificados e operando
                </span>
              </div>
            </Card>

            <Card className={commonStyles.summaryCard}>
              <div className={commonStyles.cardHeader}>
                <AlertTriangle className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>
                  Anunciantes Inativos
                </span>
              </div>
              <div className={commonStyles.cardValue}>
                <span
                  className={`${commonStyles.primaryValue} ${commonStyles.warning}`}
                >
                  {data.advertisers.inactive}
                </span>
                <span className={commonStyles.cardDescription}>
                  Pendentes ou com problemas
                </span>
              </div>
            </Card>
          </div>

          {/* Top Performers */}
          <div className={commonStyles.cardsGrid}>
            <Card className={commonStyles.summaryCard}>
              <div className={commonStyles.cardHeader}>
                <Heart className={commonStyles.cardIcon} fill="currentColor" />
                <span className={commonStyles.cardLabel}>Top Reviews</span>
              </div>
              <div className={commonStyles.cardValue}>
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
            </Card>

            <Card className={commonStyles.summaryCard}>
              <div className={commonStyles.cardHeader}>
                <Eye className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>Top Views</span>
              </div>
              <div className={commonStyles.cardValue}>
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
            </Card>
          </div>
        </section>

        {/* Seção Plataforma */}
        <section className={commonStyles.section}>
          <div className={commonStyles.sectionHeader}>
            <div className={commonStyles.sectionTitle}>
              <Server className={commonStyles.sectionIcon} />
              <h3>Plataforma</h3>
            </div>
          </div>

          <div className={commonStyles.summaryGrid}>
            <Card className={commonStyles.summaryCard}>
              <div className={commonStyles.cardHeader}>
                <Activity className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>
                  Uptime do Sistema
                </span>
              </div>
              <div className={commonStyles.cardValue}>
                <span className={commonStyles.primaryValue}>
                  {data.systemPerformance.uptime.formatted}
                </span>
                <span className={commonStyles.cardDescription}>
                  Tempo online ininterrupto
                </span>
              </div>
            </Card>

            <Card className={commonStyles.summaryCard}>
              <div className={commonStyles.cardHeader}>
                <Server className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>
                  Memória do Sistema
                </span>
              </div>
              <div className={commonStyles.cardValue}>
                <span
                  className={`${commonStyles.primaryValue} ${getPerformanceColor(data.systemPerformance.memory.percentage)}`}
                >
                  {data.systemPerformance.memory.used}MB
                </span>
                <span className={commonStyles.cardDescription}>
                  {data.systemPerformance.memory.percentage}% em uso
                </span>
              </div>
            </Card>

            <Card className={commonStyles.summaryCard}>
              <div className={commonStyles.cardHeader}>
                <Globe className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>
                  Resposta do Banco
                </span>
              </div>
              <div className={commonStyles.cardValue}>
                <span
                  className={`${commonStyles.primaryValue} ${getDbStatusColor(data.systemPerformance.database.status)}`}
                >
                  {data.systemPerformance.database.responseTime}ms
                </span>
                <span className={commonStyles.cardDescription}>
                  Status:{" "}
                  {data.systemPerformance.database.status === "connected"
                    ? "Conectado"
                    : "Erro"}
                </span>
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* Desktop footer */}
      <div className={commonStyles.footer}>
        <small>
          Última atualização: {new Date().toLocaleString()} | Dados coletados em
          tempo real da aplicação
        </small>
      </div>
    </div>
  );
}
