@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ============================================
echo   Sistema MEI - Iniciando ambiente local
echo ============================================
echo.

REM --- Verifica se o Docker esta instalado ---
where docker >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Docker nao foi encontrado no PATH.
    echo Instale o Docker Desktop e certifique-se de que esta em execucao:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

REM --- Cria o .env a partir do .env.example, se ainda nao existir ---
if not exist ".env" (
    echo Criando arquivo .env a partir de .env.example...
    copy /y ".env.example" ".env" >nul
    echo.
    echo [ATENCAO] Gere uma chave de criptografia real e configure ENCRYPTION_KEY no .env:
    echo   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    echo.
)

REM --- Instala dependencias na primeira execucao ---
if not exist "node_modules" (
    echo Instalando dependencias do projeto ^(primeira execucao, pode demorar alguns minutos^)...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    )
)

REM --- Sobe Postgres e Redis via Docker Compose ---
echo.
echo Subindo Postgres e Redis...
docker compose up -d postgres redis
if errorlevel 1 (
    echo [ERRO] Nao foi possivel subir os containers. Verifique se o Docker Desktop esta rodando.
    pause
    exit /b 1
)

echo Aguardando o banco de dados ficar pronto...
timeout /t 6 /nobreak >nul

REM --- Gera o Prisma Client e aplica as migrations ---
echo.
echo Preparando o banco de dados (Prisma)...
call npm run prisma:generate --workspace=apps/api
call npm run prisma:migrate --workspace=apps/api

REM --- Inicia a API em uma nova janela ---
echo.
echo Iniciando a API (http://localhost:3001, docs em /docs)...
start "Sistema MEI - API" cmd /k "cd /d "%~dp0" && npm run dev:api"

timeout /t 4 /nobreak >nul

REM --- Inicia o painel web em uma nova janela ---
echo Iniciando o painel web (http://localhost:3000)...
start "Sistema MEI - Web" cmd /k "cd /d "%~dp0" && npm run dev:web"

timeout /t 6 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ============================================
echo   Sistema MEI iniciado!
echo   Painel web : http://localhost:3000
echo   API        : http://localhost:3001
echo   Swagger    : http://localhost:3001/docs
echo.
echo   Login de teste: admin@sistemamei.com.br / Senha@Forte123
echo   (feche as janelas "Sistema MEI - API" e "Sistema MEI - Web" para parar)
echo ============================================
echo.
pause
