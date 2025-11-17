@echo off
chcp 65001 >nul
echo ================================
echo 🔧 应用前端修复 - 显示2024年真题
echo ================================
echo.

echo 此脚本将：
echo   1. 备份原有的前端文件
echo   2. 用修复后的文件替换
echo   3. 重启开发服务器
echo.
echo 按任意键继续，或关闭窗口取消...
pause >nul
echo.

echo 📋 步骤 1/3: 备份原文件...
if exist "app\practice\[mode]\page.tsx" (
    copy "app\practice\[mode]\page.tsx" "app\practice\[mode]\page-backup.tsx" >nul
    echo ✅ 已备份为 page-backup.tsx
) else (
    echo ⚠️  警告: 原文件不存在
)
echo.

echo 📋 步骤 2/3: 替换文件...
if exist "app\practice\[mode]\page-fixed.tsx" (
    copy /Y "app\practice\[mode]\page-fixed.tsx" "app\practice\[mode]\page.tsx" >nul
    echo ✅ 已替换为修复版本
) else (
    echo ❌ 错误: 修复文件 page-fixed.tsx 不存在！
    echo 请确认文件位于: app\practice\[mode]\page-fixed.tsx
    pause
    exit /b 1
)
echo.

echo 📋 步骤 3/3: 重启开发服务器...
echo.
echo ⚠️  请手动重启开发服务器：
echo.
echo    1. 停止当前运行的服务器（Ctrl+C）
echo    2. 运行：npm run dev
echo    3. 访问：http://localhost:3000/practice
echo.
echo ✅ 文件替换完成！
echo.
echo 💡 提示：
echo    - 如果需要恢复原文件：copy page-backup.tsx page.tsx
echo    - 新版本会从数据库加载真实题目
echo    - 可以选择"中药学综合知识与技能"科目查看2024年真题
echo    - 2024年真题会有红色"🔥 2024年真题"标签
echo.
pause
