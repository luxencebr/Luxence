"use client";

import { signIn } from "next-auth/react";

interface LogInProps {
  formData: FormData;
  setErrors?: (errors: { [key: string]: string }) => void;
  setSuccess?: (msg: string) => void;
  setIsLoading?: (v: boolean) => void;
  onAccountDeleted?: (email: string) => void;
}

export default async function logInAction({
  formData,
  setErrors,
  setSuccess,
  setIsLoading,
  onAccountDeleted,
}: LogInProps) {
  setIsLoading?.(true);
  setErrors?.({});
  setSuccess?.("");

  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    setErrors?.({ form: "Preencha com suas credenciais." });
    setIsLoading?.(false);
    return;
  }

  try {
    // Primeiro, verificar o status da conta
    const statusRes = await fetch("/api/auth/check-account-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (statusRes.ok) {
      const statusData = await statusRes.json();
      
      if (statusData.status === "deleted") {
        onAccountDeleted?.(email);
        setIsLoading?.(false);
        return;
      }
      
      if (statusData.status === "not_found" || statusData.status === "invalid_credentials") {
        setErrors?.({ form: "Dados inválidos. Verifique seu email e senha." });
        setIsLoading?.(false);
        return;
      }
    }

    // Se chegou até aqui, tentar fazer login normalmente
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      const friendlyError =
        res.error.toLowerCase().includes("credentials") ||
        res.error.toLowerCase().includes("invalid") ||
        res.error === "Configuration"
          ? "Dados inválidos. Verifique seu email e senha."
          : res.error;

      setErrors?.({ form: friendlyError });
    } else {
      setSuccess?.("Login realizado com sucesso!");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    setErrors?.({ form: "Erro interno. Tente novamente." });
  }

  setIsLoading?.(false);
}
