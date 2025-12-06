# Implementation Plan - 知识图谱页面重设计

## Phase 1: 数据层和API基础

- [x] 1. 数据库表结构扩展
  - [x] 1.1 创建 expert_tips 表
    - 创建老司机带路内容表，包含 exam_patterns, trap_analysis, memory_techniques, exam_tactics, predictions 字段
    - 添加索引和外键约束
    - _Requirements: 6.1_
  - [x] 1.2 Write property test for expert tips storage
    - **Property 15: 老司机内容存储完整性**
    - **Validates: Requirements 6.1, 6.4**

- [x] 2. 老司机内容API开发
  - [x] 2.1 创建 `/api/expert-tips/[pointId]/route.ts`
    - GET: 根据考点ID获取老司机内容
    - 处理内容为空时返回默认提示
    - _Requirements: 6.3, 6.5_
  - [x] 2.2 Write property test for empty content fallback
    - **Property 17: 空内容降级显示**
    - **Validates: Requirements 6.3**
  - [x] 2.3 创建 `/api/expert-tips/import/route.ts`
    - POST: 批量导入老司机内容（JSON格式）
    - 验证JSON格式和必需字段
    - _Requirements: 6.2_
  - [x] 2.4 Write property test for JSON import
    - **Property 16: JSON导入解析正确性（Round-trip）**
    - **Validates: Requirements 6.2**

- [x] 3. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: 核心UI组件开发

- [x] 4. 内容展示组件
  - [x] 4.1 创建 KeywordHighlight 组件
    - 高亮预定义关键词（首选、禁忌、相互作用、禁用、慎用）
    - 支持自定义关键词列表
    - _Requirements: 3.6_
  - [x] 4.2 Write property test for keyword highlighting
    - **Property 10: 关键词高亮正确性**
    - **Validates: Requirements 3.6**
  - [x] 4.3 创建 NumberHighlight 组件
    - 高亮数字（剂量、年龄、时间等）
    - 支持单位识别（mg、岁、天等）
    - _Requirements: 3.4_
  - [x] 4.4 Write property test for number highlighting
    - **Property 9: 数字高亮正确性**
    - **Validates: Requirements 3.4**
  - [x] 4.5 创建 AdverseReactionBadge 组件
    - 根据严重程度显示不同颜色（红/黄/绿）
    - 显示严重程度标签
    - _Requirements: 3.2_
  - [x] 4.6 Write property test for color mapping
    - **Property 8: 不良反应颜色映射一致性**
    - **Validates: Requirements 3.2**

- [x] 5. 内容卡片组件
  - [x] 5.1 创建 ContentTypeCard 组件
    - 支持6种内容类型：作用机制、药动学、不良反应、临床应用、相互作用、记忆口诀
    - 卡片式布局，每种类型独立卡片
    - 集成 KeywordHighlight 和 NumberHighlight
    - _Requirements: 3.1, 1.5_
  - [x] 5.2 Write property test for content categorization
    - **Property 3: 考点内容分类完整性**
    - **Validates: Requirements 1.5**
  - [x] 5.3 创建 DrugComparisonTable 组件
    - 表格形式展示药物对比
    - 支持横向滚动
    - _Requirements: 3.3_

- [x] 6. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: 老司机带路面板

- [x] 7. ExpertTipsPanel 组件开发
  - [x] 7.1 创建 ExpertTipsPanel 主组件
    - 包含5个子模块：出题套路、坑位分析、记忆技巧、应试战术、必考预测
    - 支持折叠/展开各模块
    - _Requirements: 2.1, 2.2_
  - [x] 7.2 Write property test for module completeness
    - **Property 6: 老司机内容模块完整性**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**
  - [x] 7.3 创建 ExamPatternCard 子组件
    - 显示出题形式和题目示例
    - 显示选项和正确答案
    - _Requirements: 2.3_
  - [x] 7.4 创建 TrapAnalysisCard 子组件
    - 显示坑位名称、描述、常见错误、解决方案
    - 使用警告样式突出显示
    - _Requirements: 2.4_
  - [x] 7.5 创建 MemoryTechniqueCard 子组件
    - 支持口诀、联想、场景三种记忆类型
    - 不同类型使用不同图标
    - _Requirements: 2.5_
  - [x] 7.6 创建 ExamTacticCard 子组件
    - 显示触发条件和条件反射式解题思路
    - _Requirements: 2.6_
  - [x] 7.7 创建 PredictionCard 子组件
    - 显示预测题目、答案、解析、考查概率
    - _Requirements: 2.7_
  - [x] 7.8 Write property test for prediction completeness
    - **Property 7: 必考预测数据完整性**
    - **Validates: Requirements 2.7**

- [x] 8. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: 四级树状导航

