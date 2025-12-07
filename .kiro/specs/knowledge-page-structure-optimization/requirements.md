# Requirements Document

## Introduction

本项目旨在从产品经理角度对 https://yikaobiguo.com/knowledge 页面进行全面重构优化。当前页面存在以下核心问题：

1. **结构与逻辑不匹配** - 知识树结构未能很好地映射教材章节体系
2. **信息过载** - 单页面承载过多内容，用户难以聚焦
3. **导航/定位混乱** - 用户难以快速定位到目标考点
4. **用户体验差** - 缺乏清晰的视觉层级和交互引导

优化目标：
- 重构为"章节 → 小节 → 考点列表 → 考点详情页"的清晰层级结构
- 实现入口页与详情页分离，减少信息过载
- 提供图形化知识图谱视图，直观展示知识点关系
- 添加考点优先级标签（高频/必考/易错/基础）
- 确保用户通过≤3次操作到达目标内容（三次点击规则）

## URL结构规范

```
/knowledge                                    # 知识图谱首页（章节列表）
/knowledge/chapter/[chapterId]                # 章节页（小节列表）
/knowledge/chapter/[chapterId]/section/[sectionId]  # 小节页（考点列表）
/knowledge/point/[pointId]                    # 考点详情页
/knowledge/graph                              # 图谱视图页面
```

## 页面功能边界定义

| 页面 | 应该展示 | 禁止展示 |
|------|----------|----------|
| 知识图谱首页 | 章节卡片、整体统计、搜索框、视图切换 | 考点详细内容、口诀、例题 |
| 章节页 | 小节卡片、章节概览、学习建议 | 考点详细内容、口诀、例题 |
| 小节页 | 考点梳理、考点卡片（标题+标签+简介）、学习建议 | 考点详细内容（作用机制、不良反应等） |
| 考点详情页 | 完整内容模块、知识结构图、思维导图、例题链接 | 其他考点的内容 |

## 内容模型（Content Schema）

### 考点数据结构
```typescript
interface KnowledgePoint {
  point_id: string              // 考点唯一标识
  point_title: string           // 考点标题
  chapter_id: string            // 所属章节ID
  section_id: string            // 所属小节ID
  tags: PointTag[]              // 优先级标签数组
  key_takeaway: string          // 一句话简介（≤40字）
  exam_years: number[]          // 历年考查年份
  exam_frequency: number        // 考查频率（过去5年考查次数）
  importance: 1 | 2 | 3 | 4 | 5 // 重要性等级
  
  // 详情页内容模块
  summary?: string              // 考点简介
  core_memory_points?: string[] // 核心记忆点
  mechanism?: string            // 作用机制
  clinical_application?: string // 临床应用
  adverse_reactions?: AdverseReaction[]  // 不良反应
  contraindications?: string    // 禁忌
  drug_interactions?: string    // 药物相互作用
  mnemonics?: string            // 记忆口诀
  images?: string[]             // 图示URL数组
  mind_map_url?: string         // 思维导图URL
  related_points?: string[]     // 相关考点ID数组
}

interface PointTag {
  type: 'high_frequency' | 'must_test' | 'easy_mistake' | 'basic' | 'reinforce'
  label: string
  color: string
}
```

### 标签定义标准
| 标签类型 | 显示文字 | 颜色 | 定义标准 |
|----------|----------|------|----------|
| high_frequency | 高频 | 红色 #EF4444 | 过去5年至少考3次 |
| must_test | 必考 | 橙色 #F97316 | 教材显性要求 + 历年多次命题 |
| easy_mistake | 易错 | 黄色 #EAB308 | 学员反馈错误概率>40% |
| basic | 基础 | 蓝色 #3B82F6 | 概念、定义类基础知识 |
| reinforce | 强化 | 紫色 #8B5CF6 | 适合图示、总结、思维导图强化 |

## Glossary

