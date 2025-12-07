# 知识图谱页面优化 - 设计文档

## Overview

本设计文档描述知识图谱页面的优化方案，核心目标是：
1. **简化知识树结构** - 章节→节→（考点标题 + 小节总结），考点内容不在树中展开
2. **考点详情页独立化** - 每个考点拥有独立URL，便于SEO、分享和灵活布局
3. **小节总结页面** - 与考点并列，包含考点梳理和重点强化（思维导图）
4. **内容模块化** - 考点详情页支持灵活容纳不同类型内容

## Architecture

### 页面结构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        知识图谱主页面                            │
│                     /knowledge                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │   三级树状导航                                               ││
│  │                                                             ││
│  │  📚 第一章：解热、镇痛、抗炎、抗风湿及抗痛风药                 ││
│  │    └─ 第一节：秋水仙碱与痛风药物 (3个考点)                    ││
│  │       ├─ ⭐⭐⭐ 考点1：秋水仙碱的临床用药 [高频]              ││
│  │       ├─ ⭐⭐ 考点2：秋水仙碱的不良反应                       ││
│  │       ├─ ⭐⭐⭐ 考点3：痛风急性发作的一线用药                 ││
│  │       └─ 📋 小节总结                                        ││
│  │    └─ 第二节：...                                           ││
│  │  📚 第二章：...                                              ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         │                              │
         │ 点击考点                      │ 点击小节总结
         ▼                              ▼
┌─────────────────────┐    ┌─────────────────────────────────────┐
│   考点详情页         │    │         小节总结页面                 │
│ /knowledge/point/   │    │  /knowledge/section/[id]/summary    │
│      [id]           │    │                                     │
├─────────────────────┤    ├─────────────────────────────────────┤
│                     │    │                                     │
│ 📌 考点简介          │    │ 📋 考点梳理                          │
│ 💡 核心记忆点        │    │   • 考点1 (2020、2022、2024) [高频]  │
│ ⚙️ 作用特点          │    │   • 考点2 (2021、2023)              │
│ ⚠️ 典型不良反应      │    │   • 考点3 (高频考点，几乎每年考)     │
│ 🚫 禁忌和注意事项    │    │                                     │
│ 🔗 药物相互作用      │    │ 🧠 重点强化                          │
│                     │    │   [思维导图图片 - 点击可放大]        │
│                     │    │                                     │
└─────────────────────┘    └─────────────────────────────────────┘
```

### 数据流架构

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   数据库      │────▶│   API层      │────▶│   前端页面    │
│              │     │              │     │              │
│ knowledge_   │     │ /api/        │     │ /knowledge   │
│ tree         │     │ knowledge-   │     │ (主页面)     │
│              │     │ tree         │     │              │
│ section_     │     │              │     │ /knowledge/  │
│ summaries    │     │ /api/        │     │ point/[id]   │
│              │     │ section-     │     │ (考点详情)   │
│ exam_years   │     │ summary      │     │              │
│              │     │              │     │ /knowledge/  │
│              │     │ /api/        │     │ section/[id] │
│              │     │ knowledge-   │     │ /summary     │
│              │     │ point        │     │ (小节总结)   │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Components and Interfaces

### 1. 前端组件结构

```
app/knowledge/
├── page.tsx                        # 知识图谱主页面（优化版）
├── section/[id]/
│   └── summary/
│       └── page.tsx                # 小节总结页面（新增）
├── point/[id]/
│   └── page.tsx                    # 考点详情页（优化版）
└── components/
    ├── KnowledgeTreeSimple.tsx     # 简化版三级树状导航（新增）
    ├── SectionSummaryNode.tsx      # 小节总结节点组件（新增）
    ├── PointOverviewCard.tsx       # 考点梳理卡片（新增）
    ├── MindMapViewer.tsx           # 思维导图查看器（新增）
    ├── ExamYearTags.tsx            # 历年考查年份标签（新增）
    ├── HighFrequencyBadge.tsx      # 高频考点标记（新增）
    └── ImageLightbox.tsx           # 图片放大弹窗（新增）

