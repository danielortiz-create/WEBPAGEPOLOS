@echo off
echo.
echo  ██████╗ ██╗██╗   ██╗████████╗
echo  ██╔══██╗██║██║   ██║╚══██╔══╝
echo  ██████╔╝██║██║   ██║   ██║
echo  ██╔══██╗██║╚██╗ ██╔╝   ██║
echo  ██║  ██║██║ ╚████╔╝    ██║
echo  ╚═╝  ╚═╝╚═╝  ╚═══╝     ╚═╝
echo.
echo  Iniciando servidores RIVT...
echo.

:: Iniciar backend (puerto 4000)
echo [1/2] Iniciando API (puerto 4000)...
start "RIVT Backend" cmd /k "cd /d "%~dp0Pagina web\server" && node src/index.js"
timeout /t 3 /nobreak > nul

:: Iniciar frontend (puerto 3000)
echo [2/2] Iniciando tienda (puerto 3000)...
start "RIVT Frontend" cmd /k "cd /d "%~dp0Pagina web\client" && npm run dev"

echo.
echo  Listo! Abre estos URLs:
echo   Tienda:       http://localhost:3000
echo   Panel Admin:  http://localhost:3000/admin
echo   API:          http://localhost:4000/api/health
echo.
