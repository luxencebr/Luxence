"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
  for (let i = 0; i < 9; i++) soma += Number.parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto >= 10) resto = 0;
  if (resto !== Number.parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number.parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto >= 10) resto = 0;
  if (resto !== Number.parseInt(cpf[10])) return false;

  return true;
};

const validatePassport = (passport: string) => {
  const raw = passport.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  // Passaporte brasileiro: 2 letras + 6 dígitos
  if (/^[A-Z]{2}\d{6}$/.test(raw)) return true;

  // Formato antigo brasileiro: 1 letra + 6-8 dígitos
  if (/^[A-Z]\d{6,8}$/.test(raw)) return true;

  // Formato internacional genérico: letras e números, 6-9 caracteres
  if (/^[A-Z0-9]{6,9}$/.test(raw) && /[A-Z]/.test(raw)) return true;

  return false;
};

// Validação unificada
const validateDocument = (doc: string) => {
  const raw = doc.replace(/\W/g, "");

  if (!raw) return { valid: false, reason: "Informe o documento" };

  // Passaporte → começa com letra
  if (/^[A-Za-z]/.test(raw)) {
    const valid = validatePassport(raw);
    return valid
      ? { valid: true, reason: "" }
      : {
          valid: false,
          reason: "Passaporte inválido. Use o formato: XX000000 ou A0000000",
        };
  }

  // CPF → começa com número
  if (!validateCPF(doc)) return { valid: false, reason: "CPF inválido" };

  return { valid: true, reason: "" };
};

