"use client";

import styles from "./step-navigation.module.css";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onSubmit: () => void;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onSubmit,
}: StepNavigationProps) {
  return (
    <div className={styles.container}>
      {/* Botão Voltar */}
      <button
        onClick={onPrev}
        disabled={currentStep === 1}
        className={`${styles.button} ${styles.buttonBack}`}
      >
        ← Voltar
      </button>

      {/* Botão Pular */}
      {currentStep < totalSteps && (
        <button
          onClick={onSkip}
          className={`${styles.button} ${styles.buttonSkip}`}
        >
          Pular
        </button>
      )}

      {/* Botão Próximo / Finalizar */}
      <button
        onClick={currentStep === totalSteps ? onSubmit : onNext}
        className={`${styles.button} ${styles.buttonNext}`}
      >
        {currentStep === totalSteps ? "Finalizar" : "Próximo →"}
      </button>
    </div>
  );
}
