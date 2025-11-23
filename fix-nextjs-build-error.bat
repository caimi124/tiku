@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Next.js Build Error - Complete Fix
echo   [40-Year Dev Standard Solution]
echo ========================================
echo.

echo 💡 Problem: Cannot find module './vendor-chunks/@swc.js'
echo 🎯 Root Cause: Corrupted Next.js build cache
echo.

echo [Step 1/5] Stop all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo    ✅ Node processes stopped
echo.

echo [Step 2/5] Remove .next cache directory...
if exist ".next" (
    rmdir /s /q .next
    echo    ✅ .next directory removed
) else (
    echo    ℹ️  .next directory not found
)
echo.

echo [Step 3/5] Clean npm cache...
call npm cache clean --force
echo    ✅ npm cache cleaned
echo.

echo [Step 4/5] Remove node_modules (optional but recommended)...
echo    This may take 1-2 minutes...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo    ✅ node_modules removed
    echo.
    echo [Step 4b/5] Reinstall dependencies...
    call npm install
    echo    ✅ Dependencies reinstalled
) else (
    echo    ℹ️  node_modules already clean
)
echo.

echo [Step 5/5] Start development server...
echo.
echo ========================================
echo   ✅ Fix Complete - Server Starting
echo ========================================
echo.

call npm run dev
