"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./ProfileCompletionChecklist.module.css";

interface ProfileVerificationResult {
  status: "YELLOW" | "GREEN" | "RED";
  isComplete: boolean;
  missingFields: string[];
  completedFields: string[];
}

interface ProfileCompletionChecklistProps {
  producerId: number;
  onComplete?: () => void;
}

interface StepItem {
  id: string;
  title: string;
  description: string;
  anchor: string;
}

const STEPS: StepItem[] = [
  {
    id: "Ao menos 1 imagem",
    title: "Imagem",
    description: "Adicione pelo menos uma foto para atrair mais visualizações",
    anchor: "showcase",
  },
  {
    id: "Nome",
    title: "Nome",
    description: "Adicione seu nome profissional que será exibido no catálogo",
    anchor: "showcase",
  },
  {
    id: "Ao menos 1 contato",
    title: "Contatos",
    description: "Adicione pelo menos uma forma de contato (WhatsApp, Telegram, etc)",
    anchor: "showcase",
  },
  {
    id: "Público que atende",
    title: "Público",
    description: "Defina o tipo de público que você atende",
    anchor: "audience",
  },
  {
    id: "Idiomas falados",
    title: "Idiomas",
    description: "Informe os idiomas que você fala para facilitar a comunicação",
    anchor: "audience",
  },
  {
    id: "Ao menos 1 preço e forma de pagamento",
    title: "Valores",
    description: "Defina seus preços e formas de pagamento aceitas",
    anchor: "values",
  },
];

// Mapeamento de campos para seletores de destaque
const FIELD_SELECTORS: Record<string, string | string[]> = {
  "Nome": "[data-field='producer-name']",
  "Ao menos 1 imagem": "[data-field='producer-images']",
  "Ao menos 1 contato": "[data-field='producer-contacts']",
  "Público que atende": "[data-field='producer-audience']",
  "Idiomas falados": "[data-field='producer-languages']",
  "Ao menos 1 preço e forma de pagamento": "[data-field='producer-values']",
};

// Mapeamento específico para animações (pode ser diferente do destaque)
const ANIMATION_SELECTORS: Record<string, string | string[]> = {
  "Nome": "[data-field='producer-name']",
  "Ao menos 1 imagem": "[data-field='producer-images']",
  "Ao menos 1 contato": [
    "[data-field='producer-contact-whatsapp']",
    "[data-field='producer-contact-telegram']",
    "[data-field='producer-contact-instagram']"
  ],
  "Público que atende": "[data-field='producer-audience']",
  "Idiomas falados": "[data-field='producer-languages']",
  "Ao menos 1 preço e forma de pagamento": "[data-field='producer-values']",
};

