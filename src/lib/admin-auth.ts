import { auth } from "../../auth";
import { prisma } from "@/utils/prisma";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
}

export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return null;
    }

    // Verificar se o usuário ainda existe, não foi excluído e tem role ADMIN
    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(session.user.id),
        role: "ADMIN",
        isDeleted: false,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name || "Admin",
      email: session.user.email || "",
      role: "ADMIN",
    };
  } catch (error) {
    console.error("Erro ao validar sessão admin:", error);
    return null;
  }
}
