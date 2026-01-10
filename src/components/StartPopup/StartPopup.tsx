"use client";

import type React from "react";
import { useEffect } from "react";
import styles from "./StartPopup.module.css";

interface StartPopupProps {
  onConfirmAge: () => void;
  onExitSite: () => void;
}

const StartPopup: React.FC<StartPopupProps> = ({
  onConfirmAge,
  onExitSite,
}) => {
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
            onClick={onConfirmAge}
          >
            Sou maior, entrar!
          </button>
          <button
            className={`${styles.button} ${styles.exit}`}
            onClick={onExitSite}
          >
            Não sou maior, sair.
          </button>
        </div>
        <div className={styles.footer}>
          &copy; {new Date().getFullYear()} Luxence. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default StartPopup;
