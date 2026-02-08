"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import styles from "./account-step.module.css";
import { FaMars, FaVenus, FaTransgender, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

interface AccountStepProps {
  formData: any;
  onUpdate: (data: any) => void;
  onValidate?: (isValid: boolean) => void;
}

function PasswordRequirements({ password }: { password: string }) {
  const requirements = useMemo(
    () => [
      {
        label: "Deve conter ao menos 8 caracteres.",
        met: password.length >= 8,
      },
      {
        label: "Deve conter ao menos UMA maiúscula.",
        met: /[A-Z]/.test(password),
      },
      {
        label: "Deve conter ao menos UMA minúscula.",
        met: /[a-z]/.test(password),
      },
      { label: "Deve conter ao menos UM número.", met: /\d/.test(password) },
      {
        label: "Deve conter ao menos UM símbolo.",
        met: /[\W_]/.test(password),
      },
    ],
    [password],
  );

  const unmetRequirements = requirements.filter((req) => !req.met);

  if (!password || unmetRequirements.length === 0) return null;

  return (
    <div className={styles.passwordRequirements}>
      {unmetRequirements.map((req, index) => (
        <div
          key={index}
          className={`${styles.requirement} ${styles.requirementUnmet}`}
        >
          <FaTimes />
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
}

const validateEmail = (email: string) => {
  if (!email) return { valid: false, reason: "Informe o email" };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { valid: false, reason: "Email inválido" };
  return { valid: true, reason: "" };
};

const validatePassword = (password: string) => {
  if (!password) return { valid: false, reason: "Informe a senha" };
  if (password.length < 8) return { valid: false, reason: "Senha deve ter ao menos 8 caracteres" };
  if (!/[A-Z]/.test(password)) return { valid: false, reason: "Senha deve conter ao menos uma maiúscula" };
  if (!/[a-z]/.test(password)) return { valid: false, reason: "Senha deve conter ao menos uma minúscula" };
  if (!/\d/.test(password)) return { valid: false, reason: "Senha deve conter ao menos um número" };
  if (!/[\W_]/.test(password)) return { valid: false, reason: "Senha deve conter ao menos um símbolo" };
  return { valid: true, reason: "" };
};

const validateName = (name: string) => {
  if (!name) return { valid: false, reason: "Informe o nome" };
  if (name.length < 3) return { valid: false, reason: "Nome deve ter ao menos 3 caracteres" };
  return { valid: true, reason: "" };
};

export default function AccountStep({
  formData,
  onUpdate,
  onValidate,
}: AccountStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [emailChecking, setEmailChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [genderError, setGenderError] = useState<string | null>(null);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const checkEmailExists = useCallback(async (email: string) => {
    const validation = validateEmail(email);
    if (!validation.valid) return;

    setEmailChecking(true);
    try {
      const res = await fetch(
        `/api/register/check-email?email=${encodeURIComponent(email)}`,
      );
      const data = await res.json();
      setEmailExists(data.exists);
      if (data.exists) {
        setEmailError("Este email já está cadastrado");
      }
    } catch (err) {
      console.error("Erro ao verificar email", err);
    } finally {
      setEmailChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!formData.email) return;

    const validation = validateEmail(formData.email);
    if (!validation.valid) return;

    const timer = setTimeout(() => {
      checkEmailExists(formData.email);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, checkEmailExists]);

  useEffect(() => {
    // NAME
    if (!formData.name) {
      setNameError(touched.name ? "Informe o nome" : null);
    } else {
      const validation = validateName(formData.name);
      setNameError(validation.valid ? null : validation.reason);
    }

    // EMAIL
    if (!formData.email) {
      setEmailError(touched.email ? "Informe o email" : null);
    } else {
      const validation = validateEmail(formData.email);
      if (!validation.valid) {
        setEmailError(validation.reason);
      } else if (!emailExists && !emailChecking) {
        setEmailError(null);
      }
    }

    // PASSWORD
    if (!formData.password) {
      setPasswordError(touched.password ? "Informe a senha" : null);
    } else {
      const validation = validatePassword(formData.password);
      setPasswordError(validation.valid ? null : validation.reason);
    }

    // CONFIRM PASSWORD
    if (!formData.confirmPassword) {
      setConfirmPasswordError(touched.confirmPassword ? "Confirme a senha" : null);
    } else if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("As senhas não coincidem");
    } else {
      setConfirmPasswordError(null);
    }

    // GENDER
    if (!formData.gender) {
      setGenderError(touched.gender ? "Selecione o gênero" : null);
    } else {
      setGenderError(null);
    }

    // PREFERENCES
    if (!formData.preferences || formData.preferences.length === 0) {
      setPreferencesError(touched.preferences ? "Selecione ao menos um interesse" : null);
    } else {
      setPreferencesError(null);
    }
  }, [
    formData.name,
    formData.email,
    formData.password,
    formData.confirmPassword,
    formData.gender,
    formData.preferences,
    touched,
    emailExists,
    emailChecking,
  ]);

  const isValid = useMemo(() => {
    const nameValidation = validateName(formData.name || "");
    const emailValidation = validateEmail(formData.email || "");
    const passwordValidation = validatePassword(formData.password || "");
    const confirmPasswordValid = formData.password === formData.confirmPassword && formData.confirmPassword;
    const genderValid = !!formData.gender;
    const preferencesValid = formData.preferences && formData.preferences.length > 0;

    return (
      nameValidation.valid &&
      emailValidation.valid &&
      !emailExists &&
      !emailChecking &&
      passwordValidation.valid &&
      confirmPasswordValid &&
      genderValid &&
      preferencesValid
    );
  }, [formData, emailExists, emailChecking]);

  const lastIsValid = useRef<boolean | null>(null);

  useEffect(() => {
    if (lastIsValid.current === isValid) return;
    lastIsValid.current = isValid;
    onValidate?.(isValid);
  }, [isValid, onValidate]);

  const getInputClass = (field: string, error: string | null, value: string) => {
    if (error) return styles.inputError;
    return "";
  };

  const handlePreferenceToggle = (gender: string) => {
    const current = formData.preferences || [];
    const updated = current.includes(gender)
      ? current.filter((g: string) => g !== gender)
      : [...current, gender];
    onUpdate({ preferences: updated });
    setTouched((prev) => ({ ...prev, preferences: true }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Criar Conta</h2>
        <p>Preencha seus dados para começar a anunciar</p>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Nome completo:
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => onUpdate({ name: e.target.value })}
            onBlur={() => handleBlur("name")}
            placeholder="Seu nome completo..."
            className={getInputClass("name", nameError, formData.name)}
          />
          {nameError && touched.name && (
            <small className={styles.error}>{nameError}</small>
          )}
        </label>

        <label className={styles.label}>
          Email:
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) => onUpdate({ email: e.target.value })}
            onBlur={() => handleBlur("email")}
            placeholder="seu@email.com"
            className={getInputClass("email", emailError, formData.email)}
          />
          {emailChecking && (
            <small className={styles.loading}>
              <span className={styles.spinner}></span>
              Verificando email...
            </small>
          )}
          {emailError && !emailChecking && touched.email && (
            <small className={styles.error}>{emailError}</small>
          )}
        </label>

        <label className={styles.label}>
          Senha:
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password || ""}
              onChange={(e) => onUpdate({ password: e.target.value })}
              onBlur={() => handleBlur("password")}
              placeholder="Sua senha..."
              className={getInputClass("password", passwordError, formData.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.showPasswordBtn}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          <PasswordRequirements password={formData.password || ""} />
          {passwordError && touched.password && (
            <small className={styles.error}>{passwordError}</small>
          )}
        </label>

        <label className={styles.label}>
          Confirmar senha:
          <div className={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword || ""}
              onChange={(e) => onUpdate({ confirmPassword: e.target.value })}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Confirme a senha..."
              className={getInputClass("confirmPassword", confirmPasswordError, formData.confirmPassword)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.showPasswordBtn}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {confirmPasswordError && touched.confirmPassword && (
            <small className={styles.error}>{confirmPasswordError}</small>
          )}
        </label>

        <div className={styles.genderSection}>
          <span className={styles.sectionTitle}>Qual seu gênero?</span>
          <div className={styles.genderGroup}>
            <label className={formData.gender === "MALE" ? styles.selected : ""}>
              <input
                type="radio"
                name="gender"
                value="MALE"
                checked={formData.gender === "MALE"}
                onChange={(e) => {
                  onUpdate({ gender: e.target.value });
                  handleBlur("gender");
                }}
              />
              <span>
                <i><FaMars /></i>
                Homem
              </span>
            </label>
            <label className={formData.gender === "FEMALE" ? styles.selected : ""}>
              <input
                type="radio"
                name="gender"
                value="FEMALE"
                checked={formData.gender === "FEMALE"}
                onChange={(e) => {
                  onUpdate({ gender: e.target.value });
                  handleBlur("gender");
                }}
              />
              <span>
                <i><FaVenus /></i>
                Mulher
              </span>
            </label>
            <label className={formData.gender === "TRANS" ? styles.selected : ""}>
              <input
                type="radio"
                name="gender"
                value="TRANS"
                checked={formData.gender === "TRANS"}
                onChange={(e) => {
                  onUpdate({ gender: e.target.value });
                  handleBlur("gender");
                }}
              />
              <span>
                <i><FaTransgender /></i>
                Trans
              </span>
            </label>
          </div>
          {genderError && touched.gender && (
            <small className={styles.error}>{genderError}</small>
          )}
        </div>

        <div className={styles.genderSection}>
          <span className={styles.sectionTitle}>E seus interesses?</span>
          <div className={styles.genderGroup}>
            <label className={(formData.preferences || []).includes("MALE") ? styles.selected : ""}>
              <input
                type="checkbox"
                value="MALE"
                checked={(formData.preferences || []).includes("MALE")}
                onChange={() => handlePreferenceToggle("MALE")}
              />
              <span>
                <i><FaMars /></i>
                Homem
              </span>
            </label>
            <label className={(formData.preferences || []).includes("FEMALE") ? styles.selected : ""}>
              <input
                type="checkbox"
                value="FEMALE"
                checked={(formData.preferences || []).includes("FEMALE")}
                onChange={() => handlePreferenceToggle("FEMALE")}
              />
              <span>
                <i><FaVenus /></i>
                Mulher
              </span>
            </label>
            <label className={(formData.preferences || []).includes("TRANS") ? styles.selected : ""}>
              <input
                type="checkbox"
                value="TRANS"
                checked={(formData.preferences || []).includes("TRANS")}
                onChange={() => handlePreferenceToggle("TRANS")}
              />
              <span>
                <i><FaTransgender /></i>
                Trans
              </span>
            </label>
          </div>
          {preferencesError && touched.preferences && (
            <small className={styles.error}>{preferencesError}</small>
          )}
        </div>
      </div>
    </div>
  );
}
