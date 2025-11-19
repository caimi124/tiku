# 120道题目分批导入说明

## 方案：手动分批导入

由于题目数据量大，建议您：

### 方式1：使用现有的 import-all-120-questions.ts

1. 打开 `prisma/import-all-120-questions.ts`
2. 在第27行的 `allQuestions` 数组中，按照示例格式添加所有120道题目
3. 运行：`npx tsx prisma/import-all-120-questions.ts`

### 方式2：分批手动执行（推荐）

我已经为您创建好了脚本框架，您可以分3次复制粘贴题目数据：

**第1批（1-40题）：**
- 文件：`prisma/import-all-120-questions.ts`
- 只添加前40道题
- 运行导入
- 然后清空，添加第41-80题
- 再次运行
- 最后添加81-120题

### 数据格式示例

```typescript
{
  examType:'执业药师',
  subject:'中药学综合知识与技能',
  chapter:'章节名',
  questionType:'single',  // single/multiple/case
  content:'题目内容',
  options:[{key:'A',value:'选项A'},{key:'B',value:'选项B'}],
  correctAnswer:'A',
  explanation:'解析',
  difficulty:2,
  knowledgePoints:['知识点'],
  sourceType:'历年真题',
  sourceYear:2024
},
```

## 快速执行命令

```bash
# 导入题目
npx tsx prisma/import-all-120-questions.ts

# 或使用批处理（Windows）
执行批量导入.bat
```

## 验证结果

导入完成后，脚本会自动显示统计信息。
