import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export function useAccountStatus() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const checkAccountStatus = async () => {
      try {
        const response = await fetch("/api/auth/check-deleted");
        const data = await response.json();
        
        if (data.isDeleted) {
          // Conta foi excluída, fazer logout
          await signOut({ callbackUrl: "/" });
        }
      } catch (error) {
        console.error("Erro ao verificar status da conta:", error);
      }
    };

    // Verificar imediatamente
    checkAccountStatus();

    // Verificar a cada 30 segundos
    const interval = setInterval(checkAccountStatus, 30000);

    return () => clearInterval(interval);
  }, [session?.user?.id]);
}