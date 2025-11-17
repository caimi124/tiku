@echo off
chcp 65001 >nul
cls
echo ================================================
echo 🚀 tiku2 项目快速配置
echo ================================================
echo.
echo 项目信息：
echo   项目名称: tiku2
echo   项目ID: tparjdkxxtnentsdazfw
echo   Dashboard: https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw
echo.
echo ================================================
echo.

echo 📋 操作步骤概览：
echo.
echo   第1步: 在 Supabase Dashboard 创建表结构
echo   第2步: 在 Supabase Dashboard 导入数据
echo   第3步: 更新本地配置文件（本脚本自动完成）
echo   第4步: 启动开发服务器
echo.
echo ================================================
echo.

echo ⚠️  重要提示：
echo   由于网络环境限制，我们使用 Supabase Dashboard 直接操作
echo   这种方式更简单可靠，不需要解决连接问题
echo.
pause
cls

echo ================================================
echo 📌 第1步：创建数据库表结构
echo ================================================
echo.
echo 请按照以下步骤操作：
echo.
echo 1. 打开浏览器访问 tiku2 Dashboard：
echo    https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw
echo.
echo 2. 登录你的 Supabase 账号
echo.
echo 3. 点击左侧菜单 "SQL Editor"
echo.
echo 4. 点击 "New query" 按钮
echo.
echo 5. 复制并粘贴以下SQL代码：
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo SQL代码已保存在文件中，请打开：
echo    导入真题到tiku2-SQL脚本.sql
echo.
echo 或者手动输入这个简化版：
echo.
echo CREATE TABLE IF NOT EXISTS questions (
echo   id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
echo   exam_type TEXT NOT NULL,
echo   subject TEXT NOT NULL,
echo   chapter TEXT,
echo   question_type TEXT NOT NULL,
echo   content TEXT NOT NULL,
echo   options JSONB NOT NULL,
echo   correct_answer TEXT NOT NULL,
echo   explanation TEXT,
echo   difficulty INTEGER DEFAULT 1,
echo   knowledge_points TEXT[] DEFAULT '{}',
echo   is_published BOOLEAN DEFAULT true,
echo   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 6. 点击 "Run" 按钮执行
echo.
echo 7. 确认看到 "Success" 消息
echo.
echo 完成后按任意键继续...
pause >nul
cls

echo ================================================
echo 📌 第2步：导入2024年真题数据
echo ================================================
echo.
echo 在 SQL Editor 中：
echo.
echo 1. 点击 "New query" 创建新查询
echo.
echo 2. 打开文件并复制全部内容：
echo    导入真题到tiku2-SQL脚本.sql
echo.
echo 3. 粘贴到 SQL Editor
echo.
echo 4. 点击 "Run" 执行
echo.
echo 5. 确认看到导入成功的消息：
echo    - total_questions: 3
echo    - questions_2024: 3
echo    - zhongyao_questions: 3
echo.
echo 完成后按任意键继续...
pause >nul
cls

echo ================================================
echo 📌 第3步：更新本地配置文件
echo ================================================
echo.
echo 正在创建 .env.local 文件...
echo.

(
echo # tiku2 项目配置
echo DATABASE_URL="postgresql://postgres:bdcW5inRuvSMfwYN@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres"
echo.
echo # Supabase API 配置
echo NEXT_PUBLIC_SUPABASE_URL="https://tparjdkxxtnentsdazfw.supabase.co"
echo NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s"
echo.
echo # NextAuth 配置
echo NEXTAUTH_SECRET="your-secret-key-123456"
echo NEXTAUTH_URL="http://localhost:3000"
echo.
echo # 环境标识
echo NODE_ENV="development"
) > .env.local

if exist .env.local (
    echo ✅ .env.local 文件已创建
    echo.
    echo 文件内容：
    type .env.local
) else (
    echo ❌ 创建 .env.local 文件失败
    echo 请手动创建该文件并填入配置信息
)

echo.
echo ================================================
echo.
pause

cls
echo ================================================
echo 📌 第4步：启动开发服务器
echo ================================================
echo.
echo 确认以下步骤都已完成：
echo   ✓ 在 Dashboard 创建了 questions 表
echo   ✓ 在 Dashboard 导入了3道真题
echo   ✓ .env.local 文件已创建
echo.
echo 现在启动开发服务器吗？(Y/N)
set /p start=

if /i "%start%"=="Y" (
    echo.
    echo 🚀 正在启动开发服务器...
    echo.
    echo 启动后访问：http://localhost:3000/practice
    echo.
    echo 按 Ctrl+C 可以停止服务器
    echo.
    pause
    call npm run dev
) else (
    echo.
    echo 稍后手动运行: npm run dev
    echo.
)

echo.
echo ================================================
echo ✅ 配置完成
echo ================================================
echo.
echo 📝 下一步：
echo   1. 访问：http://localhost:3000/practice
echo   2. 选择"中药学综合知识与技能"科目
echo   3. 查看2024年真题（有🔥标签）
echo.
echo 📚 如果有更多题目数据，请告诉我：
echo   我可以帮你生成批量导入SQL脚本
echo.
echo ================================================
echo.
pause
