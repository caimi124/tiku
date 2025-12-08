# Requirements Document

## Introduction

本项目旨在从产品经理角度优化 https://yikaobiguo.com/knowledge 知识图谱页面，**核心目标是减少层级深度、提升信息密度**。

### 当前问题分析

**现状：四级结构**
```
章节列表 → 小节列表 → 考点概况列表 → 考点详情页
   (1)        (2)          (3)           (4)
```

**核心问题：**
1. **路径深度4层** - 超过用户耐心阈值（理想≤3层），用户需要4次点击才能看到考点内容
2. **信息量分散** - 小节概览页和考点概况页内容轻量、价值不高，属于"弱层级"
3. **SEO不利** - 权重拆散在大量index页中，核心内容页面权重被稀释
4. **用户目标偏离** - 用户核心目标是"学习考点"，中间层级应尽量减少

### 优化目标

**目标结构：两级结构**
```
知识图谱首页（章节+小节+考点概览） → 考点详情页
              (1)                        (2)
```

**核心原则：**
1. **两次点击到达内容** - 用户最多2次点击即可看到考点详细内容
2. **首页信息密度最大化** - 在首页展示章节、小节、考点三级信息
3. **考点详情页承载核心价值** - 所有学习内容集中在详情页
4. **SEO权重集中** - 减少中间页面，权重集中在首页和详情页

## Glossary

- **知识图谱首页(Knowledge Home)**: 整合章节、小节、考点三级信息的单页面入口
- **章节手风琴(Chapter Accordion)**: 可展开/收起的章节区块，展开后显示小节和考点
- **考点行(Point Row)**: 在首页直接展示的考点条目，包含标题、标签、一句话简介
- **考点详情页(Point Detail Page)**: 承载考点完整学习内容的独立页面
- **快速预览(Quick Preview)**: 悬停或点击考点行时显示的简要内容预览
- **高频标记(High Frequency Tag)**: 标识高频考点的醒目标签
- **学习进度条(Progress Bar)**: 显示章节/小节学习完成度的进度指示器

## URL结构规范（优化后）

```
/knowledge                    # 知识图谱首页（章节+小节+考点概览，一页展示）
/knowledge/point/[pointId]    # 考点详情页（核心内容页）
```

**删除的中间页面：**
- ~~`/knowledge/chapter/[chapterId]`~~ → 合并到首页
- ~~`/knowledge/chapter/[chapterId]/section/[sectionId]`~~ → 合并到首页

## Requirements

### Requirement 1: 首页三级信息整合展示

**User Story:** As a 备考用户, I want to 在一个页面看到所有章节、小节和考点的概览, so that 我能快速定位到想学习的考点而不需要多次跳转。

#### Acceptance Criteria

1. WHEN 用户访问知识图谱首页 THEN the 系统 SHALL 在单页面展示所有章节、小节、考点三级信息
2. WHEN 显示章节 THEN the 系统 SHALL 使用手风琴组件，默认收起状态，显示章节标题、考点数量、掌握度
3. WHEN 用户点击章节标题 THEN the 系统 SHALL 展开该章节，显示其下所有小节
4. WHEN 显示小节 THEN the 系统 SHALL 使用二级手风琴，显示小节标题、考点数量、高频考点数量
5. WHEN 用户点击小节标题 THEN the 系统 SHALL 展开该小节，直接显示考点列表
6. WHEN 显示考点列表 THEN the 系统 SHALL 每行显示：考点标题、重要性星级、高频标签、一句话简介（≤30字）
7. WHEN 用户点击考点行 THEN the 系统 SHALL 直接跳转到考点详情页（/knowledge/point/[id]）
8. WHEN 页面加载 THEN the 系统 SHALL 支持URL锚点定位（如 /knowledge#chapter-1-section-2）

### Requirement 2: 考点快速预览

**User Story:** As a 备考用户, I want to 在不离开首页的情况下快速预览考点内容, so that 我能判断是否需要深入学习该考点。

#### Acceptance Criteria

