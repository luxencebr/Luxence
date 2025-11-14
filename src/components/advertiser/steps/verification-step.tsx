"use client";

import { useEffect, useState } from "react";
import styles from "./verification-step.module.css";

interface VerificationStepProps {
  formData: any;
  onUpdate: (data: any) => void;
  onValidate?: (isValid: boolean) => void;
}

export default function VerificationStep({
  formData,
  onUpdate,
  onValidate,
}: VerificationStepProps) {
  const [substep, setSubstep] = useState<1 | 2>(1);

  // Previews
  const [previewFront, setPreviewFront] = useState<string | null>(
    formData.documentFront ? URL.createObjectURL(formData.documentFront) : null
  );

  const [previewBack, setPreviewBack] = useState<string | null>(
    formData.documentBack ? URL.createObjectURL(formData.documentBack) : null
  );

  const [previewSelfie, setPreviewSelfie] = useState<string | null>(
    formData.selfieDocument
      ? URL.createObjectURL(formData.selfieDocument)
      : null
  );

  // Errors
  const [frontError, setFrontError] = useState<string | null>(null);
  const [backError, setBackError] = useState<string | null>(null);
  const [selfieError, setSelfieError] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "documentFront" | "documentBack" | "selfieDocument",
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onUpdate({ [field]: file });

      if (field === "documentFront") setFrontError(null);
      if (field === "documentBack") setBackError(null);
      if (field === "selfieDocument") setSelfieError(null);
    }
  };

  // 👉 AUTO-AVANÇO PARA SUBETAPA 2
  useEffect(() => {
    if (formData.documentFront && formData.documentBack) {
      setSubstep(2);
    }
  }, [formData.documentFront, formData.documentBack]);

  // 👉 AUTO-FINALIZAR QUANDO A SELFIE FOR ENVIADA
  useEffect(() => {
    if (formData.selfieDocument) {
      onValidate?.(true);
    }
  }, [formData.selfieDocument]);

  useEffect(() => {
    const hasFront = !!formData.documentFront;
    const hasBack = !!formData.documentBack;
    const hasSelfie = !!formData.selfieDocument;

    // Erros locais
    if (!hasFront) setFrontError("Envie a frente do documento.");
    if (!hasBack) setBackError("Envie o verso do documento.");
    if (substep === 2 && !hasSelfie)
      setSelfieError(
        "Envie uma selfie segurando o documento ao lado do rosto."
      );

    // Validação geral da etapa
    const isValid = hasFront && hasBack && hasSelfie;

    onValidate?.(isValid);
  }, [
    formData.documentFront,
    formData.documentBack,
    formData.selfieDocument,
    substep,
  ]);

  const goToSelfie = () => {
    const hasFront = !!formData.documentFront;
    const hasBack = !!formData.documentBack;

    if (!hasFront) setFrontError("Envie a frente do documento.");
    if (!hasBack) setBackError("Envie o verso do documento.");

    if (hasFront && hasBack) {
      setSubstep(2);
    }
  };

  const canAdvance = !!formData.documentFront && !!formData.documentBack;

  // -------------------- RENDERIZAÇÃO --------------------
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Verificação de Identidade
          {substep === 2 ? (
            <button
              type="button"
              className={styles.backButton}
              onClick={() => setSubstep(1)}
            >
              Voltar
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.backButton} ${
                !canAdvance ? styles.disable : ""
              }`}
              onClick={goToSelfie}
              disabled={!canAdvance}
            >
              Próximo
            </button>
          )}
        </h2>

        <p className={styles.subtitle}>
          {substep === 1
            ? "Envie fotos nítidas da frente e verso do seu documento."
            : "Agora uma selfie segurando o documento ao lado do rosto."}
        </p>
      </div>

      <div className={styles.section}>
        {/* ---------------- SUBETAPA 1 ---------------- */}
        {substep === 1 && (
          <>
            {/* Frente */}
            <div className={styles.uploadBox}>
              <label className={styles.label}>Frente do Documento</label>

              {previewFront ? (
                <div className={styles.previewWrapper}>
                  <img src={previewFront} className={styles.previewImage} />

                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => {
                      setPreviewFront(null);
                      onUpdate({ documentFront: null });
                    }}
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <>
                  <label htmlFor="front-upload" className={styles.customUpload}>
                    <span>Enviar Foto</span>
                  </label>
                  <input
                    id="front-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(e, "documentFront", setPreviewFront)
                    }
                  />
                </>
              )}

              {frontError && (
                <small className={styles.error}>{frontError}</small>
              )}
            </div>

            {/* Verso */}
            <div className={styles.uploadBox}>
              <label className={styles.label}>Verso do Documento</label>

              {previewBack ? (
                <div className={styles.previewWrapper}>
                  <img src={previewBack} className={styles.previewImage} />

                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => {
                      setPreviewBack(null);
                      onUpdate({ documentBack: null });
                    }}
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <>
                  <label htmlFor="back-upload" className={styles.customUpload}>
                    <span>Enviar Foto</span>
                  </label>
                  <input
                    id="back-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(e, "documentBack", setPreviewBack)
                    }
                  />
                </>
              )}

              {backError && <small className={styles.error}>{backError}</small>}
            </div>
          </>
        )}
        {/* ---------------- SUBETAPA 2 ---------------- */}
        {substep === 2 && (
          <>
            {/* Selfie */}
            <div className={styles.uploadBox}>
              <label className={styles.label}>Selfie com o documento</label>

              {previewSelfie ? (
                <div className={styles.previewWrapper}>
                  <img src={previewSelfie} className={styles.previewImage} />

                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => {
                      setPreviewSelfie(null);
                      onUpdate({ selfieDocument: null });
                    }}
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <>
                  <label
                    htmlFor="selfie-upload"
                    className={styles.customUpload}
                  >
                    <span>Enviar Foto</span>
                  </label>
                  <input
                    id="selfie-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(e, "selfieDocument", setPreviewSelfie)
                    }
                  />
                </>
              )}

              {selfieError && (
                <small className={styles.error}>{selfieError}</small>
              )}
            </div>
          </>
        )}{" "}
      </div>
    </div>
  );
}
