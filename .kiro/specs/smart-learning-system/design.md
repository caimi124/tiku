# 智能学习系统设计文档

## 一、现状分析

### 当前网站问题诊断

| 问题类别 | 具体问题 | 影响程度 |
|---------|---------|---------|
| **信息架构** | 知识点没有树状结构展示，用户无法看到学习全貌 | 🔴 严重 |
| **学习反馈** | 没有掌握度可视化，用户不知道哪里薄弱 | 🔴 严重 |
| **数据展示** | 真题总数显示0，数据加载问题 | 🔴 严重 |
| **用户体验** | 缺少学习进度追踪，无法形成学习闭环 | 🟡 中等 |
| **视觉设计** | 页面信息密度低，关键信息不突出 | 🟡 中等 |
| **SEO** | 缺少结构化数据，知识点页面SEO弱 | 🟡 中等 |

---

## 二、核心优化方案

### 2.1 知识点掌握度仪表盘（核心功能）

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 我的学习仪表盘                                    [本周] [本月] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   68%    │  │  12.5h   │  │   76%    │  │    23    │        │
│  │ 总掌握度  │  │ 本周学习  │  │ 正确率   │  │ 薄弱考点  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                 │
│  📈 各章节掌握情况                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 第2章 解热镇痛抗炎药     ████████████░░░░  78%  ✓已掌握   │   │
│  │ 第3章 呼吸系统用药       ██████████░░░░░░  65%  ⚠需复习   │   │
│  │ 第4章 消化系统用药       ████░░░░░░░░░░░░  32%  ✗薄弱     │   │
│  │ 第5章 心血管系统用药     ██████████████░░  85%  ✓已掌握   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  🔥 今日推荐复习（基于艾宾浩斯遗忘曲线）                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 质子泵抑制剂的临床应用  ★★★★★  上次: 3天前  正确率: 60% │   │
│  │ 2. 头孢菌素类分代特点      ★★★★☆  上次: 5天前  正确率: 45% │   │
│  │ 3. 利尿药不良反应对比      ★★★★★  上次: 7天前  正确率: 70% │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 知识点树状结构（让用户一眼看清）

```
┌─────────────────────────────────────────────────────────────────┐
│  📚 药学专业知识（二）知识图谱                     [展开全部] [收起] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔍 搜索知识点...                          [只看薄弱] [只看高频]  │
│                                                                 │
│  ▼ 第2章 解热、镇痛、抗炎药                    78% ████████░░    │
│    │                                                            │
│    ├─▼ 2.1 解热镇痛抗炎药                     85% █████████░    │
│    │   ├─ ● 考点1 药物分类与作用机制  ★★★★★  ✓ 已掌握          │
│    │   ├─ ● 考点2 阿司匹林临床评价    ★★★★★  ✓ 已掌握          │
│    │   └─ ● 考点3 对乙酰氨基酚评价    ★★★★☆  ⚠ 需复习          │
│    │                                                            │
│    ├─▶ 2.2 抗风湿药                          72% ███████░░░    │
│    │                                                            │
│    └─▼ 2.3 抗痛风药                          65% ██████░░░░    │
│        ├─ ● 考点1 药物分类与机制      ★★★★☆  ✓ 已掌握          │
│        ├─ ● 考点2 秋水仙碱临床评价    ★★★★★  ✗ 薄弱 [去练习]   │
│        ├─ ● 考点3 促尿酸排泄药评价    ★★★☆☆  ⚠ 需复习          │
│        └─ ● 考点4 抑制尿酸生成药      ★★★★☆  ○ 未学习          │
│                                                                 │
│  ▶ 第3章 呼吸系统用药                          65% ██████░░░░    │
│  ▶ 第4章 消化系统用药                          32% ███░░░░░░░    │
│  ▶ 第5章 心血管系统用药                        85% █████████░    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

图例: ✓已掌握(≥80%)  ⚠需复习(60-79%)  ✗薄弱(<60%)  ○未学习
      ★ 重要性等级(1-5星)  █ 掌握度进度条
```

### 2.3 知识点卡片详情

