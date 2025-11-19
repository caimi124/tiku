@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo  推送Prisma模型修复到GitHub
echo ========================================
echo.
echo 📦 正在推送修复...
echo.

git push origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 可能原因：
    echo 1. 网络连接问题
    echo 2. GitHub访问受限
    echo.
    echo 解决方案：
    echo 1. 检查网络连接
    echo 2. 稍后重试
    echo 3. 或手动执行: git push origin main
    echo.
) else (
    echo.
    echo ✅ 推送成功！
    echo.
    echo Vercel将自动开始部署...
    echo 预计1-3分钟后完成部署
    echo.
)

pause
