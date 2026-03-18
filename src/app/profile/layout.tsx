import Link from "next/link";
import ProfileAuthWrapper from "@/components/profile/ProfileAuthWrapper/ProfileAuthWrapper";
import ProfileNavLinks from "@/components/profile/ProfileNavLinks/ProfileNavLinks";
import ProfileUserLink from "@/components/profile/ProfileUserLink/ProfileUserLink";
import ProfileHeader from "@/components/profile/ProfileHeader/ProfileHeader";
import ProfileFooter from "@/components/profile/ProfileFooter/ProfileFooter";
import styles from "./profile.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luxence | Minha Conta",
  description: "Gerencie sua conta na plataforma Luxence",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileAuthWrapper>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <div className={styles.top}>
            <div className={styles.header}>
              <div className={styles.left}>
                <Link href="/">
                  <img src="/LuxenceLogo.png" alt="" className={styles.logo} />
                </Link>
                <h1 className={styles.title}>Painel de Controle</h1>
              </div>
            </div>
            <ProfileNavLinks />
          </div>
          <ProfileUserLink />
        </aside>

        <main className={styles.content}>
          <ProfileHeader />
          <div className={styles.mainContent}>{children}</div>
          <ProfileFooter />
        </main>
      </div>
    </ProfileAuthWrapper>
  );
}
