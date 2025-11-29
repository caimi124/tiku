import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查2023年法规题101-110的解析数据\n');

  // 检查数据库
  const questions = await prisma.questions.findMany({
    where: {
      source_year: 2023,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    skip: 100,  // 跳过前100题
    take: 10,   // 获取题101-110
    select: {
      content: true,
      correct_answer: true,
      ai_explanation: true,
      chapter: true
    }
  });

  console.log('📊 数据库中的解析情况:\n');
  questions.forEach((q, index) => {
    const questionNum = 101 + index;
    const hasExplanation = q.ai_explanation && q.ai_explanation.trim() !== '';
    const status = hasExplanation ? '✅' : '❌';
    console.log(`题${questionNum} ${status}: ${hasExplanation ? '有解析' : '无解析'}`);
    if (hasExplanation && q.ai_explanation) {
      console.log(`   解析预览: ${q.ai_explanation.substring(0, 50)}...`);
    }
    console.log(`   题目: ${q.content.substring(0, 40)}...`);
    console.log('');
  });

  // 检查JSON源数据
  console.log('\n' + '='.repeat(60));
  console.log('📋 JSON源数据中的解析情况:\n');
  
  const jsonPath = path.join(process.cwd(), 'shuju', '2023年执业药师法规历年真题.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  for (let i = 101; i <= 110; i++) {
    const q = data.find((item: any) => item.number === i);
    if (q) {
      const hasAnalysis = q.analysis && q.analysis.trim() !== '';
      const status = hasAnalysis ? '✅' : '❌';
      console.log(`题${i} ${status}: ${hasAnalysis ? '有解析' : '无解析'}`);
      if (hasAnalysis) {
        console.log(`   解析: ${q.analysis.substring(0, 50)}...`);
      } else {
        console.log(`   解析字段: "${q.analysis}"`);
      }
    }
  }

  // 统计
  const withExplanation = questions.filter(q => q.ai_explanation && q.ai_explanation.trim() !== '').length;
  console.log('\n' + '='.repeat(60));
  console.log(`📊 统计: ${withExplanation}/10 题有解析`);
  
  if (withExplanation < 10) {
    console.log('\n⚠️  发现问题: 部分题目缺少解析数据');
    console.log('💡 可能原因:');
    console.log('   1. JSON源数据中analysis字段为空');
    console.log('   2. 导入脚本没有正确导入analysis字段');
  }
}

main()
  .catch((error) => {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
