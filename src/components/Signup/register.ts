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
  event.preventDefault();

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

  console.log("Enviando para API:", { ...data, role });

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
      return { ok: false };
    }

    setSuccess?.("Cadastro realizado com sucesso!");

    // Faz login automático
    await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    return {
      ok: true,
      role,
      userId: result.user.id, // ⬅ AQUI!
    };
  } catch (err) {
    console.error("Erro ao registrar:", err);
    setErrors({ general: "Erro inesperado. Tente novamente." });
    return { ok: false };
  } finally {
    setIsLoading?.(false);
  }
}
