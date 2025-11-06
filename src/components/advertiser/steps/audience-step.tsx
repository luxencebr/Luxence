"use client";

import styles from "./audience-step.module.css";

interface AudienceStepProps {
  formData: any;
  onUpdate: (data: any) => void;
}

const audience = ["Homens", "Mulheres", "Casais", "Grupos"];

const locales = ["À Domicílio", "Hotéis", "Moteis", "Eventos"];

const amenities = [
  "Ar-Condicionado",
  "Banheira",
  "Chuveiro",
  "Estacionamento",
  "Geladeira/Frigobar",
  "Preservativos",
  "Wi-Fi",
];

export default function AudienceStep({
  formData,
  onUpdate,
}: AudienceStepProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Atendimento</h2>
        <p className={styles.subtitle}>Nos diga como você trabalha</p>
      </div>

      {/* Público */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Público</h3>
        <div className={styles.grid}>
          {audience.map((item) => (
            <label key={item} className={styles.label}>
              <input
                type="checkbox"
                checked={formData.audience.includes(item)}
                onChange={(e) => {
                  const newAudience = e.target.checked
                    ? [...formData.audience, item]
                    : formData.audience.filter((a: string) => a !== item);
                  onUpdate({ audience: newAudience });
                }}
                className={styles.checkbox}
              />
              <span className={styles.labelText}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Locais */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Locais</h3>
        <div className={styles.grid}>
          {locales.map((item) => (
            <label key={item} className={styles.label}>
              <input
                type="checkbox"
                checked={formData.locales.includes(item)}
                onChange={(e) => {
                  const newLocales = e.target.checked
                    ? [...formData.locales, item]
                    : formData.locales.filter((l: string) => l !== item);
                  onUpdate({ locales: newLocales });
                }}
                className={styles.checkbox}
              />
              <span className={styles.labelText}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Possui Local */}
      <div className={styles.optionRow}>
        <span className={styles.optionLabel}>Possui Local?</span>
        <div className={styles.radioGroup}>
          <label>
            <input
              type="radio"
              name="hasLocation"
              value="true"
              checked={formData.hasLocation === true}
              onChange={() => onUpdate({ hasLocation: true })}
            />
            Sim
          </label>
          <label>
            <input
              type="radio"
              name="hasLocation"
              value="false"
              checked={formData.hasLocation === false}
              onChange={() => onUpdate({ hasLocation: false })}
            />
            Não
          </label>
        </div>
      </div>

      {/* Amenidades */}
      {formData.hasLocation && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Comodidades</h3>
          <div className={styles.grid}>
            {amenities.map((item) => (
              <label key={item} className={styles.label}>
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(item)}
                  onChange={(e) => {
                    const newAmenities = e.target.checked
                      ? [...formData.amenities, item]
                      : formData.amenities.filter((a: string) => a !== item);
                    onUpdate({ amenities: newAmenities });
                  }}
                  className={styles.checkbox}
                />
                <span className={styles.labelText}>{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
