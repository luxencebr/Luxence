"use client";

import { useEffect, useState } from "react";
import styles from "./Signup.module.css";

import { FaMars, FaVenus, FaTransgender } from "react-icons/fa6";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

import { validator, type SignupData } from "./validator";

import Popup from "@/components/ui/Popup/Popup";

export default function SignupPage() {
  const [isOpen, setIsOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);

  async function signup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const data: SignupData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      gender: formData.get("gender") as string,
      preferences: formData.getAll("genderPreffer") as string[],
    };

    const validationErrors = validator(data);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    setIsLoading(true);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <Popup
      trigger={"Cadastre-se"}
      triggerClass={styles.trigger}
      popupClass={styles.popupClass}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className={styles.formContent}>
        <div className={styles.formHeader}>
          <h1>Faça seu Cadastro</h1>
          <button
            onClick={() => setIsOpen(false)}
            className={styles.closeButton}
          >
            <IoClose />
          </button>
        </div>

        <form onSubmit={signup} className={styles.form}>
          <div className={styles.fieldsets}>
            <fieldset>
              <label htmlFor="name">
                Nome:
                <input
                  name="name"
                  id="name"
                  type="text"
                  placeholder="Seu nome..."
                  required
                />
              </label>

              <label htmlFor="email">
                Email:
                <input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="Seu email..."
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

              <label htmlFor="confirmPassword">
                Confirmar senha:
                <div className={styles.passwordWrapper}>
                  <input
                    name="confirmPassword"
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme a senha..."
                    required
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
              className={styles.advertiser}
              data-action="advertiser"
              disabled={isLoading}
            >
              Sou Anunciante
            </button>
            <button
              type="submit"
              className={styles.client}
              data-action="client"
              disabled={isLoading}
            >
              Sou Cliente
            </button>
          </div>

          {success && <p className={styles.success}>{success}</p>}
        </form>
      </div>

      <div className={styles.errors}>
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
