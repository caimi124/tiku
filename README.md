# 医药考试通 (MedExam Pro)

> 面向中国医药行业考试的AI智能题库平台

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)](https://tailwindcss.com/)

---

## 📋 项目简介

医药考试通是一个专注于医药行业考试的智能题库平台，涵盖执业药师、药学职称、中医执业医师、中药师等多个考试类型，提供AI智能出题、智能解析、错题本系统、学习报告等功能。

### ✨ 核心功能

- 🎯 **智能刷题**：章节练习、随机练习、模拟考试、每日一练
- 🤖 **AI 解析**：智能生成题目解析和学习建议
- 📚 **错题本**：自动收集错题，薄弱知识点分析
- 📊 **学习报告**：可视化学习数据，追踪进步
- 👥 **会员系统**：多层级会员权益
- 🔐 **用户认证**：安全的注册登录系统
- 📱 **响应式设计**：完美适配移动端和桌面端

---

## 🚀 快速开始

### 前置要求

- Node.js 18.17 或更高版本
- PostgreSQL 数据库（或 Supabase 账号）
- npm / yarn / pnpm

### 安装步骤

1. **克隆项目**（如果是从 Git 仓库）
```bash
git clone https://github.com/yourusername/medexam-pro.git
cd medexam-pro
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp ENV_CONFIG_TEMPLATE.txt .env.local

# 编辑 .env.local，填写数据库等配置
```

4. **初始化数据库**
```bash
# 生成 Prisma Client
npm run db:generate

# 推送数据库结构
npm run db:push

# 插入测试数据
npx tsx prisma/seed.ts
```

5. **启动开发服务器**
```bash
npm run dev
```

6. **访问应用**

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

---

## 📂 项目结构

```
medexam-pro/
├── app/                    # Next.js 14 App Router
│   ├── api/                # API 路由
│   ├── exams/              # 考试分类页面
│   ├── practice/           # 练习页面
│   ├── wrong-questions/    # 错题本
│   ├── page.tsx            # 首页
│   └── layout.tsx          # 全局布局
├── components/             # React 组件
│   └── ui/                 # UI 组件库
├── lib/                    # 工具库
│   ├── prisma.ts           # Prisma Client
│   └── utils.ts            # 工具函数
├── prisma/                 # 数据库
│   ├── schema.prisma       # 数据模型
│   └── seed.ts             # 种子数据
├── public/                 # 静态资源
└── docs/                   # 项目文档
    ├── 项目架构方案.md
    ├── 实施方案与TODO清单.md
    ├── CURSOR_PROMPTS.md
    ├── SEO优化方案.md
    └── 开始开发指南.md
```

---

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui
- **状态管理**: React Hooks / Zustand
- **数据请求**: React Query
- **图表**: Recharts

### 后端
- **API**: Next.js API Routes
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js
- **AI**: OpenAI API

### 部署
- **托管**: Vercel
- **数据库**: Supabase
- **CDN**: Vercel Edge Network

---

## 📚 开发文档

- [📖 开始开发指南](./开始开发指南.md) - 快速上手开发
- [🎯 实施方案与TODO清单](./实施方案与TODO清单.md) - 完整的开发计划
- [🤖 Cursor AI Prompts](./CURSOR_PROMPTS.md) - AI 辅助开发 Prompt
- [🔍 SEO优化方案](./SEO优化方案.md) - 搜索引擎优化指南
- [🏗️ 项目架构方案](./项目架构方案.md) - 详细的技术架构

---

## 🧪 测试账号

种子数据已创建以下测试账号：

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@medexam.pro | admin123456 |
| VIP用户 | user1@example.com | password123 |
| 普通用户 | user3@example.com | password123 |

---

## 📊 数据库管理

### Prisma Studio（推荐）
```bash
npm run db:studio
```
访问 [http://localhost:5555](http://localhost:5555) 查看和编辑数据

### 数据库迁移
```bash
# 生成新的迁移
npx prisma migrate dev --name your_migration_name

# 应用迁移到生产环境
npx prisma migrate deploy
```

### 手动应用 SQL 迁移（Supabase / psql）
如果你使用 Supabase，或者在生产/备份数据库直接运行 SQL，可以手动执行如下命令：

```bash
# 确保 knowledge_tree / knowledge_points 中新增的 importance_level、learn_mode、error_pattern_tags 字段存在
psql "$DATABASE_URL" -f migrations/006-knowledge-mode-guard.sql

# 或者用 Supabase CLI 运行同一份脚本
supabase db query --file migrations/006-knowledge-mode-guard.sql
```

该 SQL 脚本会：

- 增加缺失的 `importance_level`、`learn_mode`、`error_pattern_tags` 列（如已存在不会重复）
- 回填老数据并设置默认值 (`importance_level` 默认 3、`learn_mode` 默认 `BOTH`)
- 强制非空约束并避免未来再因 42703 缺列导致 `/api/section/[sectionId]/points` 与 `/api/knowledge-point/[id]` 500

### 补齐缺失的小节

`scripts/add-missing-sections.ts` 中列举了 C1.2、C1.3、C6.5、C7.1、C7.2、C9.5~C9.8、C11.2、C11.3 等目前数据库缺失的小节。运行：

```bash
npx tsx scripts/add-missing-sections.ts
```

即可自动检测是否已经存在相应 `code`，若不存在会给出新 `id` 并上插入表 `knowledge_tree`（只需设置 Supabase Service Key，脚本会用 `parentCode` 映射到对应章节）。

---

## 🎨 使用 Cursor AI 开发

项目提供了完整的 AI Prompt，可以快速实现功能模块：

1. 打开 `CURSOR_PROMPTS.md`
2. 找到对应功能的 Prompt
3. 在 Cursor 中按 `Cmd/Ctrl + K`
4. 粘贴 Prompt 执行

---

## 📈 开发路线图

### ✅ 已完成
- [x] 项目框架搭建
- [x] 数据库设计
- [x] 首页 UI
- [x] 考试分类页面
- [x] 练习页面选择界面
- [x] 错题本页面 UI

### 🚧 进行中
- [ ] 用户认证系统
- [ ] 做题功能实现
- [ ] 错题本功能完善

### 📋 计划中
- [ ] AI 智能解析
- [ ] 学习统计报告
- [ ] 会员系统
- [ ] 管理后台
- [ ] 支付集成
- [ ] SEO 优化

完整的 TODO 清单请查看 [实施方案与TODO清单.md](./实施方案与TODO清单.md)

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

[MIT License](LICENSE)

---

## 📞 联系方式

- 项目主页: [https://medexam.pro](https://medexam.pro)
- 问题反馈: [GitHub Issues](https://github.com/yourusername/medexam-pro/issues)
- 邮箱: contact@medexam.pro

---

## 🙏 鸣谢

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)
- [Supabase](https://supabase.com/)

---

## ⭐ Star History

如果这个项目对你有帮助，请给它一个 Star ⭐！

---

**Built with ❤️ by MedExam Team**

