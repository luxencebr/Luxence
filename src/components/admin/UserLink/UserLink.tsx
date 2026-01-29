"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import styles from "./UserLink.module.css";
import { AdminUser } from "@/lib/admin-auth";

export default function UserLink() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/admin/auth/session");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut({
        redirect: true,
        callbackUrl: "/admin",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <div className={styles.avatar}>
          <User size={18} />
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{user.name}</span>
          <span className={styles.email}>{user.email}</span>
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
