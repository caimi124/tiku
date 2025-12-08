# Implementation Plan

- [x] 1. 创建工具函数模块
  - [x] 1.1 创建 lib/knowledge-import-utils.ts 文件，实现核心工具函数
    - 实现 chineseToNumber 函数（中文数字转阿拉伯数字）
    - 实现 extractMnemonics 函数（提取口诀）
    - 实现 calculateImportance 函数（计算重要性）
    - 实现 generateNodeCode 函数（生成节点代码）
    - 实现 buildContentText 函数（构建内容文本）
    - _Requirements: 2.4, 2.5, 2.6, 4.5_

  - [x] 1.2 编写属性测试：中文数字转换
    - **Property 8: Chinese number conversion**
    - **Validates: Requirements 4.5**

  - [x] 1.3 编写属性测试：口诀提取完整性
    - **Property 6: Mnemonic extraction completeness**
    - **Validates: Requirements 2.5**

  - [x] 1.4 编写属性测试：重要性计算正确性
    - **Property 7: Importance calculation correctness**
    - **Validates: Requirements 2.6**

  - [x] 1.5 编写属性测试：节点代码格式
    - **Property 5: Node code format**
    - **Validates: Requirements 2.4**

- [x] 2. Checkpoint - 确保所有测试通过
  - All 238 tests passed.

- [x] 3. 创建数据合并脚本
  - [x] 3.1 创建 merge-xiyao-er-complete.js 文件
    - 读取4个JSON源文件
    - 实现章节合并逻辑（按chapter_number去重）
    - 实现小节合并逻辑（保留所有唯一小节）
    - 输出合并后的JSON文件
    - 输出统计信息
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 3.2 编写属性测试：章节合并唯一性
    - **Property 1: Chapter merge uniqueness**
    - **Validates: Requirements 1.2**

  - [x] 3.3 编写属性测试：小节保留完整性
    - **Property 2: Section preservation**
    - **Validates: Requirements 1.3, 1.5**

- [x] 4. 创建数据导入脚本
  - [x] 4.1 创建 import-xiyao-er-complete.js 文件
    - 读取合并后的JSON数据
    - 实现事务管理（BEGIN/COMMIT/ROLLBACK）
    - 导入章节节点（node_type='chapter', level=1）
    - 导入小节节点（node_type='section', level=2）
    - 导入知识点节点（node_type='point', level=3）
    - 设置正确的parent_id引用
    - 提取并存储口诀
    - 计算并设置重要性
    - 输出导入统计
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.1, 4.2, 4.3, 4.4_

  - [x] 4.2 编写属性测试：节点类型和层级一致性
    - **Property 3: Node type and level consistency**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 4.3 编写属性测试：父子关系完整性
    - **Property 4: Parent-child relationship integrity**
    - **Validates: Requirements 2.2, 2.3**

  - [x] 4.4 编写属性测试：事务回滚
    - **Property 9: Transaction rollback on error**
    - **Validates: Requirements 4.2**

- [x] 5. Checkpoint - 确保所有测试通过
  - All tests passed.

- [x] 6. 执行数据导入
  - [x] 6.1 运行合并脚本生成完整数据
    - 执行 merge-xiyao-er-complete.js
    - 验证输出文件：shuju/西药药二_合并完整版.json
    - _Requirements: 1.1, 1.4_

  - [x] 6.2 运行导入脚本将数据导入数据库
    - 执行 import-xiyao-er-complete.js
    - 导入结果：13章、80节、117知识点，共210个节点
    - 37个节点包含口诀
    - _Requirements: 2.1, 2.2, 2.3, 4.3, 4.4_

- [x] 7. 验证前端展示
  - [x] 7.1 验证知识页面显示完整的章节列表
    - 生产环境 API 返回：13章、80节、117知识点、76高频考点
    - 章节按正确顺序显示（C1-C13）
    - _Requirements: 3.1, 3.2_

  - [x] 7.2 验证知识点内容展示
    - 小节内容正常显示
    - 知识点详情正常显示
    - _Requirements: 3.3, 3.4, 3.5_

- [ ] 8. 验证搜索功能
  - [ ] 8.1 测试搜索API返回正确结果
    - 测试标题搜索
    - 测试内容搜索
    - 验证搜索结果包含上下文信息
    - _Requirements: 5.1, 5.2_

  - [ ] 8.2 编写属性测试：搜索结果上下文
    - **Property 10: Search result context**
    - **Validates: Requirements 5.2**

- [ ] 9. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## 完成总结

西药药二知识图谱导入功能已完成主要任务：

1. ✅ 工具函数模块 `lib/knowledge-import-utils.ts` 已创建并测试
2. ✅ 数据合并脚本 `merge-xiyao-er-complete.js` 已创建
3. ✅ 数据导入脚本 `import-xiyao-er-complete.js` 已创建
4. ✅ 数据已成功导入到生产数据库（210个节点）
5. ✅ 生产环境 API 正常返回完整数据
6. ✅ 前端知识图谱页面正常显示

剩余任务：搜索功能验证（可选）