1. WHEN 用户悬停在考点行上（桌面端） THEN the 系统 SHALL 显示快速预览卡片
2. WHEN 用户长按考点行（移动端） THEN the 系统 SHALL 显示快速预览卡片
3. WHEN 显示快速预览卡片 THEN the 系统 SHALL 包含：考点标题、核心记忆点（前3条）、历年考查年份、"查看详情"按钮
4. WHEN 用户点击预览卡片外部 THEN the 系统 SHALL 关闭预览卡片
5. WHEN 用户点击"查看详情"按钮 THEN the 系统 SHALL 跳转到考点详情页

### Requirement 3: 高频考点快速筛选

**User Story:** As a 备考用户, I want to 一键筛选出所有高频考点, so that 我能优先学习最重要的内容。

#### Acceptance Criteria

1. WHEN 用户访问知识图谱首页 THEN the 系统 SHALL 在页面顶部提供"只看高频考点"筛选开关
2. WHEN 用户开启高频筛选 THEN the 系统 SHALL 仅显示包含高频考点的章节和小节
3. WHEN 用户开启高频筛选 THEN the 系统 SHALL 在考点列表中仅显示高频考点
4. WHEN 显示筛选结果 THEN the 系统 SHALL 显示筛选后的考点数量（如"共筛选出32个高频考点"）
5. WHEN 用户关闭高频筛选 THEN the 系统 SHALL 恢复显示所有考点

### Requirement 4: 章节/小节进度可视化

**User Story:** As a 备考用户, I want to 在章节和小节标题旁看到学习进度, so that 我能快速了解哪些内容已学完、哪些还需要学习。

#### Acceptance Criteria

1. WHEN 显示章节标题 THEN the 系统 SHALL 在标题右侧显示进度条和百分比（如"60%"）
2. WHEN 显示小节标题 THEN the 系统 SHALL 在标题右侧显示进度指示（如"3/5考点"）
3. WHEN 章节/小节完成度为100% THEN the 系统 SHALL 显示绿色勾选图标
4. WHEN 章节/小节完成度为0% THEN the 系统 SHALL 显示灰色未开始图标
5. WHEN 章节/小节完成度在1%-99%之间 THEN the 系统 SHALL 显示蓝色进行中图标和进度条

### Requirement 5: 全局搜索直达考点

**User Story:** As a 备考用户, I want to 通过搜索直接找到并跳转到考点, so that 我能快速定位到想学习的内容。

#### Acceptance Criteria

1. WHEN 用户访问知识图谱首页 THEN the 系统 SHALL 在页面顶部显示搜索框
2. WHEN 用户输入搜索关键词 THEN the 系统 SHALL 实时显示匹配的考点列表
3. WHEN 显示搜索结果 THEN the 系统 SHALL 显示考点标题、所属章节/小节路径、高频标签
4. WHEN 用户点击搜索结果 THEN the 系统 SHALL 直接跳转到考点详情页
5. WHEN 搜索无结果 THEN the 系统 SHALL 显示"未找到相关考点"提示

### Requirement 6: 考点详情页内容聚合

**User Story:** As a 备考用户, I want to 在考点详情页看到该考点的所有学习内容, so that 我能在一个页面完成对该考点的学习。

#### Acceptance Criteria

1. WHEN 用户访问考点详情页 THEN the 系统 SHALL 在页面顶部显示面包屑导航（知识图谱 > 章节 > 小节 > 考点）
2. WHEN 显示考点详情页 THEN the 系统 SHALL 按以下顺序展示内容模块：考点简介→核心记忆点→作用机制→临床应用→不良反应→禁忌→药物相互作用→记忆口诀
3. WHEN 某内容模块为空 THEN the 系统 SHALL 跳过该模块不显示
4. WHEN 显示考点详情页 THEN the 系统 SHALL 在右侧（桌面端）或底部（移动端）显示"同小节其他考点"导航
5. WHEN 显示考点详情页 THEN the 系统 SHALL 在页面底部提供"上一考点"和"下一考点"导航按钮
6. WHEN 用户点击面包屑中的章节或小节 THEN the 系统 SHALL 跳转到首页并自动展开对应章节/小节

### Requirement 7: 学习进度统计区

**User Story:** As a 备考用户, I want to 在首页看到我的整体学习进度, so that 我能了解自己的学习状态。

#### Acceptance Criteria

