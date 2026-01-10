"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";

import styles from "./LogIn.module.css";
import { IoClose, IoArrowBack } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Popup from "../ui/Popup/Popup";
import action from "./action";

type PopupView = "login" | "forgot-password";

export default function LogIn() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<PopupView>("login");

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const isFormDisabled = isLoading || success !== "";

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const forgotFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setSuccess("");
      setIsLoading(false);
      setShowPassword(false);
      setCurrentView("login");
      setForgotEmail("");
      setForgotError("");
      setForgotSuccess(false);
      setForgotLoading(false);
      formRef.current?.reset();
      forgotFormRef.current?.reset();
    }
  }, [isOpen]);

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentView("forgot-password");
  };

  const handleBackToLogin = () => {
    setCurrentView("login");
    setForgotEmail("");
    setForgotError("");
    setForgotSuccess(false);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!res.ok) {
        throw new Error("Erro ao enviar email");
      }

      setForgotSuccess(true);
    } catch {
      setForgotError("Ocorreu um erro. Tente novamente mais tarde.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Popup
      trigger={"Conecte-se"}
      triggerClass={styles.trigger}
      popupClass={styles.popup}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      {currentView === "login" ? (
        <>
          <div className={styles.formContent}>
            <div className={styles.formHeader}>
              <h1>Conecte-se</h1>
              <button
                onClick={() => setIsOpen(false)}
                className={styles.closeButton}
              >
                <IoClose />
              </button>
            </div>

            <form
              ref={formRef}
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await action({ formData, setErrors, setSuccess, setIsLoading });
              }}
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

              <a
                href="#"
                onClick={handleForgotPassword}
                className={styles.helpLink}
              >
                Esqueceu a senha?
              </a>

              <button type="submit" className={styles.submit}>
                {isLoading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  "Conecte-se"
                )}
              </button>
            </form>
          </div>
          {success && (
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
          )}
          {errors.form && <p className={styles.error}>{errors.form}</p>}
        </>
      ) : (
        <>
          {forgotSuccess ? (
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
              <p>Email enviado!</p>
              <span className={styles.successMessage}>
                Se o email existir em nossa base, você receberá um link para
                redefinir sua senha.
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className={styles.submit}
              >
                Fechar
              </button>
            </div>
          ) : (
            <div className={styles.formContent}>
              <div className={styles.formHeader}>
                <div className={styles.left}>
                  <button
                    onClick={handleBackToLogin}
                    className={styles.backButton}
                  >
                    <IoArrowBack />
                  </button>
                  <h1>Recuperar senha</h1>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={styles.closeButton}
                >
                  <IoClose />
                </button>
              </div>

              <p className={styles.description}>
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>

              <form
                ref={forgotFormRef}
                onSubmit={handleForgotSubmit}
                className={`${styles.form} ${
                  forgotLoading ? styles.disabled : ""
                }`}
              >
                <label htmlFor="forgot-email">
                  Email:
                  <input
                    name="email"
                    id="forgot-email"
                    type="email"
                    placeholder="Seu email..."
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setForgotError("");
                    }}
                    required
                  />
                </label>

                <button type="submit" className={styles.submit}>
                  {forgotLoading ? (
                    <span className={styles.spinner}></span>
                  ) : (
                    "Enviar link"
                  )}
                </button>
              </form>

              {forgotError && <p className={styles.error}>{forgotError}</p>}
            </div>
          )}
        </>
      )}
    </Popup>
  );
}
