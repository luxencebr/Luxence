"use client";

import { useEffect, useState } from "react";
import Popup from "../ui/Popup/Popup";
import LogIn from "../LogIn/LogIn";
import SignupPage from "../Signup/Signup";

import styles from "./AuthRequiredPopup.module.css";
import { IoClose } from "react-icons/io5";

interface AuthRequiredPopupProps {
  active: boolean;
  onActiveChange?: (value: boolean) => void;
}

export default function AuthRequiredPopup({
  active,
  onActiveChange,
}: AuthRequiredPopupProps) {
  const [isOpen, setIsOpen] = useState(active);

  // sincroniza quando o pai mudar
  useEffect(() => {
    setIsOpen(active);
  }, [active]);

  // fallback → sempre que abrir/fechar, avisa o pai
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onActiveChange?.(open);
  };

  return (
    <Popup
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      popupClass={styles.menu}
      trigger={<></>}
    >
      <div className={styles.header}>
        <div className={styles.left}>
          <h1 className={styles.title}>Quase lá...</h1>
        </div>
        <button
          onClick={() => handleOpenChange(false)}
          className={styles.closeButton}
        >
          <IoClose />
        </button>
      </div>
      <div className={styles.content}>
        <p className={styles.text}>
          Para usar este recurso, basta conectar em sua conta ou realizar seu
          cadastro em minutos. Assim você desbloqueia todas as funcionalidades
          da Luxence.
        </p>
      </div>
      <div className={styles.footer}>
        <div className={styles.options}>
          <div>
            <SignupPage />
          </div>
          <div>
            <LogIn />
          </div>
        </div>
      </div>
    </Popup>
  );
}
