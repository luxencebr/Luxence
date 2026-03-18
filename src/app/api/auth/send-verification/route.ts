export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/utils/prisma";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

async function sendVerificationEmail(email: string, code: string) {
  const resend = getResend();

  await resend.emails.send({
    from: "Luxence <no-reply@luxence.com.br>",
    replyTo: "contato@luxence.com.br",
    to: email,
    subject: "Código de verificação - Luxence",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #1a1a1a; color: #ffffff; padding: 40px 20px; margin: 0;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #2a2a2a; border-radius: 12px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <h1 style="color: #d4af37; margin-bottom: 24px; text-align: center;">Luxence</h1>
            <h2>Verificação de Email</h2>
            <p>
              Use o código abaixo para verificar seu email:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <div style="background-color: #1a1a1a; color: #d4af37; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </div>
            </div>
            <p style="font-size: 14px;">Este código expira em <strong>15 minutos</strong>.</p>
            <p style="font-size: 12px; color: #666; text-align: center;">
              Este é um email automático. Para suporte, escreva para contato@luxence.com.br
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json(
        { error: "Email é obrigatório." },
        { status: 400 }
      );
    }

    // Verificar se email já está cadastrado (excluindo usuários com soft delete)
    const existingUser = await prisma.user.findUnique({
      where: { email, isDeleted: false },
    });

    if (existingUser) {
      return Response.json(
        { error: "Este email já está cadastrado." },
        { status: 400 }
      );
    }

    // Deletar tokens antigos deste email
    await prisma.emailVerificationToken.deleteMany({
      where: { email },
    });

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash do código para armazenar no banco
    const hashedToken = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    // Criar token no banco (expira em 15 minutos)
    await prisma.emailVerificationToken.create({
      data: {
        email,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    // Enviar email
    await sendVerificationEmail(email, code);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Send verification error:", error);
    return Response.json(
      { error: "Erro ao enviar código de verificação." },
      { status: 500 }
    );
  }
}
