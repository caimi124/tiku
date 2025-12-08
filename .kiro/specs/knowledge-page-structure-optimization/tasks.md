# Implementation Plan - 知识图谱页面结构优化

## Phase 1: 数据层基础

- [x] 1. 数据库表结构扩展








  - [x] 1.1 扩展 knowledge_tree 表
    - 添加 key_takeaway 字段（一句话简介）
    - 添加 exam_years 数组字段（历年考查年份）
    - 添加 exam_frequency 字段（考查频率）
    - _Requirements: 1.6, 6.3_
  - [x]* 1.2 Write property test for data storage

    - **Property 1: 章节卡片数据完整性**
    - **Validates: Requirements 1.1**
  - [x] 1.3 创建 point_tags 表

    - 创建考点标签关联表
    - 添加标签类型约束（high_frequency, must_test, easy_mistake, basic, reinforce）
    - 添加索引

    - _Requirements: 4.1_


  - [ ]* 1.4 Write property test for tag storage
    - **Property 8: 标签颜色映射正确性**


    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6**
  - [x] 1.5 添加全文搜索索引





    - 创建 search_vector 列
    - 创建触发器自动更新搜索向量
    - 创建 GIN 索引
    - _Requirements: 9.3, 9.4_








- [x] 2. Checkpoint - 确保数据库迁移成功
  - Ensure all tests pass, ask the user if questions arise.



## Phase 2: API层开发




- [x] 3. 章节和小节API
  - [x] 3.1 创建 `/api/chapters/route.ts`
    - GET: 获取所有章节列表
    - 返回章节统计信息（小节数、考点数、掌握度）





    - _Requirements: 1.1_
  - [ ]* 3.2 Write property test for chapters API
    - **Property 1: 章节卡片数据完整性**
    - **Validates: Requirements 1.1**
  - [x] 3.3 创建 `/api/chapter/[chapterId]/sections/route.ts`
    - GET: 获取指定章节的小节列表
    - 返回小节统计信息
    - _Requirements: 1.3_
  - [ ]* 3.4 Write property test for sections API
    - **Property 2: URL路由正确性**
    - **Validates: Requirements 1.2, 1.4**

- [x] 4. 考点API
  - [x] 4.1 创建 `/api/section/[sectionId]/points/route.ts`
    - GET: 获取指定小节的考点列表
    - 返回考点梳理概览数据
    - 返回考点卡片数据（仅标题、标签、简介、年份）
    - _Requirements: 1.5, 1.6, 6.1, 6.2_
  - [ ]* 4.2 Write property test for points list API
    - **Property 3: 考点卡片内容限制**


    - **Validates: Requirements 1.6, 2.1, 2.2**
  - [x] 4.3 重构 `/api/knowledge-point/[id]/route.ts`
    - 返回完整考点详情
    - 返回导航信息（上下考点、同小节考点列表）
    - 返回面包屑数据
    - _Requirements: 2.5, 2.6, 5.4, 5.7_


  - [ ]* 4.4 Write property test for point detail API
    - **Property 6: 详情页内容模块顺序**
    - **Validates: Requirements 2.6**
  - [ ]* 4.5 Write property test for empty module handling
    - **Property 7: 空模块跳过**
    - **Validates: Requirements 2.7**

- [x] 5. 搜索API
  - [x] 5.1 创建 `/api/knowledge/search/route.ts`


    - GET: 全文搜索章节、小节、考点
    - 支持拼音搜索
    - 按相关度排序结果


    - 返回搜索建议
    - _Requirements: 9.3, 9.4, 9.5, 9.6, 9.7_
  - [x]* 5.2 Write property test for search relevance


    - **Property 17: 搜索结果相关度排序**
    - **Validates: Requirements 9.5**
  - [ ]* 5.3 Write property test for search path
    - **Property 18: 搜索结果路径完整性**
    - **Validates: Requirements 9.7**

- [x] 6. Checkpoint - 确保所有API测试通过
  - Ensure all tests pass, ask the user if questions arise.



## Phase 3: 基础UI组件开发

