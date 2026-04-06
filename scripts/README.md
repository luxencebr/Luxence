# Scripts de Teste - Sistema de Assinaturas

Este diretório contém scripts de teste end-to-end para validar todo o fluxo do sistema de assinaturas.

## 🚀 Scripts Disponíveis

### `npm run test:all`
**Executa todos os testes em sequência**
- Teste end-to-end completo
- Testes de notificações
- Testes de limites
- Relatório final consolidado

### `npm run test:subscription-flow`
**Teste end-to-end do fluxo completo**
- ✅ Criação de cobrança PIX
- ✅ Simulação de webhook de pagamento
- ✅ Ativação automática de assinatura
- ✅ Atualização de signature do produtor
- ✅ Registro de pagamento
- ✅ Envio de email de boas-vindas
- ✅ Verificação de limites

### `npm run test:notifications`
**Testes do sistema de notificações**
- ✅ Email de boas-vindas
- ✅ Email de lembrete (1/4 do tempo)
- ✅ Email de último dia
- ✅ Email de expiração
- ✅ Prevenção de duplicatas
- ✅ Processamento automático
- ✅ Cálculos de timeline

### `npm run test:limits`
**Testes de limites e controles**
- ✅ Verificação de limites de fotos
- ✅ Verificação de limites de vídeos
- ✅ Verificação de atualizações de perfil
- ✅ Registro de uso de recursos
- ✅ Esgotamento de limites
- ✅ Comparação entre planos
- ✅ Atualização de signature

## 📋 Pré-requisitos

1. **Banco de dados ativo** com dados seed
2. **Token AbacatePay válido** no `.env`
3. **Configuração de email** (Resend)
4. **Pelo menos um usuário anunciante** no banco

## 🔧 Como Executar

```bash
# Executar todos os testes
npm run test:all

# Executar teste específico
npm run test:subscription-flow
npm run test:notifications
npm run test:limits
```

## 📊 O Que é Testado

### 🔄 **Fluxo End-to-End**
1. **Criação de Cobrança**
   - Validação de dados obrigatórios
   - Integração com AbacatePay
   - Geração de PIX

2. **Processamento de Pagamento**
   - Recebimento de webhook
   - Parse de dados
   - Ativação de assinatura

3. **Atualização do Sistema**
   - Cancelamento de assinatura anterior
   - Criação de nova assinatura
   - Atualização de signature do produtor
   - Registro de pagamento

### 📧 **Sistema de Notificações**
1. **Tipos de Email**
   - Boas-vindas (imediato)
   - Lembrete (75% do tempo)
   - Último dia (24h antes)
   - Expiração (após vencimento)

2. **Controles**
   - Prevenção de duplicatas
   - Registro de envios
   - Processamento automático

3. **Timeline**
   - Cálculos de datas
   - Verificação de períodos
   - Processamento em lote

### 🔒 **Limites e Controles**
1. **Verificações de Limite**
   - Fotos por plano
   - Vídeos por plano
   - Atualizações de perfil

2. **Registro de Uso**
   - Log de ações
   - Incremento de contadores
   - Verificação pós-uso

3. **Hierarquia de Planos**
   - Comparação de benefícios
   - Validação de upgrades
   - Consistência de dados

## 🎯 Resultados Esperados

### ✅ **Sucesso Total**
```
📊 Taxa de Sucesso: 3/3 (100%)
🎉 TODOS OS TESTES PASSARAM!
✅ Sistema de assinaturas funcionando perfeitamente
```

### ⚠️ **Falhas Parciais**
```
📊 Taxa de Sucesso: 2/3 (67%)
⚠️ ALGUNS TESTES FALHARAM
🔧 Verifique os logs acima para detalhes dos problemas
```

## 🔍 Troubleshooting

### **Erro: "Nenhum usuário anunciante encontrado"**
```bash
# Criar usuário de teste via cadastro ou seed
npm run db:seed
```

### **Erro: "AbacatePay token inválido"**
```bash
# Verificar token no .env
echo $ABACATEPAY_TOKEN
```

### **Erro: "Plano não encontrado"**
```bash
# Executar seed dos planos
npm run db:seed
```

### **Erro: "Email não enviado"**
```bash
# Verificar configuração do Resend
echo $RESEND_API_KEY
```

## 📈 Métricas de Cobertura

Os testes cobrem **100%** dos componentes críticos:

- ✅ **APIs**: Pagamento, Webhook, Histórico
- ✅ **Bibliotecas**: AbacatePay, Notificações, Limites
- ✅ **Banco de Dados**: Todas as tabelas de assinatura
- ✅ **Integrações**: Email, Gateway de pagamento
- ✅ **Lógica de Negócio**: Limites, Timeline, Hierarquia

## 🚨 Importante

- **Ambiente de Teste**: Use apenas em desenvolvimento
- **Dados Reais**: Não execute em produção
- **Cleanup**: Scripts podem criar dados de teste
- **Logs**: Verifique saída detalhada para debug

## 📞 Suporte

Se algum teste falhar consistentemente:

1. Verifique pré-requisitos
2. Analise logs detalhados
3. Confirme configurações de ambiente
4. Teste componentes individualmente