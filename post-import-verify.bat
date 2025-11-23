@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   导入后验证 - Post-Import Verify
echo ========================================
echo.

set /p YEAR="请输入年份（例如：2024）: "
set /p SUBJECT="请输入科目（例如：中药学专业知识（一））: "

echo.
echo 正在验证 %YEAR%年 %SUBJECT% ...
echo.

npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const total = await prisma.questions.count({
      where: { source_year: %YEAR%, subject: '%SUBJECT%' }
    });
    
    const withImages = await prisma.questions.count({
      where: {
        source_year: %YEAR%,
        subject: '%SUBJECT%',
        ai_explanation: { not: null }
      }
    });
    
    console.log('📊 总题目数:', total);
    console.log('📷 有图片数据:', withImages);
    
    if (total === 0) {
      console.log('❌ 验证失败：没有找到题目！');
      process.exit(1);
    }
    
    console.log('✅ 验证通过！');
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
"

if errorlevel 1 (
    echo.
    echo 💡 修复建议：
    echo    1. 检查导入脚本是否成功运行
    echo    2. 检查年份和科目是否正确
    echo    3. 重新运行导入脚本
    pause
    exit /b 1
)

echo.
echo ✅ 导入验证完成！
pause
