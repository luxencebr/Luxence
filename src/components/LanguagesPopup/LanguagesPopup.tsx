import { useEffect, useState } from "react";

import styles from "./LanguagesPopup.module.css";
import { IoIosArrowDown, IoIosClose } from "react-icons/io";

import Popup from "../ui/Popup/Popup";

export default function LanguagesPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("br");

  const languages = [
    { code: "br", country: "Brasil", label: "Português" },
    { code: "us", country: "United States", label: "English" },
    { code: "es", country: "España", label: "Español" },
  ];

  const currentLang = languages.find((lang) => lang.code === selectedLang);

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
      trigger={
        <>
          <img
            src={`/flags/${currentLang?.code}.svg`}
            alt={currentLang?.label}
            className={styles.flagProp}
          />
          <IoIosArrowDown />
        </>
      }
      triggerClass={styles.trigger}
      popupClass={styles.popup}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className={styles.popupHeader}>
        <span>Região e Linguagem</span>{" "}
        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
          <IoIosClose />
        </button>
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`${styles.languageOption} ${
            lang.code === selectedLang ? styles.activeLang : ""
          }`}
          onClick={() => {
            setSelectedLang(lang.code);
            setIsOpen(false);
          }}
        >
          <img
            src={`/flags/${lang.code}.svg`}
            alt={lang.label}
            className={styles.flagProp}
          />
          <div className={styles.langLabel}>
            <strong>{lang.country}</strong>
            {lang.label}
          </div>
        </button>
      ))}
    </Popup>
  );
}
