# 知识图谱页面优化 - 设计文档

## Overview

本设计文档描述知识图谱页面的层级优化方案，核心目标是：

1. **两层结构** - 从4层压缩到2层：首页（三级手风琴）→ 考点详情页
2. **信息密度最大化** - 首页整合章节、小节、考点三级信息
3. **一键直达** - 用户最多2次点击即可看到考点详细内容
4. **SEO权重集中** - 减少中间页面，权重集中在首页和详情页

## Architecture

### 页面结构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    知识图谱首页 /knowledge                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🔍 搜索框                    [只看高频] [筛选▼]    [开始顺序学习]       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📊 学习进度: 总120考点 | 已学45 | 已掌握30 | 待复习8    [去复习]        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📚 最近学习: [考点A] [考点B] [考点C] [考点D] [考点E]                    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ▼ 第一章：解热、镇痛、抗炎药                    ████████░░ 80%  20考点  │ │
│ │   ├─ ▼ 第一节：秋水仙碱与痛风药物               3/4考点                 │ │
│ │   │    ├─ ⭐⭐⭐⭐⭐ 考点1：秋水仙碱临床用药 [高频] 治疗急性痛风首选... │ │
│ │   │    ├─ ⭐⭐⭐⭐ 考点2：秋水仙碱不良反应 [易错] 主要不良反应包括...   │ │
│ │   │    ├─ ⭐⭐⭐⭐⭐ 考点3：痛风急性发作一线用药 [高频] 首选NSAIDs...   │ │
│ │   │    └─ ⭐⭐⭐ 考点4：痛风预防用药 [基础] 别嘌醇、非布司他...        │ │
│ │   ├─ ▶ 第二节：非甾体抗炎药                    0/6考点                 │ │
│ │   └─ ▶ 第三节：解热镇痛药                      2/5考点                 │ │
│ │                                                                         │ │
│ │ ▶ 第二章：抗菌药物                              ██░░░░░░░░ 20%  35考点  │ │
│ │ ▶ 第三章：心血管系统药物                        ░░░░░░░░░░ 0%   28考点  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 点击考点行
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    考点详情页 /knowledge/point/[id]                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 知识图谱 > 第一章 > 第一节 > 考点1：秋水仙碱临床用药                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐ ┌───────────────────────────┐ │
│ │ 📖 考点内容                               │ │ 📑 同小节考点             │ │
│ │                                           │ │ • 考点1 ← 当前            │ │
│ │ [高频] [必考] ⭐⭐⭐⭐⭐                   │ │ • 考点2                   │ │
│ │                                           │ │ • 考点3                   │ │
│ │ 📌 考点简介                               │ │ • 考点4                   │ │
│ │ 秋水仙碱是治疗急性痛风的首选药物...       │ │                           │ │
│ │                                           │ │ 📎 相关考点               │ │
│ │ 💡 核心记忆点                             │ │ • 非甾体抗炎药            │ │
│ │ • 首选药物                                │ │ • 糖皮质激素              │ │
│ │ • 24小时内使用效果最佳                    │ └───────────────────────────┘ │
│ │ • 口诀：秋水仙碱治痛风...                 │                               │
│ │                                           │                               │
│ │ ⚙️ 作用机制                               │                               │
│ │ 抑制白细胞趋化和吞噬作用...               │                               │
│ │                                           │                               │
│ │ ⚠️ 不良反应                               │                               │
│ │ [严重] 骨髓抑制                           │                               │
│ │ [中度] 胃肠道反应                         │                               │
│ │                                           │                               │
│ │ ┌─────────────────────────────────────┐   │                               │
│ │ │ [☆收藏] [📌标记复习] [开始练习]     │   │                               │
│ │ │ [← 上一考点]        [下一考点 →]    │   │                               │
│ │ └─────────────────────────────────────┘   │                               │
│ └───────────────────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 数据流架构

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│     数据库        │────▶│      API层       │────▶│     前端页面      │
│                  │     │                  │     │                  │
│ knowledge_tree   │     │ /api/knowledge/  │     │ /knowledge       │
│ (章节/小节/考点) │     │ structure        │     │ (首页-三级手风琴)│
│                  │     │ (仅结构数据)     │     │                  │
│ user_progress    │     │                  │     │ /knowledge/      │
│ (学习进度)       │     │ /api/section/    │     │ point/[id]       │
│                  │     │ [id]/points      │     │ (考点详情页)     │
│ user_favorites   │     │ (懒加载考点)     │     │                  │
│ (收藏/标记)      │     │                  │     │                  │
│                  │     │ /api/point/[id]  │     │                  │
│ recent_learning  │     │ (考点详情)       │     │                  │
│ (最近学习)       │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Components and Interfaces

