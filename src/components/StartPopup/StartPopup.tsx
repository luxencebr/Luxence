"use client";

import type React from "react";
import { useEffect } from "react";
import styles from "./StartPopup.module.css";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";

interface StartPopupProps {
  onConfirmAge: () => void;
  onExitSite: () => void;
}

const StartPopup: React.FC<StartPopupProps> = ({
  onConfirmAge,
  onExitSite,
}) => {
  const { locale } = useSiteLocale();
  const copy = {
    pt: { title: "Este é um site adulto!", text: "Este site é voltado para o público adulto e pode conter imagens de nudez ou conteúdo sensual. Ao continuar, você confirma ter 18 anos ou mais (ou a maioridade legal em seu país) e concorda em acessar esse tipo de material.", enter: "Sou maior, entrar!", exit: "Não sou maior, sair." },
    en: { title: "This is an adult site!", text: "This site is intended for adults and may contain nudity or sensual content. By continuing, you confirm that you are at least 18 years old (or the legal age of majority in your country) and agree to view this type of material.", enter: "I am of legal age, enter!", exit: "I am underage, leave." },
    es: { title: "¡Este es un sitio para adultos!", text: "Este sitio está dirigido a adultos y puede contener desnudez o contenido sensual. Al continuar, confirmas que tienes al menos 18 años (o la mayoría de edad legal en tu país) y aceptas acceder a este tipo de material.", enter: "Soy mayor de edad, entrar", exit: "Soy menor de edad, salir" },
  }[locale];
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <img src="/LuxenceLogo.png" alt="Logo" className={styles.logo} />
        <h2 className={styles.title}>{copy.title}</h2>
        <p className={styles.text}>{copy.text}</p>
        <div className={styles.buttons}>
          <button
            className={`${styles.button} ${styles.enter}`}
            onClick={onConfirmAge}
          >
            {copy.enter}
          </button>
          <button
            className={`${styles.button} ${styles.exit}`}
            onClick={onExitSite}
          >
            {copy.exit}
          </button>
        </div>
        <div className={styles.footer}>
          &copy; {new Date().getFullYear()} Luxence. {uiText(locale, "All rights reserved.")}
        </div>
      </div>
    </div>
  );
};

export default StartPopup;
