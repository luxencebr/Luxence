import ProfileUserLink from "@/components/profile/ProfileUserLink/ProfileUserLink";
import styles from "./ProfileFooter.module.css";

export default function ProfileFooter() {
  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        <h3 className={styles.title}>Sessão Ativa</h3>
        <ProfileUserLink />
      </div>
    </div>
  );
}
