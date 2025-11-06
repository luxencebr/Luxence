import styles from "./services-step.module.css";

interface ServicesStepProps {
  formData: any;
  onUpdate: (data: any) => void;
}

const services = [
  "Acompanhante",
  "Viagem",
  "Beijo na Boca",
  "Masturbação",
  "Sexo Oral",
  "Oral c/ Camisinha",
  "Sexo Anal",
  "Anal c/ Camisinha",
  "Sexo Vaginal",
  "Vaginal c/ Camisinha",
  "Penetração Dupla",
  "Penetração Tripla",
  "Striptease",
];

export default function ServicesStep({
  formData,
  onUpdate,
}: ServicesStepProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Serviços</h2>
        <p className={styles.subtitle}>
          Selecione os serviços que você oferece
        </p>
      </div>
      <div className={styles.grid}>
        {services.map((item) => (
          <label key={item} className={styles.label}>
            <input
              type="checkbox"
              checked={formData.services.includes(item)}
              onChange={(e) => {
                const newServices = e.target.checked
                  ? [...formData.services, item]
                  : formData.services.filter((s: string) => s !== item);
                onUpdate({ services: newServices });
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
