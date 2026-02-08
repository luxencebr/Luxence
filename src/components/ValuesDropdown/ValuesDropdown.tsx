"use client";

import styles from "./ValueDropdown.module.css";
import Dropdown from "@/components/ui/Dropdown/Dropdown";

import { Producer } from "@/types/Producer";

interface ValueDropdownProps {
  producer: Producer;
}

export default function ValueDropdown({ producer }: ValueDropdownProps) {
  const values = producer.profile.prices || [];

  function ValueTrigger() {
    const firstValue = values[0];
    const displayValue = firstValue.value > 0 
      ? firstValue.value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "A combinar";

    return (
      <div className={styles.triggerText}>
        <span>A partir de</span>
        <div>
          {displayValue} <span>- {firstValue.option.label}</span>
        </div>
      </div>
    );
  }

  return (
    <Dropdown
      trigger={ValueTrigger()}
      triggerClassName={styles.valueTrigger}
      menuClassName={styles.valueMenu}
    >
      {values.map((item, idx) => (
        <dl key={idx} className={styles.valueItem}>
          <dt>{item.option.label}</dt>
          <dd>
            {item.value > 0
              ? item.value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : "A combinar"}
          </dd>
        </dl>
      ))}
    </Dropdown>
  );
}
