
# Implementation Plan - 智能学习系统

## Phase 1: 核心数据层和基础组件

- [x] 1. 数据库表结构完善和API基础

  - [x] 1.1 创建 study_plans 和 daily_learning_stats 表



    - 在 Supabase 中创建学习计划表和每日统计表
    - 添加必要的索引和约束
    - _Requirements: 2.1, 2.4_
  - [x] 1.2 创建掌握度计算服务 `/lib/mastery.ts`


    - 实现 calculateMastery 函数（基础正确率40% + 最近表现30% + 时间衰减20% + 难度加权10%）
    - 实现 getNextReviewDate 艾宾浩斯遗忘曲线函数
    - _Requirements: 2.2, 2.5, 5.1_

  - [x] 1.3 Write property test for mastery calculation
    - **Property 6: 掌握度更新一致性**
    - **Property 8: 艾宾浩斯遗忘曲线衰减**
    - **Validates: Requirements 2.2, 2.5**
  - [x] 1.4 创建知识点树 API `/api/knowledge-tree/route.ts` 增强


    - 添加用户掌握度数据合并
    - 支持筛选参数（只看薄弱/只看高频）
    - _Requirements: 3.2, 3.3_
  - [x] 1.5 Write property test for knowledge tree API


    - **Property 10: 高频考点排序正确性**
    - **Validates: Requirements 3.3**

- [x] 2. Checkpoint - 确保所有测试通过



  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: 核心UI组件开发

- [x] 3. 掌握度可视化组件

  - [x] 3.1 创建 MasteryProgressBar 组件


    - 实现颜色映射（≥80%绿色/60-79%黄色/<60%红色/0灰色）
    - 支持 sm/md/lg 三种尺寸
    - 显示状态标签（已掌握/需复习/薄弱/未学习）
    - _Requirements: 3.2, 7.2_
  - [x] 3.2 Write property test for color mapping


    - **Property 16: 热力图颜色映射一致性**
    - **Validates: Requirements 7.2**
  - [x] 3.3 创建 MasteryStatusBadge 组件


    - 根据掌握度显示对应图标和文字
    - _Requirements: 3.3, 4.1_
  - [x] 3.4 创建 ImportanceStars 组件


    - 显示1-5星重要性等级
    - _Requirements: 4.1_

- [x] 4. 知识点树组件增强

  - [x] 4.1 增强现有 KnowledgeTree 组件


    - 添加掌握度进度条显示
    - 添加掌握状态标签
    - 添加搜索功能
    - _Requirements: 3.2, 3.5_
  - [x] 4.2 添加筛选功能

    - 实现"只看薄弱"筛选（掌握度<60%）
    - 实现"只看高频"筛选（重要性≥4星）
    - _Requirements: 3.3, 5.5_
  - [x] 4.3 Write property test for filtering


    - **Property 7: 薄弱点标记阈值一致性**
    - **Property 14: 立即复习条件过滤**
    - **Validates: Requirements 2.3, 5.5**

- [x] 5. Checkpoint - 确保所有测试通过



  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: 学习仪表盘页面

- [x] 6. 仪表盘 API 开发
  - [x] 6.1 创建 `/api/dashboard/route.ts`
    - 返回总体掌握度、本周学习时长、总体正确率
    - 返回各章节掌握度数据
    - 返回薄弱考点数量
    - _Requirements: 3.1, 3.4_
  - [x] 6.2 Write property test for dashboard API
    - **Property 9: 仪表盘数据完整性**
    - **Validates: Requirements 3.1, 3.2**
  - [x] 6.3 创建 `/api/dashboard/recommendations/route.ts`
    - 基于艾宾浩斯遗忘曲线生成今日复习推荐
    - 返回Top 10高频考点掌握情况
    - _Requirements: 5.1, 5.3_
  - [x] 6.4 Write property test for recommendations
    - **Property 13: 复习推荐算法正确性**
    - **Validates: Requirements 5.1**

