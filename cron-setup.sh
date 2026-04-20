#!/bin/bash

# Script para configurar cron job do sistema de notificações de assinatura
# Execute este script para configurar o processamento automático

echo "🚀 Configurando cron job para notificações de assinatura..."

# Obter o diretório atual do projeto
PROJECT_DIR=$(pwd)

# Criar entrada do cron job
CRON_ENTRY="0 * * * * cd $PROJECT_DIR && npm run process-notifications >> $PROJECT_DIR/logs/notifications.log 2>&1"

echo "📋 Entrada do cron job:"
echo "$CRON_ENTRY"
echo ""

# Criar diretório de logs se não existir
mkdir -p logs

# Verificar se já existe uma entrada similar
if crontab -l 2>/dev/null | grep -q "process-notifications"; then
    echo "⚠️  Já existe uma entrada de cron job para process-notifications"
    echo "   Para atualizar, remova a entrada existente primeiro:"
    echo "   crontab -e"
else
    echo "➕ Adicionando entrada ao cron job..."
    
    # Adicionar ao crontab
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    
    if [ $? -eq 0 ]; then
        echo "✅ Cron job configurado com sucesso!"
        echo ""
        echo "📊 O sistema irá:"
        echo "   - Executar a cada hora (0 * * * *)"
        echo "   - Processar notificações automaticamente"
        echo "   - Salvar logs em: $PROJECT_DIR/logs/notifications.log"
        echo ""
        echo "🔍 Para verificar o cron job:"
        echo "   crontab -l"
        echo ""
        echo "📝 Para editar o cron job:"
        echo "   crontab -e"
        echo ""
        echo "📋 Para ver os logs:"
        echo "   tail -f logs/notifications.log"
    else
        echo "❌ Erro ao configurar cron job"
        exit 1
    fi
fi

echo ""
echo "🎯 Sistema de notificações ATIVO e configurado!"
echo "   As notificações serão processadas automaticamente a cada hora."