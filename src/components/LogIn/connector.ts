import { prisma } from "@/utils/prisma";
import { compareSync } from "bcryptjs";

type User = {
  id: number; // Adicionado id ao tipo de retorno
  email: string;
  password?: string;
  name: string;
  role: string;
};

export default async function connector(
  email: string,
  password: string
): Promise<User | null> {
  const user = await prisma.user.findFirst({ where: { email: email } });

  if (!user) {
    return null;
  }

  const passwordMatches = compareSync(password, user.password);

  if (passwordMatches) {
    return {
      id: user.id, // Retornando o id do usuário
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  return null;
}
