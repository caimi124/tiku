@echo off
chcp 65001 >nul
cls
color 0A

echo ╔════════════════════════════════════════════════════════╗
echo ║     🚀 tiku2 数据库配置向导                            ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 本向导将帮助你完成 tiku2 项目的完整配置
echo.
echo 配置内容：
echo   ✓ 创建所有数据库表（13个表）
echo   ✓ 配置文件存储（3个buckets）
echo   ✓ 设置安全策略（RLS）
echo   ✓ 导入初始数据
echo   ✓ 配置环境变量
echo.
echo 预计时间：15-20分钟
echo.
echo ════════════════════════════════════════════════════════
echo.
pause

cls
echo ╔════════════════════════════════════════════════════════╗
echo ║     📋 步骤 1/5: 查看配置文档                          ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 相关文档已为你准备好：
echo.
echo   📄 🚀快速开始-完整配置指南.md      - 完整操作步骤
echo   📄 01-创建所有数据表.sql           - 建表SQL脚本
echo   📄 02-配置Storage-Buckets指南.md   - Storage配置
echo   📄 🎓项目技术架构建议.md           - 架构设计
echo.
echo 是否打开快速开始指南？(Y/N)
set /p open_guide=

if /i "%open_guide%"=="Y" (
    start "" "🚀快速开始-完整配置指南.md"
    echo.
    echo ✅ 已打开配置指南
)

echo.
echo ════════════════════════════════════════════════════════
echo.
pause

cls
echo ╔════════════════════════════════════════════════════════╗
echo ║     🗄️ 步骤 2/5: 创建数据库表                          ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 请按照以下步骤操作：
echo.
echo 1. 打开浏览器，访问 Supabase Dashboard：
echo    https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw
echo.
echo 2. 点击左侧菜单 "SQL Editor"
echo.
echo 3. 点击 "New query" 按钮
echo.
echo 4. 打开文件：01-创建所有数据表.sql
echo.
echo 5. 复制全部内容并粘贴到 SQL Editor
echo.
echo 6. 点击 "Run" 按钮执行
echo.
echo 7. 等待执行完成（约10-15秒）
echo.
echo ════════════════════════════════════════════════════════
echo.
echo 💡 提示：
echo    执行成功后会显示 "✅ Success. Rows returned."
echo    并列出13个创建的表
echo.
echo 是否打开 SQL 脚本文件？(Y/N)
set /p open_sql=

if /i "%open_sql%"=="Y" (
    start "" "01-创建所有数据表.sql"
    echo.
    echo ✅ 已打开 SQL 脚本
)

echo.
echo 完成后按任意键继续...
pause >nul

cls
echo ╔════════════════════════════════════════════════════════╗
echo ║     📦 步骤 3/5: 配置 Storage Buckets                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 请按照以下步骤操作：
echo.
echo 1. 在 Dashboard 点击左侧菜单 "Storage"
echo.
echo 2. 创建 3 个 buckets（点击 "New bucket"）：
echo.
echo    Bucket 1: pdfs
echo      - Public bucket: ✓ 勾选
echo      - 进入后创建文件夹：chapters, highlights, outlines, predictions, thumbnails
echo.
echo    Bucket 2: avatars
echo      - Public bucket: ✓ 勾选
echo      - File size limit: 5000000 (5MB，可选)
echo.
echo    Bucket 3: institution-logos
echo      - Public bucket: ✓ 勾选
echo      - File size limit: 2000000 (2MB，可选)
echo.
echo 3. 返回 SQL Editor，运行 Storage 策略SQL
echo    （在 02-配置Storage-Buckets指南.md 中查看）
echo.
echo ════════════════════════════════════════════════════════
echo.
echo 是否打开 Storage 配置指南？(Y/N)
set /p open_storage=

if /i "%open_storage%"=="Y" (
    start "" "02-配置Storage-Buckets指南.md"
    echo.
    echo ✅ 已打开 Storage 配置指南
)

echo.
echo 完成后按任意键继续...
pause >nul

cls
echo ╔════════════════════════════════════════════════════════╗
echo ║     📊 步骤 4/5: 导入初始数据                          ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 请按照以下步骤操作：
echo.
echo 1. 在 SQL Editor 创建新查询
echo.
echo 2. 打开文件：导入真题到tiku2-SQL脚本.sql
echo.
echo 3. 复制全部内容并粘贴到 SQL Editor
echo.
echo 4. 点击 "Run" 执行
echo.
echo 5. 确认导入成功：
echo    - total_questions: 3
echo    - questions_2024: 3
echo    - zhongyao_questions: 3
echo.
echo ════════════════════════════════════════════════════════
echo.
echo 是否打开导入脚本？(Y/N)
set /p open_import=

