# ⚡ Vercel 环境变量配置 - 立即操作

## 🚨 问题诊断

**症状**: 网站显示 0 道题，历年真题页面无数据
**原因**: Vercel 部署环境没有配置数据库连接
**数据库状态**: ✅ 数据正常（已有20道题）

## 🎯 立即配置步骤

### 1. 登录 Vercel Dashboard
访问: https://vercel.com/dashboard

### 2. 选择项目
找到您的项目 `tiku` 并点击进入

### 3. 配置环境变量
点击 **Settings** → **Environment Variables**

### 4. 添加以下环境变量

#### 必需的环境变量：

**变量名**: `DATABASE_URL`
**值**:
```
postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```
**环境**: ✅ Production, ✅ Preview, ✅ Development

---

**变量名**: `DIRECT_URL`
**值**:
```
postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```
**环境**: ✅ Production, ✅ Preview, ✅ Development

---

**变量名**: `NEXT_PUBLIC_SUPABASE_URL`
**值**:
```
https://tparjdkxxtnentsdazfw.supabase.co
```
**环境**: ✅ Production, ✅ Preview, ✅ Development

---

**变量名**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**值**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s
```
**环境**: ✅ Production, ✅ Preview, ✅ Development

---

### 5. 重新部署

配置完成后，有两种方式触发重新部署：

#### 方式A: 通过 Vercel Dashboard
1. 点击 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧 ⋯ 菜单
4. 选择 **Redeploy**
5. 确认 **Redeploy**

#### 方式B: 推送代码触发
```bash
git commit --allow-empty -m "trigger redeploy with database config"
git push
```

## ✅ 验证步骤

重新部署完成后（约2-3分钟）：

1. 访问: https://yikaobiguo.com/practice/history
2. 应该看到:
   - ✅ "真题总数: 20"
   - ✅ "2024年真题: 20 道题"
   - ✅ 状态从"敬请期待"变为"未开始"

3. 点击"开始练习"应该能看到题目

## 📸 配置截图参考

### Environment Variables 页面应该显示:
```
DATABASE_URL              •••••••••••••••  Production, Preview, Development
DIRECT_URL                •••••••••••••••  Production, Preview, Development  
NEXT_PUBLIC_SUPABASE_URL  https://tpar...  Production, Preview, Development
NEXT_PUBLIC_SUPABASE_...  eyJhbGci...     Production, Preview, Development
```

## 🔧 如果还是不行

### 检查1: 查看部署日志
1. Vercel Dashboard → Deployments → 最新部署
2. 点击进入查看 **Build Logs** 和 **Function Logs**
3. 搜索关键词: `DATABASE_URL`, `Prisma`, `questions`

### 检查2: 测试 API
访问: https://yikaobiguo.com/api/questions?sourceYear=2024&limit=1

应该返回:
```json
{
  "success": true,
  "data": {
    "questions": [...],
    "total": 20,
    ...
  }
}
```

### 检查3: 查看浏览器控制台
1. 打开 https://yikaobiguo.com/practice/history
2. 按 F12 打开开发者工具
3. 查看 **Console** 标签页
4. 查看 **Network** 标签页的 API 请求

## 💡 常见问题

**Q: 环境变量配置后多久生效？**
A: 需要重新部署后才生效，部署约需2-3分钟

**Q: 为什么要配置 DIRECT_URL？**
A: Prisma 在生成客户端时需要直接连接，使用 Transaction Pooler (6543端口)

**Q: 环境变量会暴露吗？**
A: `NEXT_PUBLIC_` 开头的会暴露到前端，其他的只在服务端使用，是安全的

## 🎉 配置完成后的效果

- ✅ 历年真题页面正常显示 20 道题
- ✅ 可以开始练习
- ✅ 答案和解析正常显示
- ✅ API 接口正常工作

---

**立即操作**: 现在就去 Vercel Dashboard 配置环境变量！🚀