### 1. 前端组件结构

```
app/knowledge/
├── page.tsx                        # 知识图谱首页（重构版-三级手风琴）
├── point/[id]/
│   └── page.tsx                    # 考点详情页（保留）
└── components/
    ├── KnowledgeAccordion.tsx      # 三级手风琴主组件（新增）
    ├── ChapterAccordion.tsx        # 章节手风琴（新增）
    ├── SectionAccordion.tsx        # 小节手风琴（新增）
    ├── PointRow.tsx                # 考点行组件（新增）
    ├── PointPreviewCard.tsx        # 考点快速预览卡片（新增）
    ├── ProgressStats.tsx           # 学习进度统计区（新增）
    ├── RecentLearning.tsx          # 最近学习区块（新增）
    ├── FilterPanel.tsx             # 多维度筛选面板（新增）
    ├── SequentialLearning.tsx      # 顺序学习模式（新增）
    └── SearchEnhanced.tsx          # 增强搜索组件（新增）

components/ui/
├── ProgressIndicator.tsx           # 进度指示器（新增）
├── AccordionState.tsx              # 手风琴状态管理（新增）
└── ... (复用现有组件)
```

### 2. API接口设计

#### 2.1 知识结构API `/api/knowledge/structure`

```typescript
// GET /api/knowledge/structure?subject=xiyao_yaoxue_er
// 仅返回章节和小节结构，不包含考点详情（懒加载）
interface KnowledgeStructureResponse {
  success: boolean
  data: {
    chapters: ChapterStructure[]
    stats: {
      total_chapters: number
      total_sections: number
      total_points: number
      high_frequency_count: number
    }
  }
}

interface ChapterStructure {
  id: string
  code: string
  title: string
  point_count: number
  high_frequency_count: number
  mastery_score: number
  sections: SectionStructure[]
}

interface SectionStructure {
  id: string
  code: string
  title: string
  point_count: number
  high_frequency_count: number
  completed_count: number
}
```

#### 2.2 小节考点懒加载API `/api/section/[id]/points`

```typescript
// GET /api/section/[sectionId]/points
// 展开小节时懒加载考点列表
interface SectionPointsResponse {
  success: boolean
  data: {
    section_id: string
    points: PointRow[]
  }
}

interface PointRow {
  id: string
  code: string
  title: string
  importance: number          // 1-5星
  is_high_frequency: boolean
  tags: PointTag[]
  key_takeaway: string        // ≤30字简介
  is_completed: boolean
  is_favorited: boolean
  is_marked_review: boolean
}
```

#### 2.3 用户进度API `/api/user/progress`

```typescript
// GET /api/user/progress?subject=xiyao_yaoxue_er
interface UserProgressResponse {
  success: boolean
  data: {
    total_points: number
    learned_count: number
    mastered_count: number
    review_count: number
    overall_percentage: number
    recent_learning: RecentPoint[]
    current_section?: string    // 正在学习的小节ID
  }
}

interface RecentPoint {
  id: string
  title: string
  section_title: string
  visited_at: string
}
```

#### 2.4 收藏/标记API `/api/user/favorites`

```typescript
// POST /api/user/favorites
interface FavoriteRequest {
  point_id: string
  action: 'favorite' | 'unfavorite' | 'mark_review' | 'unmark_review'
}

// GET /api/user/favorites?type=favorite|review
interface FavoritesResponse {
  success: boolean
  data: {
    points: PointRow[]
    count: number
  }
}
```

### 3. 组件接口定义

#### 3.1 KnowledgeAccordion 组件

```typescript
interface KnowledgeAccordionProps {
  chapters: ChapterStructure[]
  expandedChapters: Set<string>
  expandedSections: Set<string>
  highlightedPointId?: string
  onChapterToggle: (chapterId: string) => void
  onSectionToggle: (sectionId: string) => void
  onPointClick: (pointId: string) => void
  onPointHover?: (pointId: string) => void
  filters: FilterOptions
}
```

#### 3.2 PointRow 组件

```typescript
interface PointRowProps {
  point: PointRow
  isHighlighted?: boolean
  onClick: () => void
  onHover?: () => void
  onFavoriteToggle?: () => void
  onReviewToggle?: () => void
}
```

