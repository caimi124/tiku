# Cursor AI 开发 Prompt 集合

这个文件包含了可以直接复制粘贴到 Cursor AI 的完整 Prompt，用于快速开发医药考试通项目的各个功能模块。

---

## 📝 使用说明

1. 复制对应模块的 Prompt
2. 在 Cursor 中打开相关文件或新建文件
3. 按 `Cmd/Ctrl + K` 或 `Cmd/Ctrl + L` 调用 AI
4. 粘贴 Prompt 并执行

---

## 🔐 Prompt 1: 用户认证系统（注册/登录页面）

```
请帮我创建完整的用户认证系统，包括注册和登录功能。

【技术要求】
- 使用 Next.js 14 App Router
- TypeScript
- Tailwind CSS 样式
- bcryptjs 加密密码
- 使用已有的 Prisma Schema（User model）

【需要创建的文件】
1. `/app/register/page.tsx` - 注册页面
2. `/app/login/page.tsx` - 登录页面
3. `/app/api/auth/register/route.ts` - 注册API
4. `/app/api/auth/login/route.ts` - 登录API

【功能要求】
注册页面：
- 表单字段：邮箱、用户名、密码、确认密码
- 客户端验证：
  - 邮箱格式验证
  - 密码长度 >= 8位
  - 密码包含字母+数字
  - 两次密码一致
- 使用 react-hook-form + zod 验证
- 美观的UI设计（医疗蓝色系）
- 错误提示
- 注册成功后跳转到登录页

登录页面：
- 表单字段：邮箱、密码、记住我
- 登录成功后存储 session（使用 cookie）
- 错误提示（邮箱不存在、密码错误）
- "忘记密码"链接（暂时不实现功能）
- "还没账号？去注册"链接

API实现：
- POST /api/auth/register
  - 检查邮箱是否已存在
  - 密码使用 bcryptjs 加密
  - 创建用户记录
  - 返回成功/失败消息
- POST /api/auth/login
  - 验证邮箱和密码
  - 创建 session token
  - 返回用户信息和 token

【设计要求】
- 响应式设计
- 表单居中显示
- 卡片式布局
- 加载状态（提交时显示loading）
- 使用 lucide-react 图标
- 与首页风格一致

请提供完整的、可运行的代码。
```

---

## 🎯 Prompt 2: 做题页面核心功能

```
请帮我创建完整的做题页面，这是整个项目最核心的功能。

【页面路径】
`/app/practice/question/[id]/page.tsx`

【功能要求】

1. 题目展示区域
   - 显示题号（第 X/总数 题）
   - 题型标签（单选题/多选题/判断题）
   - 题目内容（支持富文本）
   - 科目标签（考试类型 · 科目名称）

2. 选项区域
   - 单选题：圆形单选框
   - 多选题：方形多选框
   - 判断题：对/错按钮
   - 选中状态高亮
   - 禁用状态（提交后）

3. 答案解析区域（提交后显示）
   - 正确答案高亮（绿色）
   - 错误答案标红（如果答错）
   - 详细解析内容
   - 知识点标签
   - AI智能解析（区分显示）

4. 操作按钮
   - 提交答案按钮
   - 收藏按钮（带图标，已收藏/未收藏状态）
   - 标记按钮
   - 上一题/下一题按钮
   - 返回按钮

5. 功能逻辑
   - 从数据库获取题目数据
   - 用户答题记录保存（UserAnswer表）
   - 答错自动加入错题本（WrongQuestion表）
   - 正确率实时更新
   - 答题时长记录（计时器）
   - 键盘快捷键支持（A/B/C/D）

【API需求】
- GET `/api/questions/[id]` - 获取题目详情
- POST `/api/answers/submit` - 提交答案
  ```typescript
  // Request Body
  {
    questionId: string;
    userAnswer: string; // 'A' / 'B' / 'AB' / 'true'
    timeSpent: number; // 秒
  }
  
  // Response
  {
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
    aiExplanation?: string;
  }
  ```

【UI设计要求】
- 清晰的视觉层次
- 答对显示绿色勾 ✓ + 鼓励文案
- 答错显示红色叉 ✗ + 鼓励文案
- 加载骨架屏
- 流畅的动画过渡

【状态管理】
使用 useState 管理：
- 用户选择的答案
- 是否已提交
- 答题结果
- 答题时长

请提供完整代码，包括页面组件和API路由。
```

