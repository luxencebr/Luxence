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

async function sendResetEmail(email: string, link: string) {
  const resend = getResend();

  await resend.emails.send({
    from: "Luxence <no-reply@luxence.com.br>",
    replyTo: "contato@luxence.com.br",
    to: email,
    subject: "Redefinição de senha - Luxence",
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
            <h2>Redefinição de senha</h2>
            <p>
              Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${link}" style="background-color: #d4af37; color: #1a1a1a; padding: 14px 32px; border-radius: 6px; font-weight: bold; text-decoration: none;">
                Redefinir senha
              </a>
            </div>
            <p style="font-size: 14px;">Este link expira em <strong>30 minutos</strong>.</p>
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
  const { email } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Segurança: nunca revela se existe
  if (!user) {
    return Response.json({ ok: true });
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      userId: user.id,
    },
  });

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`;

  await sendResetEmail(user.email, resetLink);

  return Response.json({ ok: true });
}
