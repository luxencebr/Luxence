"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import styles from "@/app/advertiser/page.module.css";

import StepIndicator from "@/components/advertiser/step-indicator";
import AccountStep from "@/components/advertiser/steps/account-step";
import ProfileStep from "@/components/advertiser/steps/profile-step";
import VerificationStep from "@/components/advertiser/steps/verification-step";
import ConfirmationStep from "@/components/advertiser/steps/confirmation-step";
import StepNavigation from "@/components/advertiser/step-navigation";

const TOTAL_STEPS = 4;

export default function AdvertiserRegistrationContent() {
  const { update: updateSession } = useSession();
  const [currentStep, setCurrentStep] = useState(1);

  // Dados principais do formulário
  const [formData, setFormData] = useState<{
    // Account (Step 1)
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    gender: string;
    preferences: string[];
    // Profile (Step 2)
    birthday: string;
    nationality: string;
    document: string;
    phone: string;
    // Verification (Step 3)
    documentFrontFile: File | null;
    documentBackFile: File | null;
    selfieWithDocumentFile: File | null;
    // Confirmation (Step 4)
    agreed: boolean;
  }>({
    // Account
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    preferences: [],

    // Profile
    birthday: "",
    nationality: "",
    document: "",
    phone: "",

    // Verification - arquivos File
    documentFrontFile: null,
    documentBackFile: null,
    selfieWithDocumentFile: null,

    agreed: false,
  });

  // Atualização genérica
  const handleUpdateFormData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  // 🔍 Controle de validade por etapa
  const [validSteps, setValidSteps] = useState<Record<number, boolean>>({
    1: false, // Account
    2: false, // Profile
    3: false, // Verification
    4: false, // Confirmation
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

  // Estado de loading durante submissão
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submissão final
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Preparar FormData para enviar arquivos
      const submitData = new FormData();

      // Dados da conta
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("gender", formData.gender);
      formData.preferences.forEach((pref) => {
        submitData.append("preferences", pref);
      });

      // Dados do perfil
      submitData.append("birthday", formData.birthday);
      submitData.append("nationality", formData.nationality);
      submitData.append("document", formData.document);
      submitData.append("phone", formData.phone);

      // Arquivos de verificação
      if (formData.documentFrontFile) {
        submitData.append("documentFrontFile", formData.documentFrontFile);
      }
      if (formData.documentBackFile) {
        submitData.append("documentBackFile", formData.documentBackFile);
      }
      if (formData.selfieWithDocumentFile) {
        submitData.append(
          "selfieWithDocumentFile",
          formData.selfieWithDocumentFile,
        );
      }

      // Criar conta e perfil
      const res = await fetch("/api/register/advertiser", {
        method: "POST",
        body: submitData,
      });

      if (!res.ok) {
        const error = await res.json();
        alert("Erro ao criar cadastro: " + (error.error || error.message));
        return;
      }

      const data = await res.json();
      const producerId = data.producer.id;
      const signature = data.producer.signature || "COPPER";

      // Login automático
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInResult?.error) {
        alert("Cadastro realizado! Faça login para continuar.");
        window.location.href = "/";
        return;
      }

      // Atualizar sessão com producerId
      await updateSession({
        producerId: String(producerId),
        signature: signature,
      });

      // Redirecionar para o perfil
      window.location.href = `/product/${producerId}`;
    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao finalizar cadastro.");
    } finally {
      setIsSubmitting(false);
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
              <AccountStep
                formData={formData}
                onUpdate={handleUpdateFormData}
                onValidate={(isValid) =>
                  setValidSteps((v) => ({ ...v, 1: isValid }))
                }
              />
            )}

            {currentStep === 2 && (
              <ProfileStep
                formData={formData}
                onUpdate={handleUpdateFormData}
                onValidate={(isValid) =>
                  setValidSteps((v) => ({ ...v, 2: isValid }))
                }
              />
            )}

            {currentStep === 3 && (
              <VerificationStep
                formData={formData}
                onUpdate={handleUpdateFormData}
                onValidate={(isValid) =>
                  setValidSteps((v) => ({ ...v, 3: isValid }))
                }
              />
            )}

            {currentStep === 4 && (
              <ConfirmationStep
                formData={formData}
                onUpdate={handleUpdateFormData}
                onValidate={(isValid) =>
                  setValidSteps((v) => ({ ...v, 4: isValid }))
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
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
