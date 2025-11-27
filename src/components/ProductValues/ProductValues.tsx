"use client";

import { useState } from "react";
import styles from "./ProductValues.module.css";
import type { Producer } from "@/types/Producer";
import { TbCoinFilled } from "react-icons/tb";
import { FaMoneyBills, FaPix, FaCreditCard } from "react-icons/fa6";
import { HiOutlinePencil } from "react-icons/hi2";

interface ProductValuesProps {
  producer: Producer;
  canEdit: boolean;
}

function ProductValues({ producer, canEdit }: ProductValuesProps) {
  const [isEditing, setIsEditing] = useState(false);

  const PRICE_OPTIONS = [
    { id: 0, name: "15_min", label: "15 Minutos" },
    { id: 1, name: "30_min", label: "30 Minutos" },
    { id: 2, name: "1_hora", label: "1 Hora" },
    { id: 3, name: "2_horas", label: "2 Horas" },
    { id: 4, name: "4_horas", label: "4 Horas" },
    { id: 5, name: "pernoite", label: "Pernoite" },
    { id: 6, name: "diaria", label: "Diária" },
    { id: 7, name: "personalizado", label: "Personalizado" },
  ];

  const PAYMENT_OPTIONS = [
    { id: 0, name: "dinheiro", label: "Dinheiro", icon: <FaMoneyBills /> },
    { id: 1, name: "pix", label: "Pix", icon: <FaPix /> },
    {
      id: 2,
      name: "credito",
      label: "Crédito",
      icon: <FaCreditCard />,
    },
    {
      id: 3,
      name: "debito",
      label: "Débito",
      icon: <FaCreditCard />,
    },
  ];

  const [prices, setPrices] = useState(producer.profile.prices);
  const [payments, setPayments] = useState(producer.profile.payments);

  const [originalPrices, setOriginalPrices] = useState(producer.profile.prices);
  const [originalPayments, setOriginalPayments] = useState(
    producer.profile.payments
  );

  const handleEdit = () => {
    setOriginalPrices(prices);
    setOriginalPayments(payments);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPrices(originalPrices);
    setPayments(originalPayments);
    setIsEditing(false);
  };

  async function handleSave() {
    const pricesToSave = prices.map((p) => ({
      priceId: p.option.id,
      value: Number(p.value),
    }));

    const paymentsToSave = payments.map((p) => ({
      paymentId: p.option.id,
    }));

    console.log(pricesToSave);
    console.log(paymentsToSave);

    await fetch("/api/profile/values", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: producer.profile.id,
        prices: pricesToSave,
        payments: paymentsToSave,
      }),
    });

    setIsEditing(false);
  }

  const orderedPrices = [...prices].sort((a, b) => {
    const indexA = PRICE_OPTIONS.findIndex((o) => o.label === a.option.label);
    const indexB = PRICE_OPTIONS.findIndex((o) => o.label === b.option.label);
    return indexA - indexB;
  });

  const orderedPayments = [...payments].sort((a, b) => {
    const indexA = PAYMENT_OPTIONS.findIndex((o) => o.label === a.option.label);
    const indexB = PAYMENT_OPTIONS.findIndex((o) => o.label === b.option.label);
    return indexA - indexB;
  });

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

          {canEdit ? (
            !isEditing ? (
              <button className={styles.editBtn} onClick={handleEdit}>
                Editar <HiOutlinePencil />
              </button>
            ) : (
              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={handleSave}>
                  Salvar
                </button>
                <button className={styles.cancelBtn} onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            )
          ) : null}
        </div>

        <div className={styles.content}>
          {!isEditing && (
            <>
              {prices.length > 0 ? (
                orderedPrices.map((price) => (
                  <dl key={price.option.id} className={styles.valueItem}>
                    <dt className={styles.priceOption}>{price.option.label}</dt>
                    <dd className={styles.priceValue}>
                      R$
                      {Number(price.value).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </dd>
                  </dl>
                ))
              ) : (
                <span style={{ display: "block", textAlign: "center" }}>
                  Não informado
                </span>
              )}
            </>
          )}

          {isEditing && (
            <>
              {PRICE_OPTIONS.map((opt) => {
                const exists = prices.some((p) => p.option.label === opt.label);

                return (
                  <div key={opt.id} className={styles.valueItem}>
                    <label className={styles.valueOption}>
                      <input
                        type="checkbox"
                        checked={exists}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPrices([
                              ...prices,
                              {
                                profileId: producer.profile.id,
                                priceId: opt.id,
                                value: 0,
                                option: opt,
                              },
                            ]);
                          } else {
                            setPrices(
                              prices.filter((p) => p.option.label !== opt.label)
                            );
                          }
                        }}
                      />
                      {opt.label}
                    </label>

                    {exists && (
                      <input
                        type="number"
                        placeholder="Valor"
                        value={
                          prices.find((p) => p.option.label === opt.label)
                            ?.value ?? ""
                        }
                        onChange={(e) =>
                          setPrices(
                            prices.map((p) =>
                              p.option.label === opt.label
                                ? { ...p, value: Number(e.target.value) }
                                : p
                            )
                          )
                        }
                      />
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className={styles.valuesPayments}>
          <h3 className={styles.subTitle}>Métodos de Pagamento</h3>

          <div className={styles.payments}>
            {isEditing ? (
              <>
                {PAYMENT_OPTIONS.map((opt) => {
                  const exists = payments.some(
                    (p) => p.option.label === opt.label
                  );

                  return (
                    <label key={opt.id} className={styles.paymentOption}>
                      <input
                        type="checkbox"
                        checked={exists}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPayments([
                              ...payments,
                              {
                                profileId: producer.profile.id,
                                paymentId: opt.id,
                                option: opt,
                              },
                            ]);
                          } else {
                            setPayments(
                              payments.filter(
                                (p) => p.option.label !== opt.label
                              )
                            );
                          }
                        }}
                      />
                      <span>{opt.icon}</span>
                      {opt.label}
                    </label>
                  );
                })}
              </>
            ) : (
              <>
                {payments.length > 0 ? (
                  orderedPayments.map((p) => {
                    const opt = PAYMENT_OPTIONS.find(
                      (o) => o.label === p.option.label
                    );

                    return (
                      <div key={p.id} className={styles.paymentOption}>
                        <span>{opt?.icon}</span>
                        {p.option.label}
                      </div>
                    );
                  })
                ) : (
                  <p>Não Informados</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductValues;
