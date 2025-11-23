@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   Quick Fix - Next.js Cache Issue
echo ==========================================
echo.

taskkill /F /IM node.exe >nul 2>&1
echo ✅ Stopped Node processes
timeout /t 1 >nul

if exist ".next" rmdir /s /q .next
echo ✅ Removed .next cache

echo.
echo ✅ Starting server...
echo.
call npm run dev
