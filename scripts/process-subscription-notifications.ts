#!/usr/bin/env ts-node

import { processSubscriptionNotifications } from '../src/lib/subscription-notifications.js';

async function main() {
  console.log('🚀 Iniciando processamento de notificações de assinatura...');
  console.log(`⏰ Executado em: ${new Date().toLocaleString('pt-BR')}\n`);

  try {
    await processSubscriptionNotifications();
    console.log('\n🎉 Processamento concluído com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro durante o processamento:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export { main };