export default function ProfileCompletionChecklist({
  producerId,
  onComplete,
}: ProfileCompletionChecklistProps) {
  const [verification, setVerification] = useState<ProfileVerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    fetchVerificationStatus(true);

    let debounceTimer: NodeJS.Timeout;
    
    const handleProfileUpdate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchVerificationStatus(false);
      }, 800);
    };

    // Remove destaque quando o usuário interagir com campos
    const handleFieldInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      const field = target.closest('[data-field]');
      if (field && field.classList.contains('field-incomplete')) {
        field.classList.remove('field-incomplete');
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    document.addEventListener('click', handleFieldInteraction);
    document.addEventListener('focus', handleFieldInteraction, true);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      document.removeEventListener('click', handleFieldInteraction);
      document.removeEventListener('focus', handleFieldInteraction, true);
      clearTimeout(debounceTimer);
    };
  }, [producerId]);

  const fetchVerificationStatus = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      
      const response = await fetch(
        `/api/profile/verification?producerId=${producerId}`
      );
      const data = await response.json();
      setVerification(data);

      if (data.isComplete && onComplete) {
        onComplete();
      }

      // Aplica classes de destaque aos campos incompletos
      applyIncompleteFieldsHighlight(data.missingFields);
    } catch (error) {
      console.error("Erro ao buscar status de verificação:", error);
    } finally {
      if (isInitial) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [producerId, onComplete]);

  const applyIncompleteFieldsHighlight = useCallback((missingFields: string[]) => {
    // Remove todas as classes de destaque primeiro
    document.querySelectorAll('[data-field]').forEach(el => {
      el.classList.remove('field-incomplete');
    });

    // Aplica destaque apenas aos campos incompletos
    missingFields.forEach(fieldId => {
      const selector = FIELD_SELECTORS[fieldId];
      
      if (selector) {
        if (Array.isArray(selector)) {
          // Para arrays (contatos), aplica em todos
          selector.forEach(sel => {
            const field = document.querySelector(sel);
            if (field) {
              field.classList.add('field-incomplete');
            }
          });
        } else {
          // Seletor único
          const field = document.querySelector(selector);
          if (field) {
            field.classList.add('field-incomplete');
          }
        }
      }
    });
  }, []);

  const handleStepClick = useCallback((anchor: string, stepId: string) => {
    const element = document.getElementById(anchor);
    if (!element) return;

    // Remove apenas a animação de outros campos
    document.querySelectorAll('[data-field]').forEach(el => {
      el.classList.remove('field-bounce');
    });

    // Inicia o scroll
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // Detecta quando o scroll termina
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const checkScrollEnd = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Se a posição mudou, continua verificando
      if (currentScrollTop !== lastScrollTop) {
        lastScrollTop = currentScrollTop;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(checkScrollEnd, 50);
      } else {
        // Scroll parou, aplica a animação
        applyAnimation();
      }
    };

    const applyAnimation = () => {
      const selector = ANIMATION_SELECTORS[stepId];
      
      if (selector) {
        // Se for um array de seletores (contatos), aplica com delay
        if (Array.isArray(selector)) {
          selector.forEach((sel, index) => {
            const field = document.querySelector(sel);
            if (field) {
              setTimeout(() => {
                field.classList.add('field-bounce');
                
                // Remove a animação após completar
                setTimeout(() => {
                  field.classList.remove('field-bounce');
                }, 600);
              }, index * 100); // Delay de 100ms entre cada item
            }
          });
        } else {
          // Seletor único
          const field = document.querySelector(selector);
          if (field) {
            field.classList.add('field-bounce');
            
            // Remove a animação após completar
            setTimeout(() => {
              field.classList.remove('field-bounce');
            }, 600);
          }
        }
      }
    };

    // Inicia a verificação após um pequeno delay
    scrollTimeout = setTimeout(checkScrollEnd, 100);
  }, []);

  const isStepComplete = useCallback((stepId: string): boolean => {
    if (!verification) return false;
    return !verification.missingFields.includes(stepId);
  }, [verification]);

  const completedCount = verification?.completedFields.length ?? 0;
  const totalCount = STEPS.length;
  const progressPercentage = useMemo(
    () => Math.round((completedCount / totalCount) * 100),
    [completedCount, totalCount]
  );

  // Não mostra nada se estiver carregando pela primeira vez
  if (loading && isInitialLoad) {
    return null;
  }

  // Não mostra nada se não houver dados ou se o perfil estiver completo
  if (!verification || verification.isComplete) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>
              {verification.isComplete ? "Perfil Completo" : "Complete seu Perfil"}
            </h3>
            <span className={styles.badge}>
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className={styles.progressText}>{progressPercentage}%</span>
          </div>
        </div>
      </div>

      <div className={styles.steps}>
        {STEPS.map((step) => {
          const isComplete = isStepComplete(step.id);

          return (
            <button
              key={step.id}
              className={`${styles.step} ${isComplete ? styles.stepComplete : styles.stepIncomplete}`}
              onClick={() => !isComplete && handleStepClick(step.anchor, step.id)}
              disabled={isComplete}
              type="button"
              title={step.description}
            >
              <div className={styles.stepIcon}>
                {isComplete ? (
                  <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className={styles.alertIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={styles.stepTitle}>{step.title}</span>
            </button>
          );
        })}
      </div>

      {!verification.isComplete && (
        <div className={styles.footer}>
          <svg className={styles.footerIcon} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className={styles.footerText}>
            Complete todos os campos acima para que seu perfil seja exibido no catálogo
          </p>
        </div>
      )}
    </div>
  );
}
