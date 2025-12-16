#!/bin/bash

# Comprehensive health check script
# Usage: ./scripts/health-check.sh [URL]

URL="${1:-http://localhost:3000}"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "🏥 Health Check - $TIMESTAMP"
echo "URL: $URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to check status
check_status() {
    local name=$1
    local url=$2
    local expected=$3
    
    response=$(curl -s -w "%{http_code}" "$url")
    http_code="${response: -3}"
    body="${response:0:-3}"
    
    if [ "$http_code" = "$expected" ]; then
        echo -e "${GREEN}✓${NC} $name: OK"
        return 0
    else
        echo -e "${RED}✗${NC} $name: FAILED (HTTP $http_code)"
        return 1
    fi
}

# Check endpoints
echo ""
echo "📡 Endpoint Checks:"
check_status "Health" "$URL/api/health" "200"
check_status "Memory" "$URL/api/health/memory" "200"
check_status "Leak Check" "$URL/api/debug/memory-leak-check" "200"
check_status "Connections" "$URL/api/debug/connections" "200"

# Memory analysis
echo ""
echo "💾 Memory Analysis:"
MEMORY=$(curl -s "$URL/api/debug/memory-leak-check")

HEAP=$(echo $MEMORY | jq -r '.memory.heapPercentage')
GROWTH=$(echo $MEMORY | jq -r '.growth.mbPerHour')
STATUS=$(echo $MEMORY | jq -r '.status')

HEAP_NUM=$(echo $HEAP | sed 's/%//')

if (( $(echo "$HEAP_NUM < 50" | bc -l) )); then
    echo -e "  Heap Usage: ${GREEN}$HEAP${NC}"
elif (( $(echo "$HEAP_NUM < 70" | bc -l) )); then
    echo -e "  Heap Usage: ${YELLOW}$HEAP${NC}"
else
    echo -e "  Heap Usage: ${RED}$HEAP${NC}"
fi

echo "  Growth Rate: $GROWTH MB/h"
echo "  Status: $STATUS"

# Database check
echo ""
echo "🗄️  Database:"
DB=$(curl -s "$URL/api/debug/connections")
CONNECTIONS=$(echo $DB | jq -r '.connections')
DB_SIZE=$(echo $DB | jq -r '.databaseSize')

if [ "$CONNECTIONS" -lt 15 ]; then
    echo -e "  Connections: ${GREEN}$CONNECTIONS${NC}"
elif [ "$CONNECTIONS" -lt 30 ]; then
    echo -e "  Connections: ${YELLOW}$CONNECTIONS${NC}"
else
    echo -e "  Connections: ${RED}$CONNECTIONS${NC}"
fi

echo "  Size: $DB_SIZE"

# Recommendations
echo ""
echo "📋 Recommendations:"
echo $MEMORY | jq -r '.recommendations[]' | while read line; do
    echo "  $line"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Exit code based on status
if [ "$STATUS" = "critical" ]; then
    echo -e "${RED}❌ CRITICAL: Immediate action required${NC}"
    exit 2
elif [ "$STATUS" = "warning" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Monitor closely${NC}"
    exit 1
else
    echo -e "${GREEN}✅ HEALTHY: All systems operational${NC}"
    exit 0
fi
