@echo off
chcp 65001 >nul
color 0A
cls

echo.
echo ========================================
echo   🧪 历年真题功能本地测试
echo ========================================
echo.
echo 📋 测试前准备：
echo   1. 确保已导入真题数据到Supabase
echo   2. 确保.env.local配置正确
echo.
echo ----------------------------------------
echo.

:MENU
echo 请选择操作：
echo.
echo [1] 启动开发服务器
echo [2] 测试API接口
echo [3] 查看Git状态
echo [4] 推送到GitHub
echo [5] 打开Supabase Dashboard
echo [6] 打开完整修复指南
echo [0] 退出
echo.
set /p choice="请输入选项 (0-6): "

if "%choice%"=="1" goto START_DEV
if "%choice%"=="2" goto TEST_API
if "%choice%"=="3" goto GIT_STATUS
if "%choice%"=="4" goto GIT_PUSH
if "%choice%"=="5" goto OPEN_SUPABASE
if "%choice%"=="6" goto OPEN_GUIDE
if "%choice%"=="0" goto END
goto MENU

:START_DEV
echo.
echo 🚀 正在启动开发服务器...
echo.
echo 启动后访问：
echo   http://localhost:3000/practice
echo.
echo 点击"历年真题"卡片测试功能
echo.
echo 按 Ctrl+C 停止服务器
echo.
pause
npm run dev
goto MENU

:TEST_API
echo.
echo 🔍 测试API接口...
echo.
echo 测试1: 获取2024年真题数量
curl "http://localhost:3000/api/questions?sourceYear=2024&limit=1"
echo.
echo.
echo 测试2: 获取2024年前3道题
curl "http://localhost:3000/api/questions?sourceYear=2024&limit=3"
echo.
echo.
pause
goto MENU

:GIT_STATUS
echo.
echo 📊 Git状态：
echo.
git status
echo.
echo 📦 最近的提交：
git log --oneline -5
echo.
pause
goto MENU

:GIT_PUSH
echo.
echo 🚀 推送到GitHub...
echo.
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ 推送成功！
    echo.
    echo Vercel会自动开始部署，请稍后查看：
    echo https://vercel.com/你的项目/deployments
) else (
    echo ❌ 推送失败！
    echo.
    echo 可能原因：
    echo   - 网络连接问题
    echo   - Git配置问题
    echo.
    echo 尝试使用GitHub Desktop推送
)
echo.
pause
goto MENU

:OPEN_SUPABASE
echo.
echo 🌐 打开Supabase Dashboard...
start https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw
echo.
echo 在SQL Editor中执行数据导入脚本
echo.
pause
goto MENU

:OPEN_GUIDE
echo.
echo 📖 打开修复指南...
start "" "✅立即解决-历年真题3步修复.md"
echo.
pause
goto MENU

:END
echo.
echo 👋 再见！
echo.
timeout /t 2 >nul
exit

