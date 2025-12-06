# Requirements Document

## Introduction

智能药学学习系统是一个面向执业药师考试备考的个性化学习平台。系统通过分析用户的学习行为和答题数据，识别用户的知识薄弱点，结合高频考点分析，为用户提供个性化的学习路径和复习建议。核心目标是帮助用户高效备考，提升考试通过率。

## Glossary

- **考点(Knowledge Point)**: 药学考试中的最小知识单元，包含适应证、禁忌、不良反应等具体内容
- **掌握度(Mastery Score)**: 用户对某个考点的掌握程度，基于答题正确率和学习时间计算，范围0-100
- **高频考点(High-Frequency Point)**: 历年考试中出现频率较高的考点，重要性等级为4-5星
- **薄弱点(Weak Point)**: 用户掌握度低于60%的考点
- **学习路径(Learning Path)**: 系统根据用户掌握情况生成的个性化学习顺序
- **艾宾浩斯遗忘曲线(Ebbinghaus Forgetting Curve)**: 用于计算最佳复习时间的记忆衰减模型
- **知识图谱(Knowledge Graph)**: 展示药物、考点、章节之间关联关系的可视化结构

## Requirements

### Requirement 1: 考点数据结构化存储

**User Story:** As a 系统管理员, I want to 将药学教材内容结构化存储, so that 系统能够精准识别和推荐考点。

#### Acceptance Criteria

1. WHEN 导入药学教材内容 THEN the 系统 SHALL 提取并存储以下字段：考点ID、考点标题、考点类型、详细内容、所属药物、药物分类、记忆口诀、重点等级
2. WHEN 提取适应证内容 THEN the 系统 SHALL 按浓度或类型分类存储，并标记是否为高频考查点
3. WHEN 提取不良反应内容 THEN the 系统 SHALL 按严重程度分类为常见、严重、预防措施三类
4. WHEN 提取对比表格 THEN the 系统 SHALL 保留表格结构，存储表头、行数据和对比维度
5. WHEN 计算考点重要性等级 THEN the 系统 SHALL 基于关键词（首选、禁忌、相互作用等）自动评定1-5星等级

### Requirement 2: 用户学习数据跟踪

**User Story:** As a 备考用户, I want to 系统记录我的学习行为, so that 我能了解自己的学习进度和薄弱环节。

#### Acceptance Criteria

1. WHEN 用户完成一道练习题 THEN the 系统 SHALL 记录考点ID、是否正确、答题用时、答题时间戳
2. WHEN 用户答题记录更新 THEN the 系统 SHALL 重新计算该考点的掌握度分数
3. WHEN 考点掌握度低于60% THEN the 系统 SHALL 将该考点标记为薄弱点
4. WHEN 用户查看学习统计 THEN the 系统 SHALL 显示总学习时长、总正确率、各章节掌握度百分比
5. IF 用户超过7天未复习某考点 THEN the 系统 SHALL 根据艾宾浩斯遗忘曲线降低该考点的掌握度分数

### Requirement 3: 掌握度分析仪表盘

**User Story:** As a 备考用户, I want to 在仪表盘上直观看到我的学习状态, so that 我能快速了解需要重点复习的内容。

#### Acceptance Criteria

1. WHEN 用户访问仪表盘页面 THEN the 系统 SHALL 显示总体掌握度百分比、本周学习时长、总体正确率
2. WHEN 显示章节掌握情况 THEN the 系统 SHALL 以进度条形式展示每章节的掌握度百分比
3. WHEN 显示高频考点掌握情况 THEN the 系统 SHALL 列出Top 10高频考点，标注掌握状态（已掌握/需复习/未掌握）和考查频率星级
4. WHEN 显示薄弱环节分析 THEN the 系统 SHALL 按考点类型（药物相互作用、特殊人群用药等）统计正确率
5. WHEN 用户点击某章节进度条 THEN the 系统 SHALL 展开显示该章节下所有考点的掌握详情

### Requirement 4: 知识点卡片展示

**User Story:** As a 备考用户, I want to 以卡片形式查看考点详情, so that 我能快速复习和标记学习状态。

#### Acceptance Criteria

