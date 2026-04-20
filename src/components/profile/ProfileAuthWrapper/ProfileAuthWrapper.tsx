"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProfileAuthWrapperProps {
  children: React.ReactNode;
}

export default function ProfileAuthWrapper({
  children,
}: ProfileAuthWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background-color)",
          color: "var(--light-color)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-md)",
          }}
        >
          <div className="auth-spinner"></div>
          <span>Carregando...</span>
        </div>
        <style jsx>{`
          .auth-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid var(--dark-complementary-color);
            border-top: 3px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
