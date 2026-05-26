# Dados Horários de Analytics - Período 24h

## Funcionalidade Implementada

O sistema agora suporta visualização de dados por hora para o período de 24h, mostrando:

- **Dados do dia atual**: De 00h até a hora atual
- **Atualização automática**: Novos pontos são adicionados a cada hora
- **Interface responsiva**: Adaptada para desktop e mobile
- **Visualização otimizada**: Grid e espaçamento ajustados para dados horários

## Como Funciona

### Backend
- **Analytics Service**: Método `getSessionsByHour()` que filtra sessões do dia atual
- **Fuso horário**: Usa horário de Brasília (UTC-3) para consistência
- **Dados em tempo real**: Mostra apenas horas passadas e a atual

### Frontend
- **Título dinâmico**: "Acessos por Hora (Hoje)" para período 24h
- **Grid adaptativo**: Espaçamento menor para dados horários
- **Labels otimizadas**: Formato "00h", "01h", etc.
- **Responsividade**: Em mobile, mostra apenas algumas labels para evitar sobreposição

## Testando a Funcionalidade

### 1. Executar Script de Teste
```bash
# Criar dados de teste para o dia atual
npx tsx scripts/test-hourly-data.ts
```

Este script:
- Cria sessões aleatórias para cada hora do dia atual até a hora atual
- Simula padrões realistas de uso (1-15 sessões por hora)
- Inclui dados variados (usuários logados/anônimos, diferentes dispositivos)

### 2. Visualizar no Dashboard
1. Acesse `/admin/metrics`
2. Selecione o período "24h"
3. Observe o gráfico "Acessos por Hora (Hoje)"

### 3. Comportamento Esperado
- **Manhã**: Gráfico mostra de 00h até hora atual
- **Tarde/Noite**: Mais pontos no gráfico conforme o dia avança
- **Meia-noite**: Gráfico reinicia para o novo dia

## Estrutura de Dados

### Formato de Resposta
```typescript
{
  date: "2026-05-26T08:00:00",  // ISO string com hora
  views: 12,                    // Número de sessões na hora
  label: "08h",                 // Label para exibição
  isHourly: true               // Flag indicando dados horários
}
```

### Diferenças por Período
- **24h**: Dados por hora (00h-23h)
- **7d**: Dados por dia com dia da semana
- **30d**: Dados agrupados de 3 em 3 dias
- **1y**: Dados por mês
- **all**: Dados por trimestre/ano

## Responsividade

### Desktop
- Grid normal com todas as labels visíveis
- Pontos de 3px de raio
- Labels de 10px/8px

### Mobile (< 768px)
- Grid mais compacto
- Pontos de 2.5px de raio
- Labels de 9px/7px

### Mobile Pequeno (< 480px)
- Mostra apenas labels a cada 4 horas
- Labels de 8px/6px
- Oculta informações secundárias

## Próximos Passos

1. **Agregação automática**: Implementar job que roda a cada hora
2. **Cache**: Otimizar consultas para dados horários
3. **Comparação**: Mostrar dados do dia anterior
4. **Picos de atividade**: Destacar horários de maior movimento