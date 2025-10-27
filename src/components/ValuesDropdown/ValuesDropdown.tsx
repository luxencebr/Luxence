"use client";

import styles from "./ValueDropdown.module.css";
import Dropdown from "@/components/ui/Dropdown/Dropdown";

import { Producer } from "@/types/Producer";

interface ValueDropdownProps {
  producer: Producer;
}

export default function ValueDropdown({ producer }: ValueDropdownProps) {
  const values = producer.prices || [];

  function ValueTrigger() {
    return (
      <div className={styles.triggerText}>
        <span>A partir de</span>
        <div>
          {values[0].price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}{" "}
          <span>- {values[0].duration}</span>
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
          <dt>{item.duration}</dt>
          <dd>
            {item.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </dd>
        </dl>
      ))}
    </Dropdown>
  );
}
