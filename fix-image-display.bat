@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   图片不显示问题 - 一键修复
echo ========================================
echo.

echo [1/4] 停止开发服务器...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo [2/4] 清除Next.js缓存...
if exist .next (
    rmdir /s /q .next
    echo    ✅ .next目录已删除
) else (
    echo    ℹ️  .next目录不存在
)

echo.
echo [3/4] 清除npm缓存...
call npm cache clean --force 2>nul

echo.
echo [4/4] 重启开发服务器...
echo.
echo ========================================
echo   修复完成！开发服务器正在启动...
echo ========================================
echo.
echo 📝 接下来请执行：
echo.
echo 1. 清除浏览器缓存（Ctrl+Shift+Delete）
echo 2. 访问：http://localhost:3000/practice/history/2023?subject=中药学专业知识（一）
echo 3. 按F12打开开发者工具
echo 4. 查看Console标签，确认有"✅ 图片已设置"日志
echo 5. 如果还是不显示，直接访问图片URL测试：
echo    http://localhost:3000/shuju/2023年执业药师中药药一历年真题图片/img/37-A.jpeg
echo.
echo ========================================
echo.

call npm run dev
