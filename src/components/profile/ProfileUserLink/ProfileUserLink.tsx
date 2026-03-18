"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import styles from "./ProfileUserLink.module.css";
import { LogOut, User } from "lucide-react";

export default function ProfileUserLink() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <div className={styles.avatar}>
          <User size={18} />
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{session.user.name || "Usuário"}</span>
          <span className={styles.email}>{session.user.email}</span>
        </div>
      </div>

      <button
        type="button"
        className={styles.logout}
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <div className={styles.spinner}></div>
        ) : (
          <LogOut className={styles.icon} />
        )}
      </button>
    </div>
  );
}