---

## 📊 Prompt 3: 学习统计与报告页面

```
请创建一个功能完整的学习中心页面，展示用户的学习数据和统计报告。

【页面路径】
`/app/study-center/page.tsx`

【需要展示的数据】

1. 核心统计卡片（顶部4个卡片）
   - 已刷题数
   - 总正确率（百分比 + 环形进度条）
   - 连续学习天数
   - 累计学习时长（格式化为小时/分钟）

2. 答题趋势图表（Recharts）
   - 最近7天/30天的答题数量折线图
   - X轴：日期
   - Y轴：题数
   - 显示正确数和错误数两条线

3. 正确率趋势（Recharts）
   - 最近7天的正确率变化
   - 面积图
   - 显示平均线

4. 知识点掌握度雷达图
   - 展示各个科目/章节的掌握情况
   - 数据来源：各知识点的正确率

5. 最近学习记录
   - 表格展示最近10次的答题记录
   - 字段：日期、考试类型、题数、正确数、正确率、用时

6. 薄弱知识点列表
   - 按错误率排序
   - 显示Top 5
   - 每个知识点显示：名称、错误率、练习次数
   - "针对性练习"按钮

【API需求】
- GET `/api/study/stats` - 获取统计数据
  ```typescript
  interface StudyStats {
    totalQuestions: number;
    correctRate: number;
    studyDays: number;
    totalTimeSpent: number;
    dailyStats: Array<{
      date: string;
      correct: number;
      wrong: number;
      rate: number;
    }>;
    knowledgePoints: Array<{
      point: string;
      masteryRate: number;
    }>;
    weakPoints: Array<{
      point: string;
      errorRate: number;
      count: number;
    }>;
    recentSessions: Array<{
      date: string;
      examType: string;
      questionsCount: number;
      correctCount: number;
      timeSpent: number;
    }>;
  }
  ```

【UI要求】
- 使用 Recharts 库创建图表
- 响应式布局（移动端图表自适应）
- 数据加载状态
- 空状态提示（没有数据时）
- 导出报告按钮（PDF，可选功能）

【技术实现】
- 使用 Prisma 聚合查询
- 数据缓存（避免频繁计算）
- 日期范围筛选（7天/30天/全部）

请提供完整代码。
```

---

## 🤖 Prompt 4: AI 自动出题功能（管理后台）

