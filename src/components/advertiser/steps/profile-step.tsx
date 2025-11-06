"use client";

import { useState } from "react";
import Range from "@/components/ui/Range/Range";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import styles from "./profile-step.module.css";

interface ProfileStepProps {
  formData: any;
  onUpdate: (data: any) => void;
}

const nationalities = [
  "Brasileiro(a)",
  "Argentino(a)",
  "Colombiano(a)",
  "Chileno(a)",
  "Uruguaio(a)",
];

const languageOptions = [
  "Português",
  "Inglês",
  "Espanhol",
  "Francês",
  "Italiano",
];

export default function ProfileStep({ formData, onUpdate }: ProfileStepProps) {
  const [localLanguages, setLocalLanguages] = useState(formData.languages);

  const handleLanguageChange = (index: number, value: string) => {
    const updated = [...localLanguages];
    updated[index] = value;
    setLocalLanguages(updated);
    onUpdate({ languages: updated });
  };

  const addLanguage = () => {
    const updated = [...localLanguages, ""];
    setLocalLanguages(updated);
    onUpdate({ languages: updated });
  };

  const removeLanguage = (index: number) => {
    const updated = localLanguages.filter(
      (_: string, i: number) => i !== index
    );
    setLocalLanguages(updated);
    onUpdate({ languages: updated });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Informações Básicas</h2>
        <p>Comece preenchendo seus dados pessoais</p>
      </div>

      <div className={styles.section}>
        {/* Faixa de Idade */}
        <Range
          label="Idade"
          min={18}
          max={99}
          value={formData.age}
          onChange={(age) => onUpdate({ age })}
          unit="anos"
        />

        {/* Nacionalidade */}
        <div className={styles.field}>
          <label className={styles.label}>Nacionalidade</label>
          <Dropdown
            trigger={formData.nationality || "Selecione a Nacionalidade"}
            triggerClassName={styles.dropdownTrigger}
            menuClassName={styles.dropdownMenu}
          >
            {nationalities.map((nation) => (
              <button
                key={nation}
                type="button"
                onClick={() => onUpdate({ nationality: nation })}
                className={styles.dropdownItem}
              >
                {nation}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Idiomas */}
        <div className={styles.field}>
          <label className={styles.label}>Idiomas</label>
          <div className={styles.languageList}>
            {localLanguages.map((lang: string, index: number) => (
              <div key={index} className={styles.languageItem}>
                <Dropdown
                  trigger={lang || "Selecione o Idioma"}
                  triggerClassName={styles.dropdownTrigger}
                  menuClassName={styles.dropdownMenu}
                >
                  {languageOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleLanguageChange(index, option)}
                      className={styles.dropdownItem}
                    >
                      {option}
                    </button>
                  ))}
                </Dropdown>
                {localLanguages.length > 1 && (
                  <button
                    onClick={() => removeLanguage(index)}
                    className={styles.removeButton}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addLanguage}
              className={styles.addButton}
            >
              + Adicionar idioma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
