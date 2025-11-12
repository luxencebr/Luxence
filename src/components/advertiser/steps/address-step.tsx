"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./address-step.module.css";

interface AddressStepProps {
  formData: any;
  onUpdate: (data: any) => void;
  onValidate: (isValid: boolean) => void; // ← compatível com o pai
}

/* -------------------- Função de formatação -------------------- */
const formatCEP = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2")
    .slice(0, 9);

/* -------------------- Funções de validação -------------------- */
const validateCEP = (cepRaw: string) => {
  const digits = cepRaw.replace(/\D/g, "");
  return digits.length === 8;
};

const validateRequired = (value?: string) => !!value && value.trim().length > 0;

/* -------------------- Componente -------------------- */
export default function AddressStep({
  formData,
  onUpdate,
  onValidate,
}: AddressStepProps) {
  const [cepError, setCepError] = useState<string | null>(null);
  const [numberError, setNumberError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  /* -------------------- Busca automática via CEP -------------------- */
  useEffect(() => {
    const cep = formData.cep?.replace(/\D/g, "");

    if (!cep) {
      setCepError("Informe o CEP");
      return;
    }

    if (cep.length < 8) {
      setCepError("CEP incompleto");
      return;
    }

    if (validateCEP(cep)) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            onUpdate({
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf,
            });
            setCepError(null);
          } else {
            setCepError("CEP não encontrado. Verifique e tente novamente.");
          }
        })
        .catch(() => setCepError("Erro ao buscar o CEP. Tente novamente."));
    }
  }, [formData.cep, onUpdate]);

  /* -------------------- Validação geral -------------------- */
  useEffect(() => {
    // Número
    if (!formData.number) setNumberError("Informe o número da residência");
    else if (!/^[0-9A-Za-z\s-]+$/.test(formData.number))
      setNumberError("Número inválido");
    else setNumberError(null);

    // Campos obrigatórios
    const requiredFields = [
      "cep",
      "street",
      "neighborhood",
      "city",
      "state",
      "number",
    ];

    const allFilled = requiredFields.every((f) =>
      validateRequired(formData[f])
    );

    if (!allFilled) {
      setGeneralError(
        "⚠ Preencha corretamente todas as informações obrigatórias."
      );
    } else {
      setGeneralError(null);
    }
  }, [formData]);

  /* -------------------- Cálculo de validade geral -------------------- */
  const isValid = useMemo(
    () => !cepError && !numberError && !generalError,
    [cepError, numberError, generalError]
  );

  /* -------------------- Notifica o pai sobre a validade -------------------- */
  useEffect(() => {
    onValidate(isValid);
  }, [isValid, onValidate]);

  /* -------------------- Renderização -------------------- */
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Endereço Residencial</h2>
        <p className={styles.subtitle}>
          Preencha seu endereço completo para cadastro
        </p>
      </div>

      <div className={styles.section}>
        {/* CEP */}
        <label className={styles.label}>
          CEP:
          <input
            type="text"
            value={formData.cep || ""}
            onChange={(e) => onUpdate({ cep: formatCEP(e.target.value) })}
            placeholder="00000-000"
            maxLength={9}
            className={`${styles.input} ${cepError ? styles.invalid : ""}`}
            aria-invalid={!!cepError}
          />
          {cepError && <small className={styles.error}>{cepError}</small>}
        </label>

        {/* Endereço automático */}
        <label className={styles.label}>
          Rua:
          <input
            type="text"
            disabled
            value={formData.street || ""}
            placeholder="Nome da rua"
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Bairro:
          <input
            type="text"
            disabled
            value={formData.neighborhood || ""}
            placeholder="Bairro"
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Cidade:
          <input
            type="text"
            disabled
            value={formData.city || ""}
            placeholder="Cidade"
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Estado:
          <input
            type="text"
            disabled
            value={formData.state || ""}
            placeholder="UF"
            maxLength={2}
            className={styles.input}
          />
        </label>

        {/* Número */}
        <label className={styles.label}>
          Número:
          <input
            type="text"
            value={formData.number || ""}
            onChange={(e) => onUpdate({ number: e.target.value })}
            placeholder="Número"
            className={`${styles.input} ${numberError ? styles.invalid : ""}`}
            aria-invalid={!!numberError}
          />
          {numberError && <small className={styles.error}>{numberError}</small>}
        </label>

        {/* Complemento (opcional) */}
        <label className={styles.label}>
          Complemento:
          <input
            type="text"
            value={formData.complement || ""}
            onChange={(e) => onUpdate({ complement: e.target.value })}
            placeholder="Complemento (opcional)"
            className={styles.input}
          />
        </label>

        {/* Indicador geral */}
        {!isValid && (
          <p style={{ color: "orange", margin: 0 }}>
            ⚠ Preencha corretamente as informações
          </p>
        )}
      </div>
    </div>
  );
}
