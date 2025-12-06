# Requirements Document

## Introduction

知识图谱页面重新设计项目旨在优化现有的知识点展示页面，解决三个核心问题：1）内容展示结构不清晰，缺乏章节→小节→考点→具体内容的层级结构；2）知识点内容过于教材化，缺乏帮助用户记忆的辅助内容；3）视觉设计不够友好，核心内容不突出。通过引入"老司机带路"记忆辅助系统和重新设计的树状内容展示，帮助用户更高效地记忆和掌握药学考点。

## Glossary

- **知识图谱(Knowledge Graph)**: 展示药学知识点层级结构和关联关系的可视化页面
- **章节(Chapter)**: 知识体系的一级分类，如"第二章 解热镇痛抗炎药"
- **小节(Section)**: 章节下的二级分类，如"第一节 解热镇痛抗炎药概述"
- **考点(Knowledge Point)**: 小节下的具体知识单元，如"NSAIDs作用机制"
- **考点内容(Point Content)**: 考点下的具体知识项，如"作用特点"、"不良反应"、"临床应用"
- **老司机带路(Expert Tips)**: 以考过药考的老司机视角，提供出题套路、易错点、记忆技巧的辅助内容
- **坑位地图(Trap Map)**: 针对某个考点，总结出题人常用的挖坑方式和考生常犯的错误
- **记忆口诀(Memory Mnemonics)**: 帮助用户快速记忆知识点的顺口溜或技巧
- **高频考点(High-Frequency Point)**: 历年考试中出现频率较高的考点，重要性等级为4-5星
- **掌握度(Mastery Score)**: 用户对某个考点的掌握程度，范围0-100

## Requirements

### Requirement 1: 树状内容层级展示

**User Story:** As a 备考用户, I want to 以清晰的树状结构查看知识点, so that 我能快速定位到具体的考点内容并了解知识体系全貌。

#### Acceptance Criteria

1. WHEN 用户访问知识图谱页面 THEN the 系统 SHALL 以四级树状结构展示内容：章节→小节→考点→考点内容
2. WHEN 展示章节节点 THEN the 系统 SHALL 显示章节编号、章节标题、该章节整体掌握度百分比、包含的考点数量
3. WHEN 展示小节节点 THEN the 系统 SHALL 显示小节编号、小节标题、该小节掌握度、包含的高频考点数量
4. WHEN 展示考点节点 THEN the 系统 SHALL 显示考点标题、重要性星级、掌握状态标签、所属药物名称
5. WHEN 展示考点内容 THEN the 系统 SHALL 按类型分组显示：作用机制、药动学、不良反应、临床应用、相互作用、记忆口诀
6. WHEN 用户点击展开/收起按钮 THEN the 系统 SHALL 切换该节点的子节点显示状态
7. WHEN 用户使用搜索功能 THEN the 系统 SHALL 在所有层级中搜索匹配的节点并高亮显示

### Requirement 2: 老司机带路记忆辅助系统

**User Story:** As a 备考用户, I want to 在专业知识旁边看到考试技巧和记忆方法, so that 我能更容易记住知识点并避免考试中的常见陷阱。

#### Acceptance Criteria

1. WHEN 用户查看考点详情 THEN the 系统 SHALL 在专业内容旁边显示"老司机带路"辅助区域
2. WHEN 显示老司机带路内容 THEN the 系统 SHALL 包含以下模块：出题套路、坑位分析、记忆技巧、应试战术
3. WHEN 展示出题套路 THEN the 系统 SHALL 显示该考点常见的出题形式和题目示例
4. WHEN 展示坑位分析 THEN the 系统 SHALL 明确指出考生容易犯的错误和出题人常用的陷阱
5. WHEN 展示记忆技巧 THEN the 系统 SHALL 提供口诀、联想记忆、场景记忆等多种记忆方法
6. WHEN 展示应试战术 THEN the 系统 SHALL 提供看到该类题目时的条件反射式解题思路
7. WHEN 考点有必考预测 THEN the 系统 SHALL 显示预测题目和正确答案解析

