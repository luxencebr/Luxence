#!/bin/bash

# Script de teste de carga
# Simula múltiplos usuários acessando a aplicação

API_URL="${1:-http://localhost:3000}"
REQUESTS="${2:-100}"
CONCURRENT="${3:-10}"

echo "🚀 Iniciando teste de carga..."
echo "URL: $API_URL"
echo "Requests: $REQUESTS"
echo "Concurrent: $CONCURRENT"
echo ""

# Verificar se 'ab' (Apache Bench) está instalado
if ! command -v ab &> /dev/null; then
    echo "❌ Apache Bench (ab) não está instalado."
    echo "Instale com: sudo apt-get install apache2-utils"
    exit 1
fi

# Endpoint para testar
ENDPOINTS=(
    "/api/health"
    "/api/health/memory"
    "/api/home"
)

for endpoint in "${ENDPOINTS[@]}"; do
    echo "📊 Testando: $endpoint"
    ab -n $REQUESTS -c $CONCURRENT -q "$API_URL$endpoint" | grep -E "Requests per second|Time per request|Failed requests"
    echo ""
done

echo "✅ Teste de carga completo!"
echo ""
echo "📈 Verificar memória após teste:"
curl -s "$API_URL/api/debug/memory-leak-check" | jq '.memory, .growth'
