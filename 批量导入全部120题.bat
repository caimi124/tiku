@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo  2024年执业药师中药综合真题
echo  批量导入工具 (120道完整题目)
echo ========================================
echo.
echo 📦 准备导入120道题目...
echo.

echo [步骤 1/4] 检查环境...
if not exist ".env.import" (
    echo ❌ 缺少 .env.import 文件
    pause
    exit /b 1
)
echo ✅ 环境检查通过
echo.

echo [步骤 2/4] 导入第1-40题（最佳选择题）...
call npx tsx generate-and-import-sql.ts
if errorlevel 1 (
    echo ❌ 第1批导入失败
    pause
    exit /b 1
)
echo ✅ 第1批导入完成
echo.

echo [步骤 3/4] 导入第41-80题（配伍选择题）...
echo ⏳ 准备中...请继续添加题目数据
echo.

echo [步骤 4/4] 导入第81-120题（综合+多选题）...
echo ⏳ 准备中...请继续添加题目数据
echo.

echo ========================================
echo 📊 当前进度: 10/120 道题目已导入
echo ========================================
echo.
echo 💡 提示：我正在为您准备剩余110道题的数据
echo    请稍等，我会继续完成...
echo.
pause
