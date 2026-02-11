import crypto from "crypto";
import { prisma } from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return Response.json(
        { error: "Email e código são obrigatórios." },
        { status: 400 }
      );
    }

    // Hash do código para comparar com o banco
    const hashedToken = crypto.createHash("sha256").update(code).digest("hex");

    // Buscar token no banco
    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: {
        email,
        token: hashedToken,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verificationToken) {
      return Response.json(
        { error: "Código inválido ou expirado." },
        { status: 400 }
      );
    }

    // Deletar token usado
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return Response.json({ ok: true, verified: true });
  } catch (error) {
    console.error("Verify email error:", error);
    return Response.json(
      { error: "Erro ao verificar código." },
      { status: 500 }
    );
  }
}
