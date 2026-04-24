#!/bin/bash

# Script para configurar cron jobs do sistema
# Execute este script para configurar o processamento automático

echo "🚀 Configurando cron jobs do sistema..."

# Obter o diretório atual do projeto
PROJECT_DIR=$(pwd)

# Criar entradas do cron job
NOTIFICATIONS_CRON="0 * * * * cd $PROJECT_DIR && npm run process-notifications >> $PROJECT_DIR/logs/notifications.log 2>&1"
ANALYTICS_CRON="0 * * * * cd $PROJECT_DIR && npm run aggregate-analytics >> $PROJECT_DIR/logs/analytics.log 2>&1"

echo "📋 Entradas do cron job:"
echo "1. Notificações: $NOTIFICATIONS_CRON"
echo "2. Analytics: $ANALYTICS_CRON"
echo ""

# Criar diretório de logs se não existir
mkdir -p logs

# Verificar se já existem entradas similares
NOTIFICATIONS_EXISTS=$(crontab -l 2>/dev/null | grep -c "process-notifications")
ANALYTICS_EXISTS=$(crontab -l 2>/dev/null | grep -c "aggregate-analytics")

if [ $NOTIFICATIONS_EXISTS -gt 0 ] || [ $ANALYTICS_EXISTS -gt 0 ]; then
    echo "⚠️  Já existem entradas de cron job similares"
    echo "   Para atualizar, remova as entradas existentes primeiro:"
    echo "   crontab -e"
else
    echo "➕ Adicionando entradas ao cron job..."
    
    # Adicionar ao crontab
    (crontab -l 2>/dev/null; echo "$NOTIFICATIONS_CRON"; echo "$ANALYTICS_CRON") | crontab -
    
    if [ $? -eq 0 ]; then
        echo "✅ Cron jobs configurados com sucesso!"
        echo ""
        echo "📊 O sistema irá:"
        echo "   - Executar a cada hora (0 * * * *)"
        echo "   - Processar notificações automaticamente"
        echo "   - Agregar dados de analytics automaticamente"
        echo "   - Salvar logs em: $PROJECT_DIR/logs/"
        echo ""
        echo "🔍 Para verificar os cron jobs:"
        echo "   crontab -l"
        echo ""
        echo "📝 Para editar os cron jobs:"
        echo "   crontab -e"
        echo ""
        echo "📋 Para ver os logs:"
        echo "   tail -f logs/notifications.log"
        echo "   tail -f logs/analytics.log"
    else
        echo "❌ Erro ao configurar cron jobs"
        exit 1
    fi
fi

echo ""
echo "🎯 Sistema ATIVO e configurado!"
echo "   - Notificações processadas automaticamente a cada hora"
echo "   - Analytics agregados automaticamente a cada hora"