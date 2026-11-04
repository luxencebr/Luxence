import { useEffect, useState } from "react";

import styles from "./LanguagesPopup.module.css";
import { IoIosArrowDown, IoIosClose } from "react-icons/io";

import Popup from "../ui/Popup/Popup";
import { useSiteLocale, type SiteLocale } from "@/lib/site-locale";

export default function LanguagesPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale } = useSiteLocale();

  const languages = [
    { code: "pt" as SiteLocale, flag: "br", country: "Brasil", label: "Português" },
    { code: "en" as SiteLocale, flag: "us", country: "United States", label: "English" },
    { code: "es" as SiteLocale, flag: "es", country: "España", label: "Español" },
  ];

  const currentLang = languages.find((lang) => lang.code === locale);

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
            src={`/flags/${currentLang?.flag}.svg`}
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
        <span>{{ pt: "Idioma", en: "Language", es: "Idioma" }[locale]}</span>{" "}
        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
          <IoIosClose />
        </button>
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`${styles.languageOption} ${
            lang.code === locale ? styles.activeLang : ""
          }`}
          onClick={() => {
            setLocale(lang.code);
            setIsOpen(false);
          }}
        >
          <img
            src={`/flags/${lang.flag}.svg`}
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
