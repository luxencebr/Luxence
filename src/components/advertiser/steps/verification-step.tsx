"use client";

import React from "react";

import { useEffect, useState } from "react";
import styles from "./verification-step.module.css";

interface VerificationStepProps {
  formData: any;
  onUpdate: (data: any) => void;
  onValidate?: (isValid: boolean) => void;
  // Controle de sub-etapas
  substep?: number;
  onSubstepChange?: (substep: number) => void;
}

export default function VerificationStep({
  formData,
  onUpdate,
  onValidate,
  substep: externalSubstep,
  onSubstepChange,
}: VerificationStepProps) {
  const [substep, setSubstep] = useState<1 | 2>(externalSubstep as 1 | 2 || 1);
  
  // Sincronizar substep interno com externo
  useEffect(() => {
    if (externalSubstep && externalSubstep !== substep) {
      setSubstep(externalSubstep as 1 | 2);
    }
  }, [externalSubstep]);

  // Notificar mudanças de substep
  useEffect(() => {
    onSubstepChange?.(substep);
  }, [substep, onSubstepChange]);

  // Previews - usa as URLs salvas no formData ou cria novas para Files
  const [previewFront, setPreviewFront] = useState<string | null>(null);
  const [previewBack, setPreviewBack] = useState<string | null>(null);
  const [previewSelfie, setPreviewSelfie] = useState<string | null>(null);

  // Inicializa previews baseado no formData existente
  useEffect(() => {
    if (formData.documentFrontFile && !previewFront) {
      setPreviewFront(URL.createObjectURL(formData.documentFrontFile));
    }
    if (formData.documentBackFile && !previewBack) {
      setPreviewBack(URL.createObjectURL(formData.documentBackFile));
    }
    if (formData.selfieWithDocumentFile && !previewSelfie) {
      setPreviewSelfie(URL.createObjectURL(formData.selfieWithDocumentFile));
    }
  }, []);

  // Errors
  const [frontError, setFrontError] = useState<string | null>(null);
  const [backError, setBackError] = useState<string | null>(null);
  const [selfieError, setSelfieError] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "documentFrontFile" | "documentBackFile" | "selfieWithDocumentFile",
    setPreview: (url: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onUpdate({ [field]: file });

      if (field === "documentFrontFile") setFrontError(null);
      if (field === "documentBackFile") setBackError(null);
      if (field === "selfieWithDocumentFile") setSelfieError(null);
    }
  };

  // 👉 Validação quando a selfie for enviada
  useEffect(() => {
    if (formData.selfieWithDocumentFile) {
      onValidate?.(true);
    }
  }, [formData.selfieWithDocumentFile]);

  useEffect(() => {
    const hasFront = !!formData.documentFrontFile;
    const hasBack = !!formData.documentBackFile;
    const hasSelfie = !!formData.selfieWithDocumentFile;

    // Erros locais
    if (!hasFront) setFrontError("Envie a frente do documento.");
    if (!hasBack) setBackError("Envie o verso do documento.");
    if (substep === 2 && !hasSelfie)
      setSelfieError(
        "Envie uma selfie segurando o documento ao lado do rosto.",
      );

    // Validação geral da etapa
    const isValid = hasFront && hasBack && hasSelfie;

    onValidate?.(isValid);
  }, [
    formData.documentFrontFile,
    formData.documentBackFile,
    formData.selfieWithDocumentFile,
    substep,
  ]);

  // -------------------- RENDERIZAÇÃO --------------------
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Verificação de Identidade</h2>
        <p>
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
                  <img
                    src={previewFront || "/placeholder.svg"}
                    className={styles.previewImage}
                  />

                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => {
                      setPreviewFront(null);
                      onUpdate({ documentFrontFile: null });
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
                      handleFileChange(e, "documentFrontFile", setPreviewFront)
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
                  <img
                    src={previewBack || "/placeholder.svg"}
                    className={styles.previewImage}
                  />

                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => {
                      setPreviewBack(null);
                      onUpdate({ documentBackFile: null });
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
                      handleFileChange(e, "documentBackFile", setPreviewBack)
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
                  <img
                    src={previewSelfie || "/placeholder.svg"}
                    className={styles.previewImage}
                  />

                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => {
                      setPreviewSelfie(null);
                      onUpdate({ selfieWithDocumentFile: null });
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
                      handleFileChange(
                        e,
                        "selfieWithDocumentFile",
                        setPreviewSelfie,
                      )
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
