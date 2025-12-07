# Requirements Document

## Introduction

知识图谱页面优化项目旨在重新设计 https://yikaobiguo.com/knowledge 页面的信息架构和交互体验。核心目标是：
1. **简化知识树结构**：采用"章节→节→考点标题/小节总结"三级结构，考点内容不在树中展开
2. **考点详情页独立化**：每个考点拥有独立URL页面，便于SEO、分享和灵活布局
3. **小节总结页面**：与考点并列，包含考点梳理（考点标题+历年考查年份）和重点强化（思维导图）
4. **考点标注增强**：在考点旁边标注历年考查年份和高频考点标记
5. **内容模块化**：考点详情页支持灵活容纳不同类型内容（药物分类、作用机制、口诀、不良反应等）

## Glossary

- **知识图谱(Knowledge Graph)**: 展示药学知识点层级结构的可视化页面
- **章节(Chapter)**: 知识体系的一级分类，如"第一章：解热、镇痛、抗炎、抗风湿及抗痛风药"
- **节(Section)**: 章节下的二级分类，如"第一节：秋水仙碱与痛风药物"
- **考点(Knowledge Point)**: 节下的具体知识单元，如"考点1：秋水仙碱的临床用药"
- **小节总结(Section Summary)**: 与考点并列的特殊节点，包含该节的考点梳理和重点强化内容
- **考点梳理(Point Overview)**: 列出小节内所有考点标题及其历年考查情况的概览
- **历年考查标注(Exam Year Tags)**: 标注该考点在哪些年份被考查过，如"2020、2022、2024"
- **高频考点标记(High Frequency Tag)**: 标注几乎每年都考的重要考点
- **重点强化(Key Reinforcement)**: 思维导图或总结图，用于视觉强化记忆
- **考点详情页(Point Detail Page)**: 展示单个考点完整教学内容的独立页面

## Requirements

### Requirement 1: 知识树三级结构展示

**User Story:** As a 备考用户, I want to 以简洁的三级树状结构浏览知识点, so that 我能快速定位到具体考点而不被过多内容干扰。

#### Acceptance Criteria

1. WHEN 用户访问知识图谱页面 THEN the 系统 SHALL 以三级树状结构展示内容：章节→节→（考点标题 + 小节总结）
2. WHEN 展示章节节点 THEN the 系统 SHALL 显示章节编号和章节标题
3. WHEN 展示节节点 THEN the 系统 SHALL 显示节编号、节标题、该节包含的考点数量
4. WHEN 展示考点节点 THEN the 系统 SHALL 显示考点标题、重要性星级
5. WHEN 考点为高频考点 THEN the 系统 SHALL 在考点旁显示"高频"标记（历年考查年份详情在小节总结页面展示）
6. WHEN 展示节的子节点 THEN the 系统 SHALL 在考点列表末尾显示"小节总结"节点
7. WHEN 用户点击考点标题 THEN the 系统 SHALL 跳转到该考点的独立详情页面
8. WHEN 用户点击小节总结 THEN the 系统 SHALL 跳转到该节的小节总结页面
9. WHEN 用户点击展开/收起按钮 THEN the 系统 SHALL 切换该节点的子节点显示状态

### Requirement 2: 考点详情页独立化

**User Story:** As a 备考用户, I want to 在独立页面查看考点的完整教学内容, so that 我能专注学习单个考点并方便分享和收藏。

#### Acceptance Criteria

1. WHEN 用户访问考点详情页 THEN the 系统 SHALL 为该考点提供独立的URL路径（如 /knowledge/point/[id]）
2. WHEN 显示考点详情页 THEN the 系统 SHALL 包含考点简介模块，用一句话总结该考点为什么被考
3. WHEN 显示考点详情页 THEN the 系统 SHALL 包含核心记忆点模块，展示记忆口诀和关键要点
4. WHEN 显示考点详情页 THEN the 系统 SHALL 包含作用特点模块，展示药物的作用机制和特点
5. WHEN 显示考点详情页 THEN the 系统 SHALL 包含典型不良反应模块，按严重程度分类展示
6. WHEN 显示考点详情页 THEN the 系统 SHALL 包含禁忌和注意事项模块
7. WHEN 显示考点详情页 THEN the 系统 SHALL 包含药物相互作用模块
8. WHEN 用户在考点详情页上下滑动 THEN the 系统 SHALL 支持流畅滚动查看全部内容

### Requirement 3: 小节总结页面

**User Story:** As a 备考用户, I want to 在小节总结页面快速了解该节的考点分布和重点内容, so that 我能通过思维导图加深记忆并合理安排学习优先级。

#### Acceptance Criteria

