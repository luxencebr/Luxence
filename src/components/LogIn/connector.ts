import { prisma } from "@/utils/prisma";
import { compareSync } from "bcryptjs";

type User = {
  email: string;
  password?: string;
  name: string;
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
      email: user.email,
      name: user.name,
    };
  }

  return null;
}
