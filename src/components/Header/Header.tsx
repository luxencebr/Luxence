"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import { IoIosClose, IoIosMenu } from "react-icons/io";
import { IoPerson } from "react-icons/io5";

import LanguagesPopup from "@/components/LanguagesPopup/LanguagesPopup";
import Dropdown from "@/components/ui/Dropdown/Dropdown";

import SignUp from "@/components/Signup/Signup";
import LogIn from "@/components/LogIn/LogIn";
import { useSession, signOut } from "next-auth/react";

function Header() {
  const { data: session } = useSession();

  const pathname = usePathname();

  const isActive = (route: string) =>
    pathname === route || pathname.startsWith(route + "/");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className={styles.header}>
      <div className={styles.layout}>
        <nav className={styles.left}>
          <Link href="/">
            <img src="/LuxenceLogo.png" alt="Logo" className={styles.logo} />
          </Link>

          <Link
            href="/home"
            className={`${styles.navBtn} ${
              isActive("/home") ? styles.active : ""
            }`}
          >
            Início
          </Link>

          <Link
            href="/catalog"
            className={`${styles.navBtn} ${
              isActive("/catalog") ? styles.active : ""
            }`}
          >
            Catálogo
          </Link>

          <Link
            href="/about"
            className={`${styles.navBtn} ${
              isActive("/about") ? styles.active : ""
            }`}
          >
            Sobre
          </Link>

          <Link
            href="/suport"
            className={`${styles.navBtn} ${
              isActive("/suport") ? styles.active : ""
            }`}
          >
            Suporte
          </Link>
        </nav>
        <div className={styles.headerButtons}>
          {session ? (
            <>
              <LanguagesPopup />
              <Dropdown
                trigger={
                  <>
                    <span>
                      <IoPerson />
                    </span>
                    {(() => {
                      if (!session.user?.name) return "Usuário";

                      const parts = session.user.name.trim().split(/\s+/);
                      if (parts.length === 1) return parts[0];

                      const first = parts[0];
                      const last = parts[parts.length - 1];
                      return `${first} ${last}`;
                    })()}
                  </>
                }
                containerClassName={styles.dropdown}
                triggerClassName={styles.trigger}
                menuClassName={styles.menu}
              >
                <Link
                  href={`/product/${session?.user?.id}`}
                  className={styles.menuItem}
                >
                  Ver Perfil
                </Link>
                {session.user.signature !== "COPPER" ? (
                  <Link href={""} className={styles.menuItem}>
                    Minha Assinatura
                  </Link>
                ) : (
                  <Link href="/advertiser/plans" className={styles.menuItem}>
                    Assine Já!
                  </Link>
                )}
                <button onClick={handleSignOut} className={styles.menuItem}>
                  Sair
                </button>
              </Dropdown>
            </>
          ) : (
            <>
              <SignUp />
              <LogIn />
              <LanguagesPopup />
            </>
          )}
        </div>

        <div className={styles.mobileRight}>
          <LanguagesPopup />
          <button
            className={styles.hamburgerButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <IoIosClose /> : <IoIosMenu />}
          </button>
        </div>

        <div
          className={`${styles.mobileMenu} ${
            isMenuOpen ? styles.mobileMenuOpen : ""
          }`}
        >
          <div className={styles.mobileMenuContent}>
            <nav className={styles.mobileNav}>
              <Link
                href="/home"
                className={`${styles.mobileNavBtn} ${
                  isActive("/home") ? styles.active : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>

              <Link
                href="/catalog"
                className={`${styles.mobileNavBtn} ${
                  isActive("/catalog") ? styles.active : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Catálogo
              </Link>

              <Link
                href="/about"
                className={`${styles.mobileNavBtn} ${
                  isActive("/about") ? styles.active : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
            </nav>

            <div className={styles.mobileDivider}></div>

            {session ? (
              <div className={styles.mobileUserSection}>
                <Link
                  href={`/product/${session?.user?.id}`}
                  className={styles.mobileUserInfo}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className={styles.mobileUserIcon}>
                    <IoPerson />
                  </span>
                  <span className={styles.mobileUserName}>
                    {(() => {
                      if (!session.user?.name) return "Usuário";

                      const parts = session.user.name.trim().split(/\s+/);
                      if (parts.length === 1) return parts[0];

                      const first = parts[0];
                      const last = parts[parts.length - 1];
                      return `${first} ${last}`;
                    })()}
                  </span>
                </Link>
                {session.user.signature !== "COPPER" ? (
                  <Link
                    href={""}
                    className={styles.mobileMenuItem}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Minha Assinatura
                  </Link>
                ) : (
                  <Link
                    href="/advertiser/plans"
                    className={styles.mobileMenuItem}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Assine Já!
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className={styles.mobileMenuItem}
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className={styles.mobileAuthButtons}>
                <SignUp />
                <LogIn />
              </div>
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div
            className={styles.overlay}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </header>
  );
}

export default Header;