```
┌─────────────────────────────────────────────────────────────────┐
│  质子泵抑制剂（PPI）的临床用药评价                               │
│  ─────────────────────────────────────────────────────────────  │
│  ★★★★★ 高频考点  |  📍 第4章 > 4.1节 > 考点2  |  🏷️ 适应证      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📊 我的掌握情况                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  练习次数: 15次  |  正确率: 60%  |  掌握度: ⚠ 需复习      │   │
│  │  ████████████░░░░░░░░  60%                               │   │
│  │  上次练习: 3天前  |  建议复习: 今天                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  📝 核心内容                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 【适应证】                                                │   │
│  │  • 消化性溃疡 ✓(正确率90%)                               │   │
│  │  • 胃食管反流病 ✓(正确率85%)                             │   │
│  │  • 幽门螺杆菌感染 ⚠(正确率55%)                           │   │
│  │  • 卓-艾综合征 ✗(正确率40%)                              │   │
│  │                                                          │   │
│  │ 【临床应用注意】                                          │   │
│  │  • 长期使用可能导致骨质疏松 ⚠(正确率50%)                  │   │
│  │  • 与氯吡格雷存在相互作用 ✗(正确率35%)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💡 记忆口诀                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ "拉唑家族抑酸强，溃疡反流都能扛，                         │   │
│  │  长期使用要注意，骨松感染别遗忘"                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 📝 专项练习   │  │ ⭐ 加入收藏   │  │ 🔄 标记复习   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、页面架构重设计

### 3.1 新增页面结构

```
/                           # 首页（保持现有，优化CTA）
├── /dashboard              # 📊 学习仪表盘（新增核心页面）
│   ├── 总体掌握度
│   ├── 章节进度
│   ├── 薄弱点分析
│   └── 今日推荐
│
├── /knowledge              # 📚 知识点树（新增核心页面）
│   ├── /knowledge/[subject]           # 按科目
│   ├── /knowledge/[subject]/[chapter] # 按章节
│   └── /knowledge/point/[id]          # 知识点详情
│
├── /practice               # 练习中心（优化现有）
│   ├── /practice/history   # 历年真题
│   ├── /practice/chapter   # 章节练习
│   ├── /practice/weak      # 薄弱点专练（新增）
│   └── /practice/smart     # AI智能组卷（新增）
│
├── /wrong-questions        # 错题本（优化）
│   ├── 按知识点分类
│   └── 按错误类型分类
│
└── /exams                  # 模拟考试
```

### 3.2 导航栏优化

```
现有导航:
[AI推荐] [历年真题] [机构对比] [资料测评] [押题专区] [学员社区]

优化后导航:
[📊 学习中心 ▼] [📚 知识图谱] [📝 刷题练习 ▼] [🎯 模拟考试] [👥 社区]
      │                              │
      ├─ 我的仪表盘                   ├─ 历年真题
      ├─ 学习计划                     ├─ 章节练习  
      ├─ 薄弱点分析                   ├─ 薄弱专练
      └─ 学习报告                     └─ AI智能组卷
```

---

## 四、数据模型设计

### 4.1 核心表结构

```sql
-- 已创建: knowledge_tree (知识点树)
-- 已创建: user_knowledge_mastery (用户掌握度)
-- 已创建: learning_records (学习记录)

