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
        <h2>Confirmação</h2>
        <p>Revise suas informações antes de finalizar o cadastro</p>
      </div>

      {/* CONTA */}
      <div className={styles.section}>
        <h3>Conta</h3>
        <div className={styles.infoList}>
          <p>
            <strong>Nome:</strong> {formData.name || "Não informado"}
          </p>
          <p>
            <strong>Email:</strong> {formData.email || "Não informado"}
          </p>
          <p>
            <strong>Gênero:</strong>{" "}
            {formData.gender === "MALE"
              ? "Homem"
              : formData.gender === "FEMALE"
                ? "Mulher"
                : formData.gender === "TRANS"
                  ? "Trans"
                  : "Não informado"}
          </p>
          <p>
            <strong>Interesses:</strong>{" "}
            {formData.preferences && formData.preferences.length > 0
              ? formData.preferences
                  .map((p: string) =>
                    p === "MALE"
                      ? "Homem"
                      : p === "FEMALE"
                        ? "Mulher"
                        : "Trans",
                  )
                  .join(", ")
              : "Não informado"}
          </p>
        </div>
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
