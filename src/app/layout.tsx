import type { Metadata } from "next";
import Providers from "./provider";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import "../styles/globals.css";
import "../styles/variables.css";
import "../styles/Fonts.css";

export const metadata: Metadata = {
  title: {
    default: "Luxence",
    template: "%s | Luxence",
  },
  description:
    "Luxence — plataforma premium de experiências e conexões exclusivas.",

  icons: {
    icon: "/LuxenceLogo.png",
  },

  openGraph: {
    title: "Luxence",
    description:
      "Descubra experiências premium e perfis exclusivos na Luxence.",
    url: "https://luxence.com.br",
    siteName: "Luxence",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Luxence",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Luxence",
    description:
      "Descubra experiências premium e perfis exclusivos na Luxence.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <AnalyticsTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
