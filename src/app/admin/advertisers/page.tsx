"use client";

import { useState, useEffect } from "react";
import styles from "./advertisers.module.css";
import { ArrowUpDown, Eye, User } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown/Dropdown";

interface Advertiser {
  id: number;
  userId: number;
  name: string;
  producerName: string;
  email: string;
  gender: "MALE" | "FEMALE" | "TRANS";
  signature: "COPPER" | "SILVER" | "GOLD" | "DIAMOND";
  verificationStatus: "RED" | "YELLOW" | "GREEN";
  phone: string;
  document: string;
  createdAt: string;
  profile: {
    id: number;
    views: number;
    weeklyViews: number;
    contacts: number;
  } | null;
}

type SortKey = "createdAt" | "views" | "name" | "signature" | "status";

const SIGNATURE_LABELS = {
  COPPER: "Cobre",
  SILVER: "Prata",
  GOLD: "Ouro",
  DIAMOND: "Diamante",
} as const;

const GENDER_LABELS = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  TRANS: "Trans",
} as const;

const STATUS_LABELS = {
  RED: "Reprovado",
  YELLOW: "Em Análise",
  GREEN: "Aprovado",
} as const;

const STATUS_COLORS = {
  RED: "#ef4444",
  YELLOW: "#f59e0b",
  GREEN: "#10b981",
} as const;

const PLAN_OPTIONS = [
  { key: "", label: "Todos" },
  { key: "COPPER", label: "Cobre" },
  { key: "SILVER", label: "Prata" },
  { key: "GOLD", label: "Ouro" },
  { key: "DIAMOND", label: "Diamante" },
] as const;

const GENDER_OPTIONS = [
  { key: "", label: "Todos" },
  { key: "MALE", label: "Masculino" },
  { key: "FEMALE", label: "Feminino" },
  { key: "TRANS", label: "Trans" },
] as const;

const STATUS_OPTIONS = [
  { key: "", label: "Todos" },
  { key: "RED", label: "Reprovado" },
  { key: "YELLOW", label: "Em Análise" },
  { key: "GREEN", label: "Aprovado" },
] as const;

