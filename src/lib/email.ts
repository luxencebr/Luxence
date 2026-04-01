import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<void> {
  const resend = getResend();

  await resend.emails.send({
    from: "Luxence <no-reply@luxence.com.br>",
    replyTo: "contato@luxence.com.br",
    to,
    subject: template.subject,
    html: template.html,
  });
}

export function createEmailTemplate(
  title: string,
  content: string,
  buttonText?: string,
  buttonUrl?: string
): EmailTemplate {
  return {
    subject: title,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          </style>
        </head>
        <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #1a1a1a; color: #ffffff; padding: 40px 20px; margin: 0; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #2a2a2a; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            
            <!-- Header -->
            <div style="background-color: #2a2a2a; padding: 32px; text-align: center; border-bottom: 2px solid #d4af37;">
              <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">Luxence</h1>
              <p style="color: #cccccc; margin: 8px 0 0 0; font-size: 14px;">Plataforma Premium de Acompanhantes</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 32px;">
              <h2 style="color: #ffffff; margin: 0 0 24px 0; font-size: 24px; font-weight: 600; line-height: 1.3;">${title}</h2>
              <div style="color: #cccccc; font-size: 16px; line-height: 1.7;">
                ${content}
              </div>
              
              ${buttonText && buttonUrl ? `
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${buttonUrl}" style="display: inline-block; background-color: #d4af37; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">
                    ${buttonText}
                  </a>
                </div>
              ` : ''}
            </div>

            <!-- Footer -->
            <div style="background-color: #1a1a1a; padding: 24px 32px; border-top: 1px solid #333333;">
              <p style="color: #888888; font-size: 14px; margin: 0; text-align: center;">
                Este é um email automático do sistema Luxence.<br>
                Para suporte, entre em contato: <a href="mailto:contato@luxence.com.br" style="color: #d4af37; text-decoration: none;">contato@luxence.com.br</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}