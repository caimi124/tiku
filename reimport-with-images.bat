@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   重新导入2023年题目（包含图片）
echo ========================================
echo.

echo 📋 执行前检查：
echo.

echo [1/3] 检查图片文件...
if exist "public\shuju\2023年执业药师中药药一历年真题图片\img\37-A.jpeg" (
    echo    ✅ 图片文件存在
) else (
    echo    ❌ 图片文件不存在！
    echo    请确保图片在 public\shuju\2023年执业药师中药药一历年真题图片\img\
    pause
    exit /b 1
)

echo.
echo [2/3] 检查导入脚本...
if exist "prisma\import-2023-zhongyao-yaoxue-yiyao-FIXED.ts" (
    echo    ✅ 导入脚本存在
) else (
    echo    ❌ 导入脚本不存在！
    pause
    exit /b 1
)

echo.
echo [3/3] 检查环境配置...
if exist ".env.local" (
    echo    ✅ 环境配置存在
) else (
    echo    ❌ .env.local不存在！
    pause
    exit /b 1
)

echo.
echo ========================================
echo   开始导入...
echo ========================================
echo.

echo 🚀 运行导入脚本...
echo.
echo 💡 请注意观察日志中：
echo    - 应该看到"📷×5"表示有图片
echo    - 如果只有"✓5选项"没有📷，说明图片没导入
echo.
echo ========================================
echo.

call npx tsx prisma/import-2023-zhongyao-yaoxue-yiyao-FIXED.ts

echo.
echo ========================================
echo   导入完成！
echo ========================================
echo.

echo 📝 接下来请执行：
echo.
echo 1. 检查上面的日志，确认有"📷×5"标记
echo 2. 运行验证脚本：npx tsx check-actual-options.ts
echo 3. 刷新浏览器（Ctrl+F5）
echo 4. 查看图片是否显示
echo.

pause
