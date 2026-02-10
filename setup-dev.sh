#!/bin/bash

# Script de setup do ambiente de desenvolvimento
# Para Windows, use Git Bash ou WSL

echo "🚀 Configurando ambiente de desenvolvimento..."

# 1. Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker Desktop primeiro."
    exit 1
fi

# 2. Copiar .env.example se .env.local não existir
if [ ! -f .env.local ]; then
    echo "📝 Criando .env.local..."
    cp .env.example .env.local
    echo "⚠️  Edite .env.local com suas credenciais reais!"
else
    echo "✅ .env.local já existe"
fi

# 3. Iniciar container MySQL
echo "🐳 Iniciando container MySQL..."
docker-compose up -d

# 4. Aguardar MySQL inicializar
echo "⏳ Aguardando MySQL inicializar (15 segundos)..."
sleep 15

# 5. Executar migrations
echo "📦 Executando migrations..."
npx prisma migrate deploy

# 6. Popular banco com dados
echo "🌱 Populando banco de dados..."
npx prisma db seed

# 7. Gerar Prisma Client
echo "⚙️  Gerando Prisma Client..."
npx prisma generate

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o servidor:"
echo "  npm run dev"
echo ""
echo "Para abrir o Prisma Studio:"
echo "  npm run db:studio"