- **知识图谱(Knowledge Graph)**: 展示药学知识点层级结构和关系的可视化系统
- **章节(Chapter)**: 知识体系的一级分类，对应教材章节，如"第一章：解热、镇痛、抗炎药"
- **小节(Section)**: 章节下的二级分类，对应教材小节，如"第一节：秋水仙碱与痛风药物"
- **考点(Knowledge Point)**: 小节下的具体知识单元，如"考点1：秋水仙碱的临床用药"
- **考点列表页(Point List Page)**: 展示某小节下所有考点标题和简要信息的入口页面
- **考点详情页(Point Detail Page)**: 展示单个考点完整教学内容的独立页面
- **考点梳理(Point Overview)**: 小节页面中列出所有考点标题及其考查情况的概览区域
- **图谱视图(Graph View)**: 以节点和连线形式展示知识点关系的可视化视图
- **树状视图(Tree View)**: 以层级树形结构展示知识点的传统视图
- **考点标签(Point Tags)**: 标识考点属性的标签，包括高频、必考、易错、基础、强化等
- **面包屑导航(Breadcrumb)**: 显示用户当前位置和路径的导航组件
- **三次点击规则(Three-Click Rule)**: 用户应能在≤3次点击内到达任何目标内容

## 技术需求

### 性能要求
- 首页加载时间 ≤ 2秒（首屏）
- 页面切换响应时间 ≤ 500ms
- 图谱视图渲染时间 ≤ 1秒（100个节点以内）

### SEO要求
- 所有页面支持SSR（服务端渲染）
- 每个考点详情页有独立的title和meta description
- 支持结构化数据（JSON-LD）

### 搜索实现
- 使用数据库全文搜索（PostgreSQL tsvector）
- 搜索结果按相关度排序
- 支持拼音搜索和模糊匹配

### 组件要求
- 可折叠组件（手风琴式）
- 左侧树状导航（可选显示）
- 图谱视图组件（支持缩放、拖动）
- 面包屑导航组件

## Requirements

### Requirement 1: 信息架构重构 - 四级层级结构

**User Story:** As a 备考用户, I want to 按照教材结构浏览知识点, so that 我能按照复习→考试的逻辑系统学习。

#### Acceptance Criteria

1. WHEN 用户访问知识图谱首页(/knowledge) THEN the 系统 SHALL 展示所有章节的卡片式入口，每个章节显示标题、小节数量、考点数量、整体掌握度
2. WHEN 用户点击章节卡片 THEN the 系统 SHALL 跳转到该章节页面(/knowledge/chapter/[id])
3. WHEN 用户访问章节页面 THEN the 系统 SHALL 展示该章节下所有小节的卡片，每个小节显示标题、考点数量、高频考点数量、掌握度
4. WHEN 用户点击小节卡片 THEN the 系统 SHALL 跳转到该小节页面(/knowledge/chapter/[chapterId]/section/[sectionId])
5. WHEN 用户访问小节页面 THEN the 系统 SHALL 展示"考点梳理"区域和考点卡片列表
6. WHEN 显示考点卡片 THEN the 系统 SHALL 仅展示：标题、优先级标签、一句话简介（≤40字）、历年考查年份
7. WHEN 用户点击考点卡片 THEN the 系统 SHALL 跳转到该考点详情页(/knowledge/point/[id])
8. WHEN 用户从首页到达任意考点详情页 THEN the 系统 SHALL 确保操作步骤不超过3次点击（首页→章节→小节→考点）

### Requirement 2: 入口页与详情页分离

**User Story:** As a 备考用户, I want to 在列表页快速浏览考点概况, so that 我能快速找到需要重点学习的内容而不被详细内容干扰。

#### Acceptance Criteria

