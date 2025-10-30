export interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  preffer: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validator(data: FormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name && data.name.length < 3) {
    errors.name = "O nome deve ter pelo menos 3 caracteres.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email && !emailRegex.test(data.email)) {
    errors.email = "Email inválido.";
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!data.password && !passwordRegex.test(data.password)) {
    errors.password =
      "A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos.";
  }

  if (data.password && data.password !== data.confirmPassword) {
    errors.confirmPassword = "As senhas não coincidem.";
  }

  if (!data.gender) {
    errors.gender = "Selecione seu gênero.";
  }

  if (!data.preffer || data.preffer.length === 0) {
    errors.preferences = "Selecione ao menos uma preferência.";
  }

  return errors;
}