export default function AdvertisersPage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [filters, setFilters] = useState({ plan: "", status: "", gender: "" });
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>(
    {
      key: "createdAt",
      direction: "desc",
    },
  );

  const fetchAdvertisers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.plan) params.append("plan", filters.plan);
      if (filters.status) params.append("status", filters.status);
      if (filters.gender) params.append("gender", filters.gender);
      if (debouncedSearchQuery.trim())
        params.append("search", debouncedSearchQuery.trim());

      const response = await fetch(`/api/admin/advertisers?${params}`);
      if (!response.ok) throw new Error("Falha ao carregar anunciantes");

      const data = await response.json();
      setAdvertisers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisers();
  }, [filters, debouncedSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSort = (key: SortKey) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (filterKey: "plan" | "status" | "gender", value: string) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  const getFilterLabel = (filterKey: "plan" | "status" | "gender") => {
    const options = 
      filterKey === "plan" ? PLAN_OPTIONS : 
      filterKey === "status" ? STATUS_OPTIONS : 
      GENDER_OPTIONS;
    return (
      options.find((opt) => opt.key === filters[filterKey])?.label || "Todos"
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const updateAdvertiser = async (
    advertiserId: number,
    data: { signature?: string; verificationStatus?: string },
  ) => {
    try {
      setUpdating(advertiserId);
      const response = await fetch(
        `/api/admin/advertisers?id=${advertiserId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) throw new Error("Falha ao atualizar");

      const updated = await response.json();
      setAdvertisers((prev) =>
        prev.map((adv) => (adv.id === advertiserId ? updated : adv)),
      );
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar");
    } finally {
      setUpdating(null);
    }
  };

  const sortedAdvertisers = [...advertisers].sort((a, b) => {
    const dir = sort.direction === "asc" ? 1 : -1;
    switch (sort.key) {
      case "createdAt":
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          dir
        );
      case "views":
        return ((a.profile?.views || 0) - (b.profile?.views || 0)) * dir;
      case "name":
        return a.name.localeCompare(b.name) * dir;
      case "signature":
        const sigOrder = { COPPER: 1, SILVER: 2, GOLD: 3, DIAMOND: 4 };
        return (sigOrder[a.signature] - sigOrder[b.signature]) * dir;
      case "status":
        const statusOrder = { RED: 1, YELLOW: 2, GREEN: 3 };
        return (
          (statusOrder[a.verificationStatus] -
            statusOrder[b.verificationStatus]) *
          dir
        );
      default:
        return 0;
    }
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.left}>
          <h1 className={styles.title}>Anunciantes</h1>
          <h2 className={styles.subtitle}>
            Gerenciamento de perfis de anunciantes
          </h2>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar por nome real, nome do perfil, email, telefone ou documento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("createdAt")}
                    className={styles.sortButton}
                  >
                    Cadastro
                    <ArrowUpDown
                      size={14}
                      className={
                        sort.key === "createdAt"
                          ? styles.sortActive
                          : styles.sortIcon
                      }
                    />
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("views")}
                    className={styles.sortButton}
                  >
                    Views
                    <ArrowUpDown
                      size={14}
                      className={
                        sort.key === "views"
                          ? styles.sortActive
                          : styles.sortIcon
                      }
                    />
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className={styles.sortButton}
                  >
                    Nome
                    <ArrowUpDown
                      size={14}
                      className={
                        sort.key === "name"
                          ? styles.sortActive
                          : styles.sortIcon
                      }
                    />
                  </button>
                </th>

                <th>
                  <Dropdown
                    trigger={
                      <button className={styles.sortButton}>
                        Gênero
                        <span className={styles.filterIndicator}>
                          {getFilterLabel("gender")}
                        </span>
                      </button>
                    }
                    triggerClassName={styles.dropdownHeaderTrigger}
                    menuClassName={styles.dropdownHeaderMenu}
                  >
                    {(close) => (
                      <div className={styles.filterOptions}>
                        {GENDER_OPTIONS.map((option) => (
                          <button
                            key={option.key}
                            onClick={() => {
                              handleFilterChange("gender", option.key);
                              close();
                            }}
                            className={
                              filters.gender === option.key
                                ? styles.optionActive
                                : ""
                            }
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </Dropdown>
                </th>

                <th>
                  <Dropdown
                    trigger={
                      <button className={styles.sortButton}>
                        Plano
                        <span className={styles.filterIndicator}>
                          {getFilterLabel("plan")}
                        </span>
                      </button>
                    }
                    triggerClassName={styles.dropdownHeaderTrigger}
                    menuClassName={styles.dropdownHeaderMenu}
                  >
                    {(close) => (
                      <div className={styles.filterOptions}>
                        {PLAN_OPTIONS.map((option) => (
                          <button
                            key={option.key}
                            onClick={() => {
                              handleFilterChange("plan", option.key);
                              close();
                            }}
                            className={
                              filters.plan === option.key
                                ? styles.optionActive
                                : ""
                            }
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </Dropdown>
                </th>

                <th>
                  <Dropdown
                    trigger={
                      <button className={styles.sortButton}>
                        Status
                        <span className={styles.filterIndicator}>
                          {getFilterLabel("status")}
                        </span>
                      </button>
                    }
                    triggerClassName={styles.dropdownHeaderTrigger}
                    menuClassName={styles.dropdownHeaderMenu}
                  >
                    {(close) => (
                      <div className={styles.filterOptions}>
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.key}
                            onClick={() => {
                              handleFilterChange("status", option.key);
                              close();
                            }}
                            className={
                              filters.status === option.key
                                ? styles.optionActive
                                : ""
                            }
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </Dropdown>
                </th>

                <th>
                  <span className={styles.sortButton}>Ações</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.loadingCell}>
                    <div className={styles.loadingContent}>
                      <span className={styles.spinner}></span>
                      <span>Carregando anunciantes...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className={styles.errorCell}>
                    <div className={styles.errorContent}>
                      <div className={styles.errorMessage}>Erro: {error}</div>
                      <button
                        onClick={fetchAdvertisers}
                        className={styles.retryButton}
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </td>
                </tr>
              ) : sortedAdvertisers.length > 0 ? (
                sortedAdvertisers.map((advertiser) => (
                  <tr key={advertiser.id}>
                    {updating === advertiser.id ? (
                      <td colSpan={7} className={styles.updatingCell}>
                        <div className={styles.updatingContent}>
                          <span className={styles.spinner}></span>
                          <span>Atualizando...</span>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td>
                          <div className={styles.dateInfo}>
                            {formatDate(advertiser.createdAt)}
                          </div>
                        </td>

                        <td>
                          <div className={styles.viewsInfo}>
                            <div className={styles.totalViews}>
                              {advertiser.profile?.views || 0} total
                            </div>
                            <div className={styles.weeklyViews}>
                              {advertiser.profile?.weeklyViews || 0} esta semana
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className={styles.advertiserInfo}>
                            <div className={styles.advertiserName}>
                              {advertiser.name}
                              {advertiser.producerName && (
                                <span className={styles.profileName}>
                                  ({advertiser.producerName})
                                </span>
                              )}
                            </div>
                            <div className={styles.advertiserEmail}>
                              {advertiser.email}
                            </div>
                            <div className={styles.advertiserDocument}>
                              {advertiser.document}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={`${styles.genderBadge} ${styles[advertiser.gender.toLowerCase()]}`}>
                            {GENDER_LABELS[advertiser.gender]}
                          </span>
                        </td>

                        <td>
                          <Dropdown
                            trigger={
                              <span
                                className={`${styles.signature} ${styles[advertiser.signature.toLowerCase()]}`}
                              >
                                {SIGNATURE_LABELS[advertiser.signature]}
                              </span>
                            }
                            triggerClassName={styles.dropdownTrigger}
                            menuClassName={styles.dropdownMenu}
                          >
                            {(close) => (
                              <div className={styles.editOptions}>
                                {Object.entries(SIGNATURE_LABELS).map(
                                  ([key, label]) => (
                                    <button
                                      key={key}
                                      onClick={() => {
                                        updateAdvertiser(advertiser.id, {
                                          signature: key,
                                        });
                                        close();
                                      }}
                                      className={
                                        advertiser.signature === key
                                          ? styles.optionActive
                                          : ""
                                      }
                                    >
                                      {label}
                                    </button>
                                  ),
                                )}
                              </div>
                            )}
                          </Dropdown>
                        </td>

                        <td>
                          <Dropdown
                            trigger={
                              <span
                                className={styles.status}
                                style={{
                                  color:
                                    STATUS_COLORS[advertiser.verificationStatus],
                                }}
                              >
                                {STATUS_LABELS[advertiser.verificationStatus]}
                              </span>
                            }
                            triggerClassName={styles.dropdownTrigger}
                            menuClassName={styles.dropdownMenu}
                          >
                            {(close) => (
                              <div className={styles.editOptions}>
                                {Object.entries(STATUS_LABELS).map(
                                  ([key, label]) => (
                                    <button
                                      key={key}
                                      onClick={() => {
                                        updateAdvertiser(advertiser.id, {
                                          verificationStatus: key,
                                        });
                                        close();
                                      }}
                                      className={
                                        advertiser.verificationStatus === key
                                          ? styles.optionActive
                                          : ""
                                      }
                                    >
                                      {label}
                                    </button>
                                  ),
                                )}
                              </div>
                            )}
                          </Dropdown>
                        </td>

                        <td>
                          <div className={styles.actions}>
                            <button
                              className={styles.viewBtn}
                              onClick={() =>
                                window.open(
                                  `/product/${advertiser.profile?.id}`,
                                  "_blank",
                                )
                              }
                              disabled={!advertiser.profile}
                              title="Ver perfil"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className={styles.detailBtn}
                              onClick={() => {
                                // TODO: Implementar visão individual
                                alert("Visão individual em desenvolvimento");
                              }}
                              title="Detalhes"
                            >
                              <User size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>
                    <p>Nenhum anunciante encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
