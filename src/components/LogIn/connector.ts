import { prisma } from "@/utils/prisma";
import { compareSync } from "bcryptjs";

type User = {
  id: number;
  email: string;
  password?: string;
  name: string;
  role: string;
  signature?: string | null;
};

export default async function connector(
  email: string,
  password: string
): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: { email: email },
    include: {
      producer: true,
    },
  });

  if (!user) {
    return null;
  }

  const passwordMatches = compareSync(password, user.password);

  if (passwordMatches) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      signature: user.producer?.signature ?? null,
    };
  }

  return null;
}
