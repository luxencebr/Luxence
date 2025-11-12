"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./profile-step.module.css";

interface ProfileStepProps {
  formData: any;
  onUpdate: (data: any) => void;
  onValidate?: (isValid: boolean) => void; // ✅ mesmo nome usado no pai
}

/* -------------------- Funções de formatação -------------------- */
const formatCPF = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);

const formatPhone = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d{4})$/, "$1-$2")
    .slice(0, 15);

const formatDate = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .slice(0, 10);

/* -------------------- Funções de validação -------------------- */
const validateCPF = (cpfRaw: string) => {
  const cpf = cpfRaw.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
};

const validateBirthDate = (birthRaw: string) => {
  const [d, m, y] = birthRaw.split("/").map(Number);
  if (!d || !m || !y) return { valid: false, reason: "Data incompleta" };
  const date = new Date(y, m - 1, d);
  if (
    date.getDate() !== d ||
    date.getMonth() + 1 !== m ||
    date.getFullYear() !== y
  )
    return { valid: false, reason: "Data inválida" };

  const today = new Date();
  const age =
    today.getFullYear() -
    y -
    (today.getMonth() + 1 < m ||
    (today.getMonth() + 1 === m && today.getDate() < d)
      ? 1
      : 0);

  if (age < 18) return { valid: false, reason: "Deve ter pelo menos 18 anos" };
  if (age > 120) return { valid: false, reason: "Idade inválida" };
  return { valid: true, reason: "" };
};

const validatePhone = (phoneRaw: string) => {
  const digits = phoneRaw.replace(/\D/g, "");
  return digits.length === 11;
};

/* -------------------- Componente -------------------- */
export default function ProfileStep({
  formData,
  onUpdate,
  onValidate,
}: ProfileStepProps) {
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [birthError, setBirthError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (!formData.cpf) setCpfError("Informe o CPF");
    else if (!validateCPF(formData.cpf)) setCpfError("CPF inválido");
    else setCpfError(null);

    if (!formData.birthDate) setBirthError("Informe a data de nascimento");
    else {
      const validation = validateBirthDate(formData.birthDate);
      setBirthError(validation.valid ? null : validation.reason);
    }

    if (!formData.phone) setPhoneError("Informe o telefone");
    else if (!validatePhone(formData.phone)) setPhoneError("Telefone inválido");
    else setPhoneError(null);
  }, [formData]);

  const isValid = useMemo(
    () => !cpfError && !birthError && !phoneError,
    [cpfError, birthError, phoneError]
  );

  // ✅ Notifica o pai sempre que mudar
  useEffect(() => {
    onValidate?.(isValid);
  }, [isValid, onValidate]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Perfil</h2>
        <p className={styles.subtitle}>
          Preencha as informações básicas do seu perfil
        </p>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          CPF:
          <input
            type="text"
            value={formData.cpf || ""}
            onChange={(e) => onUpdate({ cpf: formatCPF(e.target.value) })}
            placeholder="000.000.000-00"
            maxLength={14}
            className={styles.input}
            aria-invalid={!!cpfError}
          />
          {cpfError && <small className={styles.error}>{cpfError}</small>}
        </label>

        <label className={styles.label}>
          Data de nascimento:
          <input
            type="text"
            value={formData.birthDate || ""}
            onChange={(e) =>
              onUpdate({ birthDate: formatDate(e.target.value) })
            }
            placeholder="dd/mm/aaaa"
            maxLength={10}
            className={styles.input}
            aria-invalid={!!birthError}
          />
          {birthError && <small className={styles.error}>{birthError}</small>}
        </label>

        <label className={styles.label}>
          Telefone de contato:
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => onUpdate({ phone: formatPhone(e.target.value) })}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className={styles.input}
            aria-invalid={!!phoneError}
          />
          {phoneError && <small className={styles.error}>{phoneError}</small>}
        </label>

        {!isValid && (
          <p style={{ color: "orange", margin: 0 }}>
            ⚠ Preencha corretamente as informações
          </p>
        )}
      </div>
    </div>
  );
}
