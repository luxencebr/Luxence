import { prismaAuth as prisma } from "@/utils/prisma-auth";
import { compareSync } from "bcryptjs";

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  gender: "MALE" | "FEMALE" | "TRANS" | null; // 👈
  signature: string | null;
  preferences?: ("MALE" | "FEMALE" | "TRANS")[];
  producer?: {
    id: number;
  } | null;
};

export default async function connector(
  email: string,
  password: string
): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: { 
      email,
      isDeleted: false // Não permitir login de usuários excluídos
    },
    include: {
      producer: true,
      preferences: true,
    },
  });

  if (!user) return null;

  const passwordMatches = compareSync(password, user.password);
  if (!passwordMatches) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    gender: user.gender, // 👈 AQUI
    signature: user.producer?.signature ?? null,
    preferences: user.preferences.map(
      (p) => p.gender as "MALE" | "FEMALE" | "TRANS"
    ),
    producer: user.producer ? { id: user.producer.id } : null,
  };
}
