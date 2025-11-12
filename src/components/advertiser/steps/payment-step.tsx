"use client";

import styles from "./payment-step.module.css";

interface PaymentStepProps {
  formData: any;
  onUpdate: (data: any) => void;
}

export default function PaymentStep({ formData, onUpdate }: PaymentStepProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Método de Pagamento</h2>
        <p className={styles.subtitle}>
          Cadastre um cartão para compras e assinaturas futuras
        </p>
      </div>

      <div className={styles.section}>
        {/* Nome no Cartão */}
        <label className={styles.label}>
          Nome impresso no cartão:
          <input
            type="text"
            value={formData.cardName || ""}
            onChange={(e) => onUpdate({ cardName: e.target.value })}
            placeholder="Ex: ARTHUR PIMENTEL"
            className={styles.input}
          />
        </label>

        {/* Número do Cartão */}
        <label className={styles.label}>
          Número do cartão:
          <input
            type="text"
            inputMode="numeric"
            value={formData.cardNumber || ""}
            onChange={(e) => onUpdate({ cardNumber: e.target.value })}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            className={styles.input}
          />
        </label>

        <div className={styles.row}>
          {/* Validade */}
          <label className={styles.labelSmall}>
            Validade:
            <input
              type="text"
              inputMode="numeric"
              value={formData.expiry || ""}
              onChange={(e) => onUpdate({ expiry: e.target.value })}
              placeholder="MM/AA"
              maxLength={5}
              className={styles.input}
            />
          </label>

          {/* CVV */}
          <label className={styles.labelSmall}>
            CVV:
            <input
              type="password"
              inputMode="numeric"
              value={formData.cvv || ""}
              onChange={(e) => onUpdate({ cvv: e.target.value })}
              placeholder="123"
              maxLength={4}
              className={styles.input}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
