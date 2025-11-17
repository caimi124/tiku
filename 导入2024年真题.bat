@echo off
chcp 65001 >nul
echo ================================
echo 🚀 导入 2024 年执业药师真题
echo ================================
echo.

echo 📋 步骤 1/4: 检查环境...
if not exist node_modules (
    echo ❌ node_modules 不存在，正在安装依赖...
    call npm install
) else (
    echo ✅ 依赖已安装
)
echo.

echo 📋 步骤 2/4: 检查配置文件...
if not exist .env.local (
    echo ⚠️  警告: .env.local 文件不存在！
    echo.
    echo 请手动创建 .env.local 文件，内容如下：
    echo ----------------------------------------
    echo DATABASE_URL="postgresql://postgres:yZaNnwx8VfkVRVkk@db.rekdretiemtoofrvcils.supabase.co:5432/postgres"
    echo NEXTAUTH_SECRET="your-secret-key-123456"
    echo NEXTAUTH_URL="http://localhost:3000"
    echo ----------------------------------------
    echo.
    pause
    exit /b 1
) else (
    echo ✅ .env.local 文件存在
)
echo.

echo 📋 步骤 3/4: 同步数据库结构...
echo 正在运行 prisma db push...
call npx prisma db push
if errorlevel 1 (
    echo.
    echo ❌ 数据库同步失败！
    echo.
    echo 可能的原因：
    echo   1. Supabase 项目已暂停 - 请访问 https://supabase.com/dashboard 恢复项目
    echo   2. 数据库连接字符串错误 - 请检查 .env.local 文件
    echo   3. 网络连接问题 - 请检查网络设置
    echo.
    echo 详细修复指南请查看：修复数据库连接-2024真题.md
    echo.
    pause
    exit /b 1
)
echo ✅ 数据库结构同步成功
echo.

echo 📋 步骤 4/4: 导入 2024 年真题...
echo 正在运行导入脚本...
call npx tsx setup-db-2024.ts
echo.

if errorlevel 0 (
    echo ✅ 操作完成！
    echo.
    echo 💡 提示：
    echo   - 如果导入成功，前端应该能看到 2024 年真题了
    echo   - 如果前端仍然看不到，请检查前端筛选条件
    echo   - 查看详细信息：修复数据库连接-2024真题.md
    echo.
)

pause
