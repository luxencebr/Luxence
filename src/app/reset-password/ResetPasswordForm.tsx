"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token inválido ou expirado.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao redefinir senha");
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir senha");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
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
            <h2>Senha redefinida!</h2>
            <p>Você será redirecionado para a página inicial...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Redefinir senha</h1>
        <p className={styles.description}>Digite sua nova senha abaixo.</p>

        <form
          onSubmit={handleSubmit}
          className={`${styles.form} ${isLoading ? styles.disabled : ""}`}
        >
          <label htmlFor="password">
            Nova senha:
            <div className={styles.passwordWrapper}>
              <input
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua nova senha..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                minLength={6}
                required
                disabled={!token}
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

          <label htmlFor="confirmPassword">
            Confirmar senha:
            <div className={styles.passwordWrapper}>
              <input
                name="confirmPassword"
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme sua senha..."
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                minLength={6}
                required
                disabled={!token}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.showPasswordBtn}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </label>

          <button type="submit" className={styles.submit} disabled={!token}>
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              "Redefinir senha"
            )}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
