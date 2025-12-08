# Implementation Plan

- [x] 1. Set up project structure and database schema




  - [ ] 1.1 Create database migration for expert_driver_content table
    - Create SQL migration file with expert_driver_content table schema
    - Include indexes for knowledge_point_id and style_variant

    - Add UNIQUE constraint on (knowledge_point_id, style_variant)
    - _Requirements: 3.1, 3.2_
  - [x] 1.2 Create database migration for prompt_templates table

    - Create SQL migration file with prompt_templates table schema
    - Include version uniqueness constraint
    - _Requirements: 8.1, 8.2, 8.3_


  - [ ] 1.3 Create database migration for review_queue table
    - Create SQL migration file with review_queue table schema




    - Include status index for efficient querying
    - _Requirements: 9.7, 10.3_


  - [ ] 1.4 Execute database migrations
    - Run migrations against Supabase database
    - Verify table creation and constraints



    - _Requirements: 3.1_


- [ ] 2. Implement core data types and schema validation
  - [x] 2.1 Create TypeScript interfaces for ExpertDriverContent

    - Define ExpertDriverContent, TrapAnalysis, PredictionQuestion interfaces
    - Define StyleVariant type and StyleCheckResult interface

    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 2.2 Write property test for schema validation completeness

    - **Property 1: Schema Validation Completeness**
    - **Validates: Requirements 1.1, 1.7**

  - [ ] 2.3 Implement JSON schema validator using Ajv
    - Create schema-validator.ts with validateSchema function


    - Implement the JSON schema from design document




    - _Requirements: 1.1, 3.3_
  - [ ] 2.4 Write property test for trap analysis array bounds
    - **Property 2: Trap Analysis Array Bounds**

    - **Validates: Requirements 1.2, 7.1, 7.3**
  - [x] 2.5 Write property test for prediction questions array bounds

    - **Property 3: Prediction Questions Array Bounds**
    - **Validates: Requirements 1.3, 7.2**

  - [ ] 2.6 Write property test for summary length constraint
    - **Property 4: Summary Length Constraint**

    - **Validates: Requirements 1.4**
  - [x] 2.7 Write property test for version format validation

    - **Property 5: Version Format Validation**
    - **Validates: Requirements 1.5**




  - [ ] 2.8 Write property test for style variant enum validation
    - **Property 6: Style Variant Enum Validation**
    - **Validates: Requirements 1.6**
  - [x] 2.9 Write property test for short summary length constraint

    - **Property 7: Short Summary Length Constraint**
    - **Validates: Requirements 1.8**

- [x] 3. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.


- [ ] 4. Implement style validation
  - [x] 4.1 Create StyleValidator class



    - Implement validateStyle method

    - Implement checkForbiddenPatterns method
    - Implement validateTrapAnalysis method

    - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.1, 9.2, 9.3, 9.4, 9.5_
  - [x] 4.2 Write property test for mnemonic line count constraint

    - **Property 9: Mnemonic Line Count Constraint**
    - **Validates: Requirements 2.4, 9.4**

  - [ ] 4.3 Write property test for trap analysis character limit
    - **Property 10: Trap Analysis Character Limit**

    - **Validates: Requirements 2.6, 11.2**
  - [x] 4.4 Write property test for forbidden pattern detection

    - **Property 11: Forbidden Pattern Detection**
    - **Validates: Requirements 2.7, 9.5, 11.3**



  - [-] 4.5 Write property test for style check object generation

    - **Property 19: Style Check Object Generation**
    - **Validates: Requirements 9.2, 9.3, 9.6**


- [x] 5. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.


- [x] 6. Implement Prompt Template Manager

  - [ ] 6.1 Create PromptTemplateManager class
    - Implement getCurrentTemplate method

    - Implement getTemplateByVersion method
    - Implement validateOutput method
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 6.2 Create initial prompt template (v1.0)

    - Define system_prompt with老司机风格规则
    - Define user_prompt_template for knowledge point input

    - Include complete JSON schema in template
    - Define forbidden_patterns list

    - _Requirements: 8.1, 8.2, 8.3, 11.1_
  - [x] 6.3 Write property test for prompt template version tracking




    - **Property 17: Prompt Template Version Tracking**
    - **Validates: Requirements 8.5**

  - [ ] 6.4 Write property test for template version increment
    - **Property 18: Template Version Increment**
    - **Validates: Requirements 8.6**