-- 需要新增: 学习计划表
CREATE TABLE study_plans (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    target_exam_date DATE,           -- 目标考试日期
    daily_target_minutes INT,        -- 每日目标学习时长
    daily_target_questions INT,      -- 每日目标题数
    focus_chapters TEXT[],           -- 重点章节
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 需要新增: 每日学习统计
CREATE TABLE daily_learning_stats (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    stat_date DATE NOT NULL,
    study_minutes INT DEFAULT 0,
    questions_done INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    new_points_learned INT DEFAULT 0,
    weak_points_reviewed INT DEFAULT 0,
    UNIQUE(user_id, stat_date)
);
```

### 4.2 掌握度计算算法

```typescript
interface MasteryCalculation {
  // 基础正确率 (权重 40%)
  baseAccuracy: number;
  
  // 最近表现 (权重 30%) - 最近5次答题
  recentPerformance: number;
  
  // 时间衰减 (权重 20%) - 艾宾浩斯遗忘曲线
  timeDecay: number;
  
  // 题目难度加权 (权重 10%)
  difficultyWeight: number;
}

function calculateMastery(data: MasteryCalculation): number {
  return (
    data.baseAccuracy * 0.4 +
    data.recentPerformance * 0.3 +
    (100 - data.timeDecay) * 0.2 +
    data.difficultyWeight * 0.1
  );
}

// 艾宾浩斯遗忘曲线 - 计算下次复习时间
function getNextReviewDate(masteryScore: number, lastReview: Date): Date {
  const intervals = [1, 2, 4, 7, 15, 30]; // 天数
  const level = Math.floor(masteryScore / 20); // 0-5级
  const daysToAdd = intervals[Math.min(level, 5)];
  return addDays(lastReview, daysToAdd);
}
```

---

## 五、UI组件设计

### 5.1 掌握度进度条组件

```tsx
// components/MasteryProgressBar.tsx
interface Props {
  score: number;      // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// 颜色映射
const getColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';  // 已掌握
  if (score >= 60) return 'bg-yellow-500'; // 需复习
  if (score > 0) return 'bg-red-500';      // 薄弱
  return 'bg-gray-300';                     // 未学习
};

// 状态标签
const getStatus = (score: number) => {
  if (score >= 80) return { text: '已掌握', icon: '✓', color: 'text-green-600' };
  if (score >= 60) return { text: '需复习', icon: '⚠', color: 'text-yellow-600' };
  if (score > 0) return { text: '薄弱', icon: '✗', color: 'text-red-600' };
  return { text: '未学习', icon: '○', color: 'text-gray-400' };
};
```

### 5.2 知识点树组件

```tsx
// components/KnowledgeTree.tsx
interface KnowledgeNode {
  id: string;
  title: string;
  type: 'chapter' | 'section' | 'point';
  importance: number;  // 1-5星
  mastery: number;     // 0-100
  children?: KnowledgeNode[];
}

// 功能特性:
// 1. 可展开/收起
// 2. 显示掌握度进度条
// 3. 显示重要性星级
// 4. 点击跳转到详情/练习
// 5. 筛选: 只看薄弱/只看高频/搜索
```

### 5.3 学习热力图组件

```tsx
// components/LearningHeatmap.tsx
// 类似GitHub贡献图，显示每日学习情况

// 颜色等级:
// 深绿: 学习时长 > 60分钟 且 正确率 > 80%
// 浅绿: 学习时长 > 30分钟 且 正确率 > 60%
// 黄色: 有学习但效果一般
// 红色: 学习效果差
// 灰色: 未学习
```

---

## 六、SEO优化方案

### 6.1 知识点页面SEO

```tsx
// 每个知识点页面的Meta信息
<Head>
  <title>{point.title} - 执业药师考点详解 | 医药考试通</title>
  <meta name="description" content={`${point.title}是执业药师考试高频考点，包含${point.drug_name}的适应证、禁忌、不良反应等核心内容，配有记忆口诀和真题练习。`} />
  <meta name="keywords" content={`${point.drug_name},${point.title},执业药师,考点,真题`} />
</Head>

// 结构化数据
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LearningResource",
  "name": "{point.title}",
  "educationalLevel": "执业药师资格考试",
  "learningResourceType": "知识点",
  "teaches": "{point.content}"
}
</script>
```

### 6.2 URL结构优化

```
现有: /practice/history
优化: /zhenti/2024/xiyao-yaoxue-er  (中文拼音，SEO友好)