**入口页（考点卡片）规范：**
1. WHEN 显示考点卡片 THEN the 系统 SHALL 展示：标题、优先级标签、一句话简介（≤40字）、历年考查年份
2. WHEN 显示考点卡片 THEN the 系统 SHALL 禁止展示：口诀、逻辑图、例题、大段文本内容
3. WHEN 考点为高频考点 THEN the 系统 SHALL 在卡片上显示红色"高频"标签

**详情页规范：**
4. WHEN 用户点击考点卡片 THEN the 系统 SHALL 跳转到独立详情页(/knowledge/point/[id])
5. WHEN 显示考点详情页 THEN the 系统 SHALL 在顶部显示：标题、所属章节/小节（来源）、所有优先级标签
6. WHEN 显示考点详情页 THEN the 系统 SHALL 按以下顺序展示内容模块：简介→核心记忆点→作用机制→临床应用→不良反应→禁忌→药物相互作用→记忆口诀→思维导图
7. WHEN 某内容模块为空 THEN the 系统 SHALL 跳过该模块不显示
8. WHEN 显示考点详情页 THEN the 系统 SHALL 在底部提供"相关真题"和"开始练习"入口

### Requirement 3: 可视化知识图谱视图

**User Story:** As a 备考用户, I want to 通过图形化视图直观看到知识点之间的关系和结构, so that 我能建立知识体系的整体认知。

#### Acceptance Criteria

1. WHEN 用户在知识图谱页面 THEN the 系统 SHALL 提供"树状视图"和"图谱视图"两种切换选项
2. WHEN 用户选择图谱视图 THEN the 系统 SHALL 以节点和连线形式展示知识点关系
3. WHEN 显示图谱视图 THEN the 系统 SHALL 仅在节点上显示考点标题，不显示详细内容
4. WHEN 用户点击图谱中的节点 THEN the 系统 SHALL 弹出该考点的简介卡片，包含标题、标签、一句话简介、"查看详情"按钮
5. WHEN 用户点击简介卡片中的"查看详情"按钮 THEN the 系统 SHALL 跳转到该考点的详情页面
6. WHEN 显示图谱视图 THEN the 系统 SHALL 支持缩放和拖动操作
7. WHEN 显示图谱视图 THEN the 系统 SHALL 用不同颜色区分不同章节的节点
8. WHEN 显示图谱视图 THEN the 系统 SHALL 用节点大小或边框粗细表示考点重要性

### Requirement 4: 考点优先级标签系统

**User Story:** As a 备考用户, I want to 快速识别哪些考点最重要, so that 我能合理安排学习优先级。

#### Acceptance Criteria

1. WHEN 显示考点 THEN the 系统 SHALL 为每个考点显示优先级标签，标签类型包括：高频、必考、易错、基础、强化
2. WHEN 考点被标记为"高频" THEN the 系统 SHALL 显示红色标签，表示几乎每年都考
3. WHEN 考点被标记为"必考" THEN the 系统 SHALL 显示橙色标签，表示考试必出
4. WHEN 考点被标记为"易错" THEN the 系统 SHALL 显示黄色标签，表示容易出错的考点
5. WHEN 考点被标记为"基础" THEN the 系统 SHALL 显示蓝色标签，表示基础知识点
6. WHEN 考点被标记为"强化" THEN the 系统 SHALL 显示紫色标签，表示需要强化记忆的考点
7. WHEN 显示考点列表 THEN the 系统 SHALL 支持按标签类型筛选考点
8. WHEN 显示小节页面的考点梳理区域 THEN the 系统 SHALL 在每个考点旁显示其所有标签

### Requirement 5: 三层导航体系设计

**User Story:** As a 备考用户, I want to 清楚知道我当前在哪里以及如何返回上级, so that 我不会在学习过程中迷失方向。

#### Acceptance Criteria

**1. 全局导航（面包屑）：**
1. WHEN 用户在任何非首页页面 THEN the 系统 SHALL 在页面顶部显示面包屑导航
2. WHEN 显示面包屑导航 THEN the 系统 SHALL 显示完整路径：首页 > 知识库 > 第X章 > 第X节 > 考点X
3. WHEN 用户点击面包屑中的任意层级 THEN the 系统 SHALL 跳转到对应的页面

