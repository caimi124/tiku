@echo off
chcp 65001 >nul
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔧 配置 Supabase tiku2 数据库环境变量
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM 检查 .env.local 是否已存在
if exist .env.local (
    echo ⚠️  .env.local 文件已存在
    echo.
    choice /C YN /M "是否覆盖现有配置？(Y=是, N=否)"
    if errorlevel 2 goto :skip
)

echo 📝 正在创建 .env.local 文件...
echo.

(
echo # Supabase tiku2 数据库配置
echo # 自动生成于 %date% %time%
echo.
echo # 数据库连接 - 使用 Session Pooler（推荐用于 Prisma）
echo DATABASE_URL="postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
echo.
echo # Supabase 项目配置
echo NEXT_PUBLIC_SUPABASE_URL="https://tparjdkxxtnentsdazfw.supabase.co"
echo NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s"
echo.
echo # NextAuth 配置
echo NEXTAUTH_URL="http://localhost:3000"
echo NEXTAUTH_SECRET="medexam-pro-secret-key-change-in-production-%random%-%random%"
echo.
echo # AI API 配置（可选）
echo # OPENAI_API_KEY="your_openai_api_key_here"
) > .env.local

echo ✅ .env.local 文件创建成功！
echo.

:skip
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📊 配置信息
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 数据库连接: Session Pooler (5432)
echo 项目 ID: tparjdkxxtnentsdazfw
echo 区域: us-west-2
echo 数据库表: 13 个（已存在）
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎯 下一步操作
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. ✅ 环境变量已配置
echo 2. 检查数据库表结构: npx prisma db pull
echo 3. 生成 Prisma 客户端: npm run db:generate
echo 4. 启动开发服务器: npm run dev
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
