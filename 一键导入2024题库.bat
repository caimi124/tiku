@echo off
chcp 65001 >nul
echo ================================================================
echo 🚀 医考题库一键导入工具
echo    2024年执业药师中药学综合知识与技能真题
echo ================================================================
echo.

echo 📝 步骤1：检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装，请先安装Python 3.7+
    pause
    exit /b 1
)
echo ✅ Python环境正常
echo.

echo 📝 步骤2：检查数据文件...
if not exist "题库原始数据-请粘贴到这里.txt" (
    echo ❌ 数据文件不存在：题库原始数据-请粘贴到这里.txt
    echo    请将题库文本粘贴到该文件中
    pause
    exit /b 1
)
echo ✅ 数据文件存在
echo.

echo 📝 步骤3：运行解析器...
echo.
python question_parser_advanced.py --year 2024
if errorlevel 1 (
    echo ❌ 解析失败
    pause
    exit /b 1
)
echo.

echo ================================================================
echo ✅ 数据解析完成！
echo ================================================================
echo.
echo 📁 生成的文件：
echo    ✓ import-2024-questions-auto.sql  (SQL导入文件)
echo    ✓ questions-2024-parsed.json      (JSON数据文件)
echo.
echo 💡 下一步操作：
echo    1. 打开 Supabase SQL 编辑器
echo       https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw/sql
echo.
echo    2. 打开文件：import-2024-questions-auto.sql
echo       复制全部内容
echo.
echo    3. 在 Supabase 中粘贴并运行
echo.
echo    4. 刷新网站查看效果
echo       https://yikaobiguo.com/practice/history?exam=pharmacist
echo.
echo ================================================================
pause
