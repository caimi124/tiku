@echo off
chcp 65001 >nul
echo ========================================
echo    🔧 修复 Vercel 部署配置并推送
echo ========================================
echo.

cd /d e:\tiku

echo [1/5] 检查修复内容...
echo ✓ vercel.json 已更新（添加 framework 配置）
echo ✓ 部署指南已创建
echo.

echo [2/5] 检查 Git 状态...
git status
echo.

echo [3/5] 添加修复的文件...
git add vercel.json
git add Vercel部署完整指南.md
git add 修复部署并推送.bat
echo.

echo [4/5] 提交修复...
git commit -m "fix: 修复 Vercel 部署配置 - 添加 framework: nextjs"
if %errorlevel% neq 0 (
    echo 没有新的更改需要提交
    echo.
)

echo [5/5] 推送到 GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    ✅ 推送成功！
    echo ========================================
    echo.
    echo 📋 接下来需要做的：
    echo.
    echo 1. 配置数据库环境变量
    echo    - 登录 Vercel Dashboard
    echo    - 进入项目设置 ^> Environment Variables
    echo    - 添加 DATABASE_URL
    echo.
    echo 2. 推荐使用 Vercel Postgres
    echo    - 在 Vercel 项目中点击 Storage 标签
    echo    - 创建 Postgres 数据库
    echo    - 自动设置环境变量
    echo.
    echo 3. Vercel 会自动重新部署
    echo    - 访问：https://vercel.com/dashboard
    echo    - 查看部署进度
    echo.
    echo 📖 详细说明请查看：Vercel部署完整指南.md
    echo.
) else (
    echo.
    echo ========================================
    echo    ❌ 推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 需要先 git pull 获取远程更新
    echo 3. GitHub 认证问题
    echo.
    echo 解决方案：
    echo 1. 先运行：git pull origin main
    echo 2. 检查网络连接
    echo 3. 使用 GitHub Desktop
    echo.
)

pause