- [x] 9. KnowledgeTreeNav 组件开发
  - [x] 9.1 创建 KnowledgeTreeNav 主组件
    - 四级树状结构：章节→小节→考点→考点内容
    - 支持展开/收起操作
    - 显示各级节点的掌握度进度条
    - _Requirements: 1.1, 1.6_
  - [x] 9.2 Write property test for tree structure
    - **Property 1: 树状结构层级完整性**
    - **Validates: Requirements 1.1**
  - [x] 9.3 创建 ChapterNode 子组件
    - 显示章节编号、标题、掌握度、考点数量
    - _Requirements: 1.2_
  - [x] 9.4 创建 SectionNode 子组件
    - 显示小节编号、标题、掌握度、高频考点数量
    - _Requirements: 1.3_
  - [x] 9.5 创建 PointNode 子组件
    - 显示考点标题、重要性星级、掌握状态、药物名称
    - _Requirements: 1.4_
  - [x] 9.6 Write property test for node data completeness
    - **Property 2: 节点数据完整性**
    - **Validates: Requirements 1.2, 1.3, 1.4**
  - [x] 9.7 Write property test for expand/collapse
    - **Property 4: 展开/收起状态一致性**
    - **Validates: Requirements 1.6**

- [x] 10. 搜索功能实现
  - [x] 10.1 实现树状导航搜索功能
    - 在所有层级中搜索匹配节点
    - 高亮显示匹配结果
    - 自动展开包含匹配结果的父节点
    - _Requirements: 1.7_
  - [x] 10.2 Write property test for search completeness
    - **Property 5: 搜索结果完整性**
    - **Validates: Requirements 1.7**

- [x] 11. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: 筛选功能

- [x] 12. FilterBar 组件开发
  - [x] 12.1 创建 FilterBar 组件
    - 掌握状态筛选：全部、未学习、薄弱、需复习、已掌握
    - 重要性筛选：全部、高频、中频、低频
    - 内容类型筛选：作用机制、不良反应、临床应用、相互作用
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 12.2 Write property test for filter correctness
    - **Property 13: 筛选功能正确性**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  - [x] 12.3 实现筛选结果统计
    - 显示匹配考点数量
    - 显示预计学习时间
    - _Requirements: 5.4_
  - [x] 12.4 Write property test for filter stats
    - **Property 14: 筛选结果统计正确性**
    - **Validates: Requirements 5.4**

- [x] 13. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: 页面重设计

- [x] 14. 知识图谱主页面重设计
  - [x] 14.1 重构 `/app/knowledge/page.tsx`
    - 左侧树状导航 + 右侧内容展示双栏布局
    - 集成 KnowledgeTreeNav、FilterBar 组件
    - 响应式设计：移动端改为上下布局
    - _Requirements: 1.1, 4.4_
  - [x] 14.2 实现节点选择和内容展示联动
    - 点击树状导航节点，右侧显示对应内容
    - 显示专业内容和老司机带路（如有）
    - _Requirements: 2.1_
  - [x] 14.3 实现面包屑导航
    - 显示当前位置：章节 > 小节 > 考点
    - 支持点击跳转到上级
    - _Requirements: 5.5_

- [x] 15. 知识点详情页重设计
  - [x] 15.1 重构 `/app/knowledge/point/[id]/page.tsx`
    - 左右分栏布局：左侧专业内容、右侧老司机带路
    - 移动端改为上下布局
    - _Requirements: 4.1, 4.4_
  - [x] 15.2 实现专业内容区域
    - 显示分类标签、作用特点、临床应用、不良反应、注意事项
    - 集成 ContentTypeCard、AdverseReactionBadge 组件
    - _Requirements: 4.2_
  - [x] 15.3 实现老司机带路区域
    - 集成 ExpertTipsPanel 组件
    - 处理内容为空时的降级显示
    - _Requirements: 4.3, 6.3_
  - [x] 15.4 Write property test for detail page completeness
    - **Property 11: 详情页内容完整性**
    - **Validates: Requirements 4.2, 4.3**
  - [x] 15.5 实现交互按钮
    - "开始练习"按钮 - 跳转专项练习页
    - "标记复习"按钮 - 加入复习队列
    - _Requirements: 4.5, 4.6_
  - [x] 15.6 Write property test for review queue
    - **Property 12: 复习队列添加正确性**
    - **Validates: Requirements 4.6**

- [x] 16. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: 键盘导航和优化

- [x] 17. 键盘导航实现
  - [x] 17.1 实现键盘快捷键
    - 上下箭头：切换考点
    - Enter：展开详情
    - Esc：返回列表
    - _Requirements: 5.6_

- [x] 18. 性能优化
  - [x] 18.1 实现虚拟滚动
    - 大量节点时使用虚拟滚动优化性能
  - [x] 18.2 实现数据缓存
    - 缓存已加载的老司机内容
    - 减少重复API请求

- [x] 19. Final Checkpoint - 确保所有测试通过

  - Ensure all tests pass, ask the user if questions arise.
