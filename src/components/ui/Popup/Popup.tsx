"use client";

import { useEffect, ReactNode } from "react";
import styles from "./Popup.module.css";

interface PopupProps {
  trigger: ReactNode;
  children: ReactNode;
  triggerClass?: string;
  popupClass?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  triggerDataField?: string;
  triggerDataIndex?: number;
}

export default function Popup({
  trigger,
  children,
  triggerClass,
  popupClass,
  isOpen,
  onOpenChange,
  triggerDataField,
  triggerDataIndex,
}: PopupProps) {
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  return (
    <>
      <div
        onClick={() => onOpenChange(!isOpen)}
        className={`${styles.trigger} ${triggerClass || ""}`}
        data-field={triggerDataField}
        data-index={triggerDataIndex}
      >
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={styles.backdrop}
          onClick={(e) => {
            // Fecha apenas se clicar diretamente no backdrop
            if (e.target === e.currentTarget) {
              onOpenChange(false);
            }
          }}
        >
          <div className={`${styles.popup} ${popupClass || ""}`}>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
