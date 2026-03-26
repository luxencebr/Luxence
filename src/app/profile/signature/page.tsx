"use client";

import { useState, useEffect, memo } from "react";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card/Card";
import { SIGNATURE_LABELS, type Signature } from "@/utils/signatureLimits";
import { FaCheck, FaXmark } from "react-icons/fa6";
import {
  Camera,
  Video,
  MessageSquare,
  RefreshCw,
  Mic,
  Zap,
  Star,
  Calendar,
  Clock,
  TrendingUp,
  ArrowUp,
  Crown,
} from "lucide-react";
import LoadingContainer from "@/components/ui/LoadingContainer/LoadingContainer";
import styles from "./signature.module.css";

interface BenefitBase {
  id: number;
  name: string;
  type: "number" | "string" | "boolean";
}

interface Plan {
  id: Signature;
  title: string;
  price: string;
  description: string;
  popular?: boolean;
  benefits: Record<number, number | string | boolean>;
}

interface SubscriptionInfo {
  signature: string;
  status: string;
  limits: {
    maxPhotos: number;
    maxVideos: number;
    maxProfileUpdates: number;
    hasCommentControl: boolean;
    hasVoiceDemo: boolean;
    priority: string;
    hasFeaturedProfile: boolean;
  };
  usage: {
    photosUsed: number;
    videosUsed: number;
    profileUpdatesUsed: number;
  };
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isExpired: boolean;
  canUpload: {
    photos: boolean;
    videos: boolean;
  };
  canUpdateProfile: boolean;
}

const benefitList: BenefitBase[] = [
  { id: 1, name: "Fotos no Perfil", type: "number" },
  { id: 2, name: "Vídeos no Perfil", type: "number" },
  { id: 3, name: "Controle de Comentários", type: "boolean" },
  { id: 4, name: "Atualizações de Perfil", type: "number" },
  { id: 5, name: "Demonstração de Voz", type: "boolean" },
  { id: 6, name: "Prioridade", type: "string" },
  { id: 7, name: "Perfil em Destaque", type: "boolean" },
];

const BENEFIT_ICONS = {
  1: Camera,
  2: Video,
  3: MessageSquare,
  4: RefreshCw,
  5: Mic,
  6: Zap,
  7: Star,
} as const;

const plans: Plan[] = [
  {
    id: "COPPER",
    title: "Cobre",
    price: "Gratuito",
    description: "",
    benefits: {
      1: 3, // Fotos
      2: 0, // Vídeos
      3: false, // Controle comentários
      4: 2, // Atualizações perfil
      5: false, // Voz
      6: "", // Prioridade
      7: false, // Destaque
    },
  },
  {
    id: "SILVER",
    title: "Prata",
    price: "R$ 29,90/mês",
    description: "Ideal para quem está começando.",
    benefits: {
      1: 5, // Fotos
      2: 1, // Vídeos
      3: true, // Controle comentários
      4: 5, // Atualizações perfil
      5: false, // Voz
      6: "", // Prioridade
      7: false, // Destaque
    },
  },
  {
    id: "GOLD",
    title: "Ouro",
    price: "R$ 49,90/mês",
    description: "Perfeito para quem quer crescer.",
    popular: true,
    benefits: {
      1: 10,
      2: 2,
      3: true,
      4: 10,
      5: true,
      6: "Alta",
      7: false,
    },
  },
  {
    id: "DIAMOND",
    title: "Diamante",
    price: "R$ 79,90/mês",
    description: "O melhor para quem quer se destacar.",
    benefits: {
      1: 20,
      2: 5,
      3: true,
      4: Infinity,
      5: true,
      6: "Máxima",
      7: true,
    },
  },
];

const isActiveBenefit = (
  benefit: BenefitBase,
  value: number | string | boolean,
): boolean => {
  if (benefit.type === "number") return typeof value === "number" && value > 0;
  if (benefit.type === "string")
    return typeof value === "string" && value !== "";
  return Boolean(value);
};

const renderBenefitValue = (
  benefit: BenefitBase,
  value: number | string | boolean,
) => {
  if (benefit.type === "number") {
    const numValue = value as number;
    if (numValue === Infinity)
      return {
        icon: <FaCheck className={styles.checkIcon} />,
        text: "Ilimitados",
      };
    if (numValue === 0)
      return { icon: <FaXmark className={styles.xmarkIcon} />, text: "" };
    return { icon: null, text: numValue.toString() };
  }

  if (benefit.type === "string") {
    const strValue = value as string;
    return strValue && strValue !== ""
      ? { icon: <FaCheck className={styles.checkIcon} />, text: strValue }
      : { icon: <FaXmark className={styles.xmarkIcon} />, text: "" };
  }

  const boolValue = value as boolean;
  return boolValue
    ? { icon: <FaCheck className={styles.checkIcon} />, text: "" }
    : { icon: <FaXmark className={styles.xmarkIcon} />, text: "" };
};