1. WHEN 显示知识点卡片 THEN the 系统 SHALL 包含药物名称、重要性星级、掌握度标签、结构化内容（适应证、禁忌、不良反应等）
2. WHEN 卡片内容项已被测试过 THEN the 系统 SHALL 显示该内容项的正确率百分比
3. WHEN 卡片包含记忆口诀 THEN the 系统 SHALL 在卡片底部突出显示口诀内容
4. WHEN 用户点击"标记为需复习"按钮 THEN the 系统 SHALL 将该考点加入复习队列并更新优先级
5. WHEN 用户点击"专项练习"按钮 THEN the 系统 SHALL 跳转到该考点的专项练习页面

### Requirement 5: 智能复习推荐

**User Story:** As a 备考用户, I want to 获得个性化的复习建议, so that 我能高效利用学习时间。

#### Acceptance Criteria

1. WHEN 用户访问复习推荐页面 THEN the 系统 SHALL 基于艾宾浩斯遗忘曲线显示今日重点复习考点列表
2. WHEN 生成薄弱考点专项训练 THEN the 系统 SHALL 按考点类型分组，显示题目数量和预计用时
3. WHEN 生成高频考点巩固列表 THEN the 系统 SHALL 显示近5年考查最多的考点，标注已掌握和需复习数量
4. WHEN 推荐模拟测试 THEN the 系统 SHALL 根据用户薄弱章节推荐对应的章节测试，显示题目数量和预计时间
5. WHEN 用户掌握度低于70%且考点重要性大于等于4星 THEN the 系统 SHALL 将该考点列入立即复习列表

### Requirement 6: 知识图谱可视化

**User Story:** As a 备考用户, I want to 通过图谱查看药物和考点的关联关系, so that 我能建立系统的知识体系。

#### Acceptance Criteria

1. WHEN 用户访问知识图谱页面 THEN the 系统 SHALL 以节点和连线形式展示药物、适应证、禁忌证、相互作用的关联关系
2. WHEN 用户点击药物节点 THEN the 系统 SHALL 显示该药物的掌握度、练习次数、正确率
3. WHEN 用户点击考点类型节点（如禁忌证） THEN the 系统 SHALL 显示用户在该类型考点的错误率和复习建议
4. WHEN 用户点击相互作用连线 THEN the 系统 SHALL 显示相关考题和解析
5. WHEN 展开药物节点 THEN the 系统 SHALL 显示该药物下所有考点类型的子节点

### Requirement 7: 学习进度热力图

**User Story:** As a 备考用户, I want to 查看学习活动热力图, so that 我能了解自己的学习规律和持续性。

#### Acceptance Criteria

1. WHEN 用户访问学习记录页面 THEN the 系统 SHALL 以日历热力图形式展示近30天的学习活动
2. WHEN 渲染热力图单元格 THEN the 系统 SHALL 根据当日正确率使用不同颜色：绿色大于80%、黄色60-80%、红色小于60%
3. WHEN 用户点击热力图某一天 THEN the 系统 SHALL 显示当天学习详情：学习时长、各章节练习情况、正确率
4. WHEN 显示学习详情 THEN the 系统 SHALL 标注需重点复习的考点（正确率低于60%的考点）
5. WHEN 用户连续7天有学习记录 THEN the 系统 SHALL 显示连续学习天数徽章

### Requirement 8: 数据抓取与导入

**User Story:** As a 系统管理员, I want to 使用Python脚本自动提取教材内容, so that 我能快速构建考点数据库。

#### Acceptance Criteria

1. WHEN 执行数据抓取脚本 THEN the 系统 SHALL 使用正则表达式提取章节、考点、表格等结构化内容
2. WHEN 提取适应证内容 THEN the 系统 SHALL 识别浓度相关适应证和列表形式适应证两种格式
3. WHEN 提取对比表格 THEN the 系统 SHALL 保留表头和行数据的对应关系
4. WHEN 计算重要性等级 THEN the 系统 SHALL 基于高频关键词（首选、禁忌、相互作用等）自动评分
5. WHEN 导出提取结果 THEN the 系统 SHALL 以JSON格式保存，每章节一个文件
