@echo off
chcp 65001 >nul
echo ========================================
echo    🗄️ 初始化 Supabase 数据库
echo ========================================
echo.

cd /d e:\tiku

echo [1/3] 设置数据库连接...
set DATABASE_URL=postgresql://postgres:yZaNnwx8VfkVRVkk@db.rekdretiemtoofrvcils.supabase.co:5432/postgres
echo ✓ 数据库连接已设置
echo.

echo [2/3] 推送数据库结构...
echo 这将根据 prisma/schema.prisma 创建数据库表
echo.
call npx prisma db push

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo    ❌ 数据库推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 数据库连接失败
    echo 2. Supabase 项目未激活
    echo 3. 网络连接问题
    echo.
    echo 请检查：
    echo 1. 访问 https://supabase.com/dashboard
    echo 2. 确认项目状态正常
    echo 3. 检查数据库连接字符串
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] 数据库初始化完成！
echo.
echo ========================================
echo    ✅ 成功！
echo ========================================
echo.
echo 数据库表结构已创建
echo.
echo 📊 想查看数据库？运行以下命令：
echo    npx prisma studio
echo.
echo 📝 下一步：
echo 1. 访问您的 Vercel 网站
echo 2. 测试所有功能是否正常
echo 3. 开始添加题目数据
echo.

pause

