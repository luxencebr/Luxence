@echo off
REM Script de setup do ambiente de desenvolvimento para Windows

echo 🚀 Configurando ambiente de desenvolvimento...

REM 1. Verificar se Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está rodando. Inicie o Docker Desktop primeiro.
    exit /b 1
)

REM 2. Copiar .env.example se .env.local não existir
if not exist .env.local (
    echo 📝 Criando .env.local...
    copy .env.example .env.local
    echo ⚠️  Edite .env.local com suas credenciais reais!
) else (
    echo ✅ .env.local já existe
)

REM 3. Iniciar container MySQL
echo 🐳 Iniciando container MySQL...
docker-compose up -d

REM 4. Aguardar MySQL inicializar
echo ⏳ Aguardando MySQL inicializar (15 segundos)...
timeout /t 15 /nobreak >nul

REM 5. Executar migrations
echo 📦 Executando migrations...
call npx prisma migrate deploy

REM 6. Popular banco com dados
echo 🌱 Populando banco de dados...
call npx prisma db seed

REM 7. Gerar Prisma Client
echo ⚙️  Gerando Prisma Client...
call npx prisma generate

echo.
echo ✅ Setup concluído!
echo.
echo Para iniciar o servidor:
echo   npm run dev
echo.
echo Para abrir o Prisma Studio:
echo   npm run db:studio

pause
