# 🚀 Vercel 部署完整指南

## ✅ 问题已修复

### 修复内容
已更新 `vercel.json` 配置文件，添加了关键配置：
- ✅ 添加 `"framework": "nextjs"` - 明确告诉 Vercel 这是 Next.js 项目
- ✅ 保留构建命令和安装命令
- ✅ 添加环境变量配置提示

---

## 📋 部署前检查清单

### 1️⃣ 数据库配置（**必须完成**）

在 Vercel 项目设置中添加以下环境变量：

#### 方法A：使用 Vercel Postgres（推荐）
1. 登录 Vercel Dashboard
2. 进入您的项目
3. 点击 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **Postgres**
6. Vercel 会自动设置 `DATABASE_URL`

#### 方法B：使用外部数据库
在项目设置中添加环境变量：

```bash
DATABASE_URL="postgresql://用户名:密码@主机地址:5432/数据库名?schema=public"
```

**支持的数据库服务：**
- Supabase（免费）
- Neon（免费）
- Railway（免费额度）
- PlanetScale（免费额度）

---

### 2️⃣ 推送修复到 GitHub

```bash
git add vercel.json
git commit -m "fix: 修复 Vercel 部署配置"
git push origin main
```

---

### 3️⃣ Vercel 项目设置检查

登录 Vercel Dashboard，检查以下设置：

#### Build & Development Settings
- **Framework Preset**: Next.js（应自动检测）
- **Build Command**: `prisma generate && next build`
- **Output Directory**: 留空（Next.js 默认使用 `.next`）
- **Install Command**: `npm install`

#### Environment Variables（环境变量）
必须设置：
- ✅ `DATABASE_URL` - 数据库连接字符串

可选设置（根据需要）：
- `NEXTAUTH_SECRET` - NextAuth 密钥（如果使用认证）
- `NEXTAUTH_URL` - 网站 URL（如果使用认证）

---

### 4️⃣ 重新部署

推送代码后，Vercel 会自动触发部署。

或者手动触发：
1. 进入 Vercel Dashboard
2. 选择项目
3. 点击 **Deployments** 标签
4. 点击 **Redeploy**

---

## 🔍 部署过程监控

### 预期的部署日志
```
✓ Installing dependencies
✓ Running prisma generate
✓ Compiling successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
✓ Build completed successfully
```

### 常见问题及解决方案

#### ❌ 问题1: "No Output Directory named 'public' found"
**解决方案**: 已通过更新 `vercel.json` 修复

#### ❌ 问题2: 数据库连接失败
**症状**: 
```
Error: P1001: Can't reach database server
```
**解决方案**:
1. 检查 `DATABASE_URL` 环境变量是否正确设置
2. 确认数据库服务允许 Vercel IP 访问
3. 检查数据库连接字符串格式

#### ❌ 问题3: Prisma 迁移问题
**症状**:
```
Error: Migration engine error
```
**解决方案**:
1. 使用 `prisma db push` 而不是 `prisma migrate`
2. 在 Vercel 项目中添加构建命令：
   ```bash
   prisma generate && prisma db push --skip-generate && next build
   ```

---

## 🎯 数据库初始化

部署成功后，需要初始化数据库：

### 方法1: 使用 Prisma Studio（本地）
```bash
# 1. 在本地设置生产数据库 URL
DATABASE_URL="你的生产数据库URL" npx prisma db push

# 2. 运行种子数据
DATABASE_URL="你的生产数据库URL" npx prisma db seed
```

### 方法2: 创建 API 路由进行初始化
创建 `/api/setup` 路由，用于初始化数据库（建议添加验证）

---

## 📊 部署后验证

访问以下页面确认部署成功：

1. ✅ 首页: `https://你的域名.vercel.app/`
2. ✅ 练习模式: `https://你的域名.vercel.app/practice`
3. ✅ API 测试: `https://你的域名.vercel.app/api/questions`

---

## 🔐 安全建议

### 1. 设置环境变量
不要在代码中硬编码敏感信息：
- ✅ 使用 Vercel 环境变量
- ✅ 使用 `.env.local` 进行本地开发
- ❌ 不要提交 `.env` 文件到 Git

### 2. 数据库安全
- ✅ 使用强密码
- ✅ 限制 IP 访问（如果可能）
- ✅ 定期备份数据库

---

## 📈 性能优化建议

### 1. 启用 Vercel Analytics
```bash
npm install @vercel/analytics
```

在 `app/layout.tsx` 中添加：
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. 配置缓存
在 `next.config.js` 中优化：
```javascript
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  // 启用 SWC 压缩
  swcMinify: true,
}
```

---

## 🆘 需要帮助？

### 查看部署日志
1. 登录 Vercel Dashboard
2. 进入项目
3. 点击失败的部署
4. 查看详细日志

### Prisma 数据库配置文档
```bash
# 查看当前 schema
cat prisma/schema.prisma

# 验证 schema
npx prisma validate

# 生成客户端
npx prisma generate
```

---

## ✅ 快速修复步骤总结

1. **代码已修复** - `vercel.json` 已更新
2. **推送代码** - `git push origin main`
3. **配置数据库** - 在 Vercel 添加 `DATABASE_URL`
4. **等待部署** - Vercel 自动部署
5. **初始化数据** - 运行种子脚本或创建初始数据

---

## 📝 部署时间线

- ⏱️ 安装依赖: ~30-40秒
- ⏱️ Prisma 生成: ~1-2秒
- ⏱️ Next.js 构建: ~15-20秒
- ⏱️ 总计: ~45-60秒

---

**祝您部署顺利！🎉**

