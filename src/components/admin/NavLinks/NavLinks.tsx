"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavLinks.module.css";
import { IconType } from "react-icons";
import { LayoutDashboard, Package, Tags, Calendar } from "lucide-react";

export interface AdminRoute {
  label: string;
  href: string;
  icon?: IconType;
}

export const adminRoutes: AdminRoute[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Anunciantes",
    href: "/admin/advertisers",
    icon: Tags,
  },
  {
    label: "Métricas",
    href: "/admin/metrics",
    icon: Package,
  },
  {
    label: "Desempenho",
    href: "/admin/performance",
    icon: Calendar,
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {adminRoutes.map((route) => {
        const isActive =
          pathname === route.href || pathname.startsWith(route.href + "/");

        return (
          <Link
            key={route.href}
            href={route.href}
            className={`${styles.link} ${isActive ? styles.active : ""}`}
          >
            {route.icon && <route.icon className={styles.icon} />}
            <span>{route.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
