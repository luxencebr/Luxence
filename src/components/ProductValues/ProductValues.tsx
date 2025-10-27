"use client";

import styles from "./ProductValues.module.css";
import { TbCoinFilled } from "react-icons/tb";
import { FaMoneyBills, FaPix, FaCreditCard } from "react-icons/fa6";

import type { Producer } from "../../types/Producer";

interface ProductValuesProps {
  producer: Producer;
}

function ProductValues({ producer }: ProductValuesProps) {
  const values = producer.prices || [];
  const payments = producer?.payments ?? {};

  return (
    <section id="values" className={styles.producerValues}>
      <div className={styles.layout}>
        <div className={styles.header}>
          <h2>
            <span>
              <TbCoinFilled />
            </span>
            Valores
          </h2>
        </div>
        <div className={styles.content}>
          {values.map((item, idx) => (
            <dl key={idx} className={styles.valueItem}>
              <dt>{item.duration}</dt>
              <dd>
                {item.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </dd>
            </dl>
          ))}
        </div>
        <h2>Métodos de Pagamento</h2>
        <div className={styles.valuesPayments}>
          {payments.cash && (
            <div className={styles.paymentMethod}>
              <span>
                <FaMoneyBills />
              </span>
              Dinheiro
            </div>
          )}
          {payments.pix && (
            <div className={styles.paymentMethod}>
              <span>
                <FaPix />
              </span>
              Pix
            </div>
          )}
          {payments.credit && (
            <div className={styles.paymentMethod}>
              <span>
                <FaCreditCard />
              </span>
              Crédito
            </div>
          )}
          {payments.debit && (
            <div className={styles.paymentMethod}>
              <span>
                <FaCreditCard />
              </span>
              Débito
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductValues;
