"use client";

import styles from "./profile-step.module.css";

interface ProfileStepProps {
  formData: any;
  onUpdate: (data: any) => void;
}

export default function ProfileStep({ formData, onUpdate }: ProfileStepProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Perfil</h2>
        <p>Preencha as informações básicas do seu perfil</p>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          CPF:
          <input
            type="text"
            value={formData.cpf || ""}
            onChange={(e) => onUpdate({ cpf: e.target.value })}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </label>

        <label className={styles.label}>
          Data de nascimento:
          <input
            type="text"
            value={formData.birthDate || ""}
            onChange={(e) => onUpdate({ birthDate: e.target.value })}
            placeholder="dd/mm/aaaa"
            maxLength={14}
          />
        </label>

        <label className={styles.label}>
          Telefone de contato:
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
        </label>
      </div>
      <div className={styles.address}>
        <h3>Endereço Residencial</h3>

        <div className={styles.addressContent}>
          <label className={styles.label}>
            CEP:
            <input
              type="text"
              value={formData.cep || ""}
              onChange={(e) => onUpdate({ cep: e.target.value })}
              placeholder="00000-000"
              maxLength={9}
            />
          </label>

          <label className={styles.label}>
            Rua:
            <input
              type="text"
              value={formData.street || ""}
              onChange={(e) => onUpdate({ street: e.target.value })}
              placeholder="Nome da rua"
            />
          </label>

          <label className={styles.label}>
            Número:
            <input
              type="text"
              value={formData.number || ""}
              onChange={(e) => onUpdate({ number: e.target.value })}
              placeholder="Número"
            />
          </label>

          <label className={styles.label}>
            Bairro:
            <input
              type="text"
              value={formData.neighborhood || ""}
              onChange={(e) => onUpdate({ neighborhood: e.target.value })}
              placeholder="Bairro"
            />
          </label>

          <label className={styles.label}>
            Cidade:
            <input
              type="text"
              value={formData.city || ""}
              onChange={(e) => onUpdate({ city: e.target.value })}
              placeholder="Cidade"
            />
          </label>

          <label className={styles.label}>
            Estado:
            <input
              type="text"
              value={formData.state || ""}
              onChange={(e) => onUpdate({ state: e.target.value })}
              placeholder="UF"
              maxLength={2}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