- [x] 7. Implement Retry Manager

  - [ ] 7.1 Create RetryManager class
    - Implement executeWithRetry method with 2-5 retry bounds
    - Implement addToReviewQueue method
    - Implement retry logging

    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 7.2 Write property test for retry count bounds
    - **Property 21: Retry Count Bounds**
    - **Validates: Requirements 10.1, 10.2**
  - [ ] 7.3 Write property test for max retry queue insertion
    - **Property 22: Max Retry Queue Insertion**


    - **Validates: Requirements 10.3**
  - [x] 7.4 Write property test for retry trigger conditions




    - **Property 23: Retry Trigger Conditions**
    - **Validates: Requirements 10.4, 10.5, 11.6**

  - [ ] 7.5 Write property test for retry attempt logging
    - **Property 24: Retry Attempt Logging**
    - **Validates: Requirements 10.6**


- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 9. Implement Content Generator

  - [ ] 9.1 Create ContentGenerator class
    - Implement generate method with AI API integration

    - Implement generateBatch method for batch processing
    - Integrate with PromptTemplateManager, StyleValidator, RetryManager
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_


  - [ ] 9.2 Write property test for content generation schema conformance
    - **Property 8: Content Generation Schema Conformance**
    - **Validates: Requirements 2.1**

- [ ] 10. Implement database operations
  - [ ] 10.1 Create expert-driver repository
    - Implement save method with upsert behavior
    - Implement getByKnowledgePointId method
    - Implement getByStyleVariant method
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ] 10.2 Write property test for storage upsert behavior
    - **Property 12: Storage Upsert Behavior**
    - **Validates: Requirements 3.1, 3.2**
  - [ ] 10.3 Write property test for pre-save validation
    - **Property 13: Pre-Save Validation**
    - **Validates: Requirements 3.3**
  - [ ] 10.4 Create review queue repository
    - Implement addToQueue method
    - Implement getByStatus method
    - Implement updateStatus method
    - _Requirements: 9.7, 10.3_
  - [ ] 10.5 Write property test for failed style check queue insertion
    - **Property 20: Failed Style Check Queue Insertion**
    - **Validates: Requirements 9.7**

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement API endpoints
  - [ ] 12.1 Create GET /api/expert-driver/[pointId] endpoint
    - Return complete ExpertDriverContent or empty response
    - Handle not found cases
    - _Requirements: 5.1_
  - [ ] 12.2 Write property test for API response format
    - **Property 14: API Response Format**
    - **Validates: Requirements 5.1**
  - [ ] 12.3 Create POST /api/expert-driver/generate endpoint
    - Accept knowledge point text and style variant
    - Validate input and return generated content or errors
    - _Requirements: 5.2, 5.3_
  - [ ] 12.4 Write property test for API validation error messages
    - **Property 15: API Validation Error Messages**
    - **Validates: Requirements 5.2, 5.3**
  - [ ] 12.5 Create POST /api/expert-driver/batch-import endpoint
    - Accept array of content objects
    - Process each item and return summary report
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 12.6 Write property test for batch import partial failure handling
    - **Property 16: Batch Import Partial Failure Handling**
    - **Validates: Requirements 6.1, 6.2, 6.3, 10.7**
  - [ ] 12.7 Create POST /api/expert-driver/validate endpoint
    - Accept content object and return validation result
    - Return detailed error messages for failures
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement frontend components
  - [ ] 14.1 Create ExpertDriverPanel component
    - Display expert driver content in visually distinct panel
    - Handle loading and empty states
    - _Requirements: 4.1_
  - [ ] 14.2 Create TrapAnalysisCard component
    - Render trap analysis as expandable card
    - Display 标题, 出题套路, 坑在哪里, 老司机技巧
    - Conditionally display 口诀 and 场景化记忆
    - _Requirements: 4.2_
  - [ ] 14.3 Create MnemonicBlock component
    - Render 口诀 in highlighted code block format
    - _Requirements: 4.3_
  - [ ] 14.4 Create MindMapBlock component
    - Render 终极思维导图 as formatted code block
    - _Requirements: 4.4_
  - [ ] 14.5 Create PredictionQuestionCard component
    - Display questions with reveal answer interaction
    - _Requirements: 4.5_
  - [ ] 14.6 Integrate ExpertDriverPanel into knowledge point page
    - Fetch and display expert driver content
    - Handle API errors gracefully
    - _Requirements: 4.1_

- [ ] 15. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

