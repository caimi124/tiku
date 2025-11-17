@echo off
chcp 65001 >nul
echo ================================================
echo ⏳ 等待 Supabase 项目完全激活
echo ================================================
echo.
echo 项目刚恢复需要时间来完全启动：
echo   • 数据库容器启动：1-2分钟
echo   • DNS记录传播：2-5分钟
echo   • 总计通常需要：3-10分钟
echo.
echo 当前诊断结果：
echo   ✅ 网络连接正常
echo   ✅ Supabase主站可访问
echo   ❌ 项目DNS解析失败（需要等待）
echo.
echo ================================================
echo.

:MENU
echo 请选择操作：
echo.
echo   1. 等待 5 分钟后自动测试
echo   2. 等待 10 分钟后自动测试（推荐）
echo   3. 立即测试（可能仍会失败）
echo   4. 清除DNS缓存后测试
echo   5. 退出
echo.
set /p choice="请输入选项 (1-5): "

if "%choice%"=="1" goto WAIT5
if "%choice%"=="2" goto WAIT10
if "%choice%"=="3" goto TEST
if "%choice%"=="4" goto FLUSHDNS
if "%choice%"=="5" goto END
echo 无效选项，请重新选择。
echo.
goto MENU

:WAIT5
echo.
echo ⏳ 正在等待 5 分钟...
echo    期间请保持 Supabase Dashboard 打开
echo    确认项目状态保持为绿色 "Active"
echo.
timeout /t 300 /nobreak
echo.
echo ✅ 等待完成！正在测试连接...
echo.
goto TEST

:WAIT10
echo.
echo ⏳ 正在等待 10 分钟...
echo    这是推荐的等待时间
echo    期间请：
echo      • 保持 Supabase Dashboard 打开
echo      • 确认项目状态为 Active
echo      • 可以尝试访问 Table Editor 等功能
echo.
echo 倒计时：
for /l %%i in (10,-1,1) do (
    echo    剩余 %%i 分钟...
    timeout /t 60 /nobreak >nul
)
echo.
echo ✅ 等待完成！正在测试连接...
echo.
goto TEST

:FLUSHDNS
echo.
echo 🔄 清除DNS缓存...
ipconfig /flushdns
if errorlevel 0 (
    echo ✅ DNS缓存已清除
) else (
    echo ⚠️  清除DNS缓存失败，但可以继续测试
)
echo.
timeout /t 2 /nobreak >nul
goto TEST

:TEST
echo 🧪 测试数据库连接...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
call npx tsx test-new-db-connection.ts
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if errorlevel 1 (
    echo.
    echo ❌ 连接仍然失败
    echo.
    echo 可能的原因：
    echo   • 项目还需要更多时间恢复
    echo   • 项目实际上还未完全激活
    echo   • DNS传播需要更多时间
    echo.
    echo 建议：
    echo   1. 访问 Supabase Dashboard 确认项目状态
    echo      https://supabase.com/dashboard/project/mjyfiryzawngzadfxfoe
    echo   2. 确认状态为绿色 "Active"
    echo   3. 尝试在Dashboard中打开 Table Editor
    echo   4. 等待更长时间（可能需要15-20分钟）
    echo   5. 查看详细诊断：🔴连接问题诊断结果.md
    echo.
    echo 是否再次等待5分钟后重试？(Y/N)
    set /p retry=
    if /i "%retry%"=="Y" (
        echo.
        echo ⏳ 再等待 5 分钟...
        timeout /t 300 /nobreak
        goto TEST
    )
) else (
    echo.
    echo ╔════════════════════════════════════════╗
    echo ║   ✅ 恭喜！数据库连接成功！           ║
    echo ╚════════════════════════════════════════╝
    echo.
    echo 🎉 Supabase 项目已完全恢复！
    echo.
    echo 📋 下一步操作：
    echo.
    echo 1. 创建/更新 .env.local 文件：
    echo    DATABASE_URL="postgresql://postgres:HR1d0WehCi5RILq7@db.rekdretiemtoofrvcils.supabase.co:5432/postgres"
    echo.
    echo 2. 如果没有数据表，运行：
    echo    npx prisma db push
    echo.
    echo 3. 导入2024年真题：
    echo    .\导入2024年真题.bat
    echo.
    echo 4. 修复前端：
    echo    .\应用前端修复.bat
    echo.
    echo 5. 启动开发服务器：
    echo    npm run dev
    echo.
    echo 是否立即运行导入脚本？(Y/N)
    set /p import=
    if /i "%import%"=="Y" (
        echo.
        call "导入2024年真题.bat"
    )
)

echo.
goto END

:END
echo.
echo 按任意键退出...
pause >nul