### Requirement 3: 考点内容可视化优化

**User Story:** As a 备考用户, I want to 以更清晰的视觉形式查看考点内容, so that 我能快速抓住重点并提高学习效率。

#### Acceptance Criteria

1. WHEN 显示考点核心内容 THEN the 系统 SHALL 使用卡片式布局，每个内容类型一张卡片
2. WHEN 显示不良反应内容 THEN the 系统 SHALL 按严重程度使用不同颜色标记：红色严重、黄色中度、绿色轻度
3. WHEN 显示药物对比内容 THEN the 系统 SHALL 使用表格形式展示，支持横向滚动
4. WHEN 显示数字类考点 THEN the 系统 SHALL 使用醒目的数字标签突出显示关键数值
5. WHEN 显示高频考点 THEN the 系统 SHALL 使用特殊边框或背景色标识
6. WHEN 内容包含关键词 THEN the 系统 SHALL 对关键词（首选、禁忌、相互作用等）进行高亮标记

### Requirement 4: 知识点详情页重设计

**User Story:** As a 备考用户, I want to 在详情页同时看到专业内容和记忆辅助, so that 我能在一个页面完成学习和记忆。

#### Acceptance Criteria

1. WHEN 用户进入知识点详情页 THEN the 系统 SHALL 采用左右分栏布局：左侧专业内容、右侧老司机带路
2. WHEN 显示专业内容区域 THEN the 系统 SHALL 包含：分类标签、作用特点、临床应用、不良反应、注意事项
3. WHEN 显示老司机带路区域 THEN the 系统 SHALL 包含：坑位地图、记忆口诀、应试战术、必考预测
4. WHEN 用户在移动端访问 THEN the 系统 SHALL 将左右分栏改为上下布局，专业内容在上、辅助内容在下
5. WHEN 用户点击"开始练习"按钮 THEN the 系统 SHALL 跳转到该考点的专项练习页面
6. WHEN 用户点击"标记复习"按钮 THEN the 系统 SHALL 将该考点加入复习队列

### Requirement 5: 内容筛选和导航优化

**User Story:** As a 备考用户, I want to 快速筛选和定位到我需要的内容, so that 我能高效利用学习时间。

#### Acceptance Criteria

1. WHEN 用户使用筛选功能 THEN the 系统 SHALL 支持按掌握状态筛选：全部、未学习、薄弱、需复习、已掌握
2. WHEN 用户使用筛选功能 THEN the 系统 SHALL 支持按重要性筛选：全部、高频（4-5星）、中频（2-3星）、低频（1星）
3. WHEN 用户使用筛选功能 THEN the 系统 SHALL 支持按内容类型筛选：作用机制、不良反应、临床应用、相互作用
4. WHEN 显示筛选结果 THEN the 系统 SHALL 显示匹配的考点数量和预计学习时间
5. WHEN 用户点击面包屑导航 THEN the 系统 SHALL 支持快速跳转到上级章节或小节
6. WHEN 用户使用快捷键 THEN the 系统 SHALL 支持键盘导航：上下箭头切换考点、Enter展开详情、Esc返回列表

### Requirement 6: 老司机内容数据管理

**User Story:** As a 系统管理员, I want to 管理老司机带路的内容数据, so that 我能持续更新和优化记忆辅助内容。

#### Acceptance Criteria

1. WHEN 存储老司机内容 THEN the 系统 SHALL 为每个考点关联以下字段：出题套路、坑位分析、记忆技巧、应试战术、必考预测
2. WHEN 导入老司机内容 THEN the 系统 SHALL 支持JSON格式批量导入
3. WHEN 老司机内容为空 THEN the 系统 SHALL 显示默认提示"暂无老司机带路内容，敬请期待"
4. WHEN 更新老司机内容 THEN the 系统 SHALL 记录更新时间和版本号
5. WHEN 查询老司机内容 THEN the 系统 SHALL 支持按考点ID精确查询

