# 知识图谱页面重设计 - 设计文档

## Overview

本设计文档描述知识图谱页面的全面重设计方案，核心目标是将现有的扁平化知识点展示升级为：
1. **四级树状结构** - 章节→小节→考点→考点内容，让用户清晰看到知识体系全貌
2. **老司机带路系统** - 在专业内容旁边提供考试技巧、出题套路、记忆口诀
3. **视觉优化** - 卡片式布局、颜色编码、关键词高亮，提升学习效率

## Architecture

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        知识图谱页面                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐│
│  │   树状导航区域       │    │        内容展示区域              ││
│  │                     │    │                                 ││
│  │  📚 第一章          │    │  ┌─────────────┬───────────────┐││
│  │    ├─ 第一节        │    │  │ 专业内容区   │ 老司机带路区  │││
│  │    │  ├─ 考点1     │    │  │             │               │││
│  │    │  └─ 考点2     │    │  │ • 分类标签   │ 🎯 出题套路   │││
│  │    └─ 第二节        │    │  │ • 作用特点   │ 🕳 坑位分析   │││
│  │  📚 第二章          │    │  │ • 不良反应   │ 💡 记忆技巧   │││
│  │    └─ ...          │    │  │ • 临床应用   │ 🚗 应试战术   │││
│  │                     │    │  │             │ 📝 必考预测   │││
│  └─────────────────────┘    │  └─────────────┴───────────────┘││
│                             └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 数据流架构

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   数据库      │────▶│   API层      │────▶│   前端组件    │
│              │     │              │     │              │
│ knowledge_   │     │ /api/        │     │ KnowledgeTree│
│ tree         │     │ knowledge-   │     │ Component    │
│              │     │ tree         │     │              │
│ expert_tips  │     │              │     │ ExpertTips   │
│              │     │ /api/        │     │ Component    │
│              │     │ expert-tips  │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Components and Interfaces

### 1. 前端组件结构

```
app/knowledge/
├── page.tsx                    # 知识图谱主页面（重设计）
├── components/
│   ├── KnowledgeTreeNav.tsx    # 四级树状导航组件
│   ├── KnowledgeNodeCard.tsx   # 知识点卡片组件
│   ├── ExpertTipsPanel.tsx     # 老司机带路面板
│   ├── ContentTypeCard.tsx     # 内容类型卡片（作用机制/不良反应等）
│   ├── AdverseReactionBadge.tsx # 不良反应严重程度标签
│   ├── KeywordHighlight.tsx    # 关键词高亮组件
│   ├── NumberHighlight.tsx     # 数字高亮组件
│   ├── DrugComparisonTable.tsx # 药物对比表格
│   └── FilterBar.tsx           # 筛选栏组件
└── point/[id]/
    └── page.tsx                # 知识点详情页（重设计）
```

### 2. API接口设计

#### 2.1 知识树API增强 `/api/knowledge-tree`

```typescript
// 请求参数
interface KnowledgeTreeRequest {
  subject: string           // 科目代码
  includeContent: boolean   // 是否包含详细内容
  includeExpertTips: boolean // 是否包含老司机内容
  userId?: string           // 用户ID（获取掌握度）
  filter?: {
    masteryStatus?: 'all' | 'unlearned' | 'weak' | 'review' | 'mastered'
    importance?: 'all' | 'high' | 'medium' | 'low'
    contentType?: 'all' | 'mechanism' | 'adverse' | 'clinical' | 'interaction'
  }
  search?: string           // 搜索关键词
}

// 响应结构
interface KnowledgeTreeResponse {
  success: boolean
  data: {
    tree: KnowledgeChapter[]
    stats: TreeStats
    filterResult: {
      matchCount: number
      estimatedTime: number  // 预计学习时间（分钟）
    }
  }
}
```

#### 2.2 老司机内容API `/api/expert-tips`

