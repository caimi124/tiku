@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🧪 快速测试API和前端
echo ========================================
echo.

echo 【测试1】检查开发服务器是否运行...
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ 开发服务器正在运行 (端口3000)
) else (
    echo ❌ 开发服务器未运行！
    echo.
    echo 💡 请先启动服务器：npm run dev
    pause
    exit /b
)
echo.

echo 【测试2】测试API响应...
curl -s "http://localhost:3000/api/history-stats?exam=pharmacist" > temp_api_response.json
if %ERRORLEVEL% EQU 0 (
    echo ✅ API请求成功
    echo.
    echo 📦 API响应预览（前300字符）：
    powershell -Command "Get-Content temp_api_response.json -Raw | Select-Object -First 1 | ForEach-Object { $_.Substring(0, [Math]::Min(300, $_.Length)) }"
    del temp_api_response.json >nul 2>&1
) else (
    echo ❌ API请求失败
)
echo.

echo 【测试3】打开测试页面...
echo.
echo 即将打开以下页面：
echo   1. API测试页面: test-api-direct.html
echo   2. 前端页面: http://localhost:3000/practice/history?exam=pharmacist
echo.
echo 按任意键继续...
pause >nul

start "" "E:\tiku\test-api-direct.html"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/practice/history?exam=pharmacist"

echo.
echo ========================================
echo 📋 调试清单
echo ========================================
echo.
echo 请检查浏览器中：
echo  □ 打开开发者工具 (F12)
echo  □ 查看 Console 标签是否有错误
echo  □ 查看 Network 标签的 history-stats 请求
echo  □ 检查页面是否显示 "真题总数: 1440"
echo.
echo 如果仍不显示，请：
echo  1. 清除 localStorage: localStorage.clear()
echo  2. 清除浏览器缓存: Ctrl+Shift+Delete
echo  3. 使用无痕模式: Ctrl+Shift+N
echo.
echo ========================================
pause