1. WHEN 用户访问知识图谱首页 THEN the 系统 SHALL 在页面顶部显示学习进度统计区
2. WHEN 显示进度统计区 THEN the 系统 SHALL 显示：总考点数、已学习数、已掌握数、待复习数
3. WHEN 显示进度统计区 THEN the 系统 SHALL 显示整体完成度百分比和进度条
4. WHEN 用户有待复习考点 THEN the 系统 SHALL 显示"去复习"快捷按钮
5. WHEN 用户点击统计数字 THEN the 系统 SHALL 筛选显示对应状态的考点

### Requirement 8: 移动端单页适配

**User Story:** As a 移动端用户, I want to 在手机上也能流畅浏览三级信息, so that 我能随时随地学习。

#### Acceptance Criteria

1. WHEN 用户在移动端访问首页 THEN the 系统 SHALL 使用全宽手风琴布局
2. WHEN 用户在移动端访问首页 THEN the 系统 SHALL 将搜索框改为可展开的搜索图标
3. WHEN 用户在移动端访问首页 THEN the 系统 SHALL 将进度统计区改为可左右滑动的紧凑模块
4. WHEN 用户在移动端点击考点行 THEN the 系统 SHALL 直接跳转到详情页（不显示悬停预览）
5. WHEN 用户在移动端长按考点行 THEN the 系统 SHALL 显示向上浮层预览卡片，带关闭按钮
6. WHEN 用户在移动端访问 THEN the 系统 SHALL 手风琴默认只展开"当前正在学的小节"
7. WHEN 用户在移动端访问 THEN the 系统 SHALL 确保所有可点击元素的触摸区域不小于44x44像素

### Requirement 9: 状态保持与上下文恢复

**User Story:** As a 备考用户, I want to 从详情页返回首页时自动定位到我刚才学习的位置, so that 我不需要重新寻找学习位置。

#### Acceptance Criteria

1. WHEN 用户从考点详情页返回首页 THEN the 系统 SHALL 自动展开该考点所在的章节和小节
2. WHEN 用户从考点详情页返回首页 THEN the 系统 SHALL 高亮显示刚才访问的考点行
3. WHEN 用户从考点详情页返回首页 THEN the 系统 SHALL 自动滚动到该考点位置
4. WHEN 用户刷新首页 THEN the 系统 SHALL 恢复上次的手风琴展开状态（存储在localStorage）
5. WHEN 用户通过URL锚点访问首页 THEN the 系统 SHALL 自动展开并定位到指定位置

### Requirement 10: 最近学习区块

**User Story:** As a 备考用户, I want to 在首页看到我最近学习的内容, so that 我能快速恢复学习上下文。

#### Acceptance Criteria

1. WHEN 用户访问知识图谱首页 THEN the 系统 SHALL 在页面顶部显示"最近学习"区块
2. WHEN 显示最近学习区块 THEN the 系统 SHALL 显示最近访问的5个考点（标题+所属小节+访问时间）
3. WHEN 显示最近学习区块 THEN the 系统 SHALL 显示"正在学习"的小节（如有）
4. WHEN 用户点击最近学习的考点 THEN the 系统 SHALL 直接跳转到该考点详情页
5. WHEN 用户无学习记录 THEN the 系统 SHALL 显示"开始你的第一次学习"引导

### Requirement 11: 线性学习路线模式

**User Story:** As a 备考用户, I want to 有一个"从头开始学习"的模式, so that 我不需要自己选择下一个学习内容，系统自动引导我按顺序学习。

#### Acceptance Criteria

1. WHEN 用户访问知识图谱首页 THEN the 系统 SHALL 提供"开始顺序学习"按钮
2. WHEN 用户点击"开始顺序学习" THEN the 系统 SHALL 跳转到第一个未完成的考点详情页
3. WHEN 用户在详情页完成学习 THEN the 系统 SHALL 显示"下一个考点"按钮，点击自动跳转到下一个未完成考点
4. WHEN 用户完成一个小节的所有考点 THEN the 系统 SHALL 显示小节完成动画和鼓励文案
5. WHEN 用户完成所有考点 THEN the 系统 SHALL 显示"恭喜完成全部学习"页面
6. WHEN 用户中途退出顺序学习 THEN the 系统 SHALL 记录当前位置，下次可继续

