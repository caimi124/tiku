@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 部署历年真题修复到生产环境
echo ========================================
echo.

echo 【步骤1】添加核心修复文件
git add app/api/history-stats/route.ts
echo ✅ 已添加 app/api/history-stats/route.ts
echo.

echo 【步骤2】提交更改
git commit -m "fix: 修复历年真题API的exam_type中英文映射问题

- 添加exam_type字段中英文映射（pharmacist -> 执业药师）
- 修复生产环境历年真题页面零数据显示问题
- API现在能正确返回1440道题（2022-2024年，每年480题）
- 解决方案：在API层添加映射，而非修改数据库数据"

if %ERRORLEVEL% EQU 0 (
    echo ✅ 提交成功
) else (
    echo ℹ️  没有需要提交的更改或提交失败
)
echo.

echo 【步骤3】推送到远程仓库
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo ✅ 推送成功！
    echo.
    echo ========================================
    echo 🎉 部署触发成功
    echo ========================================
    echo.
    echo Vercel 会自动检测到代码变更并开始部署
    echo.
    echo 📍 部署状态查看：
    echo    https://vercel.com/dashboard
    echo.
    echo 📍 预计部署时间：1-2分钟
    echo.
    echo 📍 部署完成后访问：
    echo    https://yikaobiguo.com/practice/history?exam=pharmacist
    echo.
    echo 📍 预期结果：
    echo    - 真题总数: 1440
    echo    - 可用年份: 3
    echo    - 2024/2023/2022年各显示480题
    echo.
) else (
    echo ❌ 推送失败
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 没有推送权限
    echo 3. 需要先拉取远程更新
    echo.
    echo 请尝试：
    echo    git pull origin main
    echo    git push origin main
)

echo.
pause