- [x] 7. 标签和导航组件
  - [x] 7.1 创建 TagBadge 组件
    - 支持5种标签类型
    - 正确的颜色映射
    - 支持不同尺寸
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_
  - [ ]* 7.2 Write property test for tag color
    - **Property 8: 标签颜色映射正确性**


    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6**
  - [x] 7.3 创建 Breadcrumb 组件
    - 显示完整路径
    - 支持点击跳转
    - 移动端折叠模式
    - _Requirements: 5.1, 5.2, 5.3, 8.4_
  - [ ]* 7.4 Write property test for breadcrumb
    - **Property 10: 面包屑路径完整性**


    - **Validates: Requirements 5.1, 5.2, 5.3**


- [x] 8. 卡片组件
  - [x] 8.1 创建 ChapterCard 组件
    - 显示章节标题、小节数、考点数、掌握度
    - 渐变背景色和阴影
    - 点击跳转到章节页
    - _Requirements: 1.1, 7.8_
  - [x] 8.2 创建 SectionCard 组件
    - 显示小节标题、考点数、高频考点数、掌握度
    - 浅色背景和中等阴影
    - 点击跳转到小节页
    - _Requirements: 1.3, 7.9_
  - [x] 8.3 创建 PointCard 组件（入口卡片）


    - 仅显示标题、标签、简介（≤40字）、历年考查年份
    - 禁止显示口诀、逻辑图、例题
    - 白色背景和轻微阴影



    - _Requirements: 1.6, 2.1, 2.2, 7.10_
  - [ ]* 8.4 Write property test for point card content
    - **Property 3: 考点卡片内容限制**
    - **Validates: Requirements 1.6, 2.1, 2.2**

- [x] 9. 详情页组件
  - [x] 9.1 创建 SectionTOC 组件（右侧目录）
    - 显示同小节所有考点
    - 高亮当前考点
    - 点击跳转
    - _Requirements: 5.4, 5.5, 5.6_
  - [ ]* 9.2 Write property test for TOC highlight
    - **Property 11: 右侧目录高亮正确性**
    - **Validates: Requirements 5.4, 5.5, 5.6**
  - [x] 9.3 创建 PointNavigation 组件（上下导航）
    - 显示上一个/下一个考点按钮


    - 边界情况隐藏按钮
    - _Requirements: 5.7, 5.8, 5.9_
  - [ ]* 9.4 Write property test for navigation boundary
    - **Property 12: 上下导航边界处理**
    - **Validates: Requirements 5.7, 5.8, 5.9**
  - [x] 9.5 创建 ContentModule 组件（可折叠内容模块）
    - 支持折叠/展开
    - 移动端默认折叠
    - _Requirements: 8.3_

- [x] 10. Checkpoint - 确保所有组件测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: 考点梳理和搜索组件

- [x] 11. 考点梳理组件
  - [x] 11.1 创建 PointOverview 组件
    - 显示统计信息（考点总数、高频考点数）
    - 显示优先级分布图
    - 列出所有考点标题和标签
    - 显示学习建议
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ]* 11.2 Write property test for overview stats
    - **Property 13: 考点梳理统计正确性**
    - **Validates: Requirements 6.2**
  - [ ]* 11.3 Write property test for overview completeness
    - **Property 14: 考点梳理列表完整性**
    - **Validates: Requirements 6.3**
  - [x] 11.4 实现点击滚动功能
    - 点击考点标题平滑滚动到对应卡片
    - _Requirements: 6.6_

- [x] 12. 搜索组件
  - [x] 12.1 创建 GlobalSearch 组件
    - 搜索框UI
    - 显示搜索历史和热门搜索
    - 实时搜索建议
    - _Requirements: 9.1, 9.2_
  - [x] 12.2 创建 SearchResults 组件
    - 分类展示结果（章节、小节、考点）
    - 显示完整路径
    - 高亮匹配关键词
    - _Requirements: 9.6, 9.7, 9.8_
  - [x] 12.3 实现搜索跳转
    - 点击结果跳转到对应页面
    - 考点详情页高亮匹配内容
    - _Requirements: 9.9, 9.10, 9.11_
  - [x] 12.4 实现无结果处理
    - 显示"未找到相关内容"
    - 显示搜索建议
    - _Requirements: 9.12, 9.13_

- [x] 13. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: 页面重构

