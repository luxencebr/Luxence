@echo off
echo 🚀 Sistema de notificações de assinatura - Windows

echo.
echo ✅ Sistema ATIVADO com sucesso!
echo.
echo 📊 O que foi configurado:
echo    - Emails de boas-vindas ao assinar
echo    - Lembretes quando falta 1/4 do tempo
echo    - Avisos no último dia
echo    - Notificações de expiração
echo.
echo 🔄 Para processar notificações manualmente:
echo    npm run process-notifications
echo.
echo 🌐 Para processar via API (admin):
echo    POST /api/admin/subscriptions/notifications
echo.
echo ⏰ Para automatizar (recomendado):
echo    Configure um agendador de tarefas do Windows para executar:
echo    cd "%cd%" ^&^& npm run process-notifications
echo.
echo 📋 Frequência recomendada: A cada hora
echo.
echo 📝 Logs serão exibidos no console durante a execução
echo.
pause