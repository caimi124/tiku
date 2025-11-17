# 🎯 tiku2 项目 - 完整导入指南

## 📊 项目信息

- **项目名称：** tiku2
- **项目ID：** tparjdkxxtnentsdazfw
- **项目URL：** https://tparjdkxxtnentsdazfw.supabase.co
- **Dashboard：** https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw

---

## ⚠️ 重要提示

由于网络环境无法直接连接数据库端口（DNS解析失败），我们使用 **Supabase Dashboard** 直接操作数据库。

这种方式：
- ✅ 不需要数据库直连
- ✅ 不需要解决DNS问题
- ✅ 直接在Web界面操作
- ✅ 更简单快捷

---

## 🚀 快速导入（3步完成）

### 第1步：创建数据库表结构（5分钟）

#### 1.1 访问 SQL Editor

1. 打开浏览器访问：
   ```
   https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw
   ```

2. 登录你的账号

3. 点击左侧菜单 **"SQL Editor"**

4. 点击右上角 **"New query"** 按钮

#### 1.2 运行创建表的SQL

1. 打开文件：`prisma/schema.prisma`

2. 找到 `Question` 模型定义

3. 在 SQL Editor 中运行以下SQL创建表：

```sql
-- 创建 questions 表
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  exam_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT,
  question_type TEXT NOT NULL,
  content TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  ai_explanation TEXT,
  difficulty INTEGER DEFAULT 1,
  knowledge_points TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_questions_exam_type ON questions(exam_type);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_published ON questions(is_published);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);

-- 验证表已创建
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'questions'
ORDER BY ordinal_position;
```

4. 点击 **"Run"** 按钮执行

5. 确认看到 "Success" 消息和表结构信息

---

### 第2步：导入2024年真题（2分钟）

#### 2.1 复制导入SQL

1. 打开文件：`导入真题到tiku2-SQL脚本.sql`

2. 复制所有内容（Ctrl+A, Ctrl+C）

#### 2.2 在 SQL Editor 中运行

1. 在 SQL Editor 中点击 **"New query"**

2. 粘贴刚才复制的SQL（Ctrl+V）

3. 点击 **"Run"** 按钮

4. 等待执行完成（约5-10秒）

#### 2.3 验证导入成功

执行完成后，你应该看到：
- ✅ 插入成功的消息
- 📊 统计信息显示题目数量
- 📝 最近导入的题目列表

**预期结果：**
```
total_questions: 3
questions_2024: 3
zhongyao_questions: 3
```

---

### 第3步：更新前端配置（1分钟）

#### 3.1 更新 .env.local

创建或编辑 `e:\tiku\.env.local` 文件：

```env
# tiku2 项目配置
DATABASE_URL="postgresql://postgres:bdcW5inRuvSMfwYN@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres"

# Supabase API 配置
NEXT_PUBLIC_SUPABASE_URL="https://tparjdkxxtnentsdazfw.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key-123456"
NEXTAUTH_URL="http://localhost:3000"

# 环境标识
NODE_ENV="development"
```

#### 3.2 应用前端修复

如果还没有应用前端修复，运行：

```powershell
.\应用前端修复.bat
```

#### 3.3 启动开发服务器

```powershell
npm run dev
```

#### 3.4 访问应用

打开浏览器访问：
```
http://localhost:3000/practice
```

---

## ✅ 验证步骤

### 在 Supabase Dashboard 验证

1. **Table Editor 验证**
   - 点击左侧 **"Table Editor"**
   - 选择 **"questions"** 表
   - 应该看到 3 条记录
   - 每条记录的 `knowledge_points` 包含 "2024年真题"

2. **SQL 查询验证**
   - 在 SQL Editor 运行：
   ```sql
   SELECT * FROM questions 
   WHERE '2024年真题' = ANY(knowledge_points)
   ORDER BY created_at DESC;
   ```

### 在前端验证

1. 访问 http://localhost:3000/practice

2. 选择练习模式

3. 选择科目：**"中药学综合知识与技能"**

4. 应该看到：
   - ✅ 3道题目
   - 🔥 每道题有红色"2024年真题"标签
   - 完整的题目内容、选项和解析

---

## 📝 完整的SQL脚本（如需手动执行）

