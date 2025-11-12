"use client";

import styles from "./step-navigation.module.css";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  canProceed: () => boolean;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSubmit,
  canProceed,
}: StepNavigationProps) {
  const handleNextClick = () => {
    if (currentStep === totalSteps) {
      onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <div className={styles.container}>
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
      >
        {currentStep === totalSteps ? "Finalizar" : "Próximo →"}
      </button>
    </div>
  );
}
