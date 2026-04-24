"use client";

import { useState, useEffect, ReactElement } from "react";
import styles from "./metrics.module.css";
import commonStyles from "../admin-common.module.css";
import {
  Activity,
  AlertTriangle,
  Users,
  Globe,
  Smartphone,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  User,
  LogIn,
  HatGlasses,
  RotateCw,
} from "lucide-react";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import Card from "@/components/ui/Card/Card";

interface MetricsData {
  users: {
    period: "24h" | "7d" | "30d";
    activeUsers: number;
    uniqueUsers: number;
    authenticatedUsers: number;
    uniqueSessions: number;
    newVsReturning: {
      new: number;
      returning: number;
      total: number;
    };
    retention: {
      rate: number;
      retained: number;
      total: number;
    };
    breakdown: {
      authenticated: number;
      anonymous: number;
    };
  };
  devices: {
    deviceTypes: Array<{
      name: string;
      count: number;
      percentage: number;
      breakdown?: Array<{ name: string; count: number; percentage: number }>;
    }>;
    operatingSystems: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    browsers: Array<{ name: string; count: number; percentage: number }>;
    totalPageViews: number;
    totalUniqueUsers: number;
  };
  location: {
    countries: Array<{
      name: string;
      count: number;
      percentage: number;
      cities?: Array<{ name: string; count: number; percentage: number }>;
    }>;
    regions: Array<{ name: string; count: number; percentage: number }>;
    cities: Array<{ name: string; count: number; percentage: number }>;
    languages: Array<{ name: string; count: number; percentage: number }>;
    totalPageViews: number;
    totalUniqueUsers: number;
  };
  navigation: {
    topPages: Array<{
      path: string;
      views: number;
      avgTime: number;
    }>;
    bounceRate: number;
    funnels: Array<any>;
    totalPageViews: number;
    totalSessions: number;
  };
  summary: {
    totalPageViews: number;
    totalSessions: number;
    activeSessions: number;
  };
  timestamp: string;
}