components/ui/
├── ContentTypeCard.tsx             # 内容类型卡片（复用）
├── ImportanceStars.tsx             # 重要性星级（复用）
├── MasteryProgressBar.tsx          # 掌握度进度条（复用）
└── Breadcrumb.tsx                  # 面包屑导航（优化）
```

### 2. API接口设计

#### 2.1 知识树API优化 `/api/knowledge-tree`

```typescript
// 请求参数
interface KnowledgeTreeRequest {
  subject: string           // 科目代码
  includeExamYears: boolean // 是否包含历年考查年份
}

// 响应结构
interface KnowledgeTreeResponse {
  success: boolean
  data: {
    tree: KnowledgeChapter[]
    stats: {
      chapter_count: number
      section_count: number
      point_count: number
      high_frequency_count: number
    }
  }
}

// 章节结构
interface KnowledgeChapter {
  id: string
  code: string              // "1", "2"
  title: string             // "解热、镇痛、抗炎、抗风湿及抗痛风药"
  nodeType: 'chapter'
  children: KnowledgeSection[]
}

// 节结构
interface KnowledgeSection {
  id: string
  code: string              // "1.1", "1.2"
  title: string             // "秋水仙碱与痛风药物"
  nodeType: 'section'
  pointCount: number
  hasSummary: boolean       // 是否有小节总结
  children: KnowledgePointNode[]
}

// 考点节点（简化版，不含内容）
interface KnowledgePointNode {
  id: string
  code: string              // "1.1.1"
  title: string             // "秋水仙碱的临床用药"
  nodeType: 'point'
  importance: number        // 1-5
  isHighFrequency: boolean  // 是否高频考点
}
```

#### 2.2 小节总结API `/api/section-summary/[sectionId]`

```typescript
// GET /api/section-summary/[sectionId]
interface SectionSummaryResponse {
  success: boolean
  data: {
    sectionId: string
    sectionTitle: string
    chapterTitle: string
    pointOverview: PointOverviewItem[]  // 考点梳理
    mindMapUrl?: string                  // 思维导图URL
    mindMapAlt?: string                  // 思维导图描述
  }
}

interface PointOverviewItem {
  id: string
  title: string
  importance: number
  isHighFrequency: boolean
  examYears: number[]       // 历年考查年份 [2020, 2022, 2024]
}
```

#### 2.3 考点详情API优化 `/api/knowledge-point/[id]`

```typescript
// GET /api/knowledge-point/[id]
interface KnowledgePointDetailResponse {
  success: boolean
  data: {
    id: string
    title: string
    importance: number
    isHighFrequency: boolean
    examYears: number[]
    
    // 内容模块（按顺序）
    summary?: string              // 考点简介
    coreMemoryPoints?: string[]   // 核心记忆点
    drugClassification?: string   // 药物分类
    mechanism?: string            // 作用机制
    clinicalApplication?: string  // 临床应用
    adverseReactions?: AdverseReaction[]  // 不良反应
    contraindications?: string    // 禁忌
    drugInteractions?: string     // 药物相互作用
    reinforcementImageUrl?: string // 重点强化图
    
    // 导航信息
    breadcrumb: BreadcrumbItem[]
    prevPoint?: { id: string; title: string }
    nextPoint?: { id: string; title: string }
  }
}
```

### 3. 组件接口定义

#### 3.1 KnowledgeTreeSimple 组件

```typescript
interface KnowledgeTreeSimpleProps {
  tree: KnowledgeChapter[]
  expandedNodes: Set<string>
  onNodeExpand: (nodeId: string) => void
  onPointClick: (pointId: string) => void
  onSummaryClick: (sectionId: string) => void
}
```

#### 3.2 PointOverviewCard 组件

```typescript
interface PointOverviewCardProps {
  points: PointOverviewItem[]
  onPointClick: (pointId: string) => void
}
```

#### 3.3 MindMapViewer 组件

```typescript
interface MindMapViewerProps {
  imageUrl: string
  alt?: string
  onExpand?: () => void
}
```

#### 3.4 ImageLightbox 组件

```typescript
interface ImageLightboxProps {
  isOpen: boolean
  imageUrl: string
  alt?: string
  onClose: () => void
}
```

#### 3.5 ExamYearTags 组件

```typescript
interface ExamYearTagsProps {
  years: number[]
  compact?: boolean  // 紧凑模式，如 "2020、2022、2024"
}
```

#### 3.6 HighFrequencyBadge 组件

```typescript
interface HighFrequencyBadgeProps {
  show: boolean
  size?: 'sm' | 'md' | 'lg'
}
```

## Data Models

### 1. 数据库表结构扩展

```sql
-- 扩展 knowledge_tree 表，添加历年考查和高频标记字段
ALTER TABLE knowledge_tree ADD COLUMN IF NOT EXISTS exam_years INTEGER[] DEFAULT '{}';
ALTER TABLE knowledge_tree ADD COLUMN IF NOT EXISTS is_high_frequency BOOLEAN DEFAULT FALSE;

