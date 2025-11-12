"use client";

import { useState } from "react";

import styles from "./page.module.css";

import StepIndicator from "@/components/advertiser/step-indicator";
import ProfileStep from "@/components/advertiser/steps/profile-step";
import AppearanceStep from "@/components/advertiser/steps/verification-step";
import AudienceStep from "@/components/advertiser/steps/payment-step";
import ConfirmationStep from "@/components/advertiser/steps/confirmation-step";
import StepNavigation from "@/components/advertiser/step-navigation";

const TOTAL_STEPS = 4;

export default function AdvertiserRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Profile
    age: 25,
    nationality: "",
    languages: [""],
    // Appearance
    ethnicity: "",
    hair: "",
    eyes: "",
    height: 175,
    mannequin: 40,
    feet: 40,
    tattoos: false,
    piercings: false,
    silicone: false,
    // Audience
    audience: [],
    locales: [],
    hasLocation: false,
    amenities: [],
    //Services
    services: [],
    //Fetiches
    fetiches: [],
    // Confirmation
    agreed: false,
  });

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleUpdateFormData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {
    console.log("Formulário completo:", formData);
    // Aqui você pode enviar os dados para um servidor
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <aside className={styles.side}>
          <div className={styles.header}>
            <h1>Anuncie Conosco!</h1>
            <p>Complete seu cadastro em apenas alguns passos</p>
          </div>
          <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </aside>

        <div className={styles.content}>
          <div className={styles.card}>
            {currentStep === 1 && (
              <ProfileStep
                formData={formData}
                onUpdate={handleUpdateFormData}
              />
            )}
            {currentStep === 2 && (
              <AppearanceStep
                formData={formData}
                onUpdate={handleUpdateFormData}
              />
            )}
            {currentStep === 3 && (
              <AudienceStep
                formData={formData}
                onUpdate={handleUpdateFormData}
              />
            )}
            {currentStep === 4 && (
              <ConfirmationStep
                formData={formData}
                onUpdate={handleUpdateFormData}
              />
            )}
          </div>

          <div className={styles.navigation}>
            <StepNavigation
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              onNext={handleNext}
              onPrev={handlePrev}
              onSkip={handleSkip}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
