@echo off
chcp 65001 >nul
echo ========================================
echo 🔄 重启开发服务器
echo ========================================
echo.

echo 📍 当前目录: %CD%
echo.

echo 🛑 正在停止旧的进程...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✅ 已停止旧进程
echo.

echo 🧹 清除浏览器缓存提示...
echo.
echo ⚠️  请在浏览器中执行以下操作：
echo    1. 按 F12 打开开发者工具
echo    2. 在 Console 中输入：localStorage.clear(); location.reload();
echo    3. 或者按 Ctrl+Shift+Delete 清除缓存
echo.

echo 🚀 启动开发服务器...
echo.
echo ========================================
echo 开发服务器日志：
echo ========================================
echo.

npm run dev
