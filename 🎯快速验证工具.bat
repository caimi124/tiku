@echo off
chcp 65001 >nul
color 0B
cls

echo.
echo ========================================
echo   🎯 历年真题功能 - 快速验证
echo ========================================
echo.
echo 📊 部署状态检查
echo.

:MENU
echo.
echo 请选择验证项目：
echo.
echo [1] 检查Git推送状态
echo [2] 本地启动测试
echo [3] 测试本地API
echo [4] 打开Vercel Dashboard
echo [5] 打开完整验证清单
echo [6] 查看Supabase数据
echo [0] 退出
echo.
set /p choice="请输入选项 (0-6): "

if "%choice%"=="1" goto CHECK_GIT
if "%choice%"=="2" goto START_LOCAL
if "%choice%"=="3" goto TEST_API
if "%choice%"=="4" goto OPEN_VERCEL
if "%choice%"=="5" goto OPEN_CHECKLIST
if "%choice%"=="6" goto OPEN_SUPABASE
if "%choice%"=="0" goto END
goto MENU

:CHECK_GIT
cls
echo.
echo 📊 检查Git状态...
echo ========================================
echo.
echo 最近的提交：
git log --oneline -5
echo.
echo ----------------------------------------
echo 远程分支状态：
git branch -vv
echo.
echo ----------------------------------------
echo.
if errorlevel 1 (
    echo ❌ Git命令执行失败
) else (
    echo ✅ Git状态检查完成
    echo.
    echo 📝 说明：
    echo   - 如果看到 origin/main 与 main 一致，说明已推送成功
    echo   - 如果有差异，需要执行: git push origin main
)
echo.
pause
goto MENU

:START_LOCAL
cls
echo.
echo 🚀 启动本地开发服务器...
echo ========================================
echo.
echo 服务器启动后，访问以下地址测试：
echo.
echo   主页：     http://localhost:3000
echo   练习页：   http://localhost:3000/practice
echo   历年真题： http://localhost:3000/practice/history
echo   2024真题： http://localhost:3000/practice/history/2024
echo.
echo 按 Ctrl+C 可以停止服务器
echo.
pause
npm run dev
goto MENU

:TEST_API
cls
echo.
echo 🔍 测试本地API...
echo ========================================
echo.
echo 测试1: 获取2024年真题数量
echo ----------------------------------------
curl -s "http://localhost:3000/api/questions?sourceYear=2024&limit=1" | jq
echo.
echo.
echo 测试2: 获取前3道2024年真题
echo ----------------------------------------
curl -s "http://localhost:3000/api/questions?sourceYear=2024&limit=3" | jq ".data.questions[] | {id, content: .content[0:50]}"
echo.
echo.
if errorlevel 1 (
    echo ❌ API测试失败
    echo.
    echo 可能原因：
    echo   1. 开发服务器未启动 (运行: npm run dev)
    echo   2. 端口3000被占用
    echo   3. curl或jq未安装
) else (
    echo ✅ API测试完成
)
echo.
pause
goto MENU

:OPEN_VERCEL
echo.
echo 🌐 打开Vercel Dashboard...
start https://vercel.com
echo.
echo 💡 提示：
echo   1. 登录你的Vercel账号
echo   2. 找到tiku项目
echo   3. 查看Deployments标签
echo   4. 最新的部署应该是commit 3ed84e7
echo   5. 等待构建完成（约2-3分钟）
echo   6. 点击Visit查看线上效果
echo.
pause
goto MENU

:OPEN_CHECKLIST
echo.
echo 📖 打开验证清单...
start "" "🎉部署成功-验证清单.md"
echo.
echo 📝 说明：
echo   按照清单中的步骤，逐项验证功能
echo.
pause
goto MENU

:OPEN_SUPABASE
echo.
echo 🌐 打开Supabase Dashboard...
start https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw
echo.
echo 💡 在SQL Editor中运行以下查询验证数据：
echo.
echo   SELECT COUNT(*) FROM questions WHERE source_year = 2024;
echo.
echo 应该返回：10
echo.
pause
goto MENU

:END
cls
echo.
echo ========================================
echo   ✅ 验证完成建议
echo ========================================
echo.
echo 1. 本地测试（必做）：
echo    npm run dev
echo    访问 http://localhost:3000/practice
echo    点击"历年真题"，看到"2024年真题 - 10道题"
echo    点击"开始练习"，能正常答题
echo.
echo 2. 线上验证（部署完成后）：
echo    访问你的Vercel域名
echo    测试相同流程
echo.
echo 3. 如果有问题：
echo    查看 🎉部署成功-验证清单.md
echo.
echo ========================================
echo.
echo 👋 祝使用愉快！
echo.
timeout /t 3 >nul
exit
