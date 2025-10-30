import { useState } from "react";

import styles from "./LogIn.module.css";
import { IoClose } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Popup from "../ui/Popup/Popup";

import connector from "./connector";

export default function LogIn() {
  const [isOpen, setIsOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const isFormDisabled = isLoading || success !== "";

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
          onSubmit={connector}
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
            Conectar-se
          </button>
        </form>
      </div>
    </Popup>
  );
}
