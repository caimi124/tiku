# Requirements Document

## Introduction

"老司机带路"是一个为执业药师考试题库生成专业且有趣解析内容的功能模块。该功能模拟一位经验丰富的考试辅导老师，以诙谐但专业的语气，帮助考生理解考点、识别出题套路、掌握应试技巧。内容包括坑位解析、口诀记忆、场景化联想、押题预测等，旨在提高考生的学习效率和应试能力。

## Glossary

- **老司机模式 (Expert_Driver_Mode)**: 一种特殊的知识点解析风格，强调应试策略和易错点分析
- **坑位解析 (Trap_Analysis)**: 针对出题人常用的陷阱和考生易错点的详细分析
- **口诀 (Mnemonic)**: 便于记忆的短语或韵文，帮助快速记忆关键知识点
- **场景化记忆 (Scenario_Memory)**: 通过生动的场景描述帮助考生建立知识点联想
- **押题预测 (Prediction_Questions)**: 基于考点分析生成的模拟题目
- **知识点 (Knowledge_Point)**: 题库中的最小学习单元，包含特定的考试内容
- **Expert_Tips_Table**: 数据库中存储老司机模式内容的表
- **Prompt_Template**: AI生成内容时使用的标准化提示词模板
- **Style_Compliance**: 内容风格一致性检查机制
- **Content_Version**: 老司机内容的版本标识
- **Style_Variant**: 内容风格变体（如完整版、精简版、移动端版）
- **Retry_Mechanism**: AI生成失败时的自动重试机制
- **Forbidden_Patterns**: 内容生成时禁止出现的模式或表达

## Requirements

### Requirement 1: 老司机内容数据结构

**User Story:** 作为系统开发者，我希望有一个标准化的数据结构来存储老司机模式内容，以便内容可以被一致地存储、检索和展示。

#### Acceptance Criteria

1. THE Expert_Driver_Mode SHALL define a JSON schema containing fields: 考点名称, 坑位解析, 应试战术, 押题预测, 终极思维导图, 一句话极速总结, version, style_variant, source_knowledge_point_text
2. WHEN storing 坑位解析 THEN the Expert_Driver_Mode SHALL support an array of 3-6 trap analysis objects, each containing required fields (标题, 出题套路, 坑在哪里, 老司机技巧) and optional fields (口诀, 场景化记忆), where at least one of 口诀 or 场景化记忆 is present
3. WHEN storing 押题预测 THEN the Expert_Driver_Mode SHALL support an array of 2-4 prediction question objects, each containing: 题干, 正确答案, 理由
4. THE Expert_Driver_Mode SHALL validate that 一句话极速总结 contains 10-20 characters
5. THE Expert_Driver_Mode SHALL include a version field with format "vX.Y" to support content versioning
6. THE Expert_Driver_Mode SHALL include a style_variant field with values: "default", "compact", "mobile", "video_script"
7. THE Expert_Driver_Mode SHALL include a source_knowledge_point_text field to store the original knowledge point text for traceability
8. THE Expert_Driver_Mode SHALL include an optional short_summary field (50 characters max) for mobile-friendly quick reading

### Requirement 2: 老司机内容生成

**User Story:** 作为内容管理员，我希望能够基于知识点自动生成老司机模式解析内容，以便快速为题库添加高质量的辅导材料。

#### Acceptance Criteria

1. WHEN a user provides a knowledge point text THEN the Expert_Driver_Mode SHALL generate content following the standardized JSON structure
2. WHEN generating 坑位解析 THEN the Expert_Driver_Mode SHALL emphasize "出题人喜欢挖坑" and "考生容易掉坑" perspectives
3. WHEN the knowledge point contains numerical data THEN the Expert_Driver_Mode SHALL generate a numerical mnemonic or highlight numerical traps
4. WHEN generating 口诀 THEN the Expert_Driver_Mode SHALL produce short, memorable phrases (3 lines or fewer) using code block format
5. WHEN generating content THEN the Expert_Driver_Mode SHALL use short sentences and multiple paragraphs to avoid dense text blocks
6. WHEN generating content THEN the Expert_Driver_Mode SHALL limit each 坑位解析 item to 300 characters maximum
7. WHEN generating content THEN the Expert_Driver_Mode SHALL avoid academic-style expressions like "首先、其次、总之"

