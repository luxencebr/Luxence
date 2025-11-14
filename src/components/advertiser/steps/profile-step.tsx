"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./profile-step.module.css";
import Dropdown from "@/components/ui/Dropdown/Dropdown";

interface ProfileStepProps {
  formData: any;
  onUpdate: (data: any) => void;
  onValidate?: (isValid: boolean) => void;
}

/* -------------------- Formatação -------------------- */
const formatCPF = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);

// Detecta automaticamente se é CPF ou Passaporte
const formatDocument = (value: string) => {
  // Caso comece com uma letra → é passaporte
  if (/^[A-Za-z]/.test(value)) {
    return value
      .toUpperCase()
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 9);
  }

  // Caso comece com número → CPF
  return formatCPF(value);
};

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

/* -------------------- Validações -------------------- */
const validateCPF = (cpfRaw: string) => {
  const cpf = cpfRaw.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto >= 10) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto >= 10) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
};

// Validação unificada
const validateDocument = (doc: string) => {
  const raw = doc.replace(/\W/g, "");

  // Passaporte → começa com letra
  if (/^[A-Za-z]/.test(raw)) {
    const valid = /^[A-Za-z][0-9]{7,8}$/.test(raw);
    return valid
      ? { valid: true, reason: "" }
      : { valid: false, reason: "Passaporte inválido" };
  }

  // CPF → começa com número
  if (!validateCPF(doc)) return { valid: false, reason: "CPF inválido" };

  return { valid: true, reason: "" };
};

const validateBirthday = (birthRaw: string) => {
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

const validateNationality = (value: string) => {
  if (!value.trim()) return { valid: false, reason: "Informe a nacionalidade" };
  if (value.length < 3)
    return { valid: false, reason: "Informe uma nacionalidade válida" };
  return { valid: true, reason: "" };
};

/* -------------------- Componente -------------------- */
export default function ProfileStep({
  formData,
  onUpdate,
  onValidate,
}: ProfileStepProps) {
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [birthError, setBirthError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [nationalityError, setNationalityError] = useState<string | null>(null);

  const [countries, setCountries] = useState<string[]>([]);

  /* ----- Carregar Países ----- */
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/paises/"
        );
        const data = await res.json();

        const list = data
          .map((item: any) => item.nome?.abreviado)
          .filter(Boolean)
          .sort((a: string, b: string) => a.localeCompare(b));

        setCountries(list);
      } catch (err) {
        console.error("Erro ao carregar países", err);
      }
    };

    loadCountries();
  }, []);

  /* ----- Validações ----- */
  useEffect(() => {
    // DOCUMENTO
    if (!formData.document) setDocumentError("Informe o documento");
    else {
      const validation = validateDocument(formData.document);
      setDocumentError(validation.valid ? null : validation.reason);
    }

    // BIRTHDAY
    if (!formData.birthday) setBirthError("Informe a data de nascimento");
    else {
      const validation = validateBirthday(formData.birthday);
      setBirthError(validation.valid ? null : validation.reason);
    }

    // NATIONALITY
    if (!formData.nationality) setNationalityError("Informe a nacionalidade");
    else {
      const validation = validateNationality(formData.nationality);
      setNationalityError(validation.valid ? null : validation.reason);
    }

    // PHONE
    if (!formData.phone) setPhoneError("Informe o telefone");
    else if (!validatePhone(formData.phone)) setPhoneError("Telefone inválido");
    else setPhoneError(null);
  }, [
    formData.document,
    formData.birthday,
    formData.nationality,
    formData.phone,
  ]);

  /* ----- isValid ----- */
  const isValid = useMemo(
    () => !documentError && !birthError && !phoneError && !nationalityError,
    [documentError, birthError, phoneError, nationalityError]
  );

  useEffect(() => {
    onValidate?.(isValid);
  }, [isValid]);

  /* -------------------- Render -------------------- */
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
          Data de nascimento:
          <input
            type="text"
            value={formData.birthday || ""}
            onChange={(e) => onUpdate({ birthday: formatDate(e.target.value) })}
            placeholder="dd/mm/aaaa"
            maxLength={10}
            className={styles.input}
            aria-invalid={!!birthError}
          />
          {birthError && <small className={styles.error}>{birthError}</small>}
        </label>

        <label className={styles.label}>
          Nacionalidade:
          <Dropdown
            trigger={formData.nationality || "Selecione a nacionalidade"}
            triggerClassName={styles.trigger}
            menuClassName={styles.menu}
          >
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => {
                  onUpdate({ nationality: country });
                }}
                className={styles.dropdownItem}
              >
                {country}
              </button>
            ))}
          </Dropdown>
          {nationalityError && (
            <small className={styles.error}>{nationalityError}</small>
          )}
        </label>

        <label className={styles.label}>
          Documento (CPF ou Passaporte):
          <input
            type="text"
            value={formData.document || ""}
            onChange={(e) =>
              onUpdate({ document: formatDocument(e.target.value) })
            }
            placeholder="CPF ou Passaporte"
            maxLength={14}
            className={styles.input}
            aria-invalid={!!documentError}
          />
          {documentError && (
            <small className={styles.error}>{documentError}</small>
          )}
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
      </div>
    </div>
  );
}
