import type { ReactNode } from "react";

import styles from "./Card.module.css";

interface CardProps {
  size?: "small" | "medium" | "large";
  backgroundColor?: string;
  className?: string;
  animated?: boolean;
  children: ReactNode;
}

export default function Card({
  children,
  size = "medium",
  backgroundColor = "var(--light-complementary-color)",
  className = "",
  animated = false,
}: CardProps) {
  const sizeClass = styles[size];
  const animatedClass = animated ? styles.animated : "";

  return (
    <div
      className={`${styles.card} ${sizeClass} ${animatedClass} ${className}`}
      style={{ "--card-bg": backgroundColor } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
