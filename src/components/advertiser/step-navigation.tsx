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
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSubmit,
  canProceed,
  isSubmitting = false,
}: StepNavigationProps) {
  const handleNextClick = () => {
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

  return (
    <div className={styles.container}>
      {!canProceed() && (
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

      {/* Botão Voltar (só aparece se não for o primeiro step) */}
      {currentStep > 1 && (
        <button
          onClick={onPrev}
          className={`${styles.button} ${styles.buttonBack}`}
        >
          ← Voltar
        </button>
      )}

      {/* Botão Próximo / Finalizar */}

      <button
        onClick={handleNextClick}
        className={`${styles.button} ${styles.buttonNext}`}
        disabled={isSubmitting}
        style={{ opacity: isSubmitting ? 0.7 : 1 }}
      >
        {isSubmitting
          ? "Enviando..."
          : currentStep === totalSteps
            ? "Finalizar"
            : "Próximo →"}
      </button>
    </div>
  );
}
