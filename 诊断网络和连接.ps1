# 数据库连接诊断脚本

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🔍 Supabase 数据库连接诊断" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. 测试DNS解析
Write-Host "步骤 1: 测试DNS解析..." -ForegroundColor Yellow
Write-Host "主机: db.rekdretiemtoofrvcils.supabase.co" -ForegroundColor Gray
Write-Host ""

try {
    $dns = Resolve-DnsName -Name "db.rekdretiemtoofrvcils.supabase.co" -ErrorAction Stop
    Write-Host "✅ DNS解析成功" -ForegroundColor Green
    Write-Host "   IP地址: $($dns.IPAddress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ DNS解析失败: $_" -ForegroundColor Red
    Write-Host "   可能原因: 网络问题或DNS服务器问题" -ForegroundColor Yellow
}

Write-Host ""

# 2. 测试网络连通性
Write-Host "步骤 2: 测试网络连通性..." -ForegroundColor Yellow
Write-Host "目标: db.rekdretiemtoofrvcils.supabase.co:5432" -ForegroundColor Gray
Write-Host ""

try {
    $connection = Test-NetConnection -ComputerName "db.rekdretiemtoofrvcils.supabase.co" -Port 5432 -WarningAction SilentlyContinue
    
    if ($connection.TcpTestSucceeded) {
        Write-Host "✅ 端口 5432 连接成功" -ForegroundColor Green
        Write-Host "   远程地址: $($connection.RemoteAddress)" -ForegroundColor Gray
        Write-Host "   延迟: $($connection.PingReplyDetails.RoundtripTime) ms" -ForegroundColor Gray
    } else {
        Write-Host "❌ 端口 5432 连接失败" -ForegroundColor Red
        Write-Host "   可能原因:" -ForegroundColor Yellow
        Write-Host "   1. Supabase项目仍在启动中（需要1-2分钟）" -ForegroundColor Yellow
        Write-Host "   2. 项目实际上还未恢复" -ForegroundColor Yellow
        Write-Host "   3. 防火墙阻止了连接" -ForegroundColor Yellow
        Write-Host "   4. 网络限制" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 网络测试失败: $_" -ForegroundColor Red
}

Write-Host ""

# 3. 检查项目信息
Write-Host "步骤 3: 项目信息" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "项目ID: rekdretiemtoofrvcils" -ForegroundColor White
Write-Host "主机: db.rekdretiemtoofrvcils.supabase.co" -ForegroundColor White
Write-Host "端口: 5432" -ForegroundColor White
Write-Host "数据库: postgres" -ForegroundColor White
Write-Host "用户: postgres" -ForegroundColor White
Write-Host "密码: HR1d0WehCi5RILq7" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host ""

# 4. Supabase Dashboard链接
Write-Host "步骤 4: 检查项目状态" -ForegroundColor Yellow
Write-Host ""
Write-Host "请访问 Supabase Dashboard 确认项目状态:" -ForegroundColor White
Write-Host "https://supabase.com/dashboard/project/mjyfiryzawngzadfxfoe" -ForegroundColor Cyan
Write-Host ""
Write-Host "确认以下信息:" -ForegroundColor Yellow
Write-Host "  ✓ 项目状态显示为 🟢 Active (绿色)" -ForegroundColor Gray
Write-Host "  ✓ 不是 Paused (暂停) 或 Inactive (未激活)" -ForegroundColor Gray
Write-Host "  ✓ 可以访问 Database 设置页面" -ForegroundColor Gray
Write-Host "  ✓ Connection Info 显示连接信息" -ForegroundColor Gray
Write-Host ""

# 5. 建议
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "💡 建议操作:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "如果端口连接失败:" -ForegroundColor Yellow
Write-Host "  1. 项目可能还在启动，等待2-3分钟后重试" -ForegroundColor White
Write-Host "  2. 刷新 Supabase Dashboard 确认状态" -ForegroundColor White
Write-Host "  3. 如果显示 Paused，再次点击 Resume Project" -ForegroundColor White
Write-Host ""

Write-Host "如果端口连接成功但数据库连接失败:" -ForegroundColor Yellow
Write-Host "  1. 检查密码是否正确" -ForegroundColor White
Write-Host "  2. 在 Supabase Dashboard 重置数据库密码" -ForegroundColor White
Write-Host "  3. 获取新的连接字符串" -ForegroundColor White
Write-Host ""

Write-Host "如果DNS解析失败:" -ForegroundColor Yellow
Write-Host "  1. 检查网络连接" -ForegroundColor White
Write-Host "  2. 尝试使用VPN或更换DNS服务器" -ForegroundColor White
Write-Host "  3. 检查hosts文件是否有相关配置" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 6. 等待后重试选项
Write-Host "是否等待30秒后自动重试数据库连接? (Y/N)" -ForegroundColor Yellow
$retry = Read-Host

if ($retry -eq "Y" -or $retry -eq "y") {
    Write-Host ""
    Write-Host "⏳ 等待30秒..." -ForegroundColor Yellow
    for ($i = 30; $i -gt 0; $i--) {
        Write-Host -NoNewline "`r等待中... $i 秒 " -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
    Write-Host ""
    Write-Host ""
    Write-Host "🔄 重新测试数据库连接..." -ForegroundColor Cyan
    Write-Host ""
    
    & npx tsx test-new-db-connection.ts
} else {
    Write-Host ""
    Write-Host "请手动运行: npx tsx test-new-db-connection.ts" -ForegroundColor White
}

Write-Host ""
Write-Host "诊断完成。" -ForegroundColor Green
