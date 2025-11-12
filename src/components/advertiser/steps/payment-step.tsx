"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./payment-step.module.css";

interface PaymentStepProps {
  formData: any;
  onUpdate: (data: any) => void;
  onValidate: (isValid: boolean) => void; // 🔹 Adicionado para informar validade ao pai
}

type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

/* ---------- Utilitários ---------- */

// Remove tudo que não for dígito
const onlyDigits = (v: string) => v.replace(/\D/g, "");

// Formata número do cartão (ajusta para Amex 4-6-5 quando detectado)
function formatCardNumber(raw: string, brand: CardBrand = "unknown") {
  const digits = onlyDigits(raw);
  if (brand === "amex") {
    return digits
      .slice(0, 15)
      .replace(/(\d{1,4})(\d{1,6})?(\d{1,5})?/, (m, g1, g2, g3) =>
        [g1, g2, g3].filter(Boolean).join(" ")
      );
  }
  return digits
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

// Detecta bandeira básica por BIN
function detectBrand(numberRaw: string): CardBrand {
  const n = onlyDigits(numberRaw);
  if (/^4/.test(n)) return "visa";
  if (/^(34|37)/.test(n)) return "amex";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "mastercard";
  if (/^(6(?:011|5|4[4-9]|22))/.test(n) || /^64[4-9]/.test(n))
    return "discover";
  return "unknown";
}

// Luhn check
function luhnValidate(numberRaw: string) {
  const digits = onlyDigits(numberRaw);
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return digits.length >= 12 && sum % 10 === 0;
}

// Formata validade MM/AA
const formatExpiry = (value: string) =>
  onlyDigits(value)
    .slice(0, 4)
    .replace(/(\d{2})(\d{1,2})?/, (m, g1, g2) => (g2 ? `${g1}/${g2}` : g1));

// Valida validade (MM/AA) e se não expirou
function validateExpiry(expiryRaw: string) {
  const digits = onlyDigits(expiryRaw);
  if (digits.length !== 4) return { valid: false, reason: "Formato inválido" };
  const month = parseInt(digits.slice(0, 2), 10);
  const year = parseInt(digits.slice(2, 4), 10);
  if (Number.isNaN(month) || month < 1 || month > 12)
    return { valid: false, reason: "Mês inválido" };

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return { valid: false, reason: "Cartão expirado" };
  if (year === currentYear && month < currentMonth)
    return { valid: false, reason: "Cartão expirado" };

  return { valid: true, reason: "" };
}

// CVV validation: default 3, Amex 4
function validateCVV(cvvRaw: string, brand: CardBrand) {
  const digits = onlyDigits(cvvRaw);
  const len = digits.length;
  if (brand === "amex") return len === 4;
  return len === 3;
}

/* ---------- Componente ---------- */

export default function PaymentStep({
  formData,
  onUpdate,
  onValidate,
}: PaymentStepProps) {
  const [brand, setBrand] = useState<CardBrand>(() =>
    detectBrand(formData.cardNumber || "")
  );
  const [cardError, setCardError] = useState<string | null>(null);
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [cvvError, setCvvError] = useState<string | null>(null);

  // Atualiza a bandeira sempre que o número mudar
  useEffect(() => {
    const b = detectBrand(formData.cardNumber || "");
    setBrand(b);
  }, [formData.cardNumber]);

  // Valida tudo sempre que os campos mudam
  useEffect(() => {
    const digits = onlyDigits(formData.cardNumber || "");
    const minLen = brand === "amex" ? 15 : 13;

    if (!digits) setCardError("Informe o número do cartão");
    else if (digits.length < minLen) setCardError("Número incompleto");
    else if (!luhnValidate(formData.cardNumber || ""))
      setCardError("Número inválido (falha na verificação Luhn)");
    else setCardError(null);

    const exp = formData.expiry || "";
    const expFmt = formatExpiry(exp);
    const expValidation = validateExpiry(expFmt);
    if (!onlyDigits(exp).length) setExpiryError("Informe a validade");
    else if (!expValidation.valid) setExpiryError(expValidation.reason);
    else setExpiryError(null);

    if (!formData.cvv) setCvvError("Informe o CVV");
    else if (!validateCVV(formData.cvv, brand))
      setCvvError(
        brand === "amex"
          ? "CVV deve ter 4 dígitos (Amex)"
          : "CVV deve ter 3 dígitos"
      );
    else setCvvError(null);
  }, [formData.cardNumber, formData.expiry, formData.cvv, brand]);

  // Estado geral de validação
  const isValid = useMemo(() => {
    return !cardError && !expiryError && !cvvError && !!formData.cardName;
  }, [cardError, expiryError, cvvError, formData.cardName]);

  // 🔹 Notifica o pai sempre que a validade muda
  useEffect(() => {
    onValidate(isValid);
  }, [isValid, onValidate]);

  // Handlers formatados
  const handleCardNumberChange = (raw: string) => {
    const b = detectBrand(raw);
    const formatted = formatCardNumber(raw, b);
    onUpdate({ cardNumber: formatted });
  };

  const handleExpiryChange = (raw: string) => {
    const formatted = formatExpiry(raw);
    onUpdate({ expiry: formatted });
  };

  const handleCvvChange = (raw: string) => {
    const digits = onlyDigits(raw).slice(0, 4);
    onUpdate({ cvv: digits });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Método de Pagamento</h2>
        <p className={styles.subtitle}>
          Cadastre um cartão para compras e assinaturas futuras
        </p>
      </div>

      <div className={styles.section}>
        {/* Nome no Cartão */}
        <label className={styles.label}>
          Nome impresso no cartão:
          <input
            type="text"
            value={formData.cardName || ""}
            onChange={(e) => onUpdate({ cardName: e.target.value })}
            placeholder="Ex: ARTHUR PIMENTEL"
            className={styles.input}
            aria-invalid={!formData.cardName}
          />
          {!formData.cardName && (
            <small className={styles.error}>Nome no cartão é obrigatório</small>
          )}
        </label>

        {/* Número do Cartão */}
        <label className={styles.label}>
          Número do cartão:
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              inputMode="numeric"
              value={formData.cardNumber || ""}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="0000 0000 0000 0000"
              maxLength={23}
              className={styles.input}
              aria-invalid={!!cardError}
            />
            <div style={{ minWidth: 64, textTransform: "capitalize" }}>
              {brand !== "unknown" ? (
                <span className={styles.brand}>{brand}</span>
              ) : (
                <span className={styles.brandMuted}>—</span>
              )}
            </div>
          </div>
          {cardError && <small className={styles.error}>{cardError}</small>}
        </label>

        <div className={styles.row}>
          {/* Validade */}
          <label className={styles.labelSmall}>
            Validade:
            <input
              type="text"
              inputMode="numeric"
              value={formData.expiry || ""}
              onChange={(e) => handleExpiryChange(e.target.value)}
              placeholder="MM/AA"
              maxLength={5}
              className={styles.input}
              aria-invalid={!!expiryError}
            />
            {expiryError && (
              <small className={styles.error}>{expiryError}</small>
            )}
          </label>

          {/* CVV */}
          <label className={styles.labelSmall}>
            CVV:
            <input
              type="password"
              inputMode="numeric"
              value={formData.cvv || ""}
              onChange={(e) => handleCvvChange(e.target.value)}
              placeholder={brand === "amex" ? "4 dígitos" : "3 dígitos"}
              maxLength={brand === "amex" ? 4 : 3}
              className={styles.input}
              aria-invalid={!!cvvError}
            />
            {cvvError && <small className={styles.error}>{cvvError}</small>}
          </label>
        </div>

        {/* Indicador de validação */}
        {!isValid && (
          <p style={{ color: "orange" }}>
            ⚠ Preencha corretamente as informações
          </p>
        )}
      </div>
    </div>
  );
}
