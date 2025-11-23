@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   导入前检查 - Pre-Import Check
echo ========================================
echo.

echo 💡 这个脚本会检查所有导入前置条件
echo 💡 任何检查失败都会停止，避免浪费时间
echo.

set /p JSON_FILE="请输入JSON文件名（例如：2024年执业药师XXX真题.json）: "
set /p HAS_IMAGES="是否有图片？(y/n): "

echo.
echo ========================================
echo   开始检查...
echo ========================================
echo.

REM 检查1：JSON文件存在
echo [1/8] 检查JSON文件...
if exist "shuju\%JSON_FILE%" (
    echo    ✅ JSON文件存在
) else (
    echo    ❌ JSON文件不存在！
    echo    路径：shuju\%JSON_FILE%
    echo.
    echo    💡 修复建议：
    echo       1. 确认文件名正确
    echo       2. 确认文件在 shuju\ 目录下
    pause
    exit /b 1
)

REM 检查2：JSON格式
echo.
echo [2/8] 检查JSON格式...
node -e "const fs=require('fs');try{JSON.parse(fs.readFileSync('shuju/%JSON_FILE%','utf8'));console.log('   ✅ JSON格式正确')}catch(e){console.error('   ❌ JSON格式错误:',e.message);process.exit(1)}"
if errorlevel 1 (
    echo.
    echo    💡 修复建议：
    echo       1. 使用JSON验证工具检查语法
    echo       2. 常见错误：缺少逗号、引号不匹配
    pause
    exit /b 1
)

REM 检查3：图片目录（如果需要）
if /i "%HAS_IMAGES%"=="y" (
    echo.
    echo [3/8] 检查图片目录...
    set /p IMAGE_DIR="请输入图片目录名（例如：2024年执业药师XXX真题）: "
    if exist "public\shuju\!IMAGE_DIR!\img" (
        echo    ✅ 图片目录存在
        
        REM 统计图片数量
        for /f %%a in ('dir /b "public\shuju\!IMAGE_DIR!\img\*.jpeg" 2^>nul ^| find /c /v ""') do set IMG_COUNT=%%a
        echo    📷 图片数量：!IMG_COUNT! 张
        
        if !IMG_COUNT! EQU 0 (
            echo    ⚠️  警告：图片目录是空的！
            echo.
            echo    💡 修复建议：
            echo       1. 复制图片文件到该目录
            echo       2. 确认文件是.jpeg格式
            pause
            exit /b 1
        )
    ) else (
        echo    ❌ 图片目录不存在！
        echo    路径：public\shuju\!IMAGE_DIR!\img
        echo.
        echo    💡 修复建议：
        echo       1. 创建目录：mkdir "public\shuju\!IMAGE_DIR!\img"
        echo       2. 复制图片文件到该目录
        pause
        exit /b 1
    )
) else (
    echo.
    echo [3/8] 跳过图片检查（无图片题）
)

REM 检查4：环境变量
echo.
echo [4/8] 检查环境变量...
if exist ".env.local" (
    echo    ✅ .env.local文件存在
) else (
    echo    ❌ .env.local文件不存在！
    echo.
    echo    💡 修复建议：
    echo       1. 复制.env.local.template为.env.local
    echo       2. 配置DATABASE_URL
    pause
    exit /b 1
)

REM 检查5：数据库连接
echo.
echo [5/8] 检查数据库连接...
npx prisma db execute --stdin < nul > nul 2>&1
if errorlevel 1 (
    echo    ⚠️  数据库连接可能有问题（非致命）
) else (
    echo    ✅ 数据库连接正常
)

REM 检查6：Prisma schema
echo.
echo [6/8] 检查Prisma schema...
if exist "prisma\schema.prisma" (
    echo    ✅ Prisma schema存在
) else (
    echo    ❌ Prisma schema不存在！
    pause
    exit /b 1
)

REM 检查7：node_modules
echo.
echo [7/8] 检查依赖安装...
if exist "node_modules" (
    echo    ✅ 依赖已安装
) else (
    echo    ❌ 依赖未安装！
    echo.
    echo    💡 修复建议：
    echo       运行：npm install
    pause
    exit /b 1
)

REM 检查8：磁盘空间
echo.
echo [8/8] 检查磁盘空间...
for /f "tokens=3" %%a in ('dir /-c ^| find "bytes free"') do set FREE_SPACE=%%a
echo    ℹ️  剩余空间：%FREE_SPACE% bytes

echo.
echo ========================================
echo   ✅ 所有检查通过！
echo ========================================
echo.
echo 💡 现在可以运行导入脚本：
echo    npx tsx prisma/import-XXXX.ts
echo.
echo 💡 或使用一键导入：
echo    .\import-with-validation.bat
echo.

pause