```
请创建 AI 自动出题功能，这是项目的核心卖点之一。

【页面路径】
`/app/admin/generate-questions/page.tsx`

【功能流程】
1. 管理员输入参数
   - 考试类型（下拉选择）
   - 科目（下拉选择）
   - 章节（输入）
   - 知识点（输入或标签选择）
   - 难度（1-5星）
   - 题型（单选/多选/判断）
   - 生成数量（1-10）

2. 调用 OpenAI API 生成题目
   - 使用精心设计的 Prompt
   - 返回结构化 JSON 数据

3. 预览生成的题目
   - 展示所有生成的题目
   - 可以编辑
   - 可以删除不合格的题目

4. 批量保存到数据库
   - 保存到 Question 表
   - 显示成功提示

【API实现】
- POST `/api/ai/generate-questions`
  ```typescript
  // Request
  interface GenerateRequest {
    examType: string;
    subject: string;
    chapter: string;
    knowledgePoints: string[];
    difficulty: number;
    questionType: 'single' | 'multiple' | 'judge';
    count: number;
  }
  
  // Response
  interface GeneratedQuestion {
    content: string;
    options: Array<{ key: string; value: string }>;
    correctAnswer: string;
    explanation: string;
    knowledgePoints: string[];
  }
  ```

【Prompt 工程】
使用以下 OpenAI Prompt 模板：

```typescript
const generatePrompt = `
你是一位资深的${examType}考试专家，拥有20年的出题经验。

请为以下知识点生成${count}道高质量的${questionTypeMap[questionType]}题。

【考试信息】
- 考试类型：${examType}
- 科目：${subject}
- 章节：${chapter}
- 知识点：${knowledgePoints.join('、')}
- 难度等级：${difficulty}/5

【出题要求】
1. 题目必须准确、专业，符合${examType}考试的标准和风格
2. 难度适中，既要考察理解，也要有一定区分度
3. 选项设置合理，干扰项要有迷惑性但不离谱
4. 解析要详细，包含知识点讲解和解题思路
5. 避免出现时效性强的内容（如"2023年"）
6. 题目表述清晰，无歧义

【输出格式】
请严格按照以下 JSON 格式返回（返回数组，包含${count}道题）：

[
  {
    "content": "题目内容",
    "options": [
      {"key": "A", "value": "选项A内容"},
      {"key": "B", "value": "选项B内容"},
      {"key": "C", "value": "选项C内容"},
      {"key": "D", "value": "选项D内容"}
    ],
    "correctAnswer": "A",
    "explanation": "详细解析内容，包括：1. 正确答案解释 2. 错误选项分析 3. 相关知识点",
    "knowledgePoints": ["知识点1", "知识点2"]
  }
]

请开始生成题目：
`;
```

【UI设计】
- 左侧：参数输入表单
- 右侧：实时预览区域
- 生成中显示加载动画和进度
- 成功后显示题目卡片列表
- 每个卡片可编辑/删除

【技术要点】
- 使用 OpenAI GPT-4 API
- 流式返回（可选）
- 错误处理（API失败重试）
- 生成历史记录
- 成本控制（限制单次生成数量）

请提供完整代码。
```

---

## 💳 Prompt 5: 会员系统（展示+支付）

```
请创建完整的会员系统，包括会员页面和支付功能。

【页面路径】
`/app/membership/page.tsx`

【会员等级设计】
| 等级 | 价格 | 权益 |
|------|------|------|
| 免费版 | ¥0 | 每日10题、基础解析 |
| 月度会员 | ¥39 | 无限刷题、AI解析、错题本 |
| 季度会员 | ¥99 | 月度权益 + 学习报告 |
| 年度会员 | ¥299 | 季度权益 + 视频讲解 + 考前押题 |

【页面布局】

1. Hero 区域
   - 标题："升级会员，解锁全部功能"
   - 副标题：已有 X 位用户加入会员

2. 会员卡片（4个横向排列）
   - 卡片标题
   - 价格（大字号）
   - 权益列表（带✓图标）
   - "立即开通"按钮
   - 推荐标签（年度会员）

3. 权益对比表格
   - 功能 vs 免费/月度/季度/年度
   - 清晰标注√和×

4. 常见问题（FAQ）
   - 如何开通会员？
   - 支持哪些支付方式？
   - 会员到期后怎么办？
   - 可以退款吗？

【支付流程】

使用 Stripe（国际支付）：

1. 用户点击"立即开通"
2. 弹出支付模态框
   - 显示订单信息
   - 支付方式选择
   - Stripe Card Element

3. 创建支付意图（Payment Intent）
   - POST `/api/payments/create-intent`

4. 确认支付
   - 调用 Stripe.js 确认
   - 成功后更新用户会员状态

5. 支付成功
   - 显示成功页面
   - 更新用户 isVip 和 vipExpireDate
   - 发送欢迎邮件（可选）

【API实现】

```typescript
// POST /api/payments/create-intent
export async function POST(req: Request) {
  const { membershipType, userId } = await req.json();
  
  const prices = {
    monthly: 3900,  // 39.00元（分）
    quarterly: 9900,
    yearly: 29900,
  };
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: prices[membershipType],
    currency: 'cny',
    metadata: { userId, membershipType },
  });
  
  return Response.json({ clientSecret: paymentIntent.client_secret });
}

