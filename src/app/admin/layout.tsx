import Link from "next/link";
import UserLink from "@/components/admin/UserLink/UserLink";
import styles from "./admin.module.css";
import NavLinks from "@/components/admin/NavLinks/NavLinks";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper/AdminAuthWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luxence | Administração",
  description: "Painel administrativo da plataforma Luxence",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthWrapper>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <div className={styles.top}>
            <div className={styles.header}>
              <div className={styles.left}>
                <Link href="/">
                  <img src="/LuxenceLogo.png" alt="" className={styles.logo} />
                </Link>
                <h1 className={styles.title}>Administração</h1>
              </div>
            </div>
            <NavLinks />
          </div>
          <UserLink />
        </aside>

        <main className={styles.content}>{children}</main>
      </div>
    </AdminAuthWrapper>
  );
}
