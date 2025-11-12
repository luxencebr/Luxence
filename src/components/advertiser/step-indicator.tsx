import styles from "./step-indicator.module.css";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  "Perfil",
  "Verificação",
  "Método de Pagamento",
  "Endereço Residencial",
  "Confirmação",
];

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.steps}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step} className={styles.step}>
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
                  isActive || isCompleted ? styles.labelActive : ""
                }`}
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