- [x] 14. 知识图谱首页重构




  - [x] 14.1 重构 `/app/knowledge/page.tsx`


    - 章节卡片网格布局
    - 整体统计区域
    - 全局搜索框

    - 视图切换按钮（树状/图谱）
    - _Requirements: 1.1, 9.1_
  - [x] 14.2 实现响应式布局




    - 桌面端两列布局
    - 移动端单列布局
    - _Requirements: 7.2, 7.3, 8.1_


- [x] 15. 章节页开发
  - [x] 15.1 创建 `/app/knowledge/chapter/[chapterId]/page.tsx`




    - 面包屑导航
    - 章节概览区域
    - 小节卡片网格
    - _Requirements: 1.2, 1.3, 5.1_
  - [ ]* 15.2 Write property test for chapter page
    - **Property 2: URL路由正确性**
    - **Validates: Requirements 1.2**

- [x] 16. 小节页开发

  - [x] 16.1 创建 `/app/knowledge/chapter/[chapterId]/section/[sectionId]/page.tsx`



    - 面包屑导航

    - 考点梳理区域
    - 考点卡片列表
    - 标签筛选功能
    - _Requirements: 1.4, 1.5, 4.7, 5.1_
  - [ ]* 16.2 Write property test for tag filter
    - **Property 9: 标签筛选正确性**
    - **Validates: Requirements 4.7**
  - [ ]* 16.3 Write property test for three-click rule
    - **Property 4: 三次点击规则**

    - **Validates: Requirements 1.8**



- [x] 17. 考点详情页重构
  - [x] 17.1 重构 `/app/knowledge/point/[pointId]/page.tsx`
    - 面包屑导航
    - 顶部信息区（标题、来源、标签）
    - 内容模块区域（按顺序展示非空模块）
    - 右侧目录（同小节考点）
    - 底部导航（上下考点、相关真题、开始练习）
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8, 5.4, 5.7_
  - [x] 17.2 实现移动端适配
    - 单列布局
    - 手风琴式内容模块
    - 底部悬浮导航
    - 侧边抽屉目录
    - _Requirements: 8.1, 8.3, 8.5, 8.6_
  - [x]* 17.3 Write property test for high frequency tag
    - **Property 5: 高频标签显示一致性**
    - **Validates: Requirements 2.3, 4.2**

- [x] 18. Checkpoint - 确保所有页面测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: 图谱视图

- [x] 19. 图谱视图开发
  - [x] 19.1 创建 KnowledgeGraph 组件
    - 节点和连线渲染
    - 节点仅显示标题
    - 支持缩放和拖动
    - _Requirements: 3.2, 3.3, 3.6_
  - [x] 19.2 实现节点样式
    - 不同章节不同颜色
    - 节点大小表示重要性
    - _Requirements: 3.7, 3.8_
  - [ ]* 19.3 Write property test for node color
    - **Property 15: 图谱节点颜色分组**
    - **Validates: Requirements 3.7**
  - [ ]* 19.4 Write property test for node size
    - **Property 16: 图谱节点大小与重要性映射**
    - **Validates: Requirements 3.8**
  - [x] 19.5 实现节点交互
    - 点击弹出简介卡片
    - 卡片包含"查看详情"按钮
    - _Requirements: 3.4, 3.5_
  - [x] 19.6 创建 `/app/knowledge/graph/page.tsx`
    - 图谱视图页面
    - 视图切换入口
    - _Requirements: 3.1_
  - [x] 19.7 实现移动端适配
    - 双指缩放和单指拖动
    - 提供切换为列表视图选项
    - _Requirements: 8.7, 8.8_

- [x] 20. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.


## Phase 7: 优化和完善

- [x] 21. 性能优化
  - [x] 21.1 实现数据缓存
    - 缓存章节和小节数据
    - 减少重复API请求
  - [x] 21.2 实现懒加载
    - 图谱视图节点懒加载
    - 考点列表分页加载

- [x] 22. SEO优化
  - [x] 22.1 添加页面元数据
    - 每个页面独立的title和description
    - 结构化数据（JSON-LD）
    - _Requirements: 技术需求-SEO_
  - [x] 22.2 确保SSR支持
    - 所有页面支持服务端渲染


- [x] 23. 触摸优化
  - [x] 23.1 确保触摸区域
    - 所有可点击元素≥44x44像素
    - 添加触摸反馈
    - _Requirements: 8.9, 8.10_

- [x] 24. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.