const validateBirthday = (birthRaw: string) => {
  if (!birthRaw)
    return { valid: false, reason: "Informe a data de nascimento" };

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
  if (!digits) return { valid: false, reason: "Informe o telefone" };
  if (digits.length !== 11)
    return { valid: false, reason: "Telefone deve ter 11 dígitos" };
  return { valid: true, reason: "" };
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

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [documentChecking, setDocumentChecking] = useState(false);
  const [documentExists, setDocumentExists] = useState(false);

  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);

  const [countries, setCountries] = useState<string[]>([]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  /* ----- Carregar Países ----- */
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/paises/",
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

  const checkDocumentExists = useCallback(async (document: string) => {
    const validation = validateDocument(document);
    if (!validation.valid) return;

    setDocumentChecking(true);
    try {
      const res = await fetch(
        `/api/register/check-document?document=${encodeURIComponent(document)}`,
      );
      const data = await res.json();
      setDocumentExists(data.exists);
      if (data.exists) {
        setDocumentError("Este documento já está cadastrado");
      }
    } catch (err) {
      console.error("Erro ao verificar documento", err);
    } finally {
      setDocumentChecking(false);
    }
  }, []);

  const checkPhoneExists = useCallback(async (phone: string) => {
    const validation = validatePhone(phone);
    if (!validation.valid) return;

    setPhoneChecking(true);
    try {
      const res = await fetch(
        `/api/register/check-phone?phone=${encodeURIComponent(phone)}`,
      );
      const data = await res.json();
      setPhoneExists(data.exists);
      if (data.exists) {
        setPhoneError("Este telefone já está cadastrado");
      }
    } catch (err) {
      console.error("Erro ao verificar telefone", err);
    } finally {
      setPhoneChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!formData.document) return;

    const validation = validateDocument(formData.document);
    if (!validation.valid) return;

    const timer = setTimeout(() => {
      checkDocumentExists(formData.document);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.document, checkDocumentExists]);

  useEffect(() => {
    if (!formData.phone) return;

    const validation = validatePhone(formData.phone);
    if (!validation.valid) return;

    const timer = setTimeout(() => {
      checkPhoneExists(formData.phone);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.phone, checkPhoneExists]);

  /* ----- Validações ----- */
  useEffect(() => {
    // DOCUMENTO
    if (!formData.document) {
      setDocumentError(touched.document ? "Informe o documento" : null);
    } else {
      const validation = validateDocument(formData.document);
      if (!validation.valid) {
        setDocumentError(validation.reason);
      } else if (!documentExists && !documentChecking) {
        setDocumentError(null);
      }
    }

    // BIRTHDAY
    if (!formData.birthday) {
      setBirthError(touched.birthday ? "Informe a data de nascimento" : null);
    } else {
      const validation = validateBirthday(formData.birthday);
      setBirthError(validation.valid ? null : validation.reason);
    }

    // NATIONALITY
    if (!formData.nationality) {
      setNationalityError(
        touched.nationality ? "Informe a nacionalidade" : null,
      );
    } else {
      const validation = validateNationality(formData.nationality);
      setNationalityError(validation.valid ? null : validation.reason);
    }

    // PHONE - Adicionada verificação de existência
    if (!formData.phone) {
      setPhoneError(touched.phone ? "Informe o telefone" : null);
    } else {
      const validation = validatePhone(formData.phone);
      if (!validation.valid) {
        setPhoneError(validation.reason);
      } else if (!phoneExists && !phoneChecking) {
        setPhoneError(null);
      }
    }
  }, [
    formData.document,
    formData.birthday,
    formData.nationality,
    formData.phone,
    touched,
    documentExists,
    documentChecking,
    phoneExists,
    phoneChecking,
  ]);

  /* ----- isValid ----- */
  const isValid = useMemo(() => {
    const docValidation = validateDocument(formData.document || "");
    const birthValidation = validateBirthday(formData.birthday || "");
    const phoneValidation = validatePhone(formData.phone || "");
    const natValidation = validateNationality(formData.nationality || "");

    return (
      docValidation.valid &&
      !documentExists &&
      !documentChecking &&
      birthValidation.valid &&
      phoneValidation.valid &&
      !phoneExists &&
      !phoneChecking &&
      natValidation.valid
    );
  }, [formData, documentExists, documentChecking, phoneExists, phoneChecking]);

  const lastIsValid = useRef<boolean | null>(null);

  useEffect(() => {
    if (lastIsValid.current === isValid) return;

    lastIsValid.current = isValid;
    onValidate?.(isValid);
  }, [isValid]);

  const getInputClass = (
    field: string,
    error: string | null,
    value: string,
  ) => {
    if (!touched[field] && !value) return styles.input;
    if (error) return `${styles.input} ${styles.inputError}`;
    if (value && !error) return `${styles.input} ${styles.inputSuccess}`;
    return styles.input;
  };

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
            onBlur={() => handleBlur("birthday")}
            placeholder="dd/mm/aaaa"
            maxLength={10}
            className={getInputClass("birthday", birthError, formData.birthday)}
            aria-invalid={!!birthError}
            aria-describedby={birthError ? "birthday-error" : undefined}
          />
          {birthError && (
            <small id="birthday-error" className={styles.error}>
              {birthError}
            </small>
          )}
        </label>

        <label className={styles.label}>
          Nacionalidade:
          <Dropdown
            trigger={formData.nationality || "Selecione a nacionalidade"}
            selectedValue={formData.nationality || ""}
            triggerClassName={`${styles.trigger} ${
              touched.nationality && nationalityError ? styles.triggerError : ""
            } ${formData.nationality && !nationalityError ? styles.triggerSuccess : ""}`}
            menuClassName={styles.menu}
            searchable={true}
            searchPlaceholder="Buscar país..."
            options={countries}
            onSelect={(value) => {
              onUpdate({ nationality: value });
              setTouched((prev) => ({ ...prev, nationality: true }));
            }}
          >
            {/* Fallback vazio - o Dropdown usará options quando searchable=true */}
            <></>
          </Dropdown>
          {nationalityError && touched.nationality && (
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
            onBlur={() => handleBlur("document")}
            placeholder="CPF ou Passaporte"
            maxLength={14}
            className={getInputClass(
              "document",
              documentError,
              formData.document,
            )}
            aria-invalid={!!documentError}
            aria-describedby={documentError ? "document-error" : undefined}
          />
          {documentChecking && (
            <small className={styles.loading}>
              <span className={styles.spinner}></span>
              Verificando documento...
            </small>
          )}
          {documentError && !documentChecking && (
            <small id="document-error" className={styles.error}>
              {documentError}
            </small>
          )}
        </label>

        <label className={styles.label}>
          Telefone de contato:
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => onUpdate({ phone: formatPhone(e.target.value) })}
            onBlur={() => handleBlur("phone")}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className={getInputClass("phone", phoneError, formData.phone)}
            aria-invalid={!!phoneError}
            aria-describedby={phoneError ? "phone-error" : undefined}
          />
          {phoneChecking && (
            <small className={styles.loading}>
              <span className={styles.spinner}></span>
              Verificando telefone...
            </small>
          )}
          {phoneError && !phoneChecking && (
            <small id="phone-error" className={styles.error}>
              {phoneError}
            </small>
          )}
        </label>
      </div>
    </div>
  );
}
