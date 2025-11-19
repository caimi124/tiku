@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 2024年执业药师中药综合真题批量导入
echo ========================================
echo.

echo [1/3] 正在导入Part1（1-40题）...
call npx tsx prisma/import-2024-part1.ts
if errorlevel 1 (
    echo Part1导入失败！
    pause
    exit /b 1
)
echo.

echo [2/3] 正在导入Part2（41-80题）...
call npx tsx prisma/import-2024-part2.ts
if errorlevel 1 (
    echo Part2导入失败！
    pause
    exit /b 1
)
echo.

echo [3/3] 正在导入Part3（81-120题）...
call npx tsx prisma/import-2024-part3.ts
if errorlevel 1 (
    echo Part3导入失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎉 所有题目导入完成！
echo ========================================
echo.
pause