**2. 同小节内部快速跳转（右侧目录）：**
4. WHEN 用户在考点详情页 THEN the 系统 SHALL 在右侧显示同小节其他考点的目录列表
5. WHEN 用户点击目录中的考点 THEN the 系统 SHALL 跳转到对应考点详情页
6. WHEN 显示右侧目录 THEN the 系统 SHALL 高亮当前考点

**3. 上下考点导航：**
7. WHEN 用户在考点详情页 THEN the 系统 SHALL 在页面底部提供"上一个考点"和"下一个考点"按钮
8. WHEN 当前为小节第一个考点 THEN the 系统 SHALL 隐藏"上一个考点"按钮
9. WHEN 当前为小节最后一个考点 THEN the 系统 SHALL 隐藏"下一个考点"按钮

**4. 快捷返回：**
10. WHEN 用户在任何页面 THEN the 系统 SHALL 在导航栏提供返回知识图谱首页的快捷入口

### Requirement 6: 小节页面考点梳理（概览模块）

**User Story:** As a 备考用户, I want to 在小节页面快速了解该节的考点分布和重点, so that 我能通过概览合理安排学习计划。

#### Acceptance Criteria

**考点梳理区域：**
1. WHEN 用户访问小节页面 THEN the 系统 SHALL 在顶部显示"考点梳理"概览区域
2. WHEN 显示考点梳理区域 THEN the 系统 SHALL 展示以下统计信息：
   - 考点总数
   - 高频考点数量
   - 考点优先级分布（可视化柱状图或饼图）
3. WHEN 显示考点梳理区域 THEN the 系统 SHALL 列出所有考点标题，每个标题旁显示：
   - 优先级标签
   - 历年考查年份（如"2020、2022、2024 考过"）
4. WHEN 考点为高频考点 THEN the 系统 SHALL 在标题旁显示"高频考点，几乎每年考"提示

**学习建议：**
5. WHEN 显示考点梳理区域 THEN the 系统 SHALL 显示学习建议，包括：
   - 建议学习时间（如"本节共5个考点，建议学习时间30分钟"）
   - 本节命题趋势（一句话总结）
   - 重点关注的考点推荐

**交互：**
6. WHEN 用户点击考点梳理中的考点标题 THEN the 系统 SHALL 平滑滚动到下方考点卡片列表中对应的卡片

### Requirement 7: 视觉层级与留白设计

**User Story:** As a 备考用户, I want to 在视觉上清晰区分不同层级的内容, so that 我能快速扫描和定位信息。

#### Acceptance Criteria

**布局规范：**
1. WHEN 显示任何列表页面 THEN the 系统 SHALL 使用卡片式布局，卡片间距为16px
2. WHEN 显示桌面端列表页 THEN the 系统 SHALL 使用两列卡片布局（内容宽度720-780px）
3. WHEN 显示移动端列表页 THEN the 系统 SHALL 使用单列卡片布局

**字号规范：**
4. WHEN 显示章节卡片标题 THEN the 系统 SHALL 使用18-20px字号，font-weight: 600
5. WHEN 显示小节卡片标题 THEN the 系统 SHALL 使用16-18px字号，font-weight: 500
6. WHEN 显示考点卡片标题 THEN the 系统 SHALL 使用14-16px字号，font-weight: 500
7. WHEN 显示正文内容 THEN the 系统 SHALL 使用14px字号，行高1.6

**视觉层级：**
8. WHEN 显示章节卡片 THEN the 系统 SHALL 使用渐变背景色和较强阴影（shadow-md）
9. WHEN 显示小节卡片 THEN the 系统 SHALL 使用浅色背景和中等阴影（shadow-sm）
10. WHEN 显示考点卡片 THEN the 系统 SHALL 使用白色背景和轻微阴影
11. WHEN 显示考点详情页 THEN the 系统 SHALL 使用分块布局，模块间距24px，模块内段落间距16px