// POST /api/webhooks/stripe
// 处理 Stripe Webhook 事件
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  
  if (event.type === 'payment_intent.succeeded') {
    const { userId, membershipType } = event.data.object.metadata;
    
    // 更新用户会员状态
    await prisma.user.update({
      where: { id: userId },
      data: {
        isVip: true,
        vipExpireDate: calculateExpireDate(membershipType),
      },
    });
  }
  
  return Response.json({ received: true });
}
```

【备选方案：国内支付】
如果需要支持微信/支付宝，提供接入方案说明。

【UI要求】
- 精美的卡片设计
- 推荐会员有视觉突出（边框高亮、阴影）
- 价格对比突出性价比
- 响应式设计

请提供完整代码。
```

---

## 📊 Prompt 6: 管理后台（题库管理）

```
请创建管理后台的题库管理功能，支持CRUD和Excel批量导入。

【页面路径】
`/app/admin/questions/page.tsx`

【功能模块】

1. 题目列表
   - 表格展示所有题目
   - 字段：ID、题目内容（截断显示）、考试类型、科目、章节、难度、创建时间、操作
   - 分页（每页20条）
   - 筛选：按考试类型、科目、难度
   - 搜索：题目内容关键词搜索
   - 排序：按创建时间、难度、浏览量

2. 新增题目
   - 点击"新增题目"按钮
   - 弹出表单模态框
   - 字段：
     - 考试类型（下拉）
     - 科目（下拉）
     - 章节（输入）
     - 题型（单选/多选/判断）
     - 题目内容（富文本编辑器）
     - 选项（动态添加/删除）
     - 正确答案
     - 解析（富文本）
     - 知识点标签
     - 难度（1-5星）
   - 提交保存

3. 编辑题目
   - 点击表格中的"编辑"按钮
   - 弹出表单（字段同新增）
   - 回显原有数据
   - 保存更新

4. 删除题目
   - 点击"删除"按钮
   - 确认提示框
   - 删除后刷新列表

5. Excel 批量导入
   - 上传 .xlsx 文件
   - 解析 Excel 内容
   - 预览解析结果
   - 批量插入数据库
   - 显示导入成功数量和失败列表

【Excel 格式要求】
```
| 考试类型 | 科目 | 章节 | 题型 | 题目内容 | 选项A | 选项B | 选项C | 选项D | 正确答案 | 解析 | 知识点 | 难度 |
|---------|------|------|------|----------|-------|-------|-------|-------|---------|------|--------|------|
```

【API实现】
- GET `/api/admin/questions` - 获取题目列表（带分页和筛选）
- POST `/api/admin/questions` - 创建题目
- PUT `/api/admin/questions/[id]` - 更新题目
- DELETE `/api/admin/questions/[id]` - 删除题目
- POST `/api/admin/questions/import` - 批量导入

【导入功能实现】
```typescript
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  const questions = data.map(row => ({
    examType: row['考试类型'],
    subject: row['科目'],
    chapter: row['章节'],
    questionType: mapQuestionType(row['题型']),
    content: row['题目内容'],
    options: [
      { key: 'A', value: row['选项A'] },
      { key: 'B', value: row['选项B'] },
      { key: 'C', value: row['选项C'] },
      { key: 'D', value: row['选项D'] },
    ],
    correctAnswer: row['正确答案'],
    explanation: row['解析'],
    knowledgePoints: row['知识点'].split('、'),
    difficulty: parseInt(row['难度']),
  }));
  
  const result = await prisma.question.createMany({
    data: questions,
    skipDuplicates: true,
  });
  
  return Response.json({ 
    success: result.count,
    total: questions.length 
  });
}
```

【UI要求】
- 后台管理风格（侧边栏导航）
- 表格组件（shadcn/ui Table）
- 模态框表单
- 文件上传组件（拖拽上传）
- 加载状态和错误提示

【权限控制】
- 检查用户是否为管理员
- 使用中间件保护路由

请提供完整代码。
```

