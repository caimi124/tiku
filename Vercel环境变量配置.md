# 🔐 Vercel 环境变量配置

## ⚠️ 重要：请立即在 Vercel 中配置以下环境变量

### 访问步骤
1. 登录 Vercel Dashboard: https://vercel.com/dashboard
2. 选择您的项目（tiku）
3. 进入 **Settings** > **Environment Variables**
4. 添加以下环境变量

---

## 📋 必需的环境变量

### DATABASE_URL
这是 PostgreSQL 数据库连接字符串

**变量名称**:
```
DATABASE_URL
```

**变量值**:
```
postgresql://postgres:yZaNnwx8VfkVRVkk@db.rekdretiemtoofrvcils.supabase.co:5432/postgres
```

**应用环境**:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 🎯 可选的环境变量

如果您想使用 Supabase 的其他特性（如实时订阅、存储等），可以添加：

### NEXT_PUBLIC_SUPABASE_URL
```
NEXT_PUBLIC_SUPABASE_URL
```

**值**:
```
https://rekdretiemtoofrvcils.supabase.co
```

### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**值**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJla2RyZXRpZW10b29mcnZjaWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NzIxNjgsImV4cCI6MjA3NzU0ODE2OH0.1oBuCaiM2XWJ_LuoEwLADMTcbsMgKVK-JtrhkUzsfRg
```

---

## 📝 配置完成后

1. ✅ 保存环境变量
2. ✅ Vercel 会自动触发重新部署
3. ✅ 等待 1-2 分钟完成部署
4. ✅ 访问您的网站测试功能

---

## 🔍 验证配置

部署成功后，访问以下 URL 测试：

- 首页: `https://你的域名.vercel.app/`
- API 测试: `https://你的域名.vercel.app/api/questions`

如果看到数据库连接错误，请检查：
1. DATABASE_URL 是否正确设置
2. 密码是否正确（不包含方括号）
3. Supabase 项目是否已激活

---

## ⚡ 初始化数据库

环境变量配置完成并部署成功后，需要初始化数据库结构：

### 方法1: 本地推送（推荐）
```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://postgres:yZaNnwx8VfkVRVkk@db.rekdretiemtoofrvcils.supabase.co:5432/postgres"
npx prisma db push
```

### 方法2: 使用 Supabase Dashboard
1. 访问 https://supabase.com/dashboard
2. 选择您的项目
3. 进入 SQL Editor
4. 可以直接执行 SQL 命令创建表

---

**完成这些步骤后，您的网站就可以完全正常运行了！** 🎉

