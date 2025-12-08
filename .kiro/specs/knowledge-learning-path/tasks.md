# Implementation Plan - 知识图谱页面层级优化

## Phase 1: 数据库和API基础

- [x] 1. 数据库表结构扩展
  - [x] 1.1 创建用户学习进度表 `user_learning_progress`
    - 包含 user_id, point_id, status, last_visited_at, completed_at 字段
    - 添加唯一约束和索引
    - _Requirements: 7.2, 9.4_
  - [x] 1.2 创建用户收藏/标记表 `user_favorites`
    - 包含 user_id, point_id, type 字段
    - 支持 favorite 和 review 两种类型
    - _Requirements: 12.1, 12.2_
  - [x] 1.3 创建最近学习记录表 `recent_learning`
    - 包含 user_id, point_id, visited_at 字段
    - 添加按时间倒序索引
    - _Requirements: 10.2_

- [-] 2. 知识结构API开发



  - [x] 2.1 创建 `/api/knowledge/structure/route.ts`
    - GET: 返回章节和小节结构（不含考点详情）
    - 返回统计信息：总章节数、总小节数、总考点数、高频考点数
    - _Requirements: 1.1, 1.2, 16.1_
  - [ ]* 2.2 Write property test for structure API
    - **Property 1: 三级结构渲染完整性**
    - **Validates: Requirements 1.1**
  - [x] 2.3 重构 `/api/section/[sectionId]/points/route.ts`
    - GET: 懒加载小节考点列表
    - 返回考点行数据：标题、星级、标签、简介（≤30字）
    - _Requirements: 1.6, 16.2_
  - [ ]* 2.4 Write property test for points lazy loading
    - **Property 22: 懒加载策略正确性**
    - **Validates: Requirements 16.1**



- [x] 3. 用户进度API开发
  - [x] 3.1 创建 `/api/user/progress/route.ts`
    - GET: 返回用户学习进度统计
    - 返回最近学习的5个考点
    - _Requirements: 7.2, 10.2_
  - [ ]* 3.2 Write property test for progress stats
    - **Property 14: 进度统计正确性**
    - **Validates: Requirements 7.2**
  - [ ]* 3.3 Write property test for recent learning
    - **Property 16: 最近学习列表正确性**
    - **Validates: Requirements 10.2**

- [x] 4. 收藏/标记API开发
  - [x] 4.1 创建 `/api/user/favorites/route.ts`
    - POST: 添加/移除收藏或复习标记
    - GET: 获取用户收藏或待复习列表
    - _Requirements: 12.1, 12.2, 12.4_
  - [ ]* 4.2 Write property test for favorites sync
    - **Property 18: 收藏状态同步正确性**
    - **Validates: Requirements 12.3**

- [-] 5. Checkpoint - 确保所有API测试通过



  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: 核心UI组件开发

- [x] 6. 手风琴组件开发
  - [x] 6.1 创建 `ChapterAccordion` 组件
    - 显示章节标题、考点数量、掌握度进度条
    - 支持展开/收起状态
    - 显示进度状态图标（完成/进行中/未开始）
    - _Requirements: 1.2, 4.1, 4.3, 4.4, 4.5_
  - [ ]* 6.2 Write property test for chapter data
    - **Property 2: 章节数据完整性**
    - **Validates: Requirements 1.2**
  - [x] 6.3 创建 `SectionAccordion` 组件
    - 显示小节标题、考点数量、高频考点数量
    - 支持展开/收起状态
    - 展开时触发考点懒加载
    - _Requirements: 1.4, 4.2_
  - [ ]* 6.4 Write property test for accordion toggle
    - **Property 3: 手风琴展开状态一致性**
    - **Validates: Requirements 1.3, 1.5**

- [x] 7. 考点行组件开发
  - [x] 7.1 创建 `PointRow` 组件
    - 显示考点标题、重要性星级、高频标签、一句话简介
    - 简介限制30字，超出截断
    - 显示收藏/标记图标
    - 支持点击跳转到详情页
    - _Requirements: 1.6, 1.7, 12.3_
  - [x]* 7.2 Write property test for point row data

    - **Property 4: 考点行数据完整性**
    - **Validates: Requirements 1.6**
  - [ ]* 7.3 Write property test for point URL
    - **Property 5: 考点详情页URL正确性**
    - **Validates: Requirements 1.7**

