@echo off
chcp 65001 >nul
echo ========================================
echo    医考必过 - 推送到 GitHub
echo ========================================
echo.

cd /d e:\tiku

echo [1/4] 检查 Git 状态...
git status
echo.

echo [2/4] 添加所有更改...
git add .
echo.

echo [3/4] 检查是否有新的更改需要提交...
git diff-index --quiet HEAD || (
    echo 发现新的更改，正在提交...
    git commit -m "Update: latest changes"
    echo.
)

echo [4/4] 推送到 GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    ✓ 推送成功！
    echo ========================================
    echo.
    echo Vercel 将自动重新部署你的网站
    echo 请访问：https://vercel.com/dashboard
    echo.
) else (
    echo.
    echo ========================================
    echo    ✗ 推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. GitHub 服务不可达
    echo 3. 需要配置代理
    echo.
    echo 解决方案：
    echo 1. 检查网络连接
    echo 2. 使用 VPN 或代理
    echo 3. 使用 GitHub Desktop
    echo 4. 直接在 GitHub 网页编辑文件
    echo.
)

pause

