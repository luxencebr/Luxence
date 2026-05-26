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
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchDashboardData(), 60000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/dashboard?period=7`);
      if (!response.ok) throw new Error("Falha ao carregar dados");

      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    fetchDashboardData();
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
              <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
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

              <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
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
            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
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

            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
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

            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
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
            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
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

            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
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
            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
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

            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
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

            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
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
