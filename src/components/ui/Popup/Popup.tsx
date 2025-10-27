"use client";

import { useEffect, useRef, ReactNode } from "react";
import styles from "./Popup.module.css";

interface PopupProps {
  trigger: ReactNode;
  children: ReactNode;
  triggerClass?: string;
  popupClass?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Popup({
  trigger,
  children,
  triggerClass,
  popupClass,
  isOpen,
  onOpenChange,
}: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  return (
    <>
      <div
        onClick={() => onOpenChange(!isOpen)}
        className={`${styles.trigger} ${triggerClass || ""}`}
      >
        {trigger}
      </div>

      {isOpen && (
        <div className={styles.backdrop}>
          <div ref={popupRef} className={`${styles.popup} ${popupClass || ""}`}>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
