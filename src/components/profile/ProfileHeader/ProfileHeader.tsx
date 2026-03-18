"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "./ProfileHeader.module.css";

interface RouteInfo {
  title: string;
  subtitle: string;
}

const routeInfo: Record<string, RouteInfo> = {
  "/profile": {
    title: "Painel de Controle",
    subtitle: "Gerencie sua conta e preferências",
  },
  "/profile/account": {
    title: "Dados da Conta",
    subtitle: "Gerencie suas informações pessoais, email e dados de acesso",
  },
  "/profile/security": {
    title: "Privacidade e Segurança",
    subtitle: "Controle sua senha e configurações de privacidade",
  },
  "/profile/payment": {
    title: "Métodos de Pagamento",
    subtitle: "Gerencie suas formas de pagamento",
  },
  "/profile/signature": {
    title: "Assinatura",
    subtitle: "Gerencie seu plano",
  },
};

export default function ProfileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isMainRoute = pathname === "/profile";
  const info = routeInfo[pathname] || routeInfo["/profile"];

  const handleBack = () => {
    router.push("/profile");
  };

  const handleHome = () => {
    router.push("/");
  };

  return (
    <div className={styles.header}>
      {/* Mobile: botões de navegação */}
      <div className={styles.left}>
        {isMainRoute ? (
          <button onClick={handleHome} className={styles.logoButton}>
            <img src="/LuxenceLogo.png" alt="Luxence" className={styles.logo} />
          </button>
        ) : (
          <button onClick={handleBack} className={styles.iconButton}>
            <ArrowLeft size={20} />
          </button>
        )}
      </div>

      {/* Título e subtítulo (desktop e mobile) */}
      <div className={styles.headerContent}>
        <h1 className={styles.title}>{info.title}</h1>
        <p className={styles.subtitle}>{info.subtitle}</p>
      </div>

      {/* Mobile: espaço para centralizar */}
      <div className={styles.right} />
    </div>
  );
}
