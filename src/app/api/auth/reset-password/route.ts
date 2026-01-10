import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return Response.json(
        { error: "Token e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Hash do token para comparar com o banco
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Buscar token no banco
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      return Response.json(
        { error: "Token inválido ou expirado." },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar senha do usuário
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Deletar todos os tokens de reset do usuário
    await prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
