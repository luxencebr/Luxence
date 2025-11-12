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
        <h2 className={styles.title}>Confirmação</h2>
        <p className={styles.subtitle}>
          Revise suas informações antes de finalizar o cadastro
        </p>
      </div>

      <div className={styles.summaryBox}>
        {/* PERFIL */}
        <div className={styles.section}>
          <h3>Perfil</h3>
          <div className={styles.infoList}>
            <p>
              <strong>CPF:</strong> {formData.cpf || "Não informado"}
            </p>
            <p>
              <strong>Data de Nascimento:</strong>{" "}
              {formData.birthDate || "Não informado"}
            </p>
            <p>
              <strong>Telefone:</strong> {formData.phone || "Não informado"}
            </p>
          </div>
        </div>

        {/* ENDEREÇO */}
        <div className={styles.section}>
          <h3>Endereço Residencial</h3>
          <div className={styles.infoList}>
            <p>
              <strong>CEP:</strong> {formData.cep || "Não informado"}
            </p>
            <p>
              <strong>Rua:</strong> {formData.street || "Não informado"}
            </p>
            <p>
              <strong>Número:</strong> {formData.number || "Não informado"}
            </p>
            <p>
              <strong>Bairro:</strong>{" "}
              {formData.neighborhood || "Não informado"}
            </p>
            <p>
              <strong>Cidade:</strong> {formData.city || "Não informado"}
            </p>
            <p>
              <strong>Estado:</strong> {formData.state || "Não informado"}
            </p>
          </div>
        </div>

        {/* VERIFICAÇÃO */}
        <div className={styles.section}>
          <h3>Verificação de Identidade</h3>
          <div className={styles.infoList}>
            <p>
              <strong>Foto de Perfil:</strong>{" "}
              {formData.profilePhoto ? (
                <img
                  src={
                    typeof formData.profilePhoto === "string"
                      ? formData.profilePhoto
                      : URL.createObjectURL(formData.profilePhoto)
                  }
                  alt="Foto de perfil"
                  className={styles.thumbnail}
                />
              ) : (
                "Não enviada"
              )}
            </p>
            <p>
              <strong>Foto com Documento:</strong>{" "}
              {formData.documentPhoto ? (
                <img
                  src={
                    typeof formData.documentPhoto === "string"
                      ? formData.documentPhoto
                      : URL.createObjectURL(formData.documentPhoto)
                  }
                  alt="Foto com documento"
                  className={styles.thumbnail}
                />
              ) : (
                "Não enviada"
              )}
            </p>
          </div>
        </div>

        {/* PAGAMENTO */}
        <div className={styles.section}>
          <h3>Cartão Cadastrado</h3>
          <div className={styles.infoList}>
            <p>
              <strong>Nome no Cartão:</strong>{" "}
              {formData.cardName || "Não informado"}
            </p>
            <p>
              <strong>Número:</strong>{" "}
              {formData.cardNumber
                ? `**** **** **** ${formData.cardNumber.slice(-4)}`
                : "Não informado"}
            </p>
            <p>
              <strong>Validade:</strong> {formData.expiry || "Não informada"}
            </p>
            <p>
              <strong>CVV:</strong> {formData.cvv ? "•••" : "Não informado"}
            </p>
          </div>
        </div>
      </div>

      {/* Termos */}
      <label className={styles.agreement}>
        <input
          type="checkbox"
          checked={formData.agreed || false}
          onChange={(e) => onUpdate({ agreed: e.target.checked })}
        />
        <span>
          Concordo com os{" "}
          <a href="#" className={styles.link}>
            termos de serviço
          </a>{" "}
          e confirmo que todas as informações são verdadeiras e atuais.
        </span>
      </label>
    </div>
  );
}