### Requirement 12: 收藏与复习标记

**User Story:** As a 备考用户, I want to 收藏重要考点并标记需要复习的内容, so that 我能建立自己的复习清单。

#### Acceptance Criteria

1. WHEN 用户在考点详情页 THEN the 系统 SHALL 提供"收藏"按钮
2. WHEN 用户在考点详情页 THEN the 系统 SHALL 提供"标记为需复习"按钮
3. WHEN 用户收藏或标记考点 THEN the 系统 SHALL 在首页考点行显示对应图标
4. WHEN 用户访问知识图谱首页 THEN the 系统 SHALL 提供"只看收藏"和"只看待复习"筛选选项
5. WHEN 显示筛选结果 THEN the 系统 SHALL 显示筛选后的考点数量
6. WHEN 用户点击收藏/标记图标 THEN the 系统 SHALL 切换收藏/标记状态

### Requirement 13: 多维度筛选增强

**User Story:** As a 备考用户, I want to 按多个维度筛选考点, so that 我能找到最适合当前学习阶段的内容。

#### Acceptance Criteria

1. WHEN 用户访问知识图谱首页 THEN the 系统 SHALL 提供多维度筛选面板
2. WHEN 显示筛选面板 THEN the 系统 SHALL 支持按标签筛选：高频、必考、易错、基础、强化（可多选）
3. WHEN 显示筛选面板 THEN the 系统 SHALL 支持按难度筛选：基础、进阶、冲刺
4. WHEN 显示筛选面板 THEN the 系统 SHALL 支持按学习状态筛选：未学习、学习中、已掌握、待复习
5. WHEN 用户选择多个筛选条件 THEN the 系统 SHALL 显示同时满足所有条件的考点
6. WHEN 显示筛选结果 THEN the 系统 SHALL 实时更新匹配的考点数量

### Requirement 14: 搜索增强

**User Story:** As a 备考用户, I want to 搜索时能找到章节、小节和考点, so that 我能快速定位到任何层级的内容。

#### Acceptance Criteria

1. WHEN 用户输入搜索关键词 THEN the 系统 SHALL 支持拼音模糊搜索
2. WHEN 用户输入搜索关键词 THEN the 系统 SHALL 支持考点别名/关联词搜索
3. WHEN 显示搜索结果 THEN the 系统 SHALL 分类显示：考点（主结果）、小节、章节
4. WHEN 用户点击小节搜索结果 THEN the 系统 SHALL 跳转到首页并展开该小节
5. WHEN 用户点击章节搜索结果 THEN the 系统 SHALL 跳转到首页并展开该章节
6. WHEN 显示搜索结果 THEN the 系统 SHALL 高亮匹配的关键词

### Requirement 15: 详情页内容增强

**User Story:** As a 备考用户, I want to 在考点详情页看到相关考点和易混点对比, so that 我能建立知识点之间的联系。

#### Acceptance Criteria

1. WHEN 显示考点详情页 THEN the 系统 SHALL 在内容区显示"知识点结构图"（如有）
2. WHEN 显示考点详情页 THEN the 系统 SHALL 在底部显示"相关考点"链接列表
3. WHEN 显示考点详情页 THEN the 系统 SHALL 显示"易混点对比"卡片（如有）
4. WHEN 用户点击相关考点 THEN the 系统 SHALL 跳转到对应考点详情页
5. WHEN 显示考点详情页 THEN the 系统 SHALL 在顶部显示该考点的标签（高频/必考/易错等）

### Requirement 16: 首页性能优化

**User Story:** As a 备考用户, I want to 首页加载速度快, so that 我能快速开始学习而不需要等待。

#### Acceptance Criteria

1. WHEN 首页加载 THEN the 系统 SHALL 仅加载章节和小节的结构数据，不加载考点列表
2. WHEN 用户展开小节 THEN the 系统 SHALL 懒加载该小节的考点列表
3. WHEN 首页加载 THEN the 系统 SHALL 首屏加载时间不超过2秒
4. WHEN 用户展开手风琴 THEN the 系统 SHALL 展开动画流畅，响应时间不超过300ms
5. WHEN 首页渲染 THEN the 系统 SHALL 使用虚拟滚动优化大量考点的渲染性能

