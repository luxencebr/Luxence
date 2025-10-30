"use client";

import { signIn } from "next-auth/react";

interface LogInProps {
  formData: FormData;
  setErrors?: (errors: { [key: string]: string }) => void;
  setSuccess?: (msg: string) => void;
  setIsLoading?: (v: boolean) => void;
}

export default async function logInAction({
  formData,
  setErrors,
  setSuccess,
  setIsLoading,
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

  const res = await signIn("credentials", {
    redirect: false,
    email,
    password,
  });

  if (res?.error) {
    const friendlyError =
      res.error.toLowerCase().includes("credentials") ||
      res.error.toLowerCase().includes("invalid")
        ? "Dados inválidos. Verifique seu email e senha."
        : res.error;

    setErrors?.({ form: friendlyError });
  } else {
    setSuccess?.("Login realizado com sucesso!");
  }

  setIsLoading?.(false);
}
