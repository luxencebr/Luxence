import styles from "./fetiches-step.module.css";

interface FetichesStepProps {
  formData: any;
  onUpdate: (data: any) => void;
}

const fetiches = [
  "Acessórios",
  "Bondage",
  "Chuva Dourada",
  "Chuva Marrom",
  "Dominação",
  "Facefuck",
  "Fantasia",
  "Fisting",
  "Podolatria",
  "Pisoteio",
  "Quirofilia",
  "Sadomasoquismo",
  "Squirt",
  "Voyer",
];

export default function FetichesStep({
  formData,
  onUpdate,
}: FetichesStepProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Fetiches</h2>
        <p className={styles.subtitle}>
          Selecione os fetiches que você satisfaz
        </p>
      </div>
      <div className={styles.grid}>
        {fetiches.map((item) => (
          <label key={item} className={styles.label}>
            <input
              type="checkbox"
              checked={formData.fetiches.includes(item)}
              onChange={(e) => {
                const newFetiches = e.target.checked
                  ? [...formData.fetiches, item]
                  : formData.fetiches.filter((f: string) => f !== item);
                onUpdate({ fetiches: newFetiches });
              }}
              className={styles.checkbox}
            />
            <span className={styles.labelText}>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