```typescript
// GET /api/expert-tips/[pointId]
interface ExpertTipsResponse {
  success: boolean
  data: {
    pointId: string
    examPatterns: ExamPattern[]      // 出题套路
    trapAnalysis: TrapAnalysis[]     // 坑位分析
    memoryTechniques: MemoryTechnique[] // 记忆技巧
    examTactics: ExamTactic[]        // 应试战术
    predictions: Prediction[]        // 必考预测
    updatedAt: string
    version: number
  }
}

// POST /api/expert-tips/import (批量导入)
interface ExpertTipsImportRequest {
  tips: ExpertTipData[]
}
```

### 3. 组件接口定义

#### 3.1 KnowledgeTreeNav 组件

```typescript
interface KnowledgeTreeNavProps {
  tree: KnowledgeChapter[]
  selectedNodeId?: string
  expandedNodes: Set<string>
  onNodeSelect: (node: KnowledgeNode) => void
  onNodeExpand: (nodeId: string) => void
  onSearch: (query: string) => void
  highlightedNodes?: Set<string>  // 搜索高亮
}
```

#### 3.2 ExpertTipsPanel 组件

```typescript
interface ExpertTipsPanelProps {
  pointId: string
  tips?: ExpertTips
  loading?: boolean
}

interface ExpertTips {
  examPatterns: {
    title: string
    questionExample: string
    options: string[]
    correctAnswer: string
  }[]
  trapAnalysis: {
    trapName: string
    description: string
    commonMistake: string
    solution: string
  }[]
  memoryTechniques: {
    type: 'mnemonic' | 'association' | 'scenario'
    content: string
  }[]
  examTactics: {
    trigger: string      // 看到什么触发
    reaction: string     // 条件反射
  }[]
  predictions: {
    question: string
    answer: string
    explanation: string
    probability: number  // 考查概率 0-100
  }[]
}
```

#### 3.3 ContentTypeCard 组件

```typescript
interface ContentTypeCardProps {
  type: 'mechanism' | 'pharmacokinetics' | 'adverse' | 'clinical' | 'interaction' | 'memory'
  title: string
  content: string | string[]
  severity?: 'severe' | 'moderate' | 'mild'  // 仅不良反应
  isHighFrequency?: boolean
}
```

## Data Models

### 1. 数据库表结构扩展

```sql
-- 老司机带路内容表
CREATE TABLE IF NOT EXISTS expert_tips (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    knowledge_point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    
    -- 出题套路 (JSON数组)
    exam_patterns JSONB DEFAULT '[]',
    
    -- 坑位分析 (JSON数组)
    trap_analysis JSONB DEFAULT '[]',
    
    -- 记忆技巧 (JSON数组)
    memory_techniques JSONB DEFAULT '[]',
    
    -- 应试战术 (JSON数组)
    exam_tactics JSONB DEFAULT '[]',
    
    -- 必考预测 (JSON数组)
    predictions JSONB DEFAULT '[]',
    
    -- 版本控制
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(knowledge_point_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_expert_tips_point ON expert_tips(knowledge_point_id);
```

### 2. TypeScript 类型定义

```typescript
// 四级树状结构
interface KnowledgeChapter {
  id: string
  code: string              // "1", "2", "3"
  title: string             // "解热镇痛抗炎药"
  nodeType: 'chapter'
  masteryScore?: number
  pointCount: number
  highFrequencyCount: number
  children: KnowledgeSection[]
}

interface KnowledgeSection {
  id: string
  code: string              // "1.1", "1.2"
  title: string             // "解热镇痛抗炎药概述"
  nodeType: 'section'
  masteryScore?: number
  pointCount: number
  highFrequencyCount: number
  children: KnowledgePoint[]
}

interface KnowledgePoint {
  id: string
  code: string              // "1.1.1"
  title: string             // "NSAIDs作用机制"
  nodeType: 'point'
  drugName?: string         // "阿司匹林"
  importance: number        // 1-5
  masteryStatus: 'mastered' | 'review' | 'weak' | 'unlearned'
  masteryScore?: number
  content: KnowledgeContent
  expertTips?: ExpertTips
}

interface KnowledgeContent {
  mechanism?: string[]      // 作用机制
  pharmacokinetics?: string[] // 药动学
  adverseReactions?: AdverseReaction[] // 不良反应
  clinicalApplications?: string[] // 临床应用
  interactions?: string[]   // 相互作用
  memoryTips?: string       // 记忆口诀
}

interface AdverseReaction {
  content: string
  severity: 'severe' | 'moderate' | 'mild'
}
```

