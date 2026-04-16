@echo off
REM Demo Launcher for Windows - Run this to see the full ERP integration demo

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                                                                    ║
echo ║    AI Supply Chain Simulation Platform - Demo Launcher            ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo This will start 2 servers:
echo   1. Mock ERP Server (port 8080) - simulates SAP/Oracle/NetSuite
echo   2. React App (port 3001) - the web interface
echo.
echo On Windows, you may need to run these in separate terminal windows.
echo.
pause

echo.
setlocal enabledelayedexpansion
for /f "tokens=* USEBACKQ" %%F in (`wmic os get osarchitecture`) do (
    if "%%F"=="32-bit" (
        echo Starting Mock ERP Server...
        start "ERP Server" cmd /k npm run server
    ) else (
        echo Starting Mock ERP Server...
        start "ERP Server" cmd /k "npm run server"
    )
)

REM Wait for server to start
timeout /t 3 /nobreak

echo.
echo Starting React Application with ERP Connection...
set VITE_ERP_API_BASE=http://localhost:8080
npm run dev

echo.
echo Demo complete! Both servers are running.
echo   - ERP Server: http://localhost:8080
echo   - React App: http://localhost:3001
echo.
pause
