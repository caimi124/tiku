@echo off
chcp 65001 >nul
echo ================================================
echo 🔌 测试新的数据库连接（新密码）
echo ================================================
echo.
echo 新密码：HR1d0WehCi5RILq7
echo.
echo ⚠️  重要提示：
echo    在运行此测试前，请确保：
echo    1. 已访问 Supabase Dashboard
echo    2. 项目状态为绿色 "Active"（已恢复）
echo    3. 如果项目显示 "Paused"，请先点击 "Resume Project"
echo.
echo 访问：https://supabase.com/dashboard/project/mjyfiryzawngzadfxfoe
echo.
pause
echo.

echo 正在测试数据库连接...
echo.

call npx tsx test-new-db-connection.ts

echo.
echo ================================================
echo.

if errorlevel 1 (
    echo ❌ 连接失败！
    echo.
    echo 可能的原因：
    echo   1. Supabase 项目仍然处于暂停状态
    echo   2. 项目恢复还未完成（需要1-2分钟）
    echo   3. 网络连接问题
    echo.
    echo 解决方案：
    echo   • 访问 Supabase Dashboard 确认项目状态
    echo   • 等待项目完全恢复后重试
    echo   • 查看详细指南：🔥立即恢复Supabase项目.md
    echo.
) else (
    echo.
    echo ✅ 如果看到 "数据库连接成功"，说明：
    echo    1. Supabase 项目已恢复
    echo    2. 新密码正确
    echo    3. 可以继续下一步操作
    echo.
    echo 下一步：
    echo    1. 更新 .env.local 文件（使用新密码）
    echo    2. 如果没有表，运行：npx prisma db push
    echo    3. 导入题目：.\导入2024年真题.bat
    echo    4. 修复前端：.\应用前端修复.bat
    echo    5. 启动服务：npm run dev
    echo.
)

pause
