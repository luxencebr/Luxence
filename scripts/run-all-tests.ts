#!/usr/bin/env ts-node

/**
 * Script principal para executar todos os testes end-to-end
 * 
 * Executa uma bateria completa de testes do sistema de assinaturas
 */

import { runEndToEndTest } from './test-subscription-flow';
import { runNotificationTests } from './test-notifications';
import { runLimitTests } from './test-subscription-limits';

async function runAllTests() {
  console.log('🚀 INICIANDO BATERIA COMPLETA DE TESTES');
  console.log('=====================================');
  console.log(`⏰ Executado em: ${new Date().toLocaleString('pt-BR')}\n`);

  const results = {
    endToEnd: false,
    notifications: false,
    limits: false,
  };

  try {
    // 1. Teste End-to-End (fluxo completo)
    console.log('🔄 EXECUTANDO TESTE END-TO-END...');
    console.log('==================================');
    await runEndToEndTest();
    results.endToEnd = true;
    console.log('\n✅ TESTE END-TO-END CONCLUÍDO\n');

  } catch (error) {
    console.error('❌ TESTE END-TO-END FALHOU:', error);
    console.log('\n⏭️ Continuando com próximos testes...\n');
  }

  try {
    // 2. Testes de Notificações
    console.log('📧 EXECUTANDO TESTES DE NOTIFICAÇÕES...');
    console.log('=======================================');
    await runNotificationTests();
    results.notifications = true;
    console.log('\n✅ TESTES DE NOTIFICAÇÕES CONCLUÍDOS\n');

  } catch (error) {
    console.error('❌ TESTES DE NOTIFICAÇÕES FALHARAM:', error);
    console.log('\n⏭️ Continuando com próximos testes...\n');
  }

  try {
    // 3. Testes de Limites
    console.log('🔒 EXECUTANDO TESTES DE LIMITES...');
    console.log('==================================');
    await runLimitTests();
    results.limits = true;
    console.log('\n✅ TESTES DE LIMITES CONCLUÍDOS\n');

  } catch (error) {
    console.error('❌ TESTES DE LIMITES FALHARAM:', error);
  }

  // Relatório final
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log('=============================');
  console.log(`⏰ Concluído em: ${new Date().toLocaleString('pt-BR')}\n`);

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log('📋 Resultados:');
  console.log(`  🔄 Teste End-to-End: ${results.endToEnd ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`  📧 Testes de Notificações: ${results.notifications ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`  🔒 Testes de Limites: ${results.limits ? '✅ PASSOU' : '❌ FALHOU'}`);

  console.log(`\n📊 Taxa de Sucesso: ${passedTests}/${totalTests} (${Math.round(passedTests / totalTests * 100)}%)`);

  if (passedTests === totalTests) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Sistema de assinaturas funcionando perfeitamente');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM');
    console.log('🔧 Verifique os logs acima para detalhes dos problemas');
  }

  console.log('\n🔍 COMPONENTES TESTADOS:');
  console.log('========================');
  console.log('✅ Criação de cobranças PIX via AbacatePay');
  console.log('✅ Processamento de webhooks de pagamento');
  console.log('✅ Ativação automática de assinaturas');
  console.log('✅ Atualização de signature do produtor');
  console.log('✅ Registro de pagamentos no banco');
  console.log('✅ Sistema de notificações por email');
  console.log('✅ Prevenção de emails duplicados');
  console.log('✅ Cálculos de timeline de notificações');
  console.log('✅ Processamento automático de notificações');
  console.log('✅ Verificação de limites de recursos');
  console.log('✅ Registro de uso de recursos');
  console.log('✅ Controle de acesso baseado em planos');
  console.log('✅ Hierarquia e comparação de planos');

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };