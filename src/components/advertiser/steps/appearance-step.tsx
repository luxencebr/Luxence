"use client";

import Range from "@/components/ui/Range/Range";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import styles from "./appearance-step.module.css";

interface AppearanceStepProps {
  formData: any;
  onUpdate: (data: any) => void;
}

const ethnicities = [
  "Branco(a)",
  "Pardo(a)",
  "Moreno(a)",
  "Preto(a)",
  "Indígena",
  "Oriental",
];

const hairColors = [
  "Loiro",
  "Preto",
  "Ruivo",
  "Castanho",
  "Colorido",
  "Grisalho",
  "Sem Cabelo",
];

const eyeColors = ["Azuis", "Castanhos", "Verdes", "Pretos"];

export default function AppearanceStep({
  formData,
  onUpdate,
}: AppearanceStepProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Aparência Física</h2>
        <p className={styles.subtitle}>Descreva suas características físicas</p>
      </div>

      <div className={styles.section}>
        {/* Etnia */}
        <div>
          <label className={styles.label}>Etnia</label>
          <Dropdown
            trigger={formData.ethnicity || "Selecione a Etnia"}
            triggerClassName={styles.dropdownTrigger}
            menuClassName={styles.dropdownMenu}
          >
            {ethnicities.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onUpdate({ ethnicity: item })}
                className={styles.dropdownItem}
              >
                {item}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Cor do cabelo */}
        <div>
          <label className={styles.label}>Cor do Cabelo</label>
          <Dropdown
            trigger={formData.hair || "Selecione a Cor do Cabelo"}
            triggerClassName={styles.dropdownTrigger}
            menuClassName={styles.dropdownMenu}
          >
            {hairColors.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onUpdate({ hair: item })}
                className={styles.dropdownItem}
              >
                {item}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Cor dos olhos */}
        <div>
          <label className={styles.label}>Cor dos Olhos</label>
          <Dropdown
            trigger={formData.eyes || "Selecione a Cor dos Olhos"}
            triggerClassName={styles.dropdownTrigger}
            menuClassName={styles.dropdownMenu}
          >
            {eyeColors.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onUpdate({ eyes: item })}
                className={styles.dropdownItem}
              >
                {item}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Altura */}
        <Range
          label="Altura"
          min={140}
          max={210}
          value={formData.height}
          onChange={(height) => onUpdate({ height })}
          unit="cm"
        />

        {/* Manequim */}
        <Range
          label="Manequim"
          min={30}
          max={70}
          step={2}
          value={formData.mannequin}
          onChange={(mannequin) => onUpdate({ mannequin })}
          unit=""
        />

        {/* Pés */}
        <Range
          label="Pés"
          min={30}
          max={50}
          value={formData.feet}
          onChange={(feet) => onUpdate({ feet })}
          unit=""
        />

        {/* Checkboxes */}
        <div className={styles.optionsGroup}>
          {/* Tatuagens */}
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Possui Tatuagens?</span>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="tattoos"
                  value="true"
                  checked={formData.tattoos === true}
                  onChange={() => onUpdate({ tattoos: true })}
                />
                Sim
              </label>
              <label>
                <input
                  type="radio"
                  name="tattoos"
                  value="false"
                  checked={formData.tattoos === false}
                  onChange={() => onUpdate({ tattoos: false })}
                />
                Não
              </label>
            </div>
          </div>

          {/* Piercings */}
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Possui Piercings?</span>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="piercings"
                  value="true"
                  checked={formData.piercings === true}
                  onChange={() => onUpdate({ piercings: true })}
                />
                Sim
              </label>
              <label>
                <input
                  type="radio"
                  name="piercings"
                  value="false"
                  checked={formData.piercings === false}
                  onChange={() => onUpdate({ piercings: false })}
                />
                Não
              </label>
            </div>
          </div>

          {/* Silicone */}
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Possui Silicone?</span>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="silicone"
                  value="true"
                  checked={formData.silicone === true}
                  onChange={() => onUpdate({ silicone: true })}
                />
                Sim
              </label>
              <label>
                <input
                  type="radio"
                  name="silicone"
                  value="false"
                  checked={formData.silicone === false}
                  onChange={() => onUpdate({ silicone: false })}
                />
                Não
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
