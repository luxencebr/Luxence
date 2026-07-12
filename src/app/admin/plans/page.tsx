"use client";

import { useState, useEffect } from "react";
import styles from "./plans.module.css";
import commonStyles from "../admin-common.module.css";
import Card from "@/components/ui/Card/Card";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  CreditCard,
  Users,
  Camera,
  Video,
  MessageSquare,
  RefreshCw,
  Mic,
  Zap,
  Star,
  RotateCw,
  AlertTriangle,
} from "lucide-react";
import { FaCheck, FaXmark } from "react-icons/fa6";

interface SubscriptionPlan {
  id: number;
  signature: "COPPER" | "SILVER" | "GOLD" | "DIAMOND";
  name: string;
  description: string | null;
  price: number;
  maxPhotos: number;
  maxVideos: number;
  maxProfileUpdates: number;
  hasCommentControl: boolean;
  hasVoiceDemo: boolean;
  priority: string | null;
  hasFeaturedProfile: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    subscriptions: number;
  };
}

const SIGNATURE_LABELS = {
  COPPER: "Cobre",
  SILVER: "Prata",
  GOLD: "Ouro",
  DIAMOND: "Diamante",
} as const;

const SIGNATURE_COLORS = {
  COPPER: "#CD7F32",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  DIAMOND: "#B9F2FF",
} as const;

