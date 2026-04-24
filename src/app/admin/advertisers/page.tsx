"use client";

import { useState, useEffect } from "react";
import styles from "./advertisers.module.css";
import commonStyles from "../admin-common.module.css";
import {
  Eye,
  User,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  ArrowUpAZ,
  Calendar,
} from "lucide-react";
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

const PLAN_OPTIONS = [
  { key: "", label: "Todos os Planos" },
  { key: "COPPER", label: "Plano Cobre" },
  { key: "SILVER", label: "Plano Prata" },
  { key: "GOLD", label: "Plano Ouro" },
  { key: "DIAMOND", label: "Plano Diamante" },
] as const;

const GENDER_OPTIONS = [
  { key: "", label: "Todos os Gêneros" },
  { key: "MALE", label: "Gênero Masculino" },
  { key: "FEMALE", label: "Gênero Feminino" },
  { key: "TRANS", label: "Gênero Trans" },
] as const;

const STATUS_OPTIONS = [
  { key: "", label: "Todos os Status" },
  { key: "RED", label: "Status Reprovado" },
  { key: "YELLOW", label: "Status Em Análise" },
  { key: "GREEN", label: "Status Aprovado" },
] as const;

const SORT_OPTIONS = [
  { key: "createdAt", label: "Cadastro", icon: Calendar },
  { key: "views", label: "Visualizações", icon: Eye },
  { key: "name", label: "Alfabético", icon: ArrowUpAZ },
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
    setSort((prev) => {
      if (prev.key === key) {
        // Se é a mesma chave, alterna a direção
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      } else {
        // Nova chave: cadastro e views começam decrescente, alfabético crescente
        const defaultDirection = key === "createdAt" || key === "views" ? "desc" : "asc";
        return {
          key,
          direction: defaultDirection,
        };
      }
    });
  };

  const handleFilterChange = (
    filterKey: "plan" | "status" | "gender",
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  const getFilterLabel = (filterKey: "plan" | "status" | "gender") => {
    const options =
      filterKey === "plan"
        ? PLAN_OPTIONS
        : filterKey === "status"
          ? STATUS_OPTIONS
          : GENDER_OPTIONS;
    return (
      options.find((opt) => opt.key === filters[filterKey])?.label ||
      (filterKey === "plan"
        ? "Todos os Planos"
        : filterKey === "status"
          ? "Todos os Status"
          : "Todos os Gêneros")
    );
  };

  const getSortLabel = () => {
    const option = SORT_OPTIONS.find((opt) => opt.key === sort.key);
    return option?.label || "Data de Cadastro";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPhone = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, "");

    // Se não tem pelo menos 10 dígitos, retorna como está
    if (cleanPhone.length < 10) {
      return phone;
    }

    // Formato para celular (11 dígitos): (XX) XXXXX-XXXX
    if (cleanPhone.length === 11) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
    }

    // Formato para telefone fixo (10 dígitos): (XX) XXXX-XXXX
    if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
    }

    // Se tem mais de 11 dígitos, pega apenas os primeiros 11
    if (cleanPhone.length > 11) {
      const truncated = cleanPhone.slice(0, 11);
      return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;
    }

    return phone;
  };

  const updateAdvertiser = async (
    advertiserId: number,
    data: { signature?: string; verificationStatus?: string },
  ) => {
    try {
      setUpdating(advertiserId);

      // Se está alterando a signature, usar o sistema de assinaturas
      if (data.signature) {
        const advertiser = advertisers.find((adv) => adv.id === advertiserId);
        if (!advertiser) {
          throw new Error("Anunciante não encontrado");
        }

        // Criar nova assinatura através da API de admin
        const subscriptionResponse = await fetch("/api/admin/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: advertiser.userId,
            planSignature: data.signature,
            action: "create_by_signature",
            durationMonths: 1, // Padrão de 1 mês
          }),
        });

        if (!subscriptionResponse.ok) {
          const errorData = await subscriptionResponse.json();
          throw new Error(errorData.error || "Falha ao criar assinatura");
        }

        // Atualizar o estado local
        setAdvertisers((prev) =>
          prev.map((adv) =>
            adv.id === advertiserId
              ? { ...adv, signature: data.signature as any }
              : adv,
          ),
        );
      } else {
        // Para outras atualizações (como verificationStatus), usar a API original
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
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert(
        `Erro ao atualizar: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
    } finally {
      setUpdating(null);
    }
  };

  const sendWhatsAppMessage = async (
    advertiserId: number,
    phone: string,
    producerName: string,
  ) => {
    try {
      const response = await fetch(
        `/api/admin/advertisers/profile-check?producerId=${advertiserId}`,
      );

      if (!response.ok) throw new Error("Falha ao verificar perfil");

      const data = await response.json();

      if (data.missing.length === 0) {
        alert("Perfil está completo! Não há pendências.");
        return;
      }

      // Dicas específicas para cada campo
      const fieldTips: Record<string, string> = {
        "Nome do perfil":
          "Preencha o nome artístico/profissional que aparecerá no seu perfil público. O campo para alteração fica logo abaixo das imagens do perfil, basta clicar sobre ele para editar.",
        "Idade do perfil":
          "Informe sua idade (entre 18 e 99 anos) no campo específico do perfil. O campo para alteração fica logo ao lado no Nome.",
        "Ao menos 1 imagem":
          "Adicione pelo menos uma foto ao seu perfil na seção de Imagens.",
        "Ao menos 1 preço e forma de pagamento":
          "Cadastre seus valores e selecione as formas de pagamento aceitas.",
        "Idiomas falados":
          "Selecione os idiomas que você fala na seção de Idiomas.",
        "Público que atende":
          "Indique qual público você atende na seção de Público.",
        "Ao menos 1 contato":
          "Na parte inferior da tela, você encontrará os ícones do WhatsApp, Telegram e Instagram. Ao clicar em cada um deles, é possível preencher o respectivo campo com suas informações.",
      };

      // Gerar mensagem
      const firstName = producerName.split(" ")[0];
      let message = `Olá, ${firstName}!\n\n`;
      message += `Percebemos que você está com algumas pendências no seu perfil. Gostaríamos de ajudá-la(o) a completar o cadastro!\n\n`;
      message += `Segue um breve passo a passo dos campos que ainda precisam ser preenchidos:\n\n`;

      data.missing.forEach((item: string, index: number) => {
        const tip = fieldTips[item] || "Preencha este campo no seu perfil.";
        message += `*${index + 1}. ${item}*\n${tip}\n\n`;
      });

      message += `Caso ainda tenha dúvidas, ficamos à disposição para ajudar!\n\n`;
      message += `A Luxence agradece sua confiança e preferência.`;

      // Formatar telefone para WhatsApp (remover caracteres especiais)
      const cleanPhone = phone.replace(/\D/g, "");

      // Abrir WhatsApp Web - usar encodeURI para preservar emojis
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURI(message)}`;
      window.open(whatsappUrl, "_blank");
    } catch (error) {
      console.error("Erro ao gerar mensagem:", error);
      alert("Erro ao gerar mensagem do WhatsApp");
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
    <div className={commonStyles.container}>
      <header className={commonStyles.header}>
        <div className={commonStyles.headerContent}>
          <h1 className={commonStyles.title}>Anunciantes</h1>
          <p className={commonStyles.subtitle}>
            Gerenciamento de perfis de anunciantes
          </p>
        </div>
      </header>

      <div className={commonStyles.content}>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Buscar anunciante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={styles.clearButton}
                title="Limpar busca"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className={styles.mobileSortDropdown}>
            <Dropdown
              trigger={
                <>
                  <div className={styles.sortArrows}>
                    <ChevronUp
                      size={10}
                      className={
                        sort.direction === "asc"
                          ? styles.sortArrowActive
                          : styles.sortArrow
                      }
                    />
                    <ChevronDown
                      size={10}
                      className={
                        sort.direction === "desc"
                          ? styles.sortArrowActive
                          : styles.sortArrow
                      }
                    />
                  </div>
                  <span>{getSortLabel()}</span>
                </>
              }
              triggerClassName={styles.sortDropdownTrigger}
              menuClassName={styles.sortDropdownMenu}
            >
              {(close) => (
                <div className={styles.sortOptions}>
                  {SORT_OPTIONS.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.key}
                        onClick={() => {
                          handleSort(option.key);
                          close();
                        }}
                        className={
                          sort.key === option.key ? styles.optionActive : ""
                        }
                      >
                        <IconComponent size={16} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </Dropdown>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("createdAt")}
                    className={styles.headerSortButton}
                  >
                    <span className={styles.headerText}>Data</span>
                    <div className={styles.sortArrows}>
                      <ChevronUp
                        size={10}
                        className={
                          sort.key === "createdAt" && sort.direction === "asc"
                            ? styles.sortArrowActive
                            : styles.sortArrow
                        }
                      />
                      <ChevronDown
                        size={10}
                        className={
                          sort.key === "createdAt" && sort.direction === "desc"
                            ? styles.sortArrowActive
                            : styles.sortArrow
                        }
                      />
                    </div>
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("views")}
                    className={styles.headerSortButton}
                  >
                    <span className={styles.headerText}>Views</span>
                    <div className={styles.sortArrows}>
                      <ChevronUp
                        size={10}
                        className={
                          sort.key === "views" && sort.direction === "asc"
                            ? styles.sortArrowActive
                            : styles.sortArrow
                        }
                      />
                      <ChevronDown
                        size={10}
                        className={
                          sort.key === "views" && sort.direction === "desc"
                            ? styles.sortArrowActive
                            : styles.sortArrow
                        }
                      />
                    </div>
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className={styles.headerSortButton}
                  >
                    <span className={styles.headerText}>Anunciante</span>
                    <div className={styles.sortArrows}>
                      <ChevronUp
                        size={10}
                        className={
                          sort.key === "name" && sort.direction === "asc"
                            ? styles.sortArrowActive
                            : styles.sortArrow
                        }
                      />
                      <ChevronDown
                        size={10}
                        className={
                          sort.key === "name" && sort.direction === "desc"
                            ? styles.sortArrowActive
                            : styles.sortArrow
                        }
                      />
                    </div>
                  </button>
                </th>

                <th>
                  <Dropdown
                    trigger={
                      <div className={styles.headerDropdownTrigger}>
                        {getFilterLabel("gender")}
                      </div>
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
                      <div className={styles.headerDropdownTrigger}>
                        {getFilterLabel("plan")}
                      </div>
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
                      <div className={styles.headerDropdownTrigger}>
                        {getFilterLabel("status")}
                      </div>
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
                  <span className={styles.headerText}>Ações Disponíveis</span>
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
                              {advertiser.profile?.views || 0} totais
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
                            <div className={styles.advertiserPhone}>
                              {formatPhone(advertiser.phone)}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`${styles.genderDisplay} ${styles[advertiser.gender.toLowerCase()]}`}
                          >
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
                                className={`${styles.status} ${styles[advertiser.verificationStatus.toLowerCase()]}`}
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
                              className={styles.whatsappBtn}
                              onClick={() =>
                                sendWhatsAppMessage(
                                  advertiser.id,
                                  advertiser.phone,
                                  advertiser.name,
                                )
                              }
                              title="Enviar mensagem WhatsApp"
                            >
                              <MessageCircle size={16} />
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

        {/* Mobile Cards List */}
        <div className={styles.mobileCardsList}>
          {loading ? (
            <div className={styles.mobileLoading}>
              <span className={styles.spinner}></span>
              <span>Carregando anunciantes...</span>
            </div>
          ) : error ? (
            <div className={styles.mobileError}>
              <div className={styles.errorMessage}>Erro: {error}</div>
              <button onClick={fetchAdvertisers} className={styles.retryButton}>
                Tentar novamente
              </button>
            </div>
          ) : sortedAdvertisers.length > 0 ? (
            sortedAdvertisers.map((advertiser) => (
              <div
                key={advertiser.id}
                className={styles.mobileCard}
                onClick={() => {
                  // TODO: Implementar visão individual (equivalente ao botão desabilitado)
                  alert("Visão individual em desenvolvimento");
                }}
              >
                <div className={styles.cardContent}>
                  <button
                    className={styles.cardViewBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `/product/${advertiser.profile?.id}`,
                        "_blank",
                      );
                    }}
                    disabled={!advertiser.profile}
                    title="Ver perfil"
                  >
                    <Eye size={16} />
                    <span>Ver perfil</span>
                  </button>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardName}>
                      {advertiser.name}
                      {advertiser.producerName && (
                        <span className={styles.cardProfileName}>
                          ({advertiser.producerName})
                        </span>
                      )}
                    </div>
                    <div className={styles.cardEmail}>{advertiser.email}</div>
                    <div className={styles.cardPhone}>
                      {formatPhone(advertiser.phone)}
                    </div>
                  </div>

                  <ChevronRight className={styles.cardChevron} size={20} />
                </div>
              </div>
            ))
          ) : (
            <div className={styles.mobileEmpty}>
              <p>Nenhum anunciante encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
