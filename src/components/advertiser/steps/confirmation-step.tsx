"use client";

import { useEffect } from "react";
import styles from "./confirmation-step.module.css";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";

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
  const { locale } = useSiteLocale();
  const t = (value: string) => uiText(locale, value);
  useEffect(() => {
    if (onValidate) {
      onValidate(!!formData.agreed);
    }
  }, [formData.agreed]);
  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h2>{t("Confirmação")}</h2>
        <p>{t("Revise suas informações antes de finalizar o cadastro")}</p>
      </div>

      {/* CONTA */}
      <div className={styles.section}>
        <h3>{t("Conta")}</h3>
        <div className={styles.infoList}>
          <p>
            <strong>{t("Nome:")}</strong> {formData.name || t("Não informado")}
          </p>
          <p>
            <strong>{t("Email:")}</strong> {formData.email || t("Não informado")}
          </p>
          <p>
            <strong>{t("Gênero:")}</strong>{" "}
            {formData.gender === "MALE"
              ? t("Homem")
              : formData.gender === "FEMALE"
                ? t("Mulher")
                : formData.gender === "TRANS"
                  ? t("Trans")
                  : t("Não informado")}
          </p>
          <p>
            <strong>{t("Interesses:")}</strong>{" "}
            {formData.preferences && formData.preferences.length > 0
              ? formData.preferences
                  .map((p: string) =>
                    p === "MALE"
                      ? t("Homem")
                      : p === "FEMALE"
                        ? t("Mulher")
                        : t("Trans"),
                  )
                  .join(", ")
              : t("Não informado")}
          </p>
        </div>
      </div>

      {/* PERFIL */}
      <div className={styles.section}>
        <h3>{t("Perfil")}</h3>
        <div className={styles.infoList}>
          <p>
            <strong>{t("Data de Nascimento:")}</strong>{" "}
            {formData.birthday || t("Não informado")}
          </p>
          <p>
            <strong>{t("Nacionalidade:")}</strong>{" "}
            {formData.nationality || t("Não informado")}
          </p>
          <p>
            <strong>{t("Documento:")}</strong> {formData.document || t("Não informado")}
          </p>
          <p>
            <strong>{t("Telefone:")}</strong> {formData.phone || t("Não informado")}
          </p>
        </div>
      </div>

      {/* VERIFICAÇÃO */}
      <div className={styles.section}>
        <h3>{t("Verificação de Identidade")}</h3>
        <div className={styles.infoList}>
          <p>
            <strong>{t("Frente do Documento:")}</strong>{" "}
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
              t("Não enviada")
            )}
          </p>
          <p>
            <strong>{t("Verso do Documento:")}</strong>{" "}
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
              t("Não enviada")
            )}
          </p>
          <p>
            <strong>{t("Selfie com Documento:")}</strong>{" "}
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
              t("Não enviada")
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
