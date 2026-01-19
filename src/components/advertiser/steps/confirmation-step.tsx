"use client";

import { useEffect } from "react";
import styles from "./confirmation-step.module.css";

interface ConfirmationStepProps {
  formData: any;
  onUpdate: (data: any) => void;
  onValidate?: (isValid: boolean) => void;
}

export default function ConfirmationStep({
  formData,
  onUpdate,
  onValidate,
}: ConfirmationStepProps) {
  useEffect(() => {
    if (onValidate) {
      onValidate(!!formData.agreed);
    }
  }, [formData.agreed]);
  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h2 className={styles.title}>Confirmação</h2>
        <p className={styles.subtitle}>
          Revise suas informações antes de finalizar o cadastro
        </p>
      </div>

      {/* PERFIL */}
      <div className={styles.section}>
        <h3>Perfil</h3>
        <div className={styles.infoList}>
          <p>
            <strong>Data de Nascimento:</strong>{" "}
            {formData.birthday || "Não informado"}
          </p>
          <p>
            <strong>Nacionalidade:</strong>{" "}
            {formData.nationality || "Não informado"}
          </p>
          <p>
            <strong>Documento:</strong> {formData.document || "Não informado"}
          </p>
          <p>
            <strong>Telefone:</strong> {formData.phone || "Não informado"}
          </p>
        </div>
      </div>

      {/* VERIFICAÇÃO */}
      <div className={styles.section}>
        <h3>Verificação de Identidade</h3>
        <div className={styles.infoList}>
          <p>
            <strong>Frente do Documento:</strong>{" "}
            {formData.documentFrontFile ? (
              <img
                src={
                  URL.createObjectURL(formData.documentFrontFile) ||
                  "/placeholder.svg"
                }
                alt="Frente do documento"
                className={styles.thumbnail}
              />
            ) : (
              "Não enviada"
            )}
          </p>
          <p>
            <strong>Verso do Documento:</strong>{" "}
            {formData.documentBackFile ? (
              <img
                src={
                  URL.createObjectURL(formData.documentBackFile) ||
                  "/placeholder.svg"
                }
                alt="Verso do documento"
                className={styles.thumbnail}
              />
            ) : (
              "Não enviada"
            )}
          </p>
          <p>
            <strong>Selfie com Documento:</strong>{" "}
            {formData.selfieWithDocumentFile ? (
              <img
                src={
                  URL.createObjectURL(formData.selfieWithDocumentFile) ||
                  "/placeholder.svg"
                }
                alt="Selfie com documento"
                className={styles.thumbnail}
              />
            ) : (
              "Não enviada"
            )}
          </p>
        </div>
      </div>

      {/* Termos */}
      <label className={styles.agreement}>
        <input
          type="checkbox"
          checked={formData.agreed || false}
          onChange={(e) => onUpdate({ agreed: e.target.checked })}
        />
        <span>
          Concordo com os{" "}
          <a href="#" className={styles.link}>
            termos de serviço
          </a>{" "}
          e confirmo que todas as informações são verdadeiras e atuais.
        </span>
      </label>
    </div>
  );
}