1. WHEN 用户访问小节总结页面 THEN the 系统 SHALL 为该小节提供独立的URL路径（如 /knowledge/section/[id]/summary）
2. WHEN 显示小节总结页面 THEN the 系统 SHALL 在顶部显示"考点梳理"区域
3. WHEN 显示考点梳理区域 THEN the 系统 SHALL 列出该节所有考点标题
4. WHEN 显示考点梳理区域 THEN the 系统 SHALL 在每个考点旁显示历年考查年份（如"2020、2022、2024 考过"）
5. WHEN 显示考点梳理区域 THEN the 系统 SHALL 标注高频考点（如"高频考点，几乎每年考"）
6. WHEN 用户点击考点梳理中的考点标题 THEN the 系统 SHALL 跳转到该考点的详情页
7. WHEN 小节包含重点强化内容 THEN the 系统 SHALL 在考点梳理下方展示"重点强化"区域
8. WHEN 显示重点强化区域 THEN the 系统 SHALL 显示标题"重点强化"和提示文字"点击图片可放大"
9. WHEN 用户点击思维导图图片 THEN the 系统 SHALL 以弹窗形式放大展示图片
10. WHEN 显示放大弹窗 THEN the 系统 SHALL 支持点击弹窗外部或关闭按钮关闭弹窗

### Requirement 4: 考点历年考查数据管理

**User Story:** As a 内容管理员, I want to 管理考点的历年考查数据, so that 系统能在小节总结页面展示考点的考查历史。

#### Acceptance Criteria

1. WHEN 存储考点数据 THEN the 系统 SHALL 为每个考点关联历年考查年份字段（数组格式，如[2020, 2022, 2024]）
2. WHEN 存储考点数据 THEN the 系统 SHALL 为每个考点关联高频考点标记字段（布尔值）
3. WHEN 在小节总结页面展示考点 THEN the 系统 SHALL 显示历年考查年份（如"2020、2022、2024 考过"）
4. WHEN 考点被标记为高频 THEN the 系统 SHALL 在知识树和小节总结页面显示醒目的"高频"标签
5. WHEN 导入考点数据 THEN the 系统 SHALL 支持批量更新历年考查年份和高频标记

### Requirement 5: 内容模块灵活布局

**User Story:** As a 内容管理员, I want to 为不同考点配置不同类型的内容模块, so that 每个考点页面能展示最适合该考点的教学内容。

#### Acceptance Criteria

1. WHEN 存储考点内容 THEN the 系统 SHALL 支持以下内容类型：考点简介、核心记忆点、药物分类、作用机制、临床应用、不良反应、禁忌、药物相互作用、重点强化图
2. WHEN 渲染考点详情页 THEN the 系统 SHALL 按照预定义顺序展示已配置的内容模块
3. WHEN 某内容模块为空 THEN the 系统 SHALL 跳过该模块不显示，不影响其他模块展示
4. WHEN 显示药物分类内容 THEN the 系统 SHALL 使用表格或列表形式清晰展示分类层级
5. WHEN 显示重点强化图内容 THEN the 系统 SHALL 支持图片格式展示，并支持点击放大

### Requirement 6: 页面导航和SEO优化

**User Story:** As a 备考用户, I want to 通过搜索引擎找到具体考点页面, so that 我能快速访问需要复习的内容。

#### Acceptance Criteria

1. WHEN 渲染考点详情页 THEN the 系统 SHALL 生成包含考点标题的页面标题（title标签）
2. WHEN 渲染考点详情页 THEN the 系统 SHALL 生成包含考点简介的页面描述（meta description）
3. WHEN 用户在考点详情页 THEN the 系统 SHALL 显示面包屑导航：知识图谱 > 章节 > 节 > 考点
4. WHEN 用户点击面包屑中的节 THEN the 系统 SHALL 跳转到知识图谱页面并展开该节
5. WHEN 用户点击面包屑中的章节 THEN the 系统 SHALL 跳转到知识图谱页面并展开该章节
6. WHEN 用户分享考点详情页URL THEN the 系统 SHALL 确保URL可直接访问该考点内容

### Requirement 7: 移动端适配

**User Story:** As a 移动端用户, I want to 在手机上流畅浏览知识点内容, so that 我能随时随地学习。

#### Acceptance Criteria

1. WHEN 用户在移动端访问知识图谱页面 THEN the 系统 SHALL 将树状导航改为可折叠的侧边栏或顶部下拉菜单
2. WHEN 用户在移动端访问考点详情页 THEN the 系统 SHALL 采用单列布局，内容模块垂直排列
3. WHEN 用户在移动端查看思维导图 THEN the 系统 SHALL 支持双指缩放和拖动查看
4. WHEN 用户在移动端浏览 THEN the 系统 SHALL 确保所有可点击元素的触摸区域不小于44x44像素

