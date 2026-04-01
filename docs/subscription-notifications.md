# Sistema de Notificações de Assinatura

Este documento descreve o sistema completo de notificações por email para assinaturas da plataforma Luxence.

## Visão Geral

O sistema envia emails automáticos em momentos específicos do ciclo de vida da assinatura:

1. **Boas-vindas**: Imediatamente após a ativação da assinatura
2. **Lembrete**: Quando falta 1/4 do tempo da assinatura (25% do tempo restante)
3. **Último dia**: No último dia antes da expiração
4. **Expiração**: Quando a assinatura expira

## Lógica de Timing

### Cálculo do Lembrete (1/4 do tempo)

- **Planos mensais (30 dias)**: Lembrete enviado quando faltam ~7-8 dias
- **Planos semanais (7 dias)**: Lembrete enviado quando faltam ~2 dias
- **Fórmula**: `reminderDate = startDate + (totalDuration * 0.75)`

### Exemplos de Timeline

#### Plano Mensal (30 dias)
```
Dia 1:  ✅ Email de boas-vindas
Dia 22: ✅ Email de lembrete (faltam 8 dias)
Dia 30: ✅ Email de último dia
Dia 31: ✅ Email de expiração + status EXPIRED
```

#### Plano Semanal (7 dias)
```
Dia 1: ✅ Email de boas-vindas
Dia 5: ✅ Email de lembrete (faltam 2 dias)
Dia 7: ✅ Email de último dia
Dia 8: ✅ Email de expiração + status EXPIRED
```

## Estrutura dos Emails

### 1. Email de Boas-vindas
- **Assunto**: "Bem-vindo ao plano [NOME]! 🎉"
- **Conteúdo**: 
  - Agradecimento pela assinatura
  - Lista completa de benefícios do plano
  - Data de expiração
  - Botão para acessar o perfil

### 2. Email de Lembrete
- **Assunto**: "⏰ Sua assinatura expira em X dias"
- **Conteúdo**:
  - Aviso sobre a proximidade da expiração
  - Lembrança dos benefícios que serão perdidos
  - Botão para renovar a assinatura

### 3. Email de Último Dia
- **Assunto**: "⚠️ Sua assinatura expira hoje!"
- **Conteúdo**:
  - Urgência sobre a expiração
  - Últimas horas para renovar
  - Botão para renovar a assinatura

### 4. Email de Expiração
- **Assunto**: "Sua assinatura expirou - Reative agora! 🔄"
- **Conteúdo**:
  - Confirmação da expiração
  - Explicação sobre a volta ao plano gratuito
  - Incentivo para reativar
  - Botão para reativar a assinatura

## Implementação Técnica

### Arquivos Principais

```
src/lib/
├── email.ts                    # Utilitário base para envio de emails
├── subscription-emails.ts      # Templates dos emails
└── subscription-notifications.ts # Lógica de processamento

src/app/api/admin/subscriptions/
├── route.ts                    # API que envia email de boas-vindas
└── notifications/route.ts      # API para processamento manual

scripts/
└── process-subscription-notifications.ts # Script para cron job
```

### Banco de Dados

#### Tabela `SubscriptionNotification`
```sql
CREATE TABLE SubscriptionNotification (
    id VARCHAR(191) PRIMARY KEY,
    subscriptionId VARCHAR(191) NOT NULL,
    type ENUM('WELCOME', 'REMINDER', 'LAST_DAY', 'EXPIRED'),
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    emailSent BOOLEAN DEFAULT true,
    metadata JSON,
    
    UNIQUE KEY unique_notification (subscriptionId, type)
);
```

### Prevenção de Duplicatas

O sistema usa a constraint `UNIQUE(subscriptionId, type)` para garantir que:
- Cada tipo de email seja enviado apenas uma vez por assinatura
- Não haja spam de notificações
- O sistema seja idempotente

## Configuração

### Variáveis de Ambiente

```bash
# Email (configure seu provedor)
RESEND_API_KEY="sua_chave_resend"

# URL base da aplicação
NEXTAUTH_URL="https://seu-dominio.com"
```

### Processamento Automático

#### Opção 1: Cron Job (Recomendado)
```bash
# Executar a cada hora
0 * * * * cd /path/to/project && npm run process-notifications

# Ou usando ts-node diretamente
0 * * * * cd /path/to/project && npx ts-node scripts/process-subscription-notifications.ts
```

#### Opção 2: API Manual
```bash
# Endpoint para administradores
POST /api/admin/subscriptions/notifications
Authorization: Bearer [admin-token]
```

## Uso

### 1. Criação de Assinatura

Quando uma assinatura é criada via API admin, o email de boas-vindas é enviado automaticamente:

```typescript
// src/app/api/admin/subscriptions/route.ts
const subscription = await prisma.subscription.create({...});

// Email enviado automaticamente (não bloqueia a resposta)
sendWelcomeSubscriptionEmail(subscription).catch(console.error);
```

### 2. Processamento Periódico

Execute o script de processamento regularmente:

```bash
npm run process-notifications
```

### 3. Monitoramento

Verifique os logs de notificações:

```sql
SELECT 
    sn.type,
    sn.sentAt,
    u.email,
    sp.name as planName
FROM SubscriptionNotification sn
JOIN Subscription s ON s.id = sn.subscriptionId
JOIN User u ON u.id = s.userId
JOIN SubscriptionPlan sp ON sp.id = s.planId
ORDER BY sn.sentAt DESC;
```

## Testes

### Criar Usuário de Teste
```bash
node test-subscription-notifications.js
```

### Testar Notificações
```bash
node test-notifications.js
```

### Testar Processamento Automático
```bash
node test-auto-processing.js
```

## Personalização

### Modificar Templates

Edite os arquivos em `src/lib/subscription-emails.ts` para personalizar:
- Conteúdo dos emails
- Styling HTML
- Botões de ação
- Metadados incluídos

### Adicionar Novos Tipos

1. Adicione o tipo no enum `NOTIFICATION_TYPE` no schema
2. Crie o template em `subscription-emails.ts`
3. Adicione a lógica em `subscription-notifications.ts`
4. Execute a migração do banco

### Configurar Outros Provedores

O sistema usa Resend por padrão, mas pode ser adaptado para outros provedores modificando `src/lib/email.ts`.

## Troubleshooting

### Emails não estão sendo enviados
1. Verifique a configuração do `RESEND_API_KEY`
2. Confirme que o domínio está verificado no Resend
3. Verifique os logs de erro no console

### Duplicatas de email
- O sistema previne duplicatas automaticamente
- Se necessário, limpe a tabela `SubscriptionNotification`

### Processamento não está funcionando
1. Verifique se o cron job está configurado corretamente
2. Execute manualmente: `npm run process-notifications`
3. Use a API admin para processamento manual

## Roadmap

- [ ] Integração com WhatsApp para notificações
- [ ] Dashboard admin para visualizar estatísticas de emails
- [ ] Templates personalizáveis via interface
- [ ] Suporte a múltiplos idiomas
- [ ] Métricas de abertura e clique dos emails