import { useEffect, useState, useRef } from "react";

import styles from "./LogIn.module.css";
import { IoClose } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Popup from "../ui/Popup/Popup";
import action from "./action";

export default function LogIn() {
  const [isOpen, setIsOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const isFormDisabled = isLoading || success !== "";

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setSuccess("");
      setIsLoading(false);
      setShowPassword(false);
      formRef.current?.reset();
    }
  }, [isOpen]);

  return (
    <Popup
      trigger={"Conecte-se"}
      triggerClass={styles.trigger}
      popupClass={styles.popup}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
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
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            await action({ formData, setErrors, setSuccess, setIsLoading });
          }}
          className={`${styles.form} ${isFormDisabled ? styles.disabled : ""}`}
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

          <a href="" className={styles.helpLink}>
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
    </Popup>
  );
}