const SignaturePage = memo(function SignaturePage() {
  const { data: session } = useSession();
  const [currentSignature, setCurrentSignature] = useState<Signature>("COPPER");
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSignatureData = async () => {
      setIsLoading(true);
      try {
        const [signatureResponse, subscriptionResponse] = await Promise.all([
          fetch("/api/profile/signature"),
          fetch("/api/subscriptions"),
        ]);

        if (signatureResponse.ok) {
          const signatureData = await signatureResponse.json();
          setCurrentSignature(signatureData.signature || "COPPER");
        }

        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json();
          setSubscriptionInfo(subscriptionData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados da assinatura:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchSignatureData();
    }
  }, [session]);

  const handleUpgrade = (planId: Signature) => {
    // Aqui você implementaria a lógica de upgrade/pagamento
    alert(
      `Funcionalidade de upgrade para ${SIGNATURE_LABELS[planId]} será implementada em breve!`,
    );
  };

  const scrollToPlans = () => {
    const plansSection = document.getElementById("plans-section");
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getUsagePercentage = (used: number, max: number) => {
    if (max === -1) return 0; // Ilimitado
    return Math.min((used / max) * 100, 100);
  };

  const getStatusColor = () => {
    if (!subscriptionInfo) return "var(--success-color)";
    if (subscriptionInfo.isExpired) return "var(--error-color)";
    if (subscriptionInfo.daysRemaining <= 7) return "var(--warning-color)";
    return "var(--success-color)";
  };

  if (isLoading) {
    return <LoadingContainer message="Carregando dados da assinatura..." />;
  }

  const currentPlan = plans.find((p) => p.id === currentSignature);
  const isFreePlan = currentSignature === "COPPER";

  // Filtrar planos para mostrar apenas os superiores ao atual
  const planOrder = ["COPPER", "SILVER", "GOLD", "DIAMOND"];
  const currentPlanIndex = planOrder.indexOf(currentSignature);
  const availablePlans = plans.filter((plan) => {
    const planIndex = planOrder.indexOf(plan.id);
    return planIndex > currentPlanIndex;
  });

  return (
    <div className={styles.container}>
      <div className={styles.currentPlan}>
        <Card size="large" backgroundColor="var(--dark-complementary-color)">
          <div className={styles.currentPlanContent}>
            <div className={styles.currentPlanHeader}>
              <div className={styles.currentPlanInfo}>
                <h3 className={styles.currentPlanTitle}>Plano Atual</h3>
                <div className={styles.currentPlanDetails}>
                  <span className={styles.planName}>
                    {currentPlan?.title || "Cobre"}
                  </span>
                  <span className={styles.planPrice}>
                    {currentPlan?.price || "Gratuito"}
                  </span>
                </div>
                {currentPlan?.description && (
                  <p className={styles.planDescription}>
                    {currentPlan.description}
                  </p>
                )}
              </div>

              <div className={styles.subscriptionInfo}>
                {isFreePlan ? (
                  <button
                    className={styles.upgradeButton}
                    onClick={scrollToPlans}
                  >
                    <ArrowUp size={16} />
                    Fazer Upgrade
                  </button>
                ) : (
                  subscriptionInfo && (
                    <div className={styles.dateInfo}>
                      <div className={styles.dateItem}>
                        <Calendar size={16} />
                        <span>
                          Início: {formatDate(subscriptionInfo.startDate)}
                        </span>
                      </div>
                      <div className={styles.dateItem}>
                        <Calendar size={16} />
                        <span>Fim: {formatDate(subscriptionInfo.endDate)}</span>
                      </div>
                      <div className={styles.dateItem}>
                        <Clock size={16} />
                        <span style={{ color: getStatusColor() }}>
                          {subscriptionInfo.isExpired
                            ? "Expirada"
                            : `${subscriptionInfo.daysRemaining} dias restantes`}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {subscriptionInfo && (
              <>
                <div className={styles.usageSection}>
                  <h4 className={styles.sectionTitle}>
                    <TrendingUp size={20} />
                    Uso dos Recursos
                  </h4>

                  <div className={styles.usageGrid}>
                    <div className={styles.usageItem}>
                      <div className={styles.usageHeader}>
                        <span>Fotos</span>
                        <span>
                          {subscriptionInfo.usage.photosUsed} /{" "}
                          {subscriptionInfo.limits.maxPhotos === -1
                            ? "∞"
                            : subscriptionInfo.limits.maxPhotos}
                        </span>
                      </div>
                      {subscriptionInfo.limits.maxPhotos !== -1 && (
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${getUsagePercentage(
                                subscriptionInfo.usage.photosUsed,
                                subscriptionInfo.limits.maxPhotos,
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {subscriptionInfo.limits.maxVideos > 0 && (
                      <div className={styles.usageItem}>
                        <div className={styles.usageHeader}>
                          <span>Vídeos</span>
                          <span>
                            {subscriptionInfo.usage.videosUsed} /{" "}
                            {subscriptionInfo.limits.maxVideos === -1
                              ? "∞"
                              : subscriptionInfo.limits.maxVideos}
                          </span>
                        </div>
                        {subscriptionInfo.limits.maxVideos !== -1 && (
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{
                                width: `${getUsagePercentage(
                                  subscriptionInfo.usage.videosUsed,
                                  subscriptionInfo.limits.maxVideos,
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div className={styles.usageItem}>
                      <div className={styles.usageHeader}>
                        <span>Atualizações de Perfil</span>
                        <span>
                          {subscriptionInfo.usage.profileUpdatesUsed} /{" "}
                          {subscriptionInfo.limits.maxProfileUpdates === -1
                            ? "∞"
                            : subscriptionInfo.limits.maxProfileUpdates}
                        </span>
                      </div>
                      {subscriptionInfo.limits.maxProfileUpdates !== -1 && (
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${getUsagePercentage(
                                subscriptionInfo.usage.profileUpdatesUsed,
                                subscriptionInfo.limits.maxProfileUpdates,
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.limitsSection}>
                  <h4 className={styles.sectionTitle}>
                    <Crown size={20} /> Recursos Disponíveis
                  </h4>
                  <div className={styles.limitsList}>
                    <div
                      className={`${styles.limitItem} ${subscriptionInfo.limits.maxVideos > 0 ? styles.available : styles.unavailable}`}
                    >
                      Vídeos no Perfil
                    </div>
                    <div
                      className={`${styles.limitItem} ${subscriptionInfo.limits.hasCommentControl ? styles.available : styles.unavailable}`}
                    >
                      Controle de Comentários
                    </div>
                    <div
                      className={`${styles.limitItem} ${subscriptionInfo.limits.hasVoiceDemo ? styles.available : styles.unavailable}`}
                    >
                      Demonstração de Voz
                    </div>
                    <div
                      className={`${styles.limitItem} ${subscriptionInfo.limits.hasFeaturedProfile ? styles.available : styles.unavailable}`}
                    >
                      Perfil em Destaque
                    </div>
                    {subscriptionInfo.limits.priority && (
                      <div
                        className={`${styles.limitItem} ${styles.available}`}
                      >
                        Prioridade: {subscriptionInfo.limits.priority}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {availablePlans.length > 0 && (
        <div id="plans-section" className={styles.plansSection}>
          <h3 className={styles.plansTitle}>Faça Upgrade do seu Plano</h3>
          <div className={styles.plansGrid}>
            {availablePlans.map((plan: Plan) => (
              <Card
                key={plan.id}
                size="large"
                backgroundColor="var(--dark-complementary-color)"
                animated
                className={`${styles.planCard} ${plan.popular ? styles.popular : ""}`}
              >
                <div className={styles.planContent}>
                  {plan.popular && (
                    <div className={styles.popularBadge}>Mais Popular</div>
                  )}

                  <div className={styles.planHeader}>
                    <h4 className={styles.planName}>{plan.title}</h4>
                    <div className={styles.planPrice}>{plan.price}</div>
                  </div>

                  <p className={styles.planDescription}>{plan.description}</p>

                  <ul className={styles.benefits}>
                    {benefitList.map((benefit) => {
                      const value = plan.benefits[benefit.id];
                      const benefitDisplay = renderBenefitValue(benefit, value);
                      const isActive = isActiveBenefit(benefit, value);

                      return (
                        <li
                          key={benefit.id}
                          className={`${styles.benefit} ${!isActive ? styles.deny : ""}`}
                        >
                          {benefitDisplay.icon}
                          {benefitDisplay.text && (
                            <span>{benefitDisplay.text}</span>
                          )}
                          <span>{benefit.name}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className={styles.planAction}>
                    <button
                      className={styles.upgradeButton}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      Fazer Upgrade
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default SignaturePage;
