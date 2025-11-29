@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🧪 测试所有页面
echo ========================================
echo.

echo 【测试1】打开首页
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
echo ✅ 首页已打开
echo.

echo 【测试2】打开历年真题页面
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/practice/history?exam=pharmacist"
echo ✅ 历年真题页面已打开
echo.

echo 【测试3】打开调试页面
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/practice/history/debug"
echo ✅ 调试页面已打开
echo.

echo 【测试4】打开简化页面
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/practice/history-simple"
echo ✅ 简化页面已打开
echo.

echo 【测试5】打开API端点
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/api/history-stats?exam=pharmacist"
echo ✅ API端点已打开
echo.

echo ========================================
echo 📋 请检查浏览器中打开的页面
echo ========================================
echo.
echo 应该打开了5个标签页：
echo 1. 首页（应该是HTML页面）
echo 2. 历年真题页面（应该显示列表，不是JSON）
echo 3. 调试页面（应该显示调试信息）
echo 4. 简化页面（应该显示简化列表）
echo 5. API端点（这个显示JSON是正常的）
echo.
echo 如果2、3、4也显示JSON，说明页面渲染有问题
echo.
pause
