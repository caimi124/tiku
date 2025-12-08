# Design Document: 西药药二知识图谱导入

## Overview

本设计文档描述了西药药二知识图谱数据整合、导入和展示功能的技术实现方案。系统将从4个JSON源文件中提取知识数据，合并为完整的知识图谱，导入到PostgreSQL数据库的knowledge_tree表中，并通过现有的前端知识页面进行展示。

## Architecture

```mermaid
flowchart TD
    subgraph DataSources["数据源"]
        F1[50-100页.json]
        F2[101-150页.json]
        F3[151-200页.json]
        F4[201-222页.json]
    end
    
    subgraph Processing["数据处理层"]
        M[合并脚本<br/>merge-xiyao-er.js]
        I[导入脚本<br/>import-xiyao-er-complete.js]
    end
    
    subgraph Storage["存储层"]
        DB[(PostgreSQL<br/>knowledge_tree表)]
    end
    
    subgraph API["API层"]
        A1[/api/knowledge-tree]
        A2[/api/knowledge/search]
        A3[/api/chapters]
    end
    
    subgraph Frontend["前端展示"]
        P[知识页面<br/>/knowledge]
    end
    
    F1 --> M
    F2 --> M
    F3 --> M
    F4 --> M
    M --> I
    I --> DB
    DB --> A1
    DB --> A2
    DB --> A3
    A1 --> P
    A2 --> P
    A3 --> P
```

## Components and Interfaces

### 1. 数据合并模块 (merge-xiyao-er.js)

**职责**: 读取多个JSON源文件，合并为单一完整的知识图谱数据

**接口**:
```typescript
interface MergeResult {
  chapters: Chapter[];
  statistics: {
    totalChapters: number;
    totalSections: number;
    totalPoints: number;
    sourceFiles: string[];
  };
}

function mergeJsonFiles(filePaths: string[]): MergeResult;
```

**合并策略**:
- 按chapter_number合并章节，避免重复
- 按section_number合并小节，保持章节内唯一
- 保留所有知识点，按原始顺序排列

### 2. 数据导入模块 (import-xiyao-er-complete.js)

**职责**: 将合并后的数据转换为数据库记录并导入

**接口**:
```typescript
interface ImportOptions {
  subjectCode: string;
  clearExisting: boolean;
  validateOnly: boolean;
}

interface ImportResult {
  success: boolean;
  totalNodes: number;
  chapters: number;
  sections: number;
  points: number;
  errors: string[];
}

async function importKnowledgeTree(data: MergeResult, options: ImportOptions): Promise<ImportResult>;
```

### 3. 工具函数模块 (lib/knowledge-import-utils.ts)

**职责**: 提供数据转换和验证的工具函数

```typescript
// 中文数字转阿拉伯数字
function chineseToNumber(chinese: string): number;

// 提取口诀
function extractMnemonics(text: string): string[];

// 计算重要性
function calculateImportance(content: string): number;

// 生成节点代码
function generateNodeCode(chapter: number, section?: number, point?: number): string;

// 构建内容文本
function buildContentText(contentItems: ContentItem[]): string;
```

## Data Models

### knowledge_tree 表结构

```sql
CREATE TABLE knowledge_tree (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL,           -- 节点代码 (C7.3.1)
  title VARCHAR(500) NOT NULL,         -- 节点标题
  content TEXT,                        -- 节点内容
  node_type VARCHAR(20) NOT NULL,      -- chapter/section/point
  importance INTEGER DEFAULT 3,        -- 重要性 1-5
  parent_id UUID REFERENCES knowledge_tree(id),
  subject_code VARCHAR(50) NOT NULL,   -- 科目代码
  level INTEGER NOT NULL,              -- 层级 1/2/3
  sort_order INTEGER DEFAULT 0,        -- 排序
  memory_tips TEXT,                    -- 口诀/巧记
  point_type VARCHAR(50),              -- 考点类型
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### JSON数据结构

```typescript
interface Chapter {
  chapter_number: string;  // 中文数字 "七"
  chapter_title: string;   // "泌尿系统用药"
  sections: Section[];
}

interface Section {
  section_number: string;  // 中文数字 "三"
  section_title: string;   // "治疗良性前列腺增生用药"
  parts: {
    考点梳理?: PartContent;
    考点透析?: PartContent;
    重点强化?: PartContent;
  };
}

interface PartContent {
  general_content: ContentItem[];
  knowledge_points: KnowledgePoint[];
}

interface KnowledgePoint {
  number: number;
  title: string;
  content: ContentItem[];
}

interface ContentItem {
  type: 'text' | 'table' | 'image';
  content: string;
  images?: string[];
  ocr_text?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Chapter merge uniqueness
*For any* set of source files containing chapters, when merged, the result SHALL contain exactly one entry per unique chapter_number, with all sections from all sources combined.
**Validates: Requirements 1.2**

### Property 2: Section preservation
*For any* merge operation, the total count of sections in the merged result SHALL equal the sum of unique sections across all source files (no duplicates within same chapter).
**Validates: Requirements 1.3, 1.5**

### Property 3: Node type and level consistency
*For any* imported node, if node_type='chapter' then level=1, if node_type='section' then level=2, if node_type='point' then level=3.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 4: Parent-child relationship integrity
*For any* section node, its parent_id SHALL reference a valid chapter node. *For any* point node, its parent_id SHALL reference a valid section node.
**Validates: Requirements 2.2, 2.3**

### Property 5: Node code format
*For any* generated node code, it SHALL match the pattern `C{n}` for chapters, `C{n}.{m}` for sections, or `C{n}.{m}.{p}` for points, where n, m, p are positive integers.
**Validates: Requirements 2.4**

### Property 6: Mnemonic extraction completeness
*For any* text containing patterns like 【润德巧记】, 【巧记】, or 【口诀】, the extraction function SHALL return all matching mnemonic content.
**Validates: Requirements 2.5**

### Property 7: Importance calculation correctness
*For any* content containing keywords 禁用, 禁忌, or 不良反应, the calculated importance SHALL be >= 4.
**Validates: Requirements 2.6**

### Property 8: Chinese number conversion
*For any* Chinese numeral from 一 to 十五, the conversion function SHALL return the correct Arabic numeral (1-15).
**Validates: Requirements 4.5**

### Property 9: Transaction rollback on error
*For any* import operation that encounters an error, the database state SHALL remain unchanged (all changes rolled back).
**Validates: Requirements 4.2**

### Property 10: Search result context
*For any* search result, it SHALL include the chapter title and section title as context information.
**Validates: Requirements 5.2**

## Error Handling

### 文件读取错误
- 检查文件是否存在
- 验证JSON格式是否正确
- 记录错误并继续处理其他文件

### 数据库错误
- 使用事务确保原子性
- 发生错误时回滚所有更改
- 记录详细错误信息

### 数据验证错误
- 验证必填字段
- 检查数据类型
- 记录无效数据并跳过

## Testing Strategy

### 单元测试
- 使用 Jest 测试框架
- 测试工具函数的正确性
- 测试数据转换逻辑

### 属性测试
- 使用 fast-check 库进行属性测试
- 每个属性测试运行至少100次迭代
- 测试标注格式: `**Feature: xiyao-er-knowledge-import, Property {number}: {property_text}**`

### 集成测试
- 测试完整的导入流程
- 验证数据库记录的正确性
- 测试API端点的响应

### 测试文件结构
```
lib/
  knowledge-import-utils.ts
  knowledge-import-utils.test.ts  # 单元测试和属性测试
```
