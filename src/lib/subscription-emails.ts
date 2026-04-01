import { SubscriptionPlan } from "@prisma/client";
import { createEmailTemplate, EmailTemplate } from "./email";

export function createWelcomeSubscriptionEmail(
  userName: string,
  plan: SubscriptionPlan,
  expirationDate: Date
): EmailTemplate {
  const daysUntilExpiration = Math.ceil(
    (expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const benefits = [
    { icon: '📷', text: `Até ${plan.maxPhotos} fotos no seu perfil` },
    { icon: '🎬', text: `Até ${plan.maxVideos} vídeos para demonstrar seus serviços` },
    { icon: '✏️', text: `${plan.maxProfileUpdates} atualizações de perfil por mês` },
    ...(plan.hasCommentControl ? [{ icon: '💬', text: 'Controle total sobre comentários em seu perfil' }] : []),
    ...(plan.hasVoiceDemo ? [{ icon: '🎤', text: 'Recurso de demonstração de voz disponível' }] : []),
    ...(plan.priority && plan.priority !== '' ? [{ icon: '⭐', text: `Prioridade ${plan.priority} na exibição dos resultados` }] : []),
    ...(plan.hasFeaturedProfile ? [{ icon: '🌟', text: 'Seu perfil será destacado na plataforma' }] : []),
  ];

  const benefitsList = benefits.map(benefit => 
    `<tr>
      <td style="padding: 8px 0; vertical-align: top;">
        <span style="font-size: 18px; margin-right: 12px;">${benefit.icon}</span>
      </td>
      <td style="padding: 8px 0; color: #cccccc; font-size: 15px; line-height: 1.5;">
        ${benefit.text}
      </td>
    </tr>`
  ).join('');

  const content = `
    <p style="margin: 0 0 24px 0;">Olá <strong style="color: #ffffff;">${userName}</strong>,</p>
    
    <p style="margin: 0 0 24px 0;">Parabéns! Sua assinatura do plano <strong style="color: #d4af37;">${plan.name}</strong> foi ativada com sucesso. Agora você tem acesso a todos os recursos premium da plataforma Luxence.</p>
    
    <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 8px; padding: 24px; margin: 32px 0;">
      <h3 style="color: #d4af37; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Seus benefícios incluem:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${benefitsList}
      </table>
    </div>
    
    <div style="background-color: #2d2d00; border: 1px solid #d4af37; border-radius: 8px; padding: 20px; margin: 32px 0;">
      <p style="margin: 0; color: #d4af37; font-weight: 600; font-size: 16px;">
        <span style="font-size: 20px; margin-right: 8px;">⏰</span>
        Sua assinatura expira em ${daysUntilExpiration} dias (${expirationDate.toLocaleDateString('pt-BR')})
      </p>
    </div>
    
    <p style="margin: 0 0 16px 0;">Aproveite ao máximo todos os recursos disponíveis para destacar seu perfil e atrair mais clientes. Nossa plataforma foi desenvolvida para maximizar sua visibilidade e conversões.</p>
    
    <p style="margin: 0;">Atenciosamente,<br><strong style="color: #d4af37;">Equipe Luxence</strong></p>
  `;

  return createEmailTemplate(
    `Bem-vindo ao plano ${plan.name}!`,
    content,
    "Acessar meu perfil",
    `${process.env.NEXTAUTH_URL}/profile`
  );
}

export function createSubscriptionReminderEmail(
  userName: string,
  plan: SubscriptionPlan,
  daysRemaining: number,
  expirationDate: Date
): EmailTemplate {
  const isLastDay = daysRemaining === 0;
  const urgencyColor = isLastDay ? '#ff6b6b' : '#d4af37';
  const urgencyBg = isLastDay ? '#2d1a1a' : '#2d2d00';
  const urgencyBorder = isLastDay ? '#ff6b6b' : '#d4af37';
  
  const benefits = [
    { icon: '📷', text: `Até ${plan.maxPhotos} fotos no seu perfil` },
    { icon: '🎬', text: `Até ${plan.maxVideos} vídeos para demonstrar seus serviços` },
    { icon: '✏️', text: `${plan.maxProfileUpdates} atualizações de perfil por mês` },
    ...(plan.hasCommentControl ? [{ icon: '💬', text: 'Controle total sobre comentários' }] : []),
    ...(plan.hasVoiceDemo ? [{ icon: '🎤', text: 'Recurso de demonstração de voz' }] : []),
    ...(plan.priority && plan.priority !== '' ? [{ icon: '⭐', text: `Prioridade ${plan.priority} nos resultados` }] : []),
    ...(plan.hasFeaturedProfile ? [{ icon: '🌟', text: 'Perfil destacado na plataforma' }] : []),
  ];

  const benefitsList = benefits.map(benefit => 
    `<tr>
      <td style="padding: 6px 0; vertical-align: top;">
        <span style="font-size: 16px; margin-right: 10px;">${benefit.icon}</span>
      </td>
      <td style="padding: 6px 0; color: #cccccc; font-size: 14px; line-height: 1.4;">
        ${benefit.text}
      </td>
    </tr>`
  ).join('');

  const content = `
    <p style="margin: 0 0 24px 0;">Olá <strong style="color: #ffffff;">${userName}</strong>,</p>
    
    <div style="background-color: ${urgencyBg}; border: 1px solid ${urgencyBorder}; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0; color: ${urgencyColor}; font-weight: 600; font-size: 16px;">
        <span style="font-size: 20px; margin-right: 8px;">⚠️</span>
        ${isLastDay 
          ? `Sua assinatura do plano <strong>${plan.name}</strong> expira hoje (${expirationDate.toLocaleDateString('pt-BR')})`
          : `Sua assinatura do plano <strong>${plan.name}</strong> expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} (${expirationDate.toLocaleDateString('pt-BR')})`
        }
      </p>
    </div>
    
    <p style="margin: 0 0 24px 0;">Para continuar aproveitando todos os benefícios premium e manter seu perfil com máxima visibilidade, renove sua assinatura antes do vencimento.</p>
    
    <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 8px; padding: 24px; margin: 32px 0;">
      <h3 style="color: #d4af37; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Recursos que você continuará aproveitando:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${benefitsList}
      </table>
    </div>
    
    <p style="margin: 0 0 16px 0;"><strong style="color: #ffffff;">Não perca a oportunidade de manter seu perfil em destaque.</strong> Renove agora e continue atraindo mais clientes com todos os recursos premium da plataforma.</p>
    
    <p style="margin: 0;">Atenciosamente,<br><strong style="color: #d4af37;">Equipe Luxence</strong></p>
  `;

  return createEmailTemplate(
    isLastDay 
      ? `Sua assinatura expira hoje!`
      : `Sua assinatura expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}`,
    content,
    "Renovar assinatura",
    `${process.env.NEXTAUTH_URL}/advertiser/plans`
  );
}

export function createSubscriptionExpiredEmail(
  userName: string,
  plan: SubscriptionPlan
): EmailTemplate {
  const content = `
    <p style="margin: 0 0 24px 0;">Olá <strong style="color: #ffffff;">${userName}</strong>,</p>
    
    <div style="background-color: #2d1a1a; border: 1px solid #ff6b6b; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0; color: #ff6b6b; font-weight: 600; font-size: 16px;">
        <span style="font-size: 20px; margin-right: 8px;">❌</span>
        Sua assinatura do plano <strong>${plan.name}</strong> expirou
      </p>
    </div>
    
    <p style="margin: 0 0 24px 0;">Infelizmente, sua assinatura premium chegou ao fim. Isso significa que seu perfil voltou automaticamente para o plano gratuito da plataforma.</p>
    
    <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 8px; padding: 24px; margin: 32px 0;">
      <h3 style="color: #d4af37; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">O que mudou em seu perfil:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; vertical-align: top;">
            <span style="font-size: 18px; margin-right: 12px;">📱</span>
          </td>
          <td style="padding: 8px 0; color: #cccccc; font-size: 15px; line-height: 1.5;">
            Seu perfil voltou às limitações do plano gratuito
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top;">
            <span style="font-size: 18px; margin-right: 12px;">🔒</span>
          </td>
          <td style="padding: 8px 0; color: #cccccc; font-size: 15px; line-height: 1.5;">
            Recursos premium foram temporariamente desativados
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top;">
            <span style="font-size: 18px; margin-right: 12px;">📊</span>
          </td>
          <td style="padding: 8px 0; color: #cccccc; font-size: 15px; line-height: 1.5;">
            Seu perfil pode ter menor visibilidade nos resultados de busca
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #1a2d1a; border: 1px solid #4ade80; border-radius: 8px; padding: 20px; margin: 32px 0;">
      <h3 style="color: #4ade80; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
        <span style="font-size: 18px; margin-right: 8px;">✅</span>
        Boa notícia!
      </h3>
      <p style="margin: 0; color: #4ade80; font-size: 15px; line-height: 1.5;">
        Você pode reativar sua assinatura a qualquer momento e recuperar imediatamente todos os benefícios premium. Seus dados e configurações foram preservados.
      </p>
    </div>
    
    <p style="margin: 0 0 16px 0;"><strong style="color: #ffffff;">Não deixe seu perfil perder visibilidade.</strong> Reative sua assinatura agora e volte a aproveitar todos os recursos que fazem a diferença para atrair mais clientes.</p>
    
    <p style="margin: 0;">Atenciosamente,<br><strong style="color: #d4af37;">Equipe Luxence</strong></p>
  `;

  return createEmailTemplate(
    "Sua assinatura expirou - Reative agora!",
    content,
    "Reativar assinatura",
    `${process.env.NEXTAUTH_URL}/advertiser/plans`
  );
}