export default function MetricsPage() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"24h" | "7d" | "30d">(
    "24h",
  );
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: "" });
  const [expandedDevices, setExpandedDevices] = useState<Set<number>>(
    new Set(),
  );
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(
    new Set(),
  );

  const fetchData = async (period?: "24h" | "7d" | "30d") => {
    try {
      setLoading(true);
      const periodToUse = period || selectedPeriod;
      const response = await fetch(`/api/admin/metrics?period=${periodToUse}`);
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
  }, [selectedPeriod]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(), 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedPeriod]);

  const refreshMetrics = () => {
    fetchData();
  };

  const handlePeriodChange = (period: "24h" | "7d" | "30d") => {
    setSelectedPeriod(period);
  };

  const handleMouseEnter = (e: React.MouseEvent, content: string) => {
    setTooltip({
      visible: true,
      x: e.pageX + 10,
      y: e.pageY - 10,
      content,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip.visible) {
      setTooltip((prev) => ({
        ...prev,
        x: e.pageX + 10,
        y: e.pageY - 10,
      }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: "" });
  };

  const toggleDeviceExpanded = (deviceIndex: number) => {
    setExpandedDevices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deviceIndex)) {
        newSet.delete(deviceIndex);
      } else {
        newSet.add(deviceIndex);
      }
      return newSet;
    });
  };

  const toggleCountryExpanded = (countryIndex: number) => {
    setExpandedCountries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(countryIndex)) {
        newSet.delete(countryIndex);
      } else {
        newSet.add(countryIndex);
      }
      return newSet;
    });
  };

  // Função para gerar variações de cor
  const generateColorVariations = (baseColor: string, count: number) => {
    const variations = [];
    for (let i = 0; i < count; i++) {
      const hex = baseColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const factor = 0.7 + (i * 0.3) / Math.max(count - 1, 1);
      const newR = Math.round(r * factor);
      const newG = Math.round(g * factor);
      const newB = Math.round(b * factor);

      variations.push(`rgb(${newR}, ${newG}, ${newB})`);
    }
    return variations;
  };

  // Função para renderizar segmentos do gráfico de pizza
  const renderPieSegments = (
    items: Array<{
      name: string;
      count: number;
      percentage: number;
      breakdown?: Array<{ name: string; count: number; percentage: number }>;
    }>,
    baseColors: string[],
    outerRadius: number = 65,
    innerRadius: number = 80,
  ) => {
    const total = items.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;
    const segments: ReactElement[] = [];

    items.forEach((item, itemIndex) => {
      const angle = (item.count / total) * 360;
      const x1 =
        100 + outerRadius * Math.cos(((currentAngle - 90) * Math.PI) / 180);
      const y1 =
        100 + outerRadius * Math.sin(((currentAngle - 90) * Math.PI) / 180);
      const x2 =
        100 +
        outerRadius * Math.cos(((currentAngle + angle - 90) * Math.PI) / 180);
      const y2 =
        100 +
        outerRadius * Math.sin(((currentAngle + angle - 90) * Math.PI) / 180);
      const largeArc = angle > 180 ? 1 : 0;

      const outerPath = `M 100 100 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const baseColor = baseColors[itemIndex % baseColors.length];

      segments.push(
        <path
          key={`outer-${itemIndex}`}
          d={outerPath}
          fill={baseColor}
          stroke="#1f2937"
          strokeWidth="1"
          onMouseEnter={(e) =>
            handleMouseEnter(
              e,
              `
            <div class="${styles.tooltipTitle}">${item.name}</div>
            <div class="${styles.tooltipValue}">${item.count} usuários únicos (${item.percentage}%)</div>
          `,
            )
          }
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />,
      );

      // Anel interno (breakdown)
      if (item.breakdown) {
        const subColors = generateColorVariations(
          baseColor,
          item.breakdown.length,
        );
        let innerCurrentAngle = currentAngle;

        item.breakdown.forEach((subItem, subIndex) => {
          const innerAngle = (subItem.count / total) * 360;
          const ix1 =
            100 +
            innerRadius * Math.cos(((innerCurrentAngle - 90) * Math.PI) / 180);
          const iy1 =
            100 +
            innerRadius * Math.sin(((innerCurrentAngle - 90) * Math.PI) / 180);
          const ix2 =
            100 +
            innerRadius *
              Math.cos(((innerCurrentAngle + innerAngle - 90) * Math.PI) / 180);
          const iy2 =
            100 +
            innerRadius *
              Math.sin(((innerCurrentAngle + innerAngle - 90) * Math.PI) / 180);
          const innerLargeArc = innerAngle > 180 ? 1 : 0;

          const innerPath = `M 100 100 L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${innerLargeArc} 1 ${ix2} ${iy2} Z`;

          segments.push(
            <path
              key={`inner-${itemIndex}-${subIndex}`}
              d={innerPath}
              fill={subColors[subIndex]}
              stroke="#1f2937"
              strokeWidth="1"
              onMouseEnter={(e) =>
                handleMouseEnter(
                  e,
                  `
                <div class="${styles.tooltipTitle}">${item.name} - ${subItem.name}</div>
                <div class="${styles.tooltipValue}">${subItem.count} usuários únicos (${subItem.percentage}%)</div>
                <div style="font-size: var(--ft-xs); opacity: 0.8; margin-top: 4px;">
                  ${Math.round((subItem.count / item.count) * 100)}% do total de ${item.name}
                </div>
              `,
                )
              }
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />,
          );

          innerCurrentAngle += innerAngle;
        });
      }

      currentAngle += angle;
    });

    return segments;
  };

  // Função para renderizar legenda com dropdowns
  const renderLegendWithDropdowns = (
    items: Array<{
      name: string;
      count: number;
      percentage: number;
      breakdown?: Array<{ name: string; count: number; percentage: number }>;
    }>,
    baseColors: string[],
    expandedItems: Set<number>,
    toggleExpanded: (index: number) => void,
  ) => {
    const legendItems: ReactElement[] = [];

    items.forEach((item, itemIndex) => {
      const baseColor = baseColors[itemIndex % baseColors.length];
      const isExpanded = expandedItems.has(itemIndex);
      const hasBreakdown = item.breakdown && item.breakdown.length > 0;

      // Item principal
      legendItems.push(
        <div
          key={`item-${itemIndex}`}
          className={`${styles.legendItem} ${hasBreakdown ? styles.legendDropdown : ""}`}
          onClick={hasBreakdown ? () => toggleExpanded(itemIndex) : undefined}
        >
          <div className={styles.legendItemContent}>
            <div className={styles.legendLeft}>
              {hasBreakdown && (
                <div className={styles.chevronIcon}>
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </div>
              )}
              <div
                className={styles.legendColor}
                style={{ backgroundColor: baseColor }}
              ></div>
              <span className={styles.legendLabel}>{item.name}</span>
            </div>
            <span className={styles.legendValue}>
              {item.count} ({item.percentage}%)
            </span>
          </div>
        </div>,
      );

      // Subitens
      if (item.breakdown && isExpanded) {
        const subColors = generateColorVariations(
          baseColor,
          item.breakdown.length,
        );

        item.breakdown.forEach((subItem, subIndex) => {
          legendItems.push(
            <div
              key={`sub-${itemIndex}-${subIndex}`}
              className={`${styles.legendItem} ${styles.legendSubItem}`}
            >
              <div className={styles.legendItemContent}>
                <div className={styles.legendLeft}>
                  <div
                    className={styles.legendColor}
                    style={{ backgroundColor: subColors[subIndex] }}
                  ></div>
                  <span className={styles.legendLabel}>{subItem.name}</span>
                </div>
                <span className={styles.legendValue}>
                  {subItem.count} ({subItem.percentage}%)
                </span>
              </div>
            </div>,
          );
        });
      }
    });

    return legendItems;
  };

  if (loading) {
    return (
      <div className={commonStyles.container}>
        <div className={commonStyles.loading}>
          <div className={commonStyles.spinner}></div>
          <span>Carregando métricas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={commonStyles.container}>
        <div className={commonStyles.error}>
          <AlertTriangle size={48} />
          <h2>Erro ao carregar métricas</h2>
          <p>{error}</p>
          <button onClick={refreshMetrics} className={commonStyles.retryButton}>
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
          <h1 className={commonStyles.title}>Métricas</h1>
          <p className={commonStyles.subtitle}>Análise de uso da aplicação</p>
        </div>
        <div className={commonStyles.controls}>
          <div className={commonStyles.periodSelector}>
            <div className={commonStyles.periodDropdown}>
              <Dropdown
                trigger={
                  <div className={commonStyles.dropdownTrigger}>
                    {selectedPeriod === "24h" 
                      ? "24h" 
                      : selectedPeriod === "7d" 
                      ? "7 dias" 
                      : "30 dias"}
                  </div>
                }
                containerClassName={commonStyles.dropdownContainer}
                triggerClassName={commonStyles.dropdownTriggerStyle}
                menuClassName={commonStyles.dropdownMenu}
              >
                <button
                  type="button"
                  onClick={() => handlePeriodChange("24h")}
                  className={`${commonStyles.dropdownOption} ${selectedPeriod === "24h" ? commonStyles.dropdownOptionSelected : ""}`}
                >
                  24h
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodChange("7d")}
                  className={`${commonStyles.dropdownOption} ${selectedPeriod === "7d" ? commonStyles.dropdownOptionSelected : ""}`}
                >
                  7 dias
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodChange("30d")}
                  className={`${commonStyles.dropdownOption} ${selectedPeriod === "30d" ? commonStyles.dropdownOptionSelected : ""}`}
                >
                  30 dias
                </button>
              </Dropdown>
            </div>
            <div className={commonStyles.periodButtons}>
              <button
                className={`${commonStyles.periodButton} ${selectedPeriod === "24h" ? commonStyles.periodActive : ""}`}
                onClick={() => handlePeriodChange("24h")}
              >
                24h
              </button>
              <button
                className={`${commonStyles.periodButton} ${selectedPeriod === "7d" ? commonStyles.periodActive : ""}`}
                onClick={() => handlePeriodChange("7d")}
              >
                7 dias
              </button>
              <button
                className={`${commonStyles.periodButton} ${selectedPeriod === "30d" ? commonStyles.periodActive : ""}`}
                onClick={() => handlePeriodChange("30d")}
              >
                30 dias
              </button>
            </div>
          </div>
          <button
            onClick={refreshMetrics}
            className={commonStyles.refreshButton}
            disabled={loading}
          >
            <RotateCw size={16} className={loading ? commonStyles.spinning : ""} />
            <span className={commonStyles.refreshText}>
              {loading ? "Atualizando..." : "Atualizar"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile timestamp */}
      <div className={commonStyles.mobileTimestamp}>
        <small>
          Última atualização: {new Date(data?.timestamp || Date.now()).toLocaleString()}
        </small>
      </div>

      <div className={commonStyles.content}>
        {/* Dados Agora */}
        <div className={commonStyles.summaryGrid}>
          <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
            <div className={commonStyles.cardHeader}>
              <Globe className={commonStyles.cardIcon} />
              <span className={commonStyles.cardLabel}>Visualizações</span>
            </div>
            <div className={commonStyles.cardValue}>
              <span className={commonStyles.primaryValue}>
                {data.summary.totalSessions}
              </span>
              <span className={commonStyles.cardDescription}>
                Sessões únicas registradas
              </span>
            </div>
          </Card>

          <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
            <div className={commonStyles.cardHeader}>
              <TrendingUp className={commonStyles.cardIcon} />
              <span className={commonStyles.cardLabel}>Taxa de Retenção</span>
            </div>
            <div className={commonStyles.cardValue}>
              <span
                className={`${commonStyles.primaryValue} ${
                  data.users.retention.rate > 50 ? commonStyles.good : commonStyles.warning
                }`}
              >
                {data.users.retention.rate}%
              </span>
              <span className={commonStyles.cardDescription}>
                {data.users.retention.retained} de {data.users.retention.total}{" "}
                sessões com engajamento (2min+ ou perfil+contato)
              </span>
            </div>
          </Card>

          <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
            <div className={commonStyles.cardHeader}>
              <TrendingDown className={commonStyles.cardIcon} />
              <span className={commonStyles.cardLabel}>Taxa de Rejeição</span>
            </div>
            <div className={commonStyles.cardValue}>
              <span
                className={`${commonStyles.primaryValue} ${
                  data.navigation.bounceRate < 40
                    ? commonStyles.good
                    : data.navigation.bounceRate < 70
                      ? commonStyles.warning
                      : commonStyles.critical
                }`}
              >
                {data.navigation.bounceRate}%
              </span>
              <span className={commonStyles.cardDescription}>
                Sessões sem engajamento (inverso da retenção)
              </span>
            </div>
          </Card>
        </div>

        {/* Análise de Usuários */}
        <section className={commonStyles.section}>
          <div className={commonStyles.sectionHeader}>
            <div className={commonStyles.sectionTitle}>
              <Users className={commonStyles.sectionIcon} />
              <h3>
                Análise de Usuários
                <span className={styles.periodIndicator}>
                  (
                  {selectedPeriod === "24h"
                    ? "24 horas"
                    : selectedPeriod === "7d"
                      ? "7 dias"
                      : "30 dias"}
                  )
                </span>
              </h3>
            </div>
          </div>

          <div className={commonStyles.summaryGrid}>
            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
              <div className={commonStyles.cardHeader}>
                <Users className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>Sessões Ativas</span>
              </div>
              <div className={commonStyles.cardValue}>
                <span className={commonStyles.primaryValue}>
                  {data.summary.activeSessions}
                </span>
                <span className={commonStyles.cardDescription}>
                  Usuários online agora
                </span>
              </div>
            </Card>

            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
              <div className={commonStyles.cardHeader}>
                <LogIn className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>Usuários Logados</span>
              </div>
              <div className={commonStyles.cardValue}>
                <span
                  className={`${commonStyles.primaryValue} ${commonStyles.authenticated}`}
                >
                  {data.users.breakdown.authenticated}
                </span>
                <span className={commonStyles.cardDescription}>
                  Usuários online com login ativo
                </span>
              </div>
            </Card>

            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
              <div className={commonStyles.cardHeader}>
                <HatGlasses className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>Usuários Anônimos</span>
              </div>
              <div className={commonStyles.cardValue}>
                <span className={`${commonStyles.primaryValue} ${commonStyles.anonymous}`}>
                  {data.users.breakdown.anonymous}
                </span>
                <span className={commonStyles.cardDescription}>
                  Usuários online sem login
                </span>
              </div>
            </Card>
          </div>

          {/* Distribuição de Usuários - Linha Inteira */}
          <div className={commonStyles.fullWidthCard}>
            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
              <div className={commonStyles.cardHeader}>
                <Activity className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>
                  Distribuição de Usuários Ativos
                </span>
              </div>
              <div className={commonStyles.cardValue}>
                {(() => {
                  const totalUsers = data.users.breakdown.authenticated + data.users.breakdown.anonymous;
                  const authenticatedPercentage = totalUsers > 0 ? (data.users.breakdown.authenticated / totalUsers) * 100 : 0;
                  const anonymousPercentage = totalUsers > 0 ? (data.users.breakdown.anonymous / totalUsers) * 100 : 0;
                  
                  // Debug log temporário
                  console.log('BreakdownBar Debug:', {
                    authenticated: data.users.breakdown.authenticated,
                    anonymous: data.users.breakdown.anonymous,
                    totalUsers,
                    authenticatedPercentage,
                    anonymousPercentage
                  });
                  
                  return (
                    <>
                      <div className={styles.breakdownBar}>
                        {totalUsers > 0 ? (
                          <>
                            <div
                              className={styles.authenticatedBar}
                              style={{
                                width: `${authenticatedPercentage}%`,
                              }}
                            ></div>
                            <div
                              className={styles.anonymousBar}
                              style={{
                                width: `${anonymousPercentage}%`,
                              }}
                            ></div>
                          </>
                        ) : (
                          <div className={styles.noDataBar}>
                            Nenhum usuário ativo no momento
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
                <div className={styles.breakdownLegend}>
                  <div className={styles.legendItem}>
                    <div
                      className={styles.legendColor}
                      style={{ backgroundColor: "var(--success-color)" }}
                    ></div>
                    <span>Logados ({data.users.breakdown.authenticated})</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div
                      className={styles.legendColor}
                      style={{ backgroundColor: "var(--warning-color)" }}
                    ></div>
                    <span>Anônimos ({data.users.breakdown.anonymous})</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div
                      className={styles.legendColor}
                      style={{
                        backgroundColor: "var(--light-complementary-color)",
                      }}
                    ></div>
                    <span>Total Ativo ({data.users.breakdown.authenticated + data.users.breakdown.anonymous})</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Novos vs Recorrentes */}
          <div className={commonStyles.summaryGrid}>
            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
              <div className={commonStyles.cardHeader}>
                <User className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>Usuários Únicos</span>
              </div>
              <div className={commonStyles.cardValue}>
                <span className={commonStyles.primaryValue}>
                  {data.users.uniqueUsers}
                </span>
                <span className={commonStyles.cardDescription}>
                  Identificação por fingerprint + IP
                </span>
              </div>
            </Card>

            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
              <div className={commonStyles.cardHeader}>
                <LogIn className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>Usuários Cadastrados</span>
              </div>
              <div className={commonStyles.cardValue}>
                <span className={commonStyles.primaryValue}>
                  {data.users.newVsReturning.returning}
                </span>
                <span className={commonStyles.cardDescription}>
                  {Math.round(
                    (data.users.newVsReturning.returning /
                      data.users.newVsReturning.total) *
                      100,
                  )}
                  % do total
                </span>
              </div>
            </Card>

            <Card className={commonStyles.summaryCard} backgroundColor="var(--dark-complementary-color)">
              <div className={commonStyles.cardHeader}>
                <HatGlasses className={commonStyles.cardIcon} />
                <span className={commonStyles.cardLabel}>Usuários Anônimos</span>
              </div>
              <div className={commonStyles.cardValue}>
                <span className={commonStyles.primaryValue}>
                  {data.users.newVsReturning.new}
                </span>
                <span className={commonStyles.cardDescription}>
                  {Math.round(
                    (data.users.newVsReturning.new /
                      data.users.newVsReturning.total) *
                      100,
                  )}
                  % do total
                </span>
              </div>
            </Card>
          </div>
        </section>

        {/* Análise de Dispositivos e Localização */}
        <div className={commonStyles.cardsGrid}>
          {/* Dispositivos */}
          <section className={commonStyles.section}>
            <div className={commonStyles.sectionHeader}>
              <div className={commonStyles.sectionTitle}>
                <Smartphone className={commonStyles.sectionIcon} />
                <h3>
                  Dispositivos
                  <span className={styles.periodIndicator}>
                    (
                    {selectedPeriod === "24h"
                      ? "24 horas"
                      : selectedPeriod === "7d"
                        ? "7 dias"
                        : "30 dias"}
                    )
                  </span>
                </h3>
              </div>
            </div>

            {data.devices.deviceTypes.length > 0 ? (
              <div className={styles.cardContainer}>
                <div className={styles.chartContainer}>
                  <svg viewBox="0 0 200 200" className={styles.chartSvg}>
                    {renderPieSegments(data.devices.deviceTypes, [
                      "#3b82f6",
                      "#10b981",
                      "#f59e0b",
                    ])}
                  </svg>
                </div>

                <div className={styles.chartLegend}>
                  {renderLegendWithDropdowns(
                    data.devices.deviceTypes,
                    ["#3b82f6", "#10b981", "#f59e0b"],
                    expandedDevices,
                    toggleDeviceExpanded,
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.noData}>
                <p>Nenhum dado de dispositivo disponível ainda.</p>
              </div>
            )}
          </section>

          {/* Localização */}
          <section className={commonStyles.section}>
            <div className={commonStyles.sectionHeader}>
              <div className={commonStyles.sectionTitle}>
                <Globe className={commonStyles.sectionIcon} />
                <h3>
                  Localização
                  <span className={styles.periodIndicator}>
                    (
                    {selectedPeriod === "24h"
                      ? "24 horas"
                      : selectedPeriod === "7d"
                        ? "7 dias"
                        : "30 dias"}
                    )
                  </span>
                </h3>
              </div>
            </div>

            {data.location.countries.length > 0 ? (
              <div className={styles.cardContainer}>
                <div className={styles.chartContainer}>
                  <svg viewBox="0 0 200 200" className={styles.chartSvg}>
                    {renderPieSegments(
                      data.location.countries.slice(0, 5).map((country) => ({
                        ...country,
                        breakdown: country.cities,
                      })),
                      ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
                    )}
                  </svg>
                </div>

                <div className={styles.chartLegend}>
                  {renderLegendWithDropdowns(
                    data.location.countries.slice(0, 5).map((country) => ({
                      ...country,
                      breakdown: country.cities,
                    })),
                    ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
                    expandedCountries,
                    toggleCountryExpanded,
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.noData}>
                <p>
                  Dados de localização serão coletados conforme os usuários
                  acessam o site.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}

      {/* Desktop footer */}
      <div className={commonStyles.footer}>
        <small>
          Última atualização: {new Date(data.timestamp).toLocaleString()} |
          Dados coletados em tempo real da aplicação
        </small>
      </div>
    </div>
  );
}
