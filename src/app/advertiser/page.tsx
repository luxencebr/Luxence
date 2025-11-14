"use client";

import { useState } from "react";
import styles from "./page.module.css";

import StepIndicator from "@/components/advertiser/step-indicator";
import ProfileStep from "@/components/advertiser/steps/profile-step";
import VerificationStep from "@/components/advertiser/steps/verification-step";
import ConfirmationStep from "@/components/advertiser/steps/confirmation-step";
import StepNavigation from "@/components/advertiser/step-navigation";

import { useSearchParams } from "next/navigation";

const TOTAL_STEPS = 3;

export default function AdvertiserRegistration() {
  const [currentStep, setCurrentStep] = useState(1);

  const searchParams = useSearchParams();
  const userId = searchParams.get("uid");

  // Dados principais do formulário
  const [formData, setFormData] = useState({
    userId,

    // Profile
    birthday: "",
    nationality: "",
    document: "",
    phone: "",

    // Verification
    documentFrontPhoto: "",
    documentBackPhoto: "",
    selfieWithDocument: "",

    agreed: false,
  });

  // Atualização genérica
  const handleUpdateFormData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  // 🔍 Controle de validade por etapa
  const [validSteps, setValidSteps] = useState<Record<number, boolean>>({
    1: false, // Profile
    2: false, // Verification
    3: false, // Confirmation (sempre ok)
  });

  const canProceed = () => validSteps[currentStep];

  // Navegação entre etapas
  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && canProceed()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  // Submissão final
  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/register/advertiser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        alert("Erro ao criar cadastro: " + error.message);
        return;
      }

      const data = await res.json();

      // ID do producer criado
      const producerId = data.producer.id;

      // Redireciona para a página do perfil
      window.location.href = `/product/${producerId}`;
    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao finalizar cadastro.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Lateral esquerda */}
        <aside className={styles.side}>
          <div className={styles.header}>
            <h1>Anuncie Conosco!</h1>
            <p>Complete seu cadastro em apenas alguns passos</p>
          </div>
          <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </aside>

        {/* Conteúdo central */}
        <div className={styles.content}>
          <div className={styles.card}>
            {currentStep === 1 && (
              <ProfileStep
                formData={formData}
                onUpdate={handleUpdateFormData}
                onValidate={(isValid) =>
                  setValidSteps((v) => ({ ...v, 1: isValid }))
                }
              />
            )}

            {currentStep === 2 && (
              <VerificationStep
                formData={formData}
                onUpdate={handleUpdateFormData}
                onValidate={(isValid) =>
                  setValidSteps((v) => ({ ...v, 2: isValid }))
                }
              />
            )}

            {currentStep === 3 && (
              <ConfirmationStep
                formData={formData}
                onUpdate={handleUpdateFormData}
                onValidate={(isValid) =>
                  setValidSteps((v) => ({ ...v, 3: isValid }))
                }
              />
            )}
          </div>

          {/* Navegação entre passos */}
          <div className={styles.navigation}>
            <StepNavigation
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              onNext={handleNext}
              onPrev={handlePrev}
              onSubmit={handleSubmit}
              canProceed={canProceed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
