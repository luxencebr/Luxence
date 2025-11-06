"use client";

import React, { useState } from "react";
import styles from "./Range.module.css";

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  unit?: string;
}

export default function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit,
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(value ?? min);
  const [editingValue, setEditingValue] = useState<string | number>(
    internalValue
  );

  const handleChange = (newValue: number) => {
    if (isNaN(newValue)) return;
    setInternalValue(newValue);
    setEditingValue(newValue);
    onChange?.(newValue);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(Number(e.target.value));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditingValue(val); // permite digitar
  };

  const handleNumberBlur = () => {
    // ao sair do campo, valida e aplica
    const num = Number(editingValue);
    if (isNaN(num)) {
      setEditingValue(internalValue);
    } else {
      const clamped = Math.min(Math.max(num, min), max);
      handleChange(clamped);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur(); // força blur no Enter
    }
  };

  const currentValue = value ?? internalValue;

  return (
    <label className={styles.sliderLabel}>
      <div className={styles.labelContent}>
        {label}:
        <div>
          <input
            type="number"
            value={editingValue}
            min={min}
            max={max}
            onChange={handleNumberChange}
            onBlur={handleNumberBlur}
            onKeyDown={handleKeyDown}
            className={styles.number}
          />
          {unit && ` ${unit}`}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleRangeChange}
        className={styles.range}
        style={
          {
            "--fill": `${((currentValue - min) / (max - min)) * 100}%`,
          } as React.CSSProperties
        }
      />
    </label>
  );
}
