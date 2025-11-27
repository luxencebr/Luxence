import type React from "react";
import { validator, type RegisterFormData } from "./validator";
import { signIn } from "next-auth/react";

interface RegisterProps {
  setErrors: (errors: { [key: string]: string }) => void;
  setSuccess?: (msg: string) => void;
}

export default async function register(
  event: React.FormEvent<HTMLFormElement>,
  {
    setErrors,
    setSuccess,
    setIsLoading,
    role,
  }: RegisterProps & {
    setIsLoading?: (v: boolean) => void;
    role: "CLIENT" | "ADVERTISER";
  }
) {
  const formData = new FormData(event.currentTarget);

  const data: RegisterFormData = {
    name: (formData.get("name") as string) || "",
    email: (formData.get("email") as string) || "",
    password: (formData.get("password") as string) || "",
    confirmPassword: (formData.get("confirmPassword") as string) || "",
    gender: (formData.get("gender") as "MALE" | "FEMALE" | "TRANS" | "") || "",
    preferences: formData
      .getAll("genderPreffer")
      .filter((v): v is string => typeof v === "string"),
  };

  const errors = validator(data);
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return { ok: false };
  }

  try {
    setIsLoading?.(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role }),
    });

    const result = await res.json();

    if (!res.ok) {
      setErrors({ general: result.error || "Erro ao cadastrar." });
      setIsLoading?.(false);
      return { ok: false };
    }

    setSuccess?.("Cadastro realizado com sucesso!");

    const signInResult = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (signInResult?.error) {
      // Cadastro OK mas login falhou
      setSuccess?.("Cadastro realizado! Faça login para continuar.");
      return {
        ok: true,
        role,
        userId: result.user.id,
        loginSuccess: false,
      };
    }

    return {
      ok: true,
      role,
      userId: result.user.id,
      loginSuccess: true,
    };
  } catch (err) {
    console.error("Erro ao registrar:", err);
    setErrors({ general: "Erro inesperado. Tente novamente." });
    setIsLoading?.(false);
    return { ok: false };
  }
}
