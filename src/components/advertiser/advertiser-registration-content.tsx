"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  
  // Controle de sub-etapas
  const [accountSubstep, setAccountSubstep] = useState(1);
  const [verificationSubstep, setVerificationSubstep] = useState(1);
  
  // Ref para armazenar a função de envio de código
  const sendVerificationCodeRef = useRef<(() => Promise<boolean>) | null>(null);
  
  // Estado de loading para transições
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Callback para o AccountStep registrar sua função
  const registerSendVerificationCode = (fn: () => Promise<boolean>) => {
    sendVerificationCodeRef.current = fn;
  };

  // Dados principais do formulário
  const [formData, setFormData] = useState<{
    // Account (Step 1)
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    gender: string;
    preferences: string[];
    emailVerified: boolean;
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
    emailVerified: false,

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

  // Controle de validade por etapa
  const [validSteps, setValidSteps] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const canProceed = () => validSteps[currentStep];

  // Navegação entre etapas
  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS && canProceed()) {
      setCurrentStep((s) => s + 1);
      // Reset substeps ao mudar de etapa
      if (currentStep === 1) setAccountSubstep(1);
      if (currentStep === 3) setVerificationSubstep(1);
    }
  }, [currentStep, canProceed]);

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      // Reset substep ao voltar para step 1
      if (currentStep === 2) setAccountSubstep(1);
    }
  };

  // Listener para avançar automaticamente após verificação de email
  useEffect(() => {
    const handleEmailVerified = () => {
      if (currentStep === 1 && formData.emailVerified) {
        handleNext();
      }
    };

    window.addEventListener('emailVerified', handleEmailVerified);
    return () => {
      window.removeEventListener('emailVerified', handleEmailVerified);
    };
  }, [currentStep, formData.emailVerified, handleNext]);

  // Navegação de sub-etapas - Account Step
  const handleNextAccountSubstep = async () => {
    // Se o email já foi verificado, pular direto para o próximo step
    if (formData.emailVerified) {
      handleNext();
      return;
    }
    
    if (accountSubstep === 1 && sendVerificationCodeRef.current) {
      setIsTransitioning(true);
      const success = await sendVerificationCodeRef.current();
      if (success) {
        setAccountSubstep(2);
      }
      setIsTransitioning(false);
    }
  };

  const handlePrevAccountSubstep = () => {
    if (accountSubstep === 2) {
      setAccountSubstep(1);
    }
  };

  const canProceedAccountSubstep = (): boolean => {
    if (accountSubstep === 1) {
      // Validar dados da conta
      const nameValid = formData.name && formData.name.length >= 3;
      const emailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      const passwordValid = formData.password && formData.password.length >= 8;
      const confirmValid = formData.password === formData.confirmPassword;
      const genderValid = !!formData.gender;
      const preferencesValid = formData.preferences && formData.preferences.length > 0;
      
      return !!(nameValid && emailValid && passwordValid && confirmValid && genderValid && preferencesValid);
    }
    return false;
  };

  // Navegação de sub-etapas - Verification Step
  const handleNextVerificationSubstep = () => {
    if (verificationSubstep === 1 && formData.documentFrontFile && formData.documentBackFile) {
      setVerificationSubstep(2);
    }
  };

  const handlePrevVerificationSubstep = () => {
    if (verificationSubstep === 2) {
      setVerificationSubstep(1);
    }
  };

  const canProceedVerificationSubstep = (): boolean => {
    if (verificationSubstep === 1) {
      return !!(formData.documentFrontFile && formData.documentBackFile);
    }
    return false;
  };

  // Estado de loading durante submissão
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Submissão final
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
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
        submitData.append("selfieWithDocumentFile", formData.selfieWithDocumentFile);
      }

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

      // Mostrar feedback de sucesso
      setRegistrationSuccess(true);

      // Iniciar login e redirecionamento imediatamente (em paralelo com a animação)
      (async () => {
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

        await updateSession({
          producerId: String(producerId),
          signature: signature,
        });

        // Redirecionar (a animação continuará até o carregamento da página)
        window.location.href = `/product/${producerId}`;
      })();
    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao finalizar cadastro.");
      setRegistrationSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determinar props de sub-etapa baseado no step atual
  const getSubstepProps = () => {
    if (currentStep === 1) {
      return {
        substep: accountSubstep,
        totalSubsteps: formData.emailVerified ? 1 : 2,
        onNextSubstep: handleNextAccountSubstep,
        onPrevSubstep: handlePrevAccountSubstep,
        canProceedSubstep: canProceedAccountSubstep,
      };
    }
    if (currentStep === 3) {
      return {
        substep: verificationSubstep,
        totalSubsteps: 2,
        onNextSubstep: handleNextVerificationSubstep,
        onPrevSubstep: handlePrevVerificationSubstep,
        canProceedSubstep: canProceedVerificationSubstep,
      };
    }
    return {};
  };

  return (
    <div className={styles.container}>
      {registrationSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successModal}>
            <svg
              className={styles.successCheckmark}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className={styles.successCheckmarkCircle}
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className={styles.successCheckmarkCheck}
                fill="none"
                d="M14 27l7 7 16-16"
              />
            </svg>
            <h2>Cadastro realizado com sucesso!</h2>
            <p>Redirecionando para seu perfil...</p>
            <div className={styles.loadingBar}>
              <div className={styles.loadingBarProgress}></div>
            </div>
          </div>
        </div>
      )}
      
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
                substep={accountSubstep}
                onSubstepChange={setAccountSubstep}
                onSendVerificationCode={registerSendVerificationCode}
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
                substep={verificationSubstep}
                onSubstepChange={setVerificationSubstep}
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
              {...getSubstepProps()}
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              onNext={handleNext}
              onPrev={handlePrev}
              onSubmit={handleSubmit}
              canProceed={canProceed}
              isSubmitting={isSubmitting}
              isTransitioning={isTransitioning}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
