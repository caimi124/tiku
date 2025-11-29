@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🔧 修复404错误
echo ========================================
echo.

echo 【步骤1】停止所有Node进程
taskkill /F /IM node.exe >nul 2>&1
echo ✅ Node进程已停止
timeout /t 2 /nobreak >nul
echo.

echo 【步骤2】删除Next.js缓存
if exist ".next" (
    rmdir /s /q .next
    echo ✅ .next 缓存已删除
) else (
    echo ℹ️  .next 目录不存在
)
echo.

if exist ".next" (
    rmdir /s /q .next
    echo ✅ 再次尝试删除 .next
)
echo.

echo 【步骤3】清除node_modules缓存（可选）
echo 如果问题仍然存在，可以删除node_modules重新安装
echo.

echo 【步骤4】重新启动开发服务器
echo.
echo ========================================
echo 🚀 启动开发服务器
echo ========================================
echo.

npm run dev
