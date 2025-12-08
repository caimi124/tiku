# Requirements Document

## Introduction

本功能旨在整合执业药师西药药二（药学专业知识二）的知识图谱数据，将分散在多个JSON文件（50-100页、101-150页、151-200页、201-222页）中的知识点数据进行合并、清洗，导入到数据库中，并在前端知识页面进行展示。这些数据包含章节、小节、考点梳理、考点透析等层级结构，是执业药师考试备考的核心内容。

## Glossary

- **Knowledge_Tree**: 知识树数据库表，存储知识图谱的层级结构数据
- **Chapter**: 章节，知识图谱的一级节点（如"第七章 泌尿系统用药"）
- **Section**: 小节，知识图谱的二级节点（如"第三节 治疗良性前列腺增生用药"）
- **Point**: 知识点/考点，知识图谱的三级节点（如"考点1: 药物分类与作用机制"）
- **Subject_Code**: 科目代码，用于区分不同科目的知识数据（西药药二为 `xiyao_yaoxue_er`）
- **Mnemonic**: 口诀/巧记，帮助记忆的助记内容（如"【润德巧记】"）
- **考点梳理**: 考点概览，包含考查年份等信息
- **考点透析**: 考点详细内容，包含药理作用、临床应用、不良反应等

## Requirements

### Requirement 1

**User Story:** As a developer, I want to merge multiple JSON files into a single consolidated dataset, so that I can have a complete knowledge graph for the entire subject.

#### Acceptance Criteria

1. WHEN the system processes the JSON files THEN the system SHALL read all four source files (50-100页, 101-150页, 151-200页, 201-222页)
2. WHEN merging chapter data THEN the system SHALL combine chapters with the same chapter_number into a single chapter entry
3. WHEN merging section data THEN the system SHALL preserve all sections from each source file without duplication
4. WHEN the merge is complete THEN the system SHALL output a single consolidated JSON file containing all knowledge data
5. WHEN processing the merged data THEN the system SHALL validate that no data is lost during the merge process

### Requirement 2

**User Story:** As a developer, I want to transform the JSON data into database records, so that the knowledge graph can be stored and queried efficiently.

#### Acceptance Criteria

1. WHEN importing chapter data THEN the system SHALL create a knowledge_tree record with node_type='chapter' and level=1
2. WHEN importing section data THEN the system SHALL create a knowledge_tree record with node_type='section' and level=2 with correct parent_id reference
3. WHEN importing knowledge point data THEN the system SHALL create a knowledge_tree record with node_type='point' and level=3 with correct parent_id reference
4. WHEN generating node codes THEN the system SHALL follow the pattern C{chapter}.{section}.{point} (e.g., C7.3.1)
5. WHEN extracting mnemonics THEN the system SHALL identify and store content marked with 【润德巧记】 or similar patterns
6. WHEN calculating importance THEN the system SHALL assign higher importance (4-5) to content containing 禁用, 禁忌, or 不良反应

### Requirement 3

**User Story:** As a user, I want to view the complete knowledge graph on the frontend, so that I can study all the knowledge points for the exam.

#### Acceptance Criteria

1. WHEN a user navigates to the knowledge page THEN the system SHALL display all chapters in the correct order
2. WHEN a user expands a chapter THEN the system SHALL display all sections within that chapter
3. WHEN a user selects a section THEN the system SHALL display all knowledge points within that section
4. WHEN displaying knowledge point content THEN the system SHALL render tables, text, and images correctly
5. WHEN displaying mnemonics THEN the system SHALL highlight them with a distinct visual style

### Requirement 4

**User Story:** As a developer, I want to ensure data integrity during the import process, so that no knowledge content is corrupted or lost.

#### Acceptance Criteria

1. WHEN the import process starts THEN the system SHALL begin a database transaction
2. IF any error occurs during import THEN the system SHALL rollback the entire transaction
3. WHEN the import completes successfully THEN the system SHALL commit the transaction and log statistics
4. WHEN verifying the import THEN the system SHALL compare the count of imported nodes against expected counts
5. WHEN handling Chinese chapter numbers THEN the system SHALL correctly convert them to Arabic numerals (e.g., 七 → 7)

### Requirement 5

**User Story:** As a user, I want to search for specific knowledge points, so that I can quickly find the information I need.

#### Acceptance Criteria

1. WHEN a user enters a search query THEN the system SHALL search across all knowledge point titles and content
2. WHEN displaying search results THEN the system SHALL show the matching knowledge points with their chapter and section context
3. WHEN a user clicks a search result THEN the system SHALL navigate to that knowledge point's detail view
