import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/utils/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(email: string, link: string) {
  await resend.emails.send({
    from: "Luxence <no-reply@luxence.com.br>",
    to: email,
    subject: "Redefinição de senha - Luxence",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #1a1a1a; color: #ffffff; padding: 40px 20px; margin: 0;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #2a2a2a; border-radius: 12px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <h1 style="color: #d4af37; margin: 0 0 24px 0; font-size: 24px; text-align: center;">Luxence</h1>
            <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 18px;">Redefinição de senha</h2>
            <p style="color: #cccccc; line-height: 1.6; margin: 0 0 24px 0;">
              Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${link}" style="display: inline-block; background-color: #d4af37; color: #1a1a1a; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Redefinir senha
              </a>
            </div>
            <p style="color: #999999; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
              Este link expira em <strong>30 minutos</strong>.
            </p>
            <p style="color: #666666; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Luxence. Todos os direitos reservados.
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

  // invalida tokens antigos
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
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 min
      userId: user.id,
    },
  });

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`;

  await sendResetEmail(user.email, resetLink);

  return Response.json({ ok: true });
}
