"use client";

import styles from "./step-navigation.module.css";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  canProceed: () => boolean;
  isSubmitting?: boolean;
  isTransitioning?: boolean;
  // Suporte para sub-etapas
  substep?: number;
  totalSubsteps?: number;
  onNextSubstep?: () => void;
  onPrevSubstep?: () => void;
  canProceedSubstep?: () => boolean;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSubmit,
  canProceed,
  isSubmitting = false,
  isTransitioning = false,
  substep,
  totalSubsteps,
  onNextSubstep,
  onPrevSubstep,
  canProceedSubstep,
}: StepNavigationProps) {
  const hasSubsteps = substep !== undefined && totalSubsteps !== undefined && totalSubsteps > 1;
  const isLastSubstep = hasSubsteps && substep === totalSubsteps;
  const isFirstSubstep = hasSubsteps && substep === 1;

  // Esconder navegação se estiver na sub-etapa 2 do step 1 (verificação de email)
  const shouldHideNavigation = currentStep === 1 && substep === 2;

  const handleNextClick = () => {
    // Se tem sub-etapas e não está na última
    if (hasSubsteps && !isLastSubstep) {
      if (canProceedSubstep?.()) {
        onNextSubstep?.();
      }
      return;
    }

    // Comportamento normal
    if (currentStep === totalSteps) {
      if (canProceed()) {
        onSubmit();
      }
    } else {
      if (canProceed()) {
        onNext();
      }
    }
  };

  const handlePrevClick = () => {
    // Se tem sub-etapas e não está na primeira
    if (hasSubsteps && !isFirstSubstep) {
      onPrevSubstep?.();
      return;
    }

    // Comportamento normal
    onPrev();
  };

  const showPrevButton = currentStep > 1 || (hasSubsteps && !isFirstSubstep);
  const canProceedNow = hasSubsteps && !isLastSubstep 
    ? canProceedSubstep?.() ?? false 
    : canProceed();
  
  const isLoading = isSubmitting || isTransitioning;
  const isDisabled = isLoading || !canProceedNow;

  // Se deve esconder navegação, retornar null
  if (shouldHideNavigation) {
    return null;
  }

  return (
    <div className={styles.container}>
      {!canProceedNow && !isLoading && (
        <p
          style={{
            color: "orange",
            margin: 0,
            fontSize: "12px",
            textWrap: "nowrap",
          }}
        >
          ⚠ Preencha corretamente as informações
        </p>
      )}

      {showPrevButton && (
        <button
          onClick={handlePrevClick}
          className={`${styles.button} ${styles.buttonBack}`}
          disabled={isLoading}
        >
          ← Voltar
        </button>
      )}

      <button
        onClick={handleNextClick}
        className={`${styles.button} ${styles.buttonNext}`}
        disabled={isDisabled}
        style={{ opacity: isDisabled ? 0.5 : 1 }}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            {isSubmitting ? "Enviando..." : "Carregando..."}
          </>
        ) : (
          currentStep === totalSteps && (!hasSubsteps || isLastSubstep)
            ? "Finalizar"
            : "Próximo →"
        )}
      </button>
    </div>
  );
}
