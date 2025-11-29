import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface QuestionJSON {
  number: number;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
}

async function findMissingQuestions() {
  console.log('查找2022年中药药学专业知识（二）未导入的题目...\n');

  // 读取JSON源数据
  const jsonPath = path.join(process.cwd(), 'shuju', '2022年执业药师中药师药学专业知识（二）.json');
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const sourceQuestions: QuestionJSON[] = JSON.parse(jsonContent);
  
  console.log(`JSON源文件题目数: ${sourceQuestions.length}`);

  // 获取数据库中已导入的题目
  const importedQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2022,
      subject: '中药学专业知识（二）'
    },
    select: {
      content: true,
      correct_answer: true,
      created_at: true
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  console.log(`数据库中已导入题目数: ${importedQuestions.length}`);
  console.log(`缺失题目数: ${sourceQuestions.length - importedQuestions.length}\n`);

  // 创建已导入题目的内容映射（用于匹配）
  const importedContentSet = new Set(
    importedQuestions.map(q => q.content.trim().substring(0, 50))
  );

  // 找出未导入的题目
  const missingQuestions: QuestionJSON[] = [];
  
  sourceQuestions.forEach(sourceQ => {
    const contentKey = sourceQ.question.trim().substring(0, 50);
    if (!importedContentSet.has(contentKey)) {
      missingQuestions.push(sourceQ);
    }
  });

  console.log('=== 未导入的题目详情 ===\n');
  
  if (missingQuestions.length === 0) {
    console.log('✅ 所有题目都已成功导入！');
  } else {
    missingQuestions.forEach((q, index) => {
      console.log(`❌ 缺失题目 ${index + 1}:`);
      console.log(`   题号: ${q.number}`);
      console.log(`   题目: ${q.question.substring(0, 80)}...`);
      console.log(`   选项数: ${q.options?.length || 0}`);
      console.log(`   答案: ${q.answer}`);
      console.log(`   解析长度: ${q.analysis?.length || 0}字符`);
      
      // 检查可能的问题
      const issues = [];
      if (!q.question || q.question.trim().length < 5) issues.push('题目内容异常');
      if (!q.options || q.options.length < 4) issues.push('选项不足');
      if (!q.answer || q.answer.trim().length === 0) issues.push('答案缺失');
      if (!q.analysis || q.analysis.trim().length === 0) issues.push('解析缺失');
      
      if (issues.length > 0) {
        console.log(`   ⚠️  可能问题: ${issues.join(', ')}`);
      }
      console.log('');
    });

    // 按题号排序显示
    console.log('=== 缺失题目题号列表 ===');
    const missingNumbers = missingQuestions.map(q => q.number).sort((a, b) => a - b);
    console.log(`缺失题号: ${missingNumbers.join(', ')}`);
    
    // 分析缺失题目的分布
    console.log('\n=== 缺失题目分布分析 ===');
    const distribution = {
      '1-40': missingNumbers.filter(n => n >= 1 && n <= 40).length,
      '41-90': missingNumbers.filter(n => n >= 41 && n <= 90).length,
      '91-110': missingNumbers.filter(n => n >= 91 && n <= 110).length,
      '111-120': missingNumbers.filter(n => n >= 111 && n <= 120).length
    };
    
    Object.entries(distribution).forEach(([range, count]) => {
      if (count > 0) {
        console.log(`${range}题: ${count}题缺失`);
      }
    });
  }

  await prisma.$disconnect();
}

findMissingQuestions().catch(console.error);