if /i "%open_import%"=="Y" (
    start "" "导入真题到tiku2-SQL脚本.sql"
    echo.
    echo ✅ 已打开导入脚本
)

echo.
echo 完成后按任意键继续...
pause >nul

cls
echo ╔════════════════════════════════════════════════════════╗
echo ║     ⚙️ 步骤 5/5: 配置环境变量                          ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 正在创建 .env.local 文件...
echo.

(
echo # Supabase 配置
echo NEXT_PUBLIC_SUPABASE_URL=https://tparjdkxxtnentsdazfw.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s
echo.
echo # 数据库连接（可选）
echo DATABASE_URL=postgresql://postgres:bdcW5inRuvSMfwYN@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres
echo.
echo # NextAuth 配置
echo NEXTAUTH_SECRET=your-secret-key-change-this-in-production
echo NEXTAUTH_URL=http://localhost:3000
echo.
echo # OpenAI API（用于AI功能，可选）
echo # OPENAI_API_KEY=sk-your-openai-api-key-here
echo.
echo # 环境标识
echo NODE_ENV=development
) > .env.local

if exist .env.local (
    echo ✅ .env.local 文件已创建
    echo.
    echo 文件内容：
    echo ════════════════════════════════════════════════════════
    type .env.local
    echo ════════════════════════════════════════════════════════
) else (
    echo ❌ 创建 .env.local 文件失败
)

echo.
echo ════════════════════════════════════════════════════════
echo.
pause

cls
echo ╔════════════════════════════════════════════════════════╗
echo ║     🧪 测试配置                                         ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 正在测试 Supabase API 连接...
echo.

call npx tsx test-api-connection.ts

echo.
echo ════════════════════════════════════════════════════════
echo.

if errorlevel 1 (
    echo ⚠️  测试可能有问题，请检查：
    echo    1. Dashboard 中的表是否创建成功
    echo    2. .env.local 配置是否正确
    echo    3. 网络连接是否正常
) else (
    echo ✅ 如果看到以上成功信息，配置基本完成！
)

echo.
pause

cls
echo ╔════════════════════════════════════════════════════════╗
echo ║     ✅ 配置完成！                                       ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 🎉 恭喜！tiku2 数据库配置已完成
echo.
echo ════════════════════════════════════════════════════════
echo 📋 配置检查清单
echo ════════════════════════════════════════════════════════
echo.
echo 数据库表：
echo   □ 13个表全部创建成功
echo   □ 触发器配置成功
echo   □ 初始数据导入成功
echo.
echo Storage：
echo   □ pdfs bucket 创建（含5个文件夹）
echo   □ avatars bucket 创建
echo   □ institution-logos bucket 创建
echo   □ Storage RLS 策略配置
echo.
echo 环境配置：
echo   □ .env.local 文件创建
echo   □ API 连接测试成功
echo.
echo ════════════════════════════════════════════════════════
echo 🚀 下一步
echo ════════════════════════════════════════════════════════
echo.
echo 1. 启动开发服务器：
echo    npm run dev
echo.
echo 2. 访问应用：
echo    http://localhost:3000/practice
echo.
echo 3. 查看完整架构文档：
echo    🎓项目技术架构建议.md
echo.
echo 4. 开始开发核心功能！
echo.
echo ════════════════════════════════════════════════════════
echo.
echo 是否立即启动开发服务器？(Y/N)
set /p start_dev=

if /i "%start_dev%"=="Y" (
    echo.
    echo 🚀 正在启动开发服务器...
    echo.
    echo 访问：http://localhost:3000
    echo 按 Ctrl+C 停止服务器
    echo.
    pause
    call npm run dev
) else (
    echo.
    echo 稍后手动运行: npm run dev
    echo.
)

echo.
echo ════════════════════════════════════════════════════════
echo.
echo 💡 提示：
echo    - 所有配置文档在项目根目录
echo    - 遇到问题查看诊断报告
echo    - 随时运行 test-api-connection.ts 测试连接
echo.
echo ════════════════════════════════════════════════════════
echo.
pause