-- 小节总结表（新增）
CREATE TABLE IF NOT EXISTS section_summaries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    section_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    
    -- 思维导图
    mind_map_url TEXT,
    mind_map_alt TEXT,
    
    -- 元数据
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(section_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_knowledge_tree_exam_years ON knowledge_tree USING GIN(exam_years);
CREATE INDEX IF NOT EXISTS idx_knowledge_tree_high_frequency ON knowledge_tree(is_high_frequency) WHERE is_high_frequency = TRUE;
CREATE INDEX IF NOT EXISTS idx_section_summaries_section ON section_summaries(section_id);
```

### 2. TypeScript 类型定义

```typescript
// 考点内容模块类型
type ContentModuleType = 
  | 'summary'           // 考点简介
  | 'coreMemoryPoints'  // 核心记忆点
  | 'drugClassification' // 药物分类
  | 'mechanism'         // 作用机制
  | 'clinicalApplication' // 临床应用
  | 'adverseReactions'  // 不良反应
  | 'contraindications' // 禁忌
  | 'drugInteractions'  // 药物相互作用
  | 'reinforcementImage' // 重点强化图

// 内容模块渲染顺序
const CONTENT_MODULE_ORDER: ContentModuleType[] = [
  'summary',
  'coreMemoryPoints',
  'drugClassification',
  'mechanism',
  'clinicalApplication',
  'adverseReactions',
  'contraindications',
  'drugInteractions',
  'reinforcementImage'
]

// 不良反应结构
interface AdverseReaction {
  content: string
  severity: 'severe' | 'moderate' | 'mild'
}

// 面包屑项
interface BreadcrumbItem {
  id: string
  title: string
  type: 'chapter' | 'section' | 'point'
  url: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 树状结构层级完整性
*For any* 有效的知识树数据，渲染后的树结构必须包含且仅包含三个层级：章节(chapter)→节(section)→考点(point)，且每个节点的层级类型与其在树中的深度一致。
**Validates: Requirements 1.1**

### Property 2: 节点数据完整性
*For any* 知识树节点，根据其类型必须包含所有必需字段：
- 章节节点：编号、标题
- 节节点：编号、标题、考点数量
- 考点节点：标题、重要性星级
**Validates: Requirements 1.2, 1.3, 1.4**

### Property 3: 高频标记显示一致性
*For any* 被标记为高频的考点（isHighFrequency=true），在知识树和小节总结页面中必须显示"高频"标记。
**Validates: Requirements 1.5, 4.4**

### Property 4: 小节总结节点存在性
*For any* 节(section)节点，其子节点列表末尾必须包含一个"小节总结"节点。
**Validates: Requirements 1.6**

### Property 5: 展开/收起状态一致性
*For any* 节点的展开/收起操作，操作后该节点的展开状态必须与操作前相反。
**Validates: Requirements 1.9**

### Property 6: 考点详情页URL正确性
*For any* 考点ID，生成的详情页URL必须符合格式 `/knowledge/point/[id]`，且该URL可访问对应考点内容。
**Validates: Requirements 2.1**

### Property 7: 考点详情页内容模块完整性
*For any* 考点详情页，必须按预定义顺序展示所有非空的内容模块，空模块必须被跳过。
**Validates: Requirements 2.2-2.7, 5.2, 5.3**

### Property 8: 小节总结页面URL正确性
*For any* 节ID，生成的小节总结页URL必须符合格式 `/knowledge/section/[id]/summary`。
**Validates: Requirements 3.1**

### Property 9: 考点梳理内容完整性
*For any* 小节总结页面的考点梳理区域，必须列出该节所有考点的标题、历年考查年份、高频标记。
**Validates: Requirements 3.2-3.5**

### Property 10: 考点数据存储完整性（Round-trip）
*For any* 考点的历年考查年份和高频标记数据，存储后再读取应产生等价的数据。
**Validates: Requirements 4.1, 4.2**

### Property 11: 历年考查年份显示格式正确性
*For any* 考点的历年考查年份数组，在小节总结页面显示时必须格式化为"年份1、年份2、年份3 考过"的形式。
**Validates: Requirements 4.3**

### Property 12: 内容模块类型支持完整性
*For any* 考点内容，系统必须支持存储和渲染以下所有内容类型：考点简介、核心记忆点、药物分类、作用机制、临床应用、不良反应、禁忌、药物相互作用、重点强化图。
**Validates: Requirements 5.1**

### Property 13: SEO元数据正确性
*For any* 考点详情页，页面title必须包含考点标题，meta description必须包含考点简介（如有）。
**Validates: Requirements 6.1, 6.2**

### Property 14: 面包屑导航正确性
*For any* 考点详情页，面包屑导航必须包含完整的层级路径：知识图谱 > 章节 > 节 > 考点。
**Validates: Requirements 6.3**

## Error Handling

### 1. API错误处理

```typescript
// 统一错误响应格式
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

// 错误码定义
const ERROR_CODES = {
  POINT_NOT_FOUND: 'POINT_NOT_FOUND',
  SECTION_NOT_FOUND: 'SECTION_NOT_FOUND',
  SUMMARY_NOT_FOUND: 'SUMMARY_NOT_FOUND',
  INVALID_ID: 'INVALID_ID',
  DATABASE_ERROR: 'DATABASE_ERROR',
}
```

### 2. 前端错误处理

- 数据加载失败：显示重试按钮和错误提示
- 考点不存在：显示404页面，提供返回知识图谱链接
- 小节总结为空：显示"暂无小节总结内容"提示
- 思维导图加载失败：显示占位图和重试按钮
- 网络错误：显示离线提示

## Testing Strategy

### 1. 测试框架

- **单元测试**: Jest
- **属性测试**: fast-check
- **组件测试**: React Testing Library

### 2. 属性测试策略

每个正确性属性对应一个属性测试，使用 fast-check 生成随机测试数据：

```typescript
import fc from 'fast-check'

// Property 1: 树状结构层级完整性
describe('Property 1: Tree Structure Hierarchy', () => {
  it('tree must have exactly 3 levels: chapter -> section -> point', () => {
    fc.assert(
      fc.property(
        knowledgeTreeArbitrary,
        (tree) => {
          return tree.every(chapter => 
            chapter.nodeType === 'chapter' &&
            chapter.children.every(section =>
              section.nodeType === 'section' &&
              section.children.every(point =>
                point.nodeType === 'point'
              )
            )
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### 3. 测试文件结构

```
__tests__/
├── knowledge/
│   ├── KnowledgeTreeSimple.test.tsx
│   ├── PointOverviewCard.test.tsx
│   ├── MindMapViewer.test.tsx
│   ├── ExamYearTags.test.tsx
│   └── HighFrequencyBadge.test.tsx
├── api/
│   ├── knowledge-tree.test.ts
│   ├── section-summary.test.ts
│   └── knowledge-point.test.ts
└── properties/
    ├── tree-structure.property.test.ts
    ├── node-completeness.property.test.ts
    ├── content-modules.property.test.ts
    └── seo-metadata.property.test.ts
```