export default function PlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const response = await fetch(`/api/admin/plans?${params}`);
      if (!response.ok) throw new Error("Falha ao carregar planos");

      const data = await response.json();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchPlans(), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratuito";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const togglePlanStatus = async (planId: number, currentStatus: boolean) => {
    try {
      setUpdating(planId);
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error("Falha ao atualizar status do plano");

      fetchPlans();
    } catch (error) {
      alert(
        `Erro ao atualizar plano: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    } finally {
      setUpdating(null);
    }
  };

  const deletePlan = async (planId: number, planName: string) => {
    if (!confirm(`Deseja realmente excluir o plano "${planName}"?`)) return;

    try {
      setUpdating(planId);
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Falha ao excluir plano");

      fetchPlans();
    } catch (error) {
      alert(
        `Erro ao excluir plano: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    } finally {
      setUpdating(null);
    }
  };

  const refreshPlans = () => {
    fetchPlans();
  };

  if (loading) {
    return (
      <div className={commonStyles.container}>
        <div className={commonStyles.loading}>
          <div className={commonStyles.spinner}></div>
          <span>Carregando planos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={commonStyles.container}>
        <div className={commonStyles.error}>
          <AlertTriangle size={48} />
          <h2>Erro ao carregar planos</h2>
          <p>{error}</p>
          <button
            onClick={refreshPlans}
            className={commonStyles.retryButton}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={commonStyles.container}>
      <header className={commonStyles.header}>
        <div className={commonStyles.headerContent}>
          <h1 className={commonStyles.title}>Planos de Assinatura</h1>
          <p className={commonStyles.subtitle}>
            Gerenciamento de planos disponíveis na plataforma
          </p>
        </div>
        <div className={commonStyles.controls}>
          <button className={styles.createButton} disabled>
            <Plus size={16} />
            <span>Criar Plano</span>
          </button>
          <button
            onClick={refreshPlans}
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

      <div className={commonStyles.content}>
        {/* Barra de Pesquisa */}
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Buscar plano por nome, descrição ou tipo..."
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
        </div>

        {/* Planos */}
        {plans.length > 0 ? (
          <div className={styles.plansContainer}>
            {/* Plano Padrão (Cobre) - Card Horizontal */}
            {plans
              .filter((plan) => plan.signature === "COPPER")
              .map((plan) => (
                <Card
                  key={plan.id}
                  className={`${styles.defaultPlanCard} ${
                    updating === plan.id ? styles.updating : ""
                  }`}
                  backgroundColor="var(--dark-complementary-color)"
                  animated
                >
                  <div className={styles.defaultPlanContent}>
                    <div className={styles.defaultPlanLeft}>
                      {/* Info Principal */}
                      <div className={styles.planInfo}>
                        <h3 className={styles.planName}>{plan.name}</h3>
                        <div className={styles.planPrice}>
                          {formatPrice(plan.price)}
                        </div>
                        {plan.description && (
                          <p className={styles.planDescription}>{plan.description}</p>
                        )}
                      </div>

                      {/* Dates movidas para a esquerda */}
                      <div className={styles.planDates}>
                        <small>Criado: {formatDate(plan.createdAt)}</small>
                        <small>Atualizado: {formatDate(plan.updatedAt)}</small>
                      </div>
                    </div>

                    <div className={styles.defaultPlanRight}>
                      {/* Header com Status e Actions */}
                      <div className={styles.defaultCardHeader}>
                        <button
                          onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                          className={`${styles.statusToggle} ${
                            plan.isActive ? styles.active : styles.inactive
                          }`}
                          disabled={updating === plan.id}
                          title={
                            plan.isActive
                              ? "Clique para desativar"
                              : "Clique para ativar"
                          }
                        >
                          {plan.isActive ? (
                            <>
                              <Check size={14} />
                              Ativo
                            </>
                          ) : (
                            <>
                              <X size={14} />
                              Inativo
                            </>
                          )}
                        </button>

                        <div className={styles.planActions}>
                          <button className={styles.editButton} disabled>
                            <Edit size={16} />
                            Editar
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => deletePlan(plan.id, plan.name)}
                            disabled={plan._count.subscriptions > 0 || updating === plan.id}
                            title={
                              plan._count.subscriptions > 0
                                ? "Não é possível excluir plano com assinantes ativos"
                                : "Excluir plano"
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Benefícios */}
                      <div className={styles.defaultBenefitsSection}>
                        <h4 className={styles.benefitsTitle}>Recursos e Limites</h4>
                        <div className={styles.defaultBenefitsList}>
                          <div className={styles.benefit}>
                            <Camera size={16} />
                            <span>{plan.maxPhotos} fotos</span>
                          </div>
                          <div className={styles.benefit}>
                            <Video size={16} />
                            <span>{plan.maxVideos} vídeos</span>
                          </div>
                          <div className={styles.benefit}>
                            <RefreshCw size={16} />
                            <span>{plan.maxProfileUpdates} atualizações</span>
                          </div>
                          <div className={`${styles.benefit} ${
                            plan.hasCommentControl ? styles.enabled : styles.disabled
                          }`}>
                            {plan.hasCommentControl ? (
                              <FaCheck className={styles.checkIcon} />
                            ) : (
                              <FaXmark className={styles.xmarkIcon} />
                            )}
                            <span>Controle de comentários</span>
                          </div>
                          <div className={`${styles.benefit} ${
                            plan.hasVoiceDemo ? styles.enabled : styles.disabled
                          }`}>
                            {plan.hasVoiceDemo ? (
                              <FaCheck className={styles.checkIcon} />
                            ) : (
                              <FaXmark className={styles.xmarkIcon} />
                            )}
                            <span>Demo de voz</span>
                          </div>
                          <div className={`${styles.benefit} ${
                            plan.hasFeaturedProfile ? styles.enabled : styles.disabled
                          }`}>
                            {plan.hasFeaturedProfile ? (
                              <FaCheck className={styles.checkIcon} />
                            ) : (
                              <FaXmark className={styles.xmarkIcon} />
                            )}
                            <span>Perfil em destaque</span>
                          </div>
                          {plan.priority && (
                            <div className={`${styles.benefit} ${styles.enabled}`}>
                              <Zap size={16} />
                              <span>Prioridade: {plan.priority}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer com Stats apenas */}
                      <div className={styles.defaultPlanFooter}>
                        <div className={styles.planStats}>
                          <div className={styles.stat}>
                            <Users size={16} />
                            <span>
                              {plan._count.subscriptions} assinante
                              {plan._count.subscriptions !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {updating === plan.id && (
                    <div className={styles.updatingOverlay}>
                      <div className={commonStyles.spinner}></div>
                      <span>Atualizando...</span>
                    </div>
                  )}
                </Card>
              ))}

            {/* Outros Planos - Grid 3 Colunas */}
            {plans.filter((plan) => plan.signature !== "COPPER").length > 0 && (
              <>
                <div className={styles.otherPlansHeader}>
                  <h2>Outros Planos</h2>
                  <p>Planos adicionais disponíveis na plataforma</p>
                </div>
                <div className={styles.otherPlansGrid}>
                  {plans
                    .filter((plan) => plan.signature !== "COPPER")
                    .map((plan) => (
                      <Card
                        key={plan.id}
                        className={`${styles.planCard} ${styles.compactPlanCard} ${
                          updating === plan.id ? styles.updating : ""
                        }`}
                        backgroundColor="var(--dark-complementary-color)"
                        animated
                      >
                        <div className={styles.compactPlanContent}>
                          {/* Header com Status e Actions */}
                          <div className={styles.compactCardHeader}>
                            <button
                              onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                              className={`${styles.statusToggle} ${
                                plan.isActive ? styles.active : styles.inactive
                              }`}
                              disabled={updating === plan.id}
                              title={
                                plan.isActive
                                  ? "Clique para desativar"
                                  : "Clique para ativar"
                              }
                            >
                              {plan.isActive ? (
                                <>
                                  <Check size={12} />
                                  Ativo
                                </>
                              ) : (
                                <>
                                  <X size={12} />
                                  Inativo
                                </>
                              )}
                            </button>

                            <div className={styles.compactPlanActions}>
                              <button className={styles.compactEditButton} disabled>
                                <Edit size={16} />
                                Editar
                              </button>
                              <button
                                className={styles.compactDeleteButton}
                                onClick={() => deletePlan(plan.id, plan.name)}
                                disabled={plan._count.subscriptions > 0 || updating === plan.id}
                                title={
                                  plan._count.subscriptions > 0
                                    ? "Não é possível excluir plano com assinantes ativos"
                                    : "Excluir plano"
                                }
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Info Principal */}
                          <div className={styles.compactPlanInfo}>
                            <h3 className={styles.compactPlanName}>{plan.name}</h3>
                            <div className={styles.compactPlanPrice}>
                              {formatPrice(plan.price)}
                            </div>
                            {plan.description && (
                              <p className={styles.compactPlanDescription}>{plan.description}</p>
                            )}
                          </div>

                          {/* Benefícios */}
                          <div className={styles.compactBenefitsSection}>
                            <h4 className={styles.compactBenefitsTitle}>Recursos e Limites</h4>
                            <div className={styles.compactBenefitsList}>
                              <div className={styles.compactBenefit}>
                                <Camera size={16} />
                                <span>{plan.maxPhotos} fotos</span>
                              </div>
                              <div className={styles.compactBenefit}>
                                <Video size={16} />
                                <span>{plan.maxVideos} vídeos</span>
                              </div>
                              <div className={styles.compactBenefit}>
                                <RefreshCw size={16} />
                                <span>{plan.maxProfileUpdates} atualizações</span>
                              </div>
                              <div className={`${styles.compactBenefit} ${
                                plan.hasCommentControl ? styles.enabled : styles.disabled
                              }`}>
                                {plan.hasCommentControl ? (
                                  <FaCheck className={styles.checkIcon} />
                                ) : (
                                  <FaXmark className={styles.xmarkIcon} />
                                )}
                                <span>Controle de comentários</span>
                              </div>
                              <div className={`${styles.compactBenefit} ${
                                plan.hasVoiceDemo ? styles.enabled : styles.disabled
                              }`}>
                                {plan.hasVoiceDemo ? (
                                  <FaCheck className={styles.checkIcon} />
                                ) : (
                                  <FaXmark className={styles.xmarkIcon} />
                                )}
                                <span>Demo de voz</span>
                              </div>
                              <div className={`${styles.compactBenefit} ${
                                plan.hasFeaturedProfile ? styles.enabled : styles.disabled
                              }`}>
                                {plan.hasFeaturedProfile ? (
                                  <FaCheck className={styles.checkIcon} />
                                ) : (
                                  <FaXmark className={styles.xmarkIcon} />
                                )}
                                <span>Perfil em destaque</span>
                              </div>
                              {plan.priority && (
                                <div className={`${styles.compactBenefit} ${styles.enabled}`}>
                                  <Zap size={16} />
                                  <span>Prioridade: {plan.priority}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer Compacto */}
                          <div className={styles.compactPlanFooter}>
                            <div className={styles.compactPlanStats}>
                              <div className={styles.stat}>
                                <Users size={16} />
                                <span>
                                  {plan._count.subscriptions} assinante
                                  {plan._count.subscriptions !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={styles.planDates}>
                            <small>Criado: {formatDate(plan.createdAt)}</small>
                            <small>Atualizado: {formatDate(plan.updatedAt)}</small>
                          </div>
                        </div>

                        {updating === plan.id && (
                          <div className={styles.updatingOverlay}>
                            <div className={commonStyles.spinner}></div>
                            <span>Atualizando...</span>
                          </div>
                        )}
                      </Card>
                    ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={styles.emptyContainer}>
            <CreditCard size={48} className={styles.emptyIcon} />
            <h3>Nenhum plano encontrado</h3>
            <p>
              {searchQuery
                ? `Nenhum plano encontrado para "${searchQuery}"`
                : "Não há planos cadastrados no sistema."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}