- [x] 8. 快速预览组件开发
  - [x] 8.1 创建 `PointPreviewCard` 组件
    - 显示考点标题、核心记忆点（前3条）、历年考查年份
    - 提供"查看详情"按钮
    - 支持点击外部关闭
    - _Requirements: 2.1, 2.3, 2.4, 2.5_
  - [ ]* 8.2 Write property test for preview content
    - **Property 6: 预览卡片内容完整性**
    - **Validates: Requirements 2.3**

- [ ] 9. Checkpoint - 确保所有组件测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: 筛选和搜索功能

- [x] 10. 筛选功能开发
  - [x] 10.1 创建 `FilterPanel` 组件
    - 支持按标签筛选：高频、必考、易错、基础、强化（多选）
    - 支持按难度筛选：基础、进阶、冲刺
    - 支持按学习状态筛选：未学习、学习中、已掌握、待复习
    - 支持只看收藏、只看待复习
    - 显示筛选后的考点数量
    - _Requirements: 3.1, 13.1, 13.2, 13.3, 13.4, 13.6_
  - [ ]* 10.2 Write property test for high frequency filter
    - **Property 7: 高频筛选正确性**
    - **Validates: Requirements 3.2, 3.3**
  - [ ]* 10.3 Write property test for filter stats
    - **Property 8: 筛选统计正确性**
    - **Validates: Requirements 3.4**
  - [ ]* 10.4 Write property test for multi-filter
    - **Property 19: 多条件筛选正确性**
    - **Validates: Requirements 13.5**

- [x] 11. 搜索功能增强
  - [x] 11.1 创建 `SearchEnhanced` 组件
    - 支持拼音模糊搜索
    - 支持考点别名/关联词搜索
    - 分类显示结果：考点、小节、章节
    - 高亮匹配关键词
    - _Requirements: 5.1, 5.2, 14.1, 14.2, 14.3, 14.6_
  - [ ]* 11.2 Write property test for search match
    - **Property 10: 搜索结果匹配正确性**
    - **Validates: Requirements 5.2**
  - [ ]* 11.3 Write property test for pinyin search
    - **Property 20: 拼音搜索正确性**
    - **Validates: Requirements 14.1**
  - [ ]* 11.4 Write property test for search categories
    - **Property 21: 搜索结果分类正确性**
    - **Validates: Requirements 14.3**
  - [x] 11.5 实现搜索结果跳转
    - 点击考点结果跳转到详情页
    - 点击小节结果跳转到首页并展开该小节
    - 点击章节结果跳转到首页并展开该章节
    - _Requirements: 5.4, 14.4, 14.5_

- [-] 12. Checkpoint - 确保所有筛选和搜索测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: 首页重构

- [x] 13. 知识图谱首页重构
  - [x] 13.1 重构 `/app/knowledge/page.tsx`
    - 删除原有的章节卡片网格布局
    - 实现三级手风琴布局
    - 集成 KnowledgeAccordion、FilterPanel、SearchEnhanced 组件
    - _Requirements: 1.1_
  - [x] 13.2 实现学习进度统计区
    - 显示总考点数、已学习数、已掌握数、待复习数
    - 显示整体完成度进度条
    - 提供"去复习"快捷按钮
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [x] 13.3 实现最近学习区块
    - 显示最近访问的5个考点
    - 显示正在学习的小节
    - 无学习记录时显示引导
    - _Requirements: 10.1, 10.2, 10.3, 10.5_
  - [x] 13.4 实现状态保持功能
    - 从详情页返回时自动展开对应章节/小节
    - 高亮刚才访问的考点行
    - 自动滚动到该考点位置
    - 刷新页面恢复展开状态（localStorage）
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [ ]* 13.5 Write property test for state restore
    - **Property 15: 状态恢复正确性**
    - **Validates: Requirements 9.1**
  - [x] 13.6 实现URL锚点定位
    - 支持 /knowledge#chapter-1-section-2 格式
    - 自动展开并定位到指定位置
    - _Requirements: 1.8, 9.5_