### 3. 老司机内容JSON格式

```json
{
  "pointId": "point-123",
  "examPatterns": [
    {
      "title": "儿童用药年龄",
      "questionExample": "3个月婴儿发热，宜选用？",
      "options": ["A. 对乙酰氨基酚", "B. 布洛芬", "C. 阿司匹林", "D. 双氯芬酸"],
      "correctAnswer": "A"
    }
  ],
  "trapAnalysis": [
    {
      "trapName": "年龄数字混淆",
      "description": "很多考生记成6个月以上才能用退烧药",
      "commonMistake": "选择布洛芬给3个月婴儿",
      "solution": "记住26组合：2个月→对乙酰，6个月→布洛芬"
    }
  ],
  "memoryTechniques": [
    {
      "type": "mnemonic",
      "content": "2对6布，别记反！"
    },
    {
      "type": "scenario",
      "content": "想象一个2个月大的宝宝，妈妈给他喂对乙酰氨基酚退烧"
    }
  ],
  "examTactics": [
    {
      "trigger": "看到'对乙酰氨基酚'",
      "reaction": "立刻想：小孩>2个月可用、不消炎、不抗凝、伤肝别超量、发热轻痛首选"
    }
  ],
  "predictions": [
    {
      "question": "患儿，8个月，体温38.5℃，宜选用？",
      "answer": "对乙酰氨基酚或布洛芬都对（>6个月两个都能用）",
      "explanation": "8个月>6个月，所以两种退热药都可以使用",
      "probability": 95
    }
  ]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 树状结构层级完整性
*For any* 有效的知识树数据，渲染后的树结构必须包含且仅包含四个层级：章节(chapter)→小节(section)→考点(point)→考点内容(content)，且每个节点的层级类型与其在树中的深度一致。
**Validates: Requirements 1.1**

### Property 2: 节点数据完整性
*For any* 知识树节点，根据其类型必须包含所有必需字段：
- 章节节点：编号、标题、掌握度、考点数量
- 小节节点：编号、标题、掌握度、高频考点数量
- 考点节点：标题、重要性星级、掌握状态、药物名称
**Validates: Requirements 1.2, 1.3, 1.4**

### Property 3: 考点内容分类完整性
*For any* 考点的内容项，必须被分类到以下类型之一：作用机制、药动学、不良反应、临床应用、相互作用、记忆口诀。
**Validates: Requirements 1.5**

### Property 4: 展开/收起状态一致性
*For any* 节点的展开/收起操作，操作后该节点的展开状态必须与操作前相反，且子节点的可见性与父节点展开状态一致。
**Validates: Requirements 1.6**

### Property 5: 搜索结果完整性
*For any* 搜索查询，返回的结果必须包含所有标题或内容中包含查询关键词的节点，且不包含不匹配的节点。
**Validates: Requirements 1.7**

### Property 6: 老司机内容模块完整性
*For any* 非空的老司机带路内容，必须包含以下模块中的至少一个：出题套路、坑位分析、记忆技巧、应试战术。
**Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 7: 必考预测数据完整性
*For any* 必考预测内容，必须同时包含预测题目和正确答案解析。
**Validates: Requirements 2.7**

### Property 8: 不良反应颜色映射一致性
*For any* 不良反应内容，其颜色标记必须与严重程度一致：严重→红色、中度→黄色、轻度→绿色。
**Validates: Requirements 3.2**

### Property 9: 数字高亮正确性
*For any* 包含数字的考点内容（如剂量、年龄、时间），数字部分必须被高亮标记。
**Validates: Requirements 3.4**

### Property 10: 关键词高亮正确性
*For any* 包含预定义关键词（首选、禁忌、相互作用、禁用、慎用）的内容，关键词必须被高亮标记。
**Validates: Requirements 3.6**

### Property 11: 详情页内容完整性
*For any* 知识点详情页，专业内容区域必须包含：分类标签、作用特点、临床应用、不良反应、注意事项（如有）；老司机带路区域必须包含：坑位地图、记忆口诀、应试战术、必考预测（如有）。
**Validates: Requirements 4.2, 4.3**

### Property 12: 复习队列添加正确性
*For any* 标记为"需复习"的考点，该考点必须出现在用户的复习队列中。
**Validates: Requirements 4.6**

### Property 13: 筛选功能正确性
*For any* 筛选条件组合，返回的结果必须满足所有指定的筛选条件：
- 掌握状态筛选：结果中所有考点的掌握状态与筛选条件匹配
- 重要性筛选：结果中所有考点的重要性等级在指定范围内
- 内容类型筛选：结果中所有考点包含指定类型的内容
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 14: 筛选结果统计正确性
*For any* 筛选结果，显示的匹配考点数量必须等于实际返回的考点数量。
**Validates: Requirements 5.4**

### Property 15: 老司机内容存储完整性
*For any* 存储的老司机内容，必须关联有效的考点ID，且包含更新时间和版本号。
**Validates: Requirements 6.1, 6.4**

### Property 16: JSON导入解析正确性（Round-trip）
*For any* 有效的老司机内容JSON，导入后再导出应产生等价的JSON结构。
**Validates: Requirements 6.2**

### Property 17: 空内容降级显示
*For any* 老司机内容为空的考点，详情页必须显示默认提示文案。
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
    details?: any
  }
}

// 错误码定义
const ERROR_CODES = {
  KNOWLEDGE_NOT_FOUND: 'KNOWLEDGE_NOT_FOUND',
  EXPERT_TIPS_NOT_FOUND: 'EXPERT_TIPS_NOT_FOUND',
  INVALID_FILTER: 'INVALID_FILTER',
  IMPORT_FAILED: 'IMPORT_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
}
```

