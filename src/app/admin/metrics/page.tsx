"use client";

import React, { useState, useEffect } from "react";
import styles from "./metrics.module.css";

interface MetricsData {
  users: {
    activeUsers: number;
    uniqueUsers: {
      today: number;
      week: number;
      month: number;
    };
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
  };
  devices: {
    deviceTypes: Array<{ name: string; count: number; percentage: number }>;
    operatingSystems: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    browsers: Array<{ name: string; count: number; percentage: number }>;
    totalPageViews: number;
  };
  navigation: {
    topPages: Array<{ path: string; views: number; avgTime: number }>;
    bounceRate: number;
    funnels: Array<{
      name: string;
      steps: Array<{ path: string; users: number; conversionRate: number }>;
    }>;
    totalPageViews: number;
    totalSessions: number;
  };
  location: {
    countries: Array<{ name: string; count: number; percentage: number }>;
    regions: Array<{ name: string; count: number; percentage: number }>;
    cities: Array<{ name: string; count: number; percentage: number }>;
    languages: Array<{ name: string; count: number; percentage: number }>;
    totalPageViews: number;
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

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/metrics");
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

    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando métricas...</div>
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
        <h1 className={styles.title}>Métricas da Aplicação</h1>
        <div className={styles.controls}>
          <label className={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (1min)
          </label>
          <button onClick={fetchData} className={styles.refreshButton}>
            Atualizar
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Summary */}
        <section className={styles.summarySection}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <h3>Sessões Ativas</h3>
              <div className={styles.summaryValue}>
                {data.summary.activeSessions}
              </div>
              <small>Usuários online agora</small>
            </div>
            <div className={styles.summaryCard}>
              <h3>Total de Sessões</h3>
              <div className={styles.summaryValue}>
                {data.summary.totalSessions}
              </div>
              <small>Desde o início</small>
            </div>
            <div className={styles.summaryCard}>
              <h3>Visualizações</h3>
              <div className={styles.summaryValue}>
                {data.summary.totalPageViews}
              </div>
              <small>Total de page views</small>
            </div>
          </div>
        </section>

        {/* Usuários */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Usuários</h2>
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <h3>Usuários Únicos Hoje</h3>
              <div className={styles.metricValue}>
                <span>{data.users.uniqueUsers.today}</span>
                <small>Únicos nas últimas 24h</small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Usuários Únicos (Semana)</h3>
              <div className={styles.metricValue}>
                <span>{data.users.uniqueUsers.week}</span>
                <small>Últimos 7 dias</small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Usuários Únicos (Mês)</h3>
              <div className={styles.metricValue}>
                <span>{data.users.uniqueUsers.month}</span>
                <small>Últimos 30 dias</small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Taxa de Retenção</h3>
              <div className={styles.metricValue}>
                <span
                  className={
                    data.users.retention.rate > 50
                      ? styles.good
                      : styles.warning
                  }
                >
                  {data.users.retention.rate}%
                </span>
                <small>
                  {data.users.retention.retained} de{" "}
                  {data.users.retention.total} usuários
                </small>
              </div>
            </div>
          </div>

          {data.users.newVsReturning.total > 0 && (
            <div className={styles.userTypes}>
              <h3>Novos vs Recorrentes (Hoje)</h3>
              <div className={styles.userTypeGrid}>
                <div className={styles.userTypeCard}>
                  <div className={styles.userTypeLabel}>Novos Usuários</div>
                  <div className={styles.userTypeValue}>
                    {data.users.newVsReturning.new}
                  </div>
                  <div className={styles.userTypePercentage}>
                    {Math.round(
                      (data.users.newVsReturning.new /
                        data.users.newVsReturning.total) *
                        100,
                    )}
                    %
                  </div>
                </div>
                <div className={styles.userTypeCard}>
                  <div className={styles.userTypeLabel}>
                    Usuários Recorrentes
                  </div>
                  <div className={styles.userTypeValue}>
                    {data.users.newVsReturning.returning}
                  </div>
                  <div className={styles.userTypePercentage}>
                    {Math.round(
                      (data.users.newVsReturning.returning /
                        data.users.newVsReturning.total) *
                        100,
                    )}
                    %
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Dispositivos */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dispositivos</h2>

          {data.devices.deviceTypes.length > 0 && (
            <div className={styles.deviceSection}>
              <h3>Tipos de Dispositivo</h3>
              <div className={styles.deviceGrid}>
                {data.devices.deviceTypes.map((device, index) => (
                  <div key={index} className={styles.deviceCard}>
                    <div className={styles.deviceName}>{device.name}</div>
                    <div className={styles.deviceValue}>{device.count}</div>
                    <div className={styles.devicePercentage}>
                      {device.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.devices.operatingSystems.length > 0 && (
            <div className={styles.deviceSection}>
              <h3>Sistemas Operacionais</h3>
              <div className={styles.deviceList}>
                {data.devices.operatingSystems.slice(0, 5).map((os, index) => (
                  <div key={index} className={styles.deviceItem}>
                    <span className={styles.deviceItemName}>{os.name}</span>
                    <div className={styles.deviceItemStats}>
                      <span className={styles.deviceItemCount}>{os.count}</span>
                      <span className={styles.deviceItemPercentage}>
                        {os.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.devices.browsers.length > 0 && (
            <div className={styles.deviceSection}>
              <h3>Navegadores</h3>
              <div className={styles.deviceList}>
                {data.devices.browsers.slice(0, 5).map((browser, index) => (
                  <div key={index} className={styles.deviceItem}>
                    <span className={styles.deviceItemName}>
                      {browser.name}
                    </span>
                    <div className={styles.deviceItemStats}>
                      <span className={styles.deviceItemCount}>
                        {browser.count}
                      </span>
                      <span className={styles.deviceItemPercentage}>
                        {browser.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.devices.deviceTypes.length === 0 &&
            data.devices.operatingSystems.length === 0 &&
            data.devices.browsers.length === 0 && (
              <div className={styles.deviceSection}>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    textAlign: "center",
                    padding: "var(--space-lg)",
                  }}
                >
                  Nenhum dado de dispositivo disponível ainda.
                </p>
              </div>
            )}
        </section>

        {/* Navegação */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Navegação</h2>

          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <h3>Taxa de Rejeição</h3>
              <div className={styles.metricValue}>
                <span
                  className={
                    data.navigation.bounceRate > 70
                      ? styles.warning
                      : styles.good
                  }
                >
                  {data.navigation.bounceRate}%
                </span>
                <small>Sessões com 1 página apenas</small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Total de Sessões</h3>
              <div className={styles.metricValue}>
                <span>{data.navigation.totalSessions}</span>
                <small>Últimos 7 dias</small>
              </div>
            </div>

            <div className={styles.metric}>
              <h3>Visualizações</h3>
              <div className={styles.metricValue}>
                <span>{data.navigation.totalPageViews}</span>
                <small>Últimos 7 dias</small>
              </div>
            </div>
          </div>

          {data.navigation.topPages.length > 0 && (
            <div className={styles.topPages}>
              <h3>Páginas Mais Acessadas</h3>
              <div className={styles.pageList}>
                {data.navigation.topPages.map((page, index) => (
                  <div key={index} className={styles.pageItem}>
                    <div className={styles.pagePath}>{page.path}</div>
                    <div className={styles.pageStats}>
                      <span className={styles.pageViews}>
                        {page.views} views
                      </span>
                      {page.avgTime > 0 && (
                        <span className={styles.pageTime}>
                          {page.avgTime}s avg
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.navigation.funnels.some((funnel) =>
            funnel.steps.some((step) => step.users > 0),
          ) && (
            <div className={styles.funnels}>
              <h3>Funis de Navegação</h3>
              {data.navigation.funnels
                .filter((funnel) => funnel.steps.some((step) => step.users > 0))
                .map((funnel, index) => (
                  <div key={index} className={styles.funnel}>
                    <h4 className={styles.funnelName}>{funnel.name}</h4>
                    <div className={styles.funnelSteps}>
                      {funnel.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className={styles.funnelStep}>
                          <div className={styles.stepPath}>{step.path}</div>
                          <div className={styles.stepStats}>
                            <span className={styles.stepUsers}>
                              {step.users} usuários
                            </span>
                            <span className={styles.stepConversion}>
                              {step.conversionRate}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {data.navigation.topPages.length === 0 &&
            !data.navigation.funnels.some((funnel) =>
              funnel.steps.some((step) => step.users > 0),
            ) && (
              <div className={styles.topPages}>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    textAlign: "center",
                    padding: "var(--space-lg)",
                  }}
                >
                  Dados de navegação serão exibidos conforme os usuários navegam
                  pelo site.
                </p>
              </div>
            )}
        </section>

        {/* Localização */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Localização</h2>

          {data.location.countries.length > 0 && (
            <div className={styles.locationSection}>
              <h3>Países</h3>
              <div className={styles.locationList}>
                {data.location.countries.slice(0, 5).map((country, index) => (
                  <div key={index} className={styles.locationItem}>
                    <span className={styles.locationName}>{country.name}</span>
                    <div className={styles.locationStats}>
                      <span className={styles.locationCount}>
                        {country.count}
                      </span>
                      <span className={styles.locationPercentage}>
                        {country.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.location.regions.length > 0 && (
            <div className={styles.locationSection}>
              <h3>Estados/Regiões</h3>
              <div className={styles.locationList}>
                {data.location.regions.slice(0, 5).map((region, index) => (
                  <div key={index} className={styles.locationItem}>
                    <span className={styles.locationName}>{region.name}</span>
                    <div className={styles.locationStats}>
                      <span className={styles.locationCount}>
                        {region.count}
                      </span>
                      <span className={styles.locationPercentage}>
                        {region.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.location.cities.length > 0 && (
            <div className={styles.locationSection}>
              <h3>Cidades</h3>
              <div className={styles.locationList}>
                {data.location.cities.slice(0, 5).map((city, index) => (
                  <div key={index} className={styles.locationItem}>
                    <span className={styles.locationName}>{city.name}</span>
                    <div className={styles.locationStats}>
                      <span className={styles.locationCount}>{city.count}</span>
                      <span className={styles.locationPercentage}>
                        {city.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.location.languages.length > 0 && (
            <div className={styles.locationSection}>
              <h3>Idiomas</h3>
              <div className={styles.locationList}>
                {data.location.languages.slice(0, 5).map((language, index) => (
                  <div key={index} className={styles.locationItem}>
                    <span className={styles.locationName}>{language.name}</span>
                    <div className={styles.locationStats}>
                      <span className={styles.locationCount}>
                        {language.count}
                      </span>
                      <span className={styles.locationPercentage}>
                        {language.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.location.countries.length === 0 &&
            data.location.regions.length === 0 &&
            data.location.cities.length === 0 &&
            data.location.languages.length === 0 && (
              <div className={styles.locationSection}>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    textAlign: "center",
                    padding: "var(--space-lg)",
                  }}
                >
                  Dados de localização serão coletados conforme os usuários
                  acessam o site.
                </p>
              </div>
            )}
        </section>
      </div>

      <div className={styles.footer}>
        <small>
          Última atualização: {new Date(data.timestamp).toLocaleString()} |
          Dados coletados em tempo real da aplicação
        </small>
      </div>
    </div>
  );
}
