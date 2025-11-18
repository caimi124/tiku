@echo off
chcp 65001 >nul
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔧 Supabase 数据库配置向导
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📋 项目信息:
echo    项目 ID: tparjdkxxtnentsdazfw
echo    API URL: https://tparjdkxxtnentsdazfw.supabase.co
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ⚠️  数据库直连失败的原因:
echo.
echo    1. DNS 解析失败 (无法解析 db.tparjdkxxtnentsdazfw.supabase.co)
echo    2. 可能的网络或防火墙限制
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🎯 建议的解决方案:
echo.
echo 方案 1: 获取正确的连接池地址
echo    • 登录 Supabase Dashboard
echo    • Settings → Database → Connection String
echo    • 选择 "Session pooler" 或 "Transaction pooler"
echo    • 复制完整的连接字符串
echo.
echo 方案 2: 使用 Supabase JS Client (API 模式)
echo    • 通过 HTTPS API 访问，无需直连
echo    • 获取 Settings → API 中的 keys
echo    • 适合开发环境
echo.
echo 方案 3: 修复网络 DNS
echo    • 更改 DNS 服务器为 8.8.8.8 或 1.1.1.1
echo    • 检查防火墙设置
echo    • 检查 VPN 或代理
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📝 下一步操作:
echo.
echo 1. 打开 Supabase Dashboard:
echo    https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw
echo.
echo 2. 检查项目状态是否为 "Active"
echo.
echo 3. 前往 Settings → Database，获取:
echo    □ Connection pooler URL (推荐)
echo    □ Direct connection URL
echo    □ Region 信息
echo.
echo 4. 前往 Settings → API，获取:
echo    □ Project URL
echo    □ anon public key
echo    □ service_role key (可选)
echo.
echo 5. 将信息提供给助手，助手会帮你配置
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
