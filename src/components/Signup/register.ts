import { validator } from "./validator";

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

  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    gender: formData.get("gender") as "MALE" | "FEMALE" | "FEMALETRANS" | "",
    preffer: formData.getAll("genderPreffer").join(","),
    role,
  };

  console.log(data);

  const errors = validator(data);

  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return;
  }

  setErrors({});

  setErrors({});

  try {
    setIsLoading?.(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setErrors({ general: result.error || "Erro ao cadastrar." });
      return;
    }

    setSuccess?.("Cadastro realizado com sucesso!");
  } catch (err) {
    setErrors({ general: "Erro inesperado. Tente novamente." });
  } finally {
    setIsLoading?.(false);
  }
}
