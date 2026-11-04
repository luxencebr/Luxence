"use client";

import styles from "./step-indicator.module.css";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = ["Conta", "Perfil", "Verificação", "Confirmação"];

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  const { locale } = useSiteLocale();
  return (
    <div className={styles.container}>
      <div className={styles.steps}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div
              key={step}
              className={`${styles.step} ${isActive ? styles.stepActive : ""}`}
            >
              <div
                className={`${styles.circle} ${
                  isCompleted
                    ? styles.circleCompleted
                    : isActive
                    ? styles.circleActive
                    : styles.circleInactive
                }`}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>

              <div
                className={`${styles.label} ${
                  isActive ? styles.labelActive : ""
                }`}
              >
                {uiText(locale, step)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
