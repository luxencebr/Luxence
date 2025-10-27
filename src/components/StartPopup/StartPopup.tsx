"use client";

import React, { useEffect, useState } from "react";
import styles from "./StartPopup.module.css";

interface StartPopupProps {
  onConfirmAge: () => void;
  onExitSite: () => void;
}

const StartPopup: React.FC<StartPopupProps> = ({
  onConfirmAge,
  onExitSite,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleConfirmAge = () => {
    sessionStorage.setItem("ageConfirmed", "true");
    setIsVisible(false);
    onConfirmAge();
  };

  const handleExitSite = () => {
    setIsVisible(false);
    onExitSite();
  };

  if (!isVisible) {
    return null;
  }

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <img src="/ExenceLogo.svg" alt="Logo" className={styles.logo} />
        <h2 className={styles.title}>Este é um site adulto!</h2>
        <p className={styles.text}>
          Este site é voltado para o público <span>adulto</span> e pode conter
          imagens de <span>nudez</span> ou <span>conteúdo sensual</span>. Ao
          continuar, você confirma ter <span>18 anos</span> ou mais (ou a
          maioridade legal em seu país) e <span>concorda</span> em acessar esse
          tipo de material.
        </p>
        <div className={styles.buttons}>
          <button
            className={`${styles.button} ${styles.enter}`}
            onClick={handleConfirmAge}
          >
            Sou maior, entrar!
          </button>
          <button
            className={`${styles.button} ${styles.exit}`}
            onClick={handleExitSite}
          >
            Não sou maior, sair.
          </button>
        </div>
        <div className={styles.footer}>
          &copy; {new Date().getFullYear()} Exence. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default StartPopup;