### Requirement 8: Prompt模板规范

**User Story:** 作为系统架构师，我希望有一个统一的Prompt模板规范，以便AI生成的内容风格保持一致，不会因工程师或批次不同而产生偏差。

#### Acceptance Criteria

1. THE Expert_Driver_Mode SHALL define a unified System Prompt template that specifies: writing style, tone, module structure, and output format
2. THE Expert_Driver_Mode SHALL define a User Prompt template that specifies the input knowledge point format
3. THE Expert_Driver_Mode SHALL include the complete JSON schema specification within the Prompt template
4. WHEN generating content THEN the Expert_Driver_Mode SHALL use only the standardized Prompt template without freestyle modifications
5. THE Expert_Driver_Mode SHALL store the Prompt template version alongside generated content for reproducibility
6. WHEN the Prompt template is updated THEN the Expert_Driver_Mode SHALL increment the template version number

### Requirement 3: 老司机内容存储

**User Story:** 作为系统管理员，我希望老司机模式内容能够持久化存储到数据库，以便内容可以被检索和更新。

#### Acceptance Criteria

1. WHEN saving expert driver content THEN the Expert_Driver_Mode SHALL store the content in the Expert_Tips_Table linked to the corresponding knowledge point ID
2. WHEN a knowledge point already has expert driver content THEN the Expert_Driver_Mode SHALL update the existing record rather than create a duplicate
3. WHEN storing content THEN the Expert_Driver_Mode SHALL validate the JSON structure before persisting to the database

### Requirement 4: 老司机内容展示

**User Story:** 作为考生用户，我希望在学习知识点时能够查看老司机模式解析，以便更好地理解考点和掌握应试技巧。

#### Acceptance Criteria

1. WHEN a user views a knowledge point THEN the Expert_Driver_Mode SHALL display the expert driver content in a visually distinct panel
2. WHEN displaying 坑位解析 THEN the Expert_Driver_Mode SHALL render each trap analysis as an expandable card with clear visual hierarchy
3. WHEN displaying 口诀 THEN the Expert_Driver_Mode SHALL render the mnemonic in a highlighted code block format
4. WHEN displaying 终极思维导图 THEN the Expert_Driver_Mode SHALL render the content as a formatted code block with clear hierarchical structure
5. WHEN displaying 押题预测 THEN the Expert_Driver_Mode SHALL show questions in an interactive format where users can reveal answers

### Requirement 5: 老司机内容API

**User Story:** 作为前端开发者，我希望有标准化的API来获取和提交老司机模式内容，以便前端组件可以与后端数据交互。

#### Acceptance Criteria

1. WHEN requesting expert driver content for a knowledge point THEN the API SHALL return the complete JSON structure or an empty response if no content exists
2. WHEN submitting new expert driver content THEN the API SHALL validate the JSON structure and return appropriate success or error responses
3. WHEN the API encounters validation errors THEN the API SHALL return detailed error messages indicating which fields failed validation

### Requirement 6: 老司机内容批量导入

**User Story:** 作为内容管理员，我希望能够批量导入老司机模式内容，以便快速为多个知识点添加解析内容。

#### Acceptance Criteria

1. WHEN importing expert driver content in batch THEN the Expert_Driver_Mode SHALL accept an array of content objects with knowledge point identifiers
2. WHEN batch importing THEN the Expert_Driver_Mode SHALL validate each content object and report individual success or failure status
3. WHEN batch import encounters partial failures THEN the Expert_Driver_Mode SHALL continue processing remaining items and provide a summary report

### Requirement 7: 老司机内容质量保证

**User Story:** 作为内容审核员，我希望系统能够验证老司机模式内容的质量，以便确保内容符合标准格式和风格要求。