#### 3.3 PointPreviewCard 组件

```typescript
interface PointPreviewCardProps {
  point: PointPreview
  position: { x: number; y: number }
  onClose: () => void
  onViewDetail: () => void
}

interface PointPreview {
  id: string
  title: string
  core_memory_points: string[]  // 前3条
  exam_years: number[]
  tags: PointTag[]
}
```

#### 3.4 ProgressStats 组件

```typescript
interface ProgressStatsProps {
  stats: UserProgress
  onStatClick: (type: 'learned' | 'mastered' | 'review') => void
  onReviewClick: () => void
}
```

#### 3.5 FilterPanel 组件

```typescript
interface FilterPanelProps {
  filters: FilterOptions
  onChange: (filters: FilterOptions) => void
  matchCount: number
}

interface FilterOptions {
  tags: string[]              // 高频、必考、易错、基础、强化
  difficulty: string[]        // 基础、进阶、冲刺
  status: string[]            // 未学习、学习中、已掌握、待复习
  showFavorites: boolean
  showReview: boolean
}
```

## Data Models

### 1. 数据库表结构扩展

```sql
-- 用户学习进度表
CREATE TABLE IF NOT EXISTS user_learning_progress (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'learning', 'mastered', 'review')),
    last_visited_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, point_id)
);

-- 用户收藏/标记表
CREATE TABLE IF NOT EXISTS user_favorites (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('favorite', 'review')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, point_id, type)
);

-- 最近学习记录表
CREATE TABLE IF NOT EXISTS recent_learning (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, point_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_learning_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_learning_user ON recent_learning(user_id, visited_at DESC);
```

### 2. TypeScript 类型定义

```typescript
// 学习状态枚举
type LearningStatus = 'not_started' | 'learning' | 'mastered' | 'review'

// 标签类型
type TagType = 'high_frequency' | 'must_test' | 'easy_mistake' | 'basic' | 'reinforce'

// 难度等级
type DifficultyLevel = 'basic' | 'intermediate' | 'advanced'

// 手风琴展开状态（存储在localStorage）
interface AccordionState {
  expandedChapters: string[]
  expandedSections: string[]
  lastVisitedPointId?: string
  scrollPosition?: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 三级结构渲染完整性
*For any* 有效的知识树数据，渲染后的手风琴结构必须包含三个层级：章节→小节→考点行，且每个层级的节点数量与数据一致。
**Validates: Requirements 1.1**

### Property 2: 章节数据完整性
*For any* 章节节点，渲染结果必须包含：章节标题、考点数量、掌握度百分比。
**Validates: Requirements 1.2**

### Property 3: 手风琴展开状态一致性
*For any* 章节或小节的点击操作，操作后该节点的展开状态必须与操作前相反。
**Validates: Requirements 1.3, 1.5**

### Property 4: 考点行数据完整性
*For any* 考点行，渲染结果必须包含：考点标题、重要性星级、高频标签（如适用）、一句话简介（≤30字）。
**Validates: Requirements 1.6**

### Property 5: 考点详情页URL正确性
*For any* 考点ID，点击考点行后跳转的URL必须符合格式 `/knowledge/point/[id]`。
**Validates: Requirements 1.7**

### Property 6: 预览卡片内容完整性
*For any* 考点预览卡片，必须包含：考点标题、核心记忆点（最多3条）、历年考查年份、"查看详情"按钮。
**Validates: Requirements 2.3**

### Property 7: 高频筛选正确性
*For any* 开启高频筛选后的结果，所有显示的考点必须具有高频标签，且不遗漏任何高频考点。
**Validates: Requirements 3.2, 3.3**

### Property 8: 筛选统计正确性
*For any* 筛选操作，显示的考点数量必须等于实际筛选结果的数量。
**Validates: Requirements 3.4**

### Property 9: 进度状态显示正确性
*For any* 章节或小节，其进度状态图标必须与完成度一致：
- 100% → 绿色勾选
- 0% → 灰色未开始
- 1%-99% → 蓝色进行中
**Validates: Requirements 4.3, 4.4, 4.5**

### Property 10: 搜索结果匹配正确性
*For any* 搜索查询，返回的结果必须包含标题中含有查询关键词的所有考点。
**Validates: Requirements 5.2**

### Property 11: 面包屑导航正确性
*For any* 考点详情页，面包屑必须包含完整路径：知识图谱 > 章节 > 小节 > 考点。
**Validates: Requirements 6.1**

### Property 12: 内容模块顺序正确性
*For any* 考点详情页，非空内容模块必须按预定义顺序展示。
**Validates: Requirements 6.2**

### Property 13: 空模块跳过正确性
*For any* 考点详情页，如果某内容模块为空，该模块不应被渲染。
**Validates: Requirements 6.3**

### Property 14: 进度统计正确性
*For any* 用户进度数据，统计区显示的数字必须与实际数据一致：总考点数、已学习数、已掌握数、待复习数。
**Validates: Requirements 7.2**

### Property 15: 状态恢复正确性
*For any* 从详情页返回首页的操作，首页必须自动展开该考点所在的章节和小节。
**Validates: Requirements 9.1**

### Property 16: 最近学习列表正确性
*For any* 最近学习区块，显示的考点必须是用户最近访问的5个考点，按访问时间倒序排列。
**Validates: Requirements 10.2**

### Property 17: 顺序学习跳转正确性
*For any* "开始顺序学习"操作，必须跳转到第一个未完成的考点。
**Validates: Requirements 11.2**

### Property 18: 收藏状态同步正确性
*For any* 收藏或标记操作，首页考点行必须显示对应的图标状态。
**Validates: Requirements 12.3**

### Property 19: 多条件筛选正确性
*For any* 多个筛选条件的组合，结果必须同时满足所有选中的条件（AND逻辑）。
**Validates: Requirements 13.5**

### Property 20: 拼音搜索正确性
*For any* 拼音搜索查询，必须返回标题拼音匹配的考点。
**Validates: Requirements 14.1**

### Property 21: 搜索结果分类正确性
*For any* 搜索结果，必须按类型分类显示：考点、小节、章节。
**Validates: Requirements 14.3**

### Property 22: 懒加载策略正确性
*For any* 首页加载，初始请求不应包含考点详情数据，仅包含章节和小节结构。
**Validates: Requirements 16.1**

## Error Handling

### 1. API错误处理

```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