### 2. 前端错误处理

- 数据加载失败：显示重试按钮和错误提示
- 老司机内容为空：显示默认提示"暂无老司机带路内容，敬请期待"
- 搜索无结果：显示"未找到匹配的知识点"提示
- 网络错误：显示离线提示和缓存数据（如有）

## Testing Strategy

### 1. 测试框架

- **单元测试**: Jest
- **属性测试**: fast-check
- **组件测试**: React Testing Library
- **E2E测试**: Playwright（可选）

### 2. 属性测试策略

每个正确性属性对应一个属性测试，使用 fast-check 生成随机测试数据：

```typescript
import fc from 'fast-check'

// Property 2: 节点数据完整性
describe('Property 2: Node Data Completeness', () => {
  it('chapter nodes must have all required fields', () => {
    fc.assert(
      fc.property(
        chapterNodeArbitrary,
        (chapter) => {
          return (
            chapter.code !== undefined &&
            chapter.title !== undefined &&
            chapter.masteryScore !== undefined &&
            chapter.pointCount !== undefined
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### 3. 单元测试覆盖

- 组件渲染测试
- 筛选逻辑测试
- 搜索功能测试
- 颜色映射测试
- 关键词高亮测试

### 4. 测试文件结构

```
__tests__/
├── knowledge/
│   ├── KnowledgeTreeNav.test.tsx
│   ├── ExpertTipsPanel.test.tsx
│   ├── ContentTypeCard.test.tsx
│   └── FilterBar.test.tsx
├── api/
│   ├── knowledge-tree.test.ts
│   └── expert-tips.test.ts
└── properties/
    ├── tree-structure.property.test.ts
    ├── node-completeness.property.test.ts
    ├── filter-correctness.property.test.ts
    └── expert-tips.property.test.ts
```