**标题层级：**
12. WHEN 显示考点详情页 THEN the 系统 SHALL 使用H2作为内容模块标题，H3作为子模块标题

### Requirement 8: 移动端适配

**User Story:** As a 移动端用户, I want to 在手机上流畅浏览和学习, so that 我能随时随地复习。

#### Acceptance Criteria

**布局适配：**
1. WHEN 用户在移动端访问（屏幕宽度<768px） THEN the 系统 SHALL 将多栏布局改为单列布局
2. WHEN 用户在移动端访问列表页 THEN the 系统 SHALL 将卡片改为列表式展示（减少阴影）
3. WHEN 用户在移动端访问考点详情页 THEN the 系统 SHALL 将内容模块改为可折叠的手风琴式布局

**导航适配：**
4. WHEN 用户在移动端访问 THEN the 系统 SHALL 将面包屑导航改为可折叠的顶部下拉菜单
5. WHEN 用户在移动端访问考点详情页 THEN the 系统 SHALL 在底部显示悬浮的"上一题/下一题"导航按钮
6. WHEN 用户在移动端访问 THEN the 系统 SHALL 将右侧目录改为可展开的侧边抽屉

**图谱视图适配：**
7. WHEN 用户在移动端访问图谱视图 THEN the 系统 SHALL 支持双指缩放和单指拖动
8. WHEN 用户在移动端访问图谱视图 THEN the 系统 SHALL 提供"切换为线性列表视图"选项

**触摸优化：**
9. WHEN 用户在移动端访问 THEN the 系统 SHALL 确保所有可点击元素的触摸区域不小于44x44像素
10. WHEN 用户在移动端访问 THEN the 系统 SHALL 增加按钮和链接的点击反馈（触摸高亮）

### Requirement 9: 搜索与快速定位

**User Story:** As a 备考用户, I want to 快速搜索和定位到特定考点, so that 我能在需要时立即找到相关内容。

#### Acceptance Criteria

**搜索入口：**
1. WHEN 用户在知识图谱任何页面 THEN the 系统 SHALL 在顶部导航栏提供全局搜索框
2. WHEN 用户点击搜索框 THEN the 系统 SHALL 显示搜索历史和热门搜索

**搜索逻辑：**
3. WHEN 用户输入搜索关键词 THEN the 系统 SHALL 在所有层级（章节、小节、考点）中搜索匹配内容
4. WHEN 搜索关键词 THEN the 系统 SHALL 支持拼音搜索和模糊匹配
5. WHEN 显示搜索结果 THEN the 系统 SHALL 按相关度排序，优先级：标题完全匹配 > 标题部分匹配 > 内容匹配

**搜索结果展示：**
6. WHEN 显示搜索结果 THEN the 系统 SHALL 分三类展示：章节、小节、考点
7. WHEN 显示搜索结果 THEN the 系统 SHALL 显示匹配内容所属的完整路径（如"第一章 > 第一节 > 考点1"）
8. WHEN 显示搜索结果 THEN the 系统 SHALL 高亮匹配的关键词

**搜索跳转：**
9. WHEN 用户点击章节搜索结果 THEN the 系统 SHALL 跳转到章节页面
10. WHEN 用户点击小节搜索结果 THEN the 系统 SHALL 跳转到小节页面
11. WHEN 用户点击考点搜索结果 THEN the 系统 SHALL 跳转到考点详情页，并高亮匹配内容

**无结果处理：**
12. WHEN 搜索无结果 THEN the 系统 SHALL 显示"未找到相关内容"提示
13. WHEN 搜索无结果 THEN the 系统 SHALL 提供搜索建议（如"您是否在找：XXX"）

