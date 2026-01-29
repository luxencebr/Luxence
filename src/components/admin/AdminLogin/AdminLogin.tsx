"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./AdminLogin.module.css";

interface AdminLoginProps {
  onLoginSuccess?: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const isFormDisabled = isLoading || success !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccess("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    if (!email || !password) {
      setErrors({ form: "Preencha com suas credenciais." });
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        const friendlyError =
          res.error.toLowerCase().includes("credentials") ||
          res.error.toLowerCase().includes("invalid")
            ? "Dados inválidos. Verifique seu email e senha."
            : res.error;

        setErrors({ form: friendlyError });
      } else {
        // Verificar se o usuário logado tem role ADMIN
        const sessionCheck = await fetch("/api/admin/auth/session");

        if (sessionCheck.ok) {
          setSuccess("Login realizado com sucesso!");
          setTimeout(() => {
            if (onLoginSuccess) {
              onLoginSuccess();
            }
          }, 1500);
        } else {
          setErrors({
            form: "Acesso negado. Apenas administradores podem acessar esta área.",
          });
        }
      }
    } catch (error) {
      setErrors({ form: "Erro de conexão. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.popup}>
        {success ? (
          <div className={styles.successContainer}>
            <svg
              className={styles.checkmark}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className={styles.checkmarkCircle}
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className={styles.checkmarkCheck}
                fill="none"
                d="M14 27l7 7 16-16"
              />
            </svg>
            <p>{success}</p>
          </div>
        ) : (
          <div className={styles.formContent}>
            <div className={styles.formHeader}>
              <h1>Administração</h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`${styles.form} ${
                isFormDisabled ? styles.disabled : ""
              }`}
              aria-busy={isLoading}
            >
              <label htmlFor="email">
                Email:
                <input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="Seu email..."
                  onChange={() => setErrors({})}
                  required
                />
              </label>

              <label htmlFor="password">
                Senha:
                <div className={styles.passwordWrapper}>
                  <input
                    name="password"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha..."
                    onChange={() => setErrors({})}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.showPasswordBtn}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </label>

              <button type="submit" className={styles.submit}>
                {isLoading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  "Conecte-se"
                )}
              </button>
            </form>

            {errors.form && <p className={styles.error}>{errors.form}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
