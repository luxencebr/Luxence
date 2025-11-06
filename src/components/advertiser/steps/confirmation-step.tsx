"use client";

import styles from "./confirmation-step.module.css";

interface ConfirmationStepProps {
  formData: any;
  onUpdate: (data: any) => void;
}

export default function ConfirmationStep({
  formData,
  onUpdate,
}: ConfirmationStepProps) {
  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h2>Confirmação</h2>
        <p>Revise cuidadosamente seus dados antes de finalizar o cadastro.</p>
      </div>

      {/* Caixa de resumo */}
      <div className={styles.summaryBox}>
        {/* PERFIL */}
        <div className={styles.section}>
          <h3>Perfil</h3>
          <div className={styles.infoList}>
            <p>
              <strong>Idade:</strong> {formData.age || "Não informado"} anos
            </p>
            <p>
              <strong>Nacionalidade:</strong>{" "}
              {formData.nationality || "Não informado"}
            </p>
            <p>
              <strong>Idiomas:</strong>{" "}
              {formData.languages?.filter((l: string) => l).join(", ") ||
                "Não informado"}
            </p>
          </div>
        </div>

        {/* APARÊNCIA */}
        <div className={styles.section}>
          <h3>Aparência</h3>
          <div className={styles.infoList}>
            <p>
              <strong>Etnia:</strong> {formData.ethnicity || "Não informado"}
            </p>
            <p>
              <strong>Cabelo:</strong> {formData.hair || "Não informado"}
            </p>
            <p>
              <strong>Olhos:</strong> {formData.eyes || "Não informado"}
            </p>
            <p>
              <strong>Altura:</strong>{" "}
              {formData.height ? `${formData.height} cm` : "Não informado"}
            </p>
            <p>
              <strong>Manequim:</strong> {formData.mannequin || "Não informado"}
            </p>
            <p>
              <strong>Pés:</strong> {formData.feet || "Não informado"}
            </p>

            <p>
              <strong>Tatuagens:</strong> {formData.tattoos ? "Sim" : "Não"}
            </p>
            <p>
              <strong>Piercings:</strong> {formData.piercings ? "Sim" : "Não"}
            </p>
            <p>
              <strong>Silicone:</strong> {formData.silicone ? "Sim" : "Não"}
            </p>
          </div>
        </div>

        {/* ATENDIMENTO */}
        <div className={styles.section}>
          <h3>Atendimento</h3>
          <div className={styles.infoList}>
            <p>
              <strong>Público:</strong>{" "}
              {formData.audience?.length
                ? formData.audience.join(", ")
                : "Não selecionado"}
            </p>
            <p>
              <strong>Locais de Atendimento:</strong>{" "}
              {formData.locales?.length
                ? formData.locales.join(", ")
                : "Não selecionado"}
            </p>
            <p>
              <strong>Possui Local Próprio:</strong>{" "}
              {formData.hasLocation ? "Sim" : "Não"}
            </p>
            <p>
              <strong>Comodidades:</strong>{" "}
              {formData.amenities?.length
                ? formData.amenities.join(", ")
                : "Nenhuma selecionada"}
            </p>
          </div>
        </div>

        {/* SERVIÇOS */}
        <div className={styles.section}>
          <h3>Serviços</h3>
          <div className={styles.infoList}>
            <p>
              <strong>Serviços Oferecidos:</strong>{" "}
              {formData.services?.length
                ? formData.services.join(", ")
                : "Não selecionado"}
            </p>
          </div>
        </div>

        {/* FETICHES */}
        <div className={styles.section}>
          <h3>Fetiches</h3>
          <div className={styles.infoList}>
            <p>
              <strong>Preferências:</strong>{" "}
              {formData.fetiches?.length
                ? formData.fetiches.join(", ")
                : "Nenhum selecionado"}
            </p>
          </div>
        </div>
      </div>

      {/* Termos de Serviço */}
      <label className={styles.agreement}>
        <input
          type="checkbox"
          checked={formData.agreed}
          onChange={(e) => onUpdate({ agreed: e.target.checked })}
        />
        <span>
          Concordo com os{" "}
          <a href="#" className={styles.link}>
            termos de serviço
          </a>{" "}
          e confirmo que todos os dados fornecidos são verdadeiros e precisos.
        </span>
      </label>
    </div>
  );
}