- [x] 14. 删除中间页面
  - [x] 14.1 重构 `/app/knowledge/chapter/[chapterId]/page.tsx`
    - 改为重定向到首页并展开对应章节
  - [x] 14.2 重构 `/app/knowledge/chapter/[chapterId]/section/[sectionId]/page.tsx`
    - 改为重定向到首页并展开对应小节
  - [x] 14.3 更新所有指向中间页面的链接
    - 旧链接通过重定向自动跳转到首页锚点

- [-] 15. Checkpoint - 确保首页重构测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: 详情页优化

- [x] 16. 考点详情页优化
  - [x] 16.1 优化面包屑导航
    - 显示完整路径：知识图谱 > 章节 > 小节 > 考点
    - 点击章节/小节跳转到首页并展开对应位置
    - _Requirements: 6.1, 6.6_
  - [ ]* 16.2 Write property test for breadcrumb
    - **Property 11: 面包屑导航正确性**
    - **Validates: Requirements 6.1**
  - [x] 16.3 优化内容模块展示（已实现）
    - 按预定义顺序展示非空模块
    - 空模块自动跳过
    - _Requirements: 6.2, 6.3_
  - [ ]* 16.4 Write property test for module order
    - **Property 12: 内容模块顺序正确性**
    - **Validates: Requirements 6.2**
  - [ ]* 16.5 Write property test for empty module
    - **Property 13: 空模块跳过正确性**
    - **Validates: Requirements 6.3**
  - [x] 16.6 添加收藏/标记按钮（已实现）
    - 提供"收藏"按钮
    - 提供"标记为需复习"按钮
    - _Requirements: 12.1, 12.2_
  - [x] 16.7 添加相关考点和易混点（已实现）
    - 显示相关考点链接列表
    - 显示易混点对比卡片（如有）
    - _Requirements: 15.2, 15.3_
  - [x] 16.8 优化同小节导航（已实现）
    - 右侧显示同小节其他考点
    - 底部显示上一考点/下一考点按钮
    - _Requirements: 6.4, 6.5_

- [-] 17. Checkpoint - 确保详情页测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: 顺序学习模式

- [x] 18. 顺序学习功能开发
  - [x] 18.1 创建 `SequentialLearning` 组件
    - 首页提供"开始顺序学习"按钮
    - 跳转到第一个未完成的考点
    - _Requirements: 11.1, 11.2_
  - [ ]* 18.2 Write property test for sequential start
    - **Property 17: 顺序学习跳转正确性**
    - **Validates: Requirements 11.2**
  - [x] 18.3 实现顺序学习导航
    - 详情页显示"下一个考点"按钮（已有PointNavigation组件）
    - 完成小节时显示完成动画
    - 完成全部时显示恭喜页面
    - _Requirements: 11.3, 11.4, 11.5_
  - [x] 18.4 实现学习位置记录
    - 中途退出时记录当前位置（localStorage）
    - 下次可继续学习
    - _Requirements: 11.6_

- [-] 19. Checkpoint - 确保顺序学习测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: 移动端适配和性能优化

- [x] 20. 移动端适配
  - [x] 20.1 实现移动端手风琴布局
    - 全宽手风琴布局（Tailwind响应式类已实现）
    - 默认只展开当前正在学的小节
    - _Requirements: 8.1, 8.6_
  - [x] 20.2 实现移动端搜索
    - 搜索框在移动端全宽显示
    - _Requirements: 8.2_
  - [x] 20.3 实现移动端进度统计
    - 使用grid响应式布局（grid-cols-2 md:grid-cols-4）
    - _Requirements: 8.3_
  - [x] 20.4 实现移动端预览
    - PointPreviewCard支持移动端显示
    - 带关闭按钮
    - _Requirements: 8.5_
  - [x] 20.5 确保触摸区域
    - 按钮和可点击元素使用足够大的padding
    - _Requirements: 8.7_

- [x] 21. 性能优化
  - [x] 21.1 实现懒加载策略
    - 首页仅加载章节/小节结构（/api/knowledge/structure）
    - 展开小节时懒加载考点（/api/section/[id]/points）
    - _Requirements: 16.1, 16.2_
  - [ ] 21.2 实现虚拟滚动（可选优化）
    - 大量考点时使用虚拟滚动
    - _Requirements: 16.5_
  - [x] 21.3 实现状态缓存
    - sectionPoints状态缓存已加载的考点数据
    - 减少重复API请求

- [-] 22. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.