const ERROR_CODES = {
  POINT_NOT_FOUND: 'POINT_NOT_FOUND',
  SECTION_NOT_FOUND: 'SECTION_NOT_FOUND',
  CHAPTER_NOT_FOUND: 'CHAPTER_NOT_FOUND',
  INVALID_FILTER: 'INVALID_FILTER',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
}
```

### 2. 前端错误处理

- **数据加载失败**: 显示重试按钮和错误提示
- **考点不存在**: 显示404页面，提供返回首页链接
- **网络错误**: 显示离线提示，支持缓存数据展示
- **懒加载失败**: 显示"加载失败，点击重试"

## Testing Strategy

### 1. 测试框架

- **单元测试**: Jest
- **属性测试**: fast-check
- **组件测试**: React Testing Library

### 2. 属性测试策略

每个正确性属性对应一个属性测试，使用 fast-check 生成随机测试数据。测试配置为最少100次迭代。

```typescript
import fc from 'fast-check'

// Property 7: 高频筛选正确性
describe('Property 7: High Frequency Filter', () => {
  /**
   * Feature: knowledge-learning-path, Property 7: 高频筛选正确性
   * Validates: Requirements 3.2, 3.3
   */
  it('filtered results should only contain high frequency points', () => {
    fc.assert(
      fc.property(
        pointListArbitrary,
        (points) => {
          const filtered = applyHighFrequencyFilter(points)
          return filtered.every(p => p.is_high_frequency) &&
                 points.filter(p => p.is_high_frequency).length === filtered.length
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
├── components/
│   ├── KnowledgeAccordion.test.tsx
│   ├── PointRow.test.tsx
│   ├── PointPreviewCard.test.tsx
│   ├── ProgressStats.test.tsx
│   ├── FilterPanel.test.tsx
│   └── SearchEnhanced.test.tsx
├── api/
│   ├── knowledge-structure.test.ts
│   ├── section-points.test.ts
│   ├── user-progress.test.ts
│   └── user-favorites.test.ts
├── properties/
│   ├── accordion-structure.property.test.ts
│   ├── filter-correctness.property.test.ts
│   ├── search-correctness.property.test.ts
│   ├── progress-stats.property.test.ts
│   └── state-restore.property.test.ts
└── utils/
    ├── arbitraries.ts
    └── test-helpers.ts
```