知识点URL:
/kaodian/xiyao-er/xiaohua-xitong/zhizi-beng-yizhiji
(考点/西药二/消化系统/质子泵抑制剂)
```

---

## 七、实施优先级

### Phase 1: 核心功能（1-2周）
1. ✅ 知识点树数据结构和导入
2. 🔲 知识点树页面 `/knowledge`
3. 🔲 用户掌握度追踪
4. 🔲 学习仪表盘 `/dashboard`

### Phase 2: 体验优化（2-3周）
5. 🔲 知识点详情页
6. 🔲 薄弱点专项练习
7. 🔲 艾宾浩斯复习提醒
8. 🔲 学习热力图

### Phase 3: 高级功能（3-4周）
9. 🔲 AI智能组卷
10. 🔲 学习计划制定
11. 🔲 学习报告生成
12. 🔲 SEO优化上线

---

## 八、正确性属性 (Correctness Properties)

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 知识点数据完整性
*For any* 导入的药学教材内容，提取后的数据必须包含所有必需字段（考点ID、考点标题、考点类型、详细内容、所属药物、药物分类、记忆口诀、重点等级），且字段格式正确。
**Validates: Requirements 1.1**

### Property 2: 重要性等级计算一致性
*For any* 包含高频关键词（首选、禁忌、相互作用等）的考点内容，重要性等级计算结果应在1-5范围内且具有确定性（相同输入产生相同输出）。
**Validates: Requirements 1.5, 8.4**

### Property 3: 表格结构保留（Round-trip）
*For any* 有效的对比表格数据，解析后再序列化应产生等价的结构（表头、行数据、对比维度保持一致）。
**Validates: Requirements 1.4, 8.3**

### Property 4: 不良反应分类完整性
*For any* 提取的不良反应内容，必须被分类到三类之一：常见、严重、预防措施。
**Validates: Requirements 1.3**

### Property 5: 答题记录完整性
*For any* 用户提交的答题记录，系统存储的数据必须包含：考点ID、是否正确、答题用时、答题时间戳。
**Validates: Requirements 2.1**

### Property 6: 掌握度更新一致性
*For any* 答题记录更新，对应考点的掌握度分数必须根据答题正确性进行相应调整。
**Validates: Requirements 2.2**

### Property 7: 薄弱点标记阈值一致性
*For any* 考点掌握度分数，当分数低于60%时必须标记为薄弱点，当分数≥60%时不应标记为薄弱点。
**Validates: Requirements 2.3**

### Property 8: 艾宾浩斯遗忘曲线衰减
*For any* 超过7天未复习的考点，掌握度分数必须按照艾宾浩斯遗忘曲线公式进行衰减。
**Validates: Requirements 2.5**

### Property 9: 仪表盘数据完整性
*For any* 用户访问仪表盘，返回数据必须包含：总体掌握度百分比、本周学习时长、总体正确率、各章节掌握度。
**Validates: Requirements 3.1, 3.2**

### Property 10: 高频考点排序正确性
*For any* 高频考点列表，必须按考查频率降序排列，且每个考点包含正确的掌握状态标签（已掌握≥80%/需复习60-79%/未掌握<60%）。
**Validates: Requirements 3.3**

### Property 11: 知识点卡片数据完整性
*For any* 知识点卡片渲染，必须包含：药物名称、重要性星级、掌握度标签、结构化内容。若存在记忆口诀，必须显示。
**Validates: Requirements 4.1, 4.3**

### Property 12: 复习队列优先级更新
*For any* 标记为"需复习"的考点，该考点必须出现在复习队列中，且优先级根据掌握度和重要性正确计算。
**Validates: Requirements 4.4**

### Property 13: 复习推荐算法正确性
*For any* 基于艾宾浩斯遗忘曲线的复习推荐，到期需要复习的考点（基于上次复习时间）必须出现在今日推荐列表中。
**Validates: Requirements 5.1**

### Property 14: 立即复习条件过滤
*For any* 考点，当掌握度<70%且重要性≥4星时，必须出现在立即复习列表中。
**Validates: Requirements 5.5**

### Property 15: 知识图谱节点关系正确性
*For any* 药物节点展开操作，返回的子节点必须与该药物的所有考点类型（适应证、禁忌证、相互作用等）一一对应。
**Validates: Requirements 6.5**

### Property 16: 热力图颜色映射一致性
*For any* 日期的学习正确率，颜色映射必须遵循：>80%绿色、60-80%黄色、<60%红色。
**Validates: Requirements 7.2**

### Property 17: 连续学习天数计算
*For any* 用户学习记录，连续学习天数必须等于从今天往前连续有学习记录的天数。
**Validates: Requirements 7.5**

### Property 18: JSON导出格式正确性
*For any* 导出的提取结果，必须是有效的JSON格式，且按章节分文件存储。
**Validates: Requirements 8.5**

---

## 九、技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **图表**: Recharts / Chart.js
- **状态管理**: Zustand
- **认证**: Supabase Auth
- **测试**: Jest + fast-check (Property-Based Testing)
