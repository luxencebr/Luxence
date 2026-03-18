import styles from "./LoadingContainer.module.css";

interface LoadingContainerProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

export default function LoadingContainer({ 
  message = "Carregando...", 
  size = "medium" 
}: LoadingContainerProps) {
  return (
    <div className={`${styles.container} ${styles[size]}`}>
      <div className={styles.spinner}>
        <div className={styles.spinnerInner} />
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}