#### Acceptance Criteria

1. WHEN validating content THEN the Expert_Driver_Mode SHALL check that 坑位解析 contains between 3 and 6 items
2. WHEN validating content THEN the Expert_Driver_Mode SHALL check that 押题预测 contains between 2 and 4 items
3. WHEN validating content THEN the Expert_Driver_Mode SHALL check that each 坑位解析 item contains all required fields: 标题, 出题套路, 坑在哪里, 老司机技巧
4. WHEN validating 老司机技巧 THEN the Expert_Driver_Mode SHALL verify the content is concise and contains actionable advice

### Requirement 9: 风格一致性检查

**User Story:** 作为内容审核员，我希望系统能够自动检查内容的风格一致性，以便确保所有老司机模式内容保持统一的语气和表达方式。

#### Acceptance Criteria

1. WHEN validating style compliance THEN the Expert_Driver_Mode SHALL check that content uses "老司机视角" tone
2. WHEN validating style compliance THEN the Expert_Driver_Mode SHALL verify that each 坑位解析 contains "坑在哪里" analysis
3. WHEN validating style compliance THEN the Expert_Driver_Mode SHALL verify that content includes "出题套路" descriptions
4. WHEN validating style compliance THEN the Expert_Driver_Mode SHALL verify that 口诀 is formatted within 3 lines
5. WHEN validating style compliance THEN the Expert_Driver_Mode SHALL reject content containing forbidden patterns: "AI觉得", "可能", "本模型", "首先其次总之", clinical/textbook-style expansions, content unrelated to the knowledge point
6. WHEN validating style compliance THEN the Expert_Driver_Mode SHALL generate a style_check object with fields: is_driver_tone, has_traps, has_mnemonic, no_ai_artifacts, no_forbidden_patterns
7. WHEN style compliance check fails THEN the Expert_Driver_Mode SHALL flag the content for manual review with specific failure reasons

### Requirement 10: 自动重试机制

**User Story:** 作为系统管理员，我希望AI生成失败时系统能够自动重试，以便提高批量生成的成功率并减少人工干预。

#### Acceptance Criteria

1. WHEN AI output does not conform to JSON schema THEN the Expert_Driver_Mode SHALL automatically retry the generation request
2. WHEN retrying generation THEN the Expert_Driver_Mode SHALL attempt a minimum of 2 retries and a maximum of 5 retries
3. WHEN all retry attempts fail THEN the Expert_Driver_Mode SHALL add the content to a manual review queue
4. WHEN AI output is too long (exceeds field limits) THEN the Expert_Driver_Mode SHALL request regeneration with stricter length constraints
5. WHEN AI output is missing required fields THEN the Expert_Driver_Mode SHALL request regeneration with explicit field requirements
6. THE Expert_Driver_Mode SHALL log each retry attempt with failure reason for debugging purposes
7. WHEN batch processing THEN the Expert_Driver_Mode SHALL continue processing remaining items after individual failures and provide a summary report

### Requirement 11: 禁忌输出规则

**User Story:** 作为内容质量管理员，我希望系统能够自动过滤不符合规范的内容模式，以便确保生成的内容始终保持老司机风格。

#### Acceptance Criteria

1. THE Expert_Driver_Mode SHALL define a forbidden_patterns list containing: overly academic descriptions, content unrelated to the knowledge point, AI self-references, consecutive dense paragraphs
2. WHEN generating content THEN the Expert_Driver_Mode SHALL not output 坑位解析 items exceeding 300 characters
3. WHEN generating content THEN the Expert_Driver_Mode SHALL not use textbook-style connectors like "首先、其次、总之、综上所述"
4. WHEN generating content THEN the Expert_Driver_Mode SHALL not include pharmacological or clinical mechanism expansions beyond the given knowledge point
5. WHEN generating content THEN the Expert_Driver_Mode SHALL not reference information not provided in the input knowledge point
6. WHEN forbidden patterns are detected THEN the Expert_Driver_Mode SHALL trigger automatic regeneration