---

## 🔍 Prompt 7: SEO优化完整实现

```
请帮我实现网站的完整SEO优化，包括动态元数据、Sitemap和结构化数据。

【任务列表】

1. 动态元数据（每个页面独立SEO）

为以下页面添加动态 metadata：

- 首页 `/` 
  - Title: "医药考试通 - 执业药师题库 | 10万+题目在线刷题"
  - Description: "医药考试通提供执业药师、药学职称、中医师题库，AI智能解析，错题本系统，模拟考试，助你高效通关。"
  - Keywords: "执业药师题库,药学考试,医药考试,执业药师刷题"

- 考试分类页 `/exams`
  - Title: "考试分类 - 医药考试通"

- 题目详情页 `/practice/question/[id]`
  - 动态生成 Title（包含题目关键词）
  - Description 使用题目内容摘要

2. 生成 sitemap.xml

创建 `/app/sitemap.ts`：
```typescript
import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态页面
  const routes = [
    '/',
    '/exams',
    '/practice',
    '/wrong-questions',
    '/study-center',
    '/membership',
    '/login',
    '/register',
  ].map(route => ({
    url: `https://medexam.pro${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '/' ? 1 : 0.8,
  }));

  // 动态页面：所有题目
  const questions = await prisma.question.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true },
  });

  const questionRoutes = questions.map(q => ({
    url: `https://medexam.pro/practice/question/${q.id}`,
    lastModified: q.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...questionRoutes];
}
```

3. robots.txt

创建 `/app/robots.ts`：
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://medexam.pro/sitemap.xml',
  };
}
```

4. 结构化数据（Schema.org）

在题目详情页添加结构化数据：
```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Question',
  'name': question.content,
  'text': question.content,
  'acceptedAnswer': {
    '@type': 'Answer',
    'text': question.explanation,
  },
  'educationalAlignment': {
    '@type': 'AlignmentObject',
    'alignmentType': 'educationalSubject',
    'targetName': question.subject,
  },
};

// 在页面中添加
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

5. 面包屑导航（含结构化数据）

创建面包屑组件 `/components/Breadcrumb.tsx`：
- UI展示
- 添加 BreadcrumbList Schema

6. Open Graph 优化

为每个页面添加 OG 图片：
- 创建动态 OG 图片生成 API
- 使用 @vercel/og 库

7. 性能优化
- 所有图片使用 next/image
- 添加 loading="lazy"
- 配置图片压缩

8. 内链优化
- 在首页添加"热门题目"板块
- 相关题目推荐
- 面包屑导航

请提供完整实现代码。
```

---

## 🎨 Prompt 8: UI组件库扩展

```
请帮我创建一套可复用的UI组件，用于整个项目。

【需要创建的组件】

1. `/components/ui/loading.tsx` - 加载动画
   - 全屏loading（路由跳转时）
   - 按钮loading（提交时）
   - 骨架屏（数据加载时）

2. `/components/ui/toast.tsx` - 提示消息
   - 成功提示（绿色）
   - 错误提示（红色）
   - 警告提示（黄色）
   - 信息提示（蓝色）
   - 自动消失（3秒）
   - 支持位置（top/bottom/center）

3. `/components/ui/modal.tsx` - 模态框
   - 标题
   - 内容区域
   - 底部操作按钮
   - 背景遮罩
   - 关闭按钮
   - 支持大中小尺寸

4. `/components/ui/tabs.tsx` - 标签页
   - 横向标签切换
   - 下划线动画
   - 支持图标

5. `/components/QuestionCard.tsx` - 题目卡片
   - 题目内容展示
   - 题型标签
   - 难度星级
   - 浏览量/正确率
   - 操作按钮（做题/收藏）

6. `/components/StatsCard.tsx` - 统计卡片
   - 图标
   - 数值（大字号）
   - 标签
   - 趋势指示（上升/下降）

7. `/components/ProgressBar.tsx` - 进度条
   - 百分比进度
   - 颜色可配置
   - 圆环进度条（用于正确率）

8. `/components/EmptyState.tsx` - 空状态
   - 图标
   - 提示文字
   - 操作按钮

【设计要求】
- 使用 Tailwind CSS
- 支持 TypeScript 类型
- 可配置的 Props
- 可访问性（ARIA标签）
- 响应式设计

【使用示例】
```typescript
// Toast 使用
import { toast } from '@/components/ui/toast';
toast.success('题目已收藏');

// Modal 使用
<Modal 
  isOpen={isOpen} 
  onClose={onClose}
  title="确认删除"
>
  <p>确定要删除这道题目吗？</p>
</Modal>
```

请为每个组件提供完整代码和使用示例。
```

---

## 🗄️ Prompt 9: 数据库种子数据

```
请帮我创建数据库种子文件，插入测试数据。

【文件路径】
`/prisma/seed.ts`

【需要创建的数据】

1. 测试用户（5个）
   - 1个管理员账号
   - 4个普通用户
   - 其中2个是VIP用户

2. 题目数据（100道）
   - 考试类型分布：
     - 执业药师：40道
     - 药学职称：30道
     - 中医执业医师：20道
     - 中药师：10道
   - 题型分布：
     - 单选题：70%
     - 多选题：20%
     - 判断题：10%
   - 难度分布：1-5星均匀分布

3. 答题记录（200条）
   - 关联已创建的用户和题目
   - 随机正确/错误
   - 随机答题时长（30-300秒）

4. 错题记录（30条）
   - 关联答错的题目

5. 收藏记录（20条）

6. 学习记录（10条）

【实现要求】
- 使用真实的医药类题目内容
- 题目内容专业、准确
- 解析详细
- 知识点标签合理

【运行方式】
```bash
npx prisma db seed
```

【package.json 配置】
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

请提供完整的 seed.ts 文件，包含真实的医药类题目示例。
```

---

## 📱 Prompt 10: 移动端优化

```
请帮我优化网站的移动端体验。

【优化内容】

1. 响应式导航栏
   - 桌面端：横向导航
   - 移动端：汉堡菜单（侧边抽屉）
   - 创建 `/components/MobileNav.tsx`

2. 底部导航栏（移动端专用）
   - 固定在底部
   - 5个主要入口：
     - 首页
     - 刷题
     - 错题本
     - 学习中心
     - 我的
   - 图标 + 文字
   - 当前页面高亮

3. 做题页面移动端优化
   - 选项按钮更大（最小44x44px）
   - 支持滑动切换题目（上一题/下一题）
   - 操作按钮固定在底部

4. 表单优化
   - 输入框更大
   - 键盘适配（数字键盘、邮箱键盘）
   - 自动聚焦优化

5. 图表适配
   - Recharts 响应式配置
   - 移动端简化显示

6. 性能优化
   - 图片懒加载
   - 分页加载（无限滚动）
   - 减少首屏加载内容

7. PWA 支持（可选）
   - 创建 manifest.json
   - Service Worker
   - 离线缓存

【技术实现】
- 使用 Tailwind 响应式类（sm/md/lg）
- 使用 framer-motion 实现滑动动画
- 媒体查询断点：
  - 移动端：< 768px
  - 平板：768px - 1024px
  - 桌面：> 1024px

请提供完整的移动端优化代码。
```

---

## 🎯 使用技巧

1. **渐进式实现**：不要一次性要求实现所有功能，按 Prompt 顺序逐个实现
2. **测试验证**：每完成一个模块，立即测试功能是否正常
3. **代码复用**：优先使用已有的组件和样式
4. **错误处理**：确保每个 API 都有错误处理和用户提示
5. **类型安全**：充分利用 TypeScript 的类型检查

---

## 📞 遇到问题？

如果 AI 生成的代码有问题：
1. 检查是否缺少依赖包
2. 检查 import 路径是否正确
3. 检查 Prisma Schema 是否同步（`npm run db:generate`）
4. 重新表述 Prompt，提供更多上下文

祝开发顺利！🚀