### 创建表结构

```sql
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  exam_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT,
  question_type TEXT NOT NULL,
  content TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  ai_explanation TEXT,
  difficulty INTEGER DEFAULT 1,
  knowledge_points TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_exam_type ON questions(exam_type);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_published ON questions(is_published);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
```

### 查询统计

```sql
-- 查看所有题目数量
SELECT COUNT(*) as total FROM questions;

-- 查看2024年真题数量
SELECT COUNT(*) as count_2024 
FROM questions 
WHERE '2024年真题' = ANY(knowledge_points);

-- 按科目统计
SELECT 
  subject,
  COUNT(*) as count
FROM questions
GROUP BY subject
ORDER BY count DESC;

-- 查看最近的题目
SELECT 
  exam_type,
  subject,
  LEFT(content, 50) || '...' as content,
  correct_answer,
  knowledge_points,
  created_at
FROM questions
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎯 快速检查清单

### Dashboard 操作清单

- [ ] 已访问 tiku2 项目 Dashboard
- [ ] 在 SQL Editor 中运行了创建表的SQL
- [ ] 看到 questions 表创建成功
- [ ] 在 SQL Editor 中运行了导入数据的SQL
- [ ] 看到3条数据导入成功
- [ ] 在 Table Editor 中确认数据存在

### 本地配置清单

- [ ] 已创建/更新 `.env.local` 文件
- [ ] 配置了正确的 DATABASE_URL
- [ ] 配置了 SUPABASE_URL 和 ANON_KEY
- [ ] 已应用前端修复（如果需要）
- [ ] 已启动开发服务器

### 前端验证清单

- [ ] 可以访问 http://localhost:3000/practice
- [ ] 可以选择"中药学综合知识与技能"科目
- [ ] 可以看到题目列表
- [ ] 题目有🔥"2024年真题"标签
- [ ] 可以正常答题和查看解析

---

## 🔧 故障排除

### Q1: SQL Editor 显示权限错误？

**解决：** 确保你使用的是项目所有者账号登录。

### Q2: 运行SQL后没有反应？

**解决：** 
- 检查是否有语法错误
- 尝试分段运行（先创建表，再导入数据）
- 刷新页面重试

### Q3: Table Editor 看不到数据？

**解决：**
- 点击表名刷新
- 在 SQL Editor 运行查询确认数据存在
- 检查是否在正确的项目中

### Q4: 前端看不到题目？

**解决：**
1. 检查 `.env.local` 配置是否正确
2. 重启开发服务器
3. 清除浏览器缓存
4. 检查浏览器控制台错误
5. 确认API路由 `/api/questions` 是否正常

### Q5: 需要导入更多题目？

**方法1：** 在 SQL Editor 继续添加INSERT语句

**方法2：** 在 Table Editor 手动添加（点击"Insert row"）

**方法3：** 提供完整题目数据，我帮你生成批量导入SQL

---

## 📊 当前状态

- ✅ **tiku2 项目已创建**
- ⏳ **等待你在 Dashboard 中执行SQL**
- 📝 **已准备好3道示例真题**

---

## 🎉 下一步

### 立即操作：

1. **打开 Dashboard**
   ```
   https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw
   ```

2. **执行创建表SQL**（第1步）

3. **执行导入数据SQL**（第2步）

4. **更新本地配置**（第3步）

5. **启动并测试**

### 如果有更多题目数据

如果你有完整的120道2024年真题（Excel、Word或其他格式），请提供给我，我可以：
- 生成完整的SQL导入脚本
- 或创建批量导入工具
- 帮你一次性导入所有题目

---

## 💡 为什么使用 Dashboard？

**优点：**
- ✅ 绕过网络/DNS问题
- ✅ 直观的图形界面
- ✅ 实时查看数据
- ✅ 不需要本地工具
- ✅ 安全可靠

**Dashboard 功能：**
- **SQL Editor** - 运行任何SQL语句
- **Table Editor** - 可视化编辑数据
- **Database** - 查看表结构和关系
- **Authentication** - 用户管理
- **Storage** - 文件存储

---

**现在就开始操作吧！** 

按照上面的步骤，你可以在5-10分钟内完成所有设置。

有任何问题随时告诉我！🚀
