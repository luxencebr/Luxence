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
    return (
      <div className={styles.triggerText}>
        <span>A partir de</span>
        <div>
          {values[0].value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}{" "}
          <span>- {values[0].option.label}</span>
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
            {item.value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </dd>
        </dl>
      ))}
    </Dropdown>
  );
}