- [x] 7. 仪表盘页面 `/app/dashboard/page.tsx`
  - [x] 7.1 创建仪表盘页面布局
    - 顶部统计卡片（总掌握度、学习时长、正确率、薄弱考点数）
    - 章节掌握情况进度条列表
    - _Requirements: 3.1, 3.2_
  - [x] 7.2 实现今日推荐复习模块
    - 显示基于遗忘曲线的推荐考点
    - 显示上次复习时间和正确率
    - _Requirements: 5.1_
  - [x] 7.3 实现高频考点掌握情况模块
    - 显示Top 10高频考点
    - 标注掌握状态和星级
    - _Requirements: 3.3_
  - [x] 7.4 实现薄弱环节分析模块
    - 按考点类型分组显示正确率
    - _Requirements: 3.4_

- [x] 8. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: 知识点详情和交互

- [x] 9. 知识点详情页


  - [x] 9.1 创建 `/app/knowledge/point/[id]/page.tsx`

    - 显示知识点完整信息（药物名称、重要性、掌握度、内容）
    - 显示记忆口诀（如有）
    - _Requirements: 4.1, 4.3_

  - [x] 9.2 Write property test for card data completeness

    - **Property 11: 知识点卡片数据完整性**
    - **Validates: Requirements 4.1, 4.3**

  - [x] 9.3 实现内容项正确率显示

    - 对已测试过的内容项显示正确率
    - _Requirements: 4.2_


  - [x] 9.4 实现交互按钮
    - "标记为需复习"按钮 - 加入复习队列
    - "专项练习"按钮 - 跳转练习页

    - _Requirements: 4.4, 4.5_
  - [x] 9.5 Write property test for review queue


    - **Property 12: 复习队列优先级更新**
    - **Validates: Requirements 4.4**





- [x] 10. 答题记录追踪


  - [x] 10.1 创建 `/api/learning-records/route.ts`


    - POST: 记录答题数据（考点ID、是否正确、用时、时间戳）
    - GET: 获取用户学习记录


    - _Requirements: 2.1_
  - [x] 10.2 Write property test for record completeness
    - **Property 5: 答题记录完整性**



    - **Validates: Requirements 2.1**
  - [x] 10.3 集成到现有练习页面

    - 在答题完成时调用记录API

    - 更新对应考点掌握度
    - _Requirements: 2.1, 2.2_


- [x] 11. Checkpoint - 确保所有测试通过


  - Ensure all tests pass, ask the user if questions arise.


## Phase 5: 学习热力图和统计
































- [x] 12. 学习热力图功能
  - [x] 12.1 创建 `/api/learning-stats/heatmap/route.ts`
    - 返回近30天每日学习数据
    - 包含学习时长、题目数、正确率
    - _Requirements: 7.1_
  - [x] 12.2 创建 LearningHeatmap 组件
    - 日历热力图展示
    - 颜色映射（绿/黄/红/灰）
    - _Requirements: 7.1, 7.2_
  - [x] 12.3 实现日期点击详情
    - 显示当天学习详情
    - 标注需重点复习的考点
    - _Requirements: 7.3, 7.4_
  - [x] 12.4 实现连续学习徽章
    - 计算连续学习天数
    - 显示徽章
    - _Requirements: 7.5_
  - [x] 12.5 Write property test for streak calculation
    - **Property 17: 连续学习天数计算**
    - **Validates: Requirements 7.5**

- [x] 13. Checkpoint - 确保所有测试通过



  - Ensure all tests pass, ask the user if questions arise.














## Phase 6: 导航和路由优化


- [x] 14. 导航栏优化
  - [x] 14.1 更新导航栏结构
    - 添加"学习中心"下拉菜单（仪表盘、学习计划、薄弱点分析）
    - 添加"知识图谱"入口
    - _Requirements: 3.1_
  - [x] 14.2 添加移动端导航适配
    - 响应式菜单
    - _Requirements: 3.1_

- [x] 15. 首页入口优化
  - [x] 15.1 在首页添加学习仪表盘入口
    - 显示简要学习统计
    - 快速跳转按钮
    - _Requirements: 3.1_

- [x] 16. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.
