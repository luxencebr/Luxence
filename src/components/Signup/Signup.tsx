"use client";

import { useEffect, useState } from "react";
import styles from "./Signup.module.css";

import { FaMars, FaVenus, FaTransgender } from "react-icons/fa6";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

import Popup from "@/components/ui/Popup/Popup";
import register from "./register";

export default function SignupPage() {
  const [isOpen, setIsOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [role, setRole] = useState<"CLIENT" | "ADVERTISER" | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const isFormDisabled = isLoading || success !== "";

  return (
    <Popup
      trigger={"Cadastre-se"}
      triggerClass={styles.trigger}
      popupClass={styles.popup}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className={styles.formContent}>
        <div className={styles.formHeader}>
          <h1>Cadastre-se</h1>
          <button
            onClick={() => setIsOpen(false)}
            className={styles.closeButton}
          >
            <IoClose />
          </button>
        </div>

        <form
          onSubmit={(e) =>
            register(e, {
              setErrors,
              setSuccess,
              setIsLoading,
              role: role as "CLIENT" | "ADVERTISER",
            })
          }
          className={`${styles.form} ${isFormDisabled ? styles.disabled : ""}`}
          aria-busy={isLoading}
        >
          <div className={styles.fieldsets}>
            <fieldset>
              <label htmlFor="name">
                Nome:
                <input
                  name="name"
                  id="name"
                  type="text"
                  placeholder="Seu nome..."
                />
              </label>

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

              <label htmlFor="confirmPassword">
                Confirmar senha:
                <div className={styles.passwordWrapper}>
                  <input
                    name="confirmPassword"
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme a senha..."
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
            </fieldset>
            <fieldset>
              <h2>
                Para melhorar a <br /> sua experiência!
              </h2>
              <span>Qual seu gênero?</span>
              <div className={styles.genderGroup}>
                <label>
                  <input type="radio" name="gender" value="MALE" />
                  <span>
                    <i>
                      <FaMars />
                    </i>
                    Homem
                  </span>
                </label>
                <label>
                  <input type="radio" name="gender" value="FEMALE" />
                  <span>
                    <i>
                      <FaVenus />
                    </i>
                    Mulher
                  </span>
                </label>
                <label>
                  <input type="radio" name="gender" value="FEMALETRANS" />
                  <span>
                    <i>
                      <FaTransgender />
                    </i>
                    Trans
                  </span>
                </label>
              </div>
              <span>E seus interesses?</span>
              <div className={styles.genderGroup}>
                <label>
                  <input type="checkbox" name="genderPreffer" value="MALE" />
                  <span>
                    <i>
                      <FaMars />
                    </i>
                    Homem
                  </span>
                </label>
                <label>
                  <input type="checkbox" name="genderPreffer" value="FEMALE" />
                  <span>
                    <i>
                      <FaVenus />
                    </i>
                    Mulher
                  </span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="genderPreffer"
                    value="FEMALETRANS"
                  />
                  <span>
                    <i>
                      <FaTransgender />
                    </i>
                    Trans
                  </span>
                </label>
              </div>
            </fieldset>
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              name="role"
              value="ADVERTISER"
              className={styles.advertiser}
              data-action="advertiser"
              disabled={isLoading}
              onClick={() => setRole("ADVERTISER")}
            >
              {isLoading && role === "ADVERTISER" ? (
                <span className={styles.spinner}></span>
              ) : (
                "Sou Anunciante"
              )}
            </button>

            <button
              type="submit"
              name="role"
              value="CLIENT"
              className={styles.client}
              data-action="client"
              disabled={isLoading}
              onClick={() => setRole("CLIENT")}
            >
              {isLoading && role === "CLIENT" ? (
                <span className={styles.spinner}></span>
              ) : (
                "Sou Cliente"
              )}
            </button>
          </div>
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
      <div className={styles.errors}>
        {errors.general && <p className={styles.error}>{errors.general}</p>}

        {errors.name && <p className={styles.error}>{errors.name}</p>}

        {errors.email && <p className={styles.error}>{errors.email}</p>}

        {errors.password && <p className={styles.error}>{errors.password}</p>}

        {errors.confirmPassword && (
          <p className={styles.error}>{errors.confirmPassword}</p>
        )}

        {errors.gender && <p className={styles.error}>{errors.gender}</p>}

        {errors.preferences && (
          <p className={styles.error}>{errors.preferences}</p>
        )}
      </div>
    </Popup>
  );
}
