import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import styles from "./page.module.css";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.card}>
            <span className={styles.spinner}></span>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
