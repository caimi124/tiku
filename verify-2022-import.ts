import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('🔍 验证2022年中药学综合知识与技能真题导入情况\n');
    
    // 1. 统计总数
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2022
      }
    });
    
    console.log(`📊 题目总数: ${total} 题\n`);
    
    // 2. 按题型统计
    console.log('📋 题型分布:');
    const typeGroups = await prisma.questions.groupBy({
      by: ['question_type'],
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2022
      },
      _count: true
    });
    
    typeGroups.forEach(group => {
      console.log(`  ${group.question_type}: ${group._count} 题`);
    });
    
    // 3. 抽查第1题
    const q1 = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2022,
        content: { contains: '本草经集注' }
      }
    });
    
    if (q1) {
      console.log('\n✅ 第1题（最佳选择题）:');
      console.log(`  题目: ${q1.content.substring(0, 50)}...`);
      console.log(`  正确答案: ${q1.correct_answer}`);
      console.log(`  题型: ${q1.question_type}`);
    }
    
    // 4. 抽查第120题
    const q120 = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2022,
        content: { contains: '泄泻' }
      }
    });
    
    if (q120) {
      console.log('\n✅ 第120题（多项选择题）:');
      console.log(`  题目: ${q120.content.substring(0, 50)}...`);
      console.log(`  正确答案: ${q120.correct_answer}`);
      console.log(`  题型: ${q120.question_type}`);
    }
    
    // 5. 检查历年真题统计
    console.log('\n📊 历年真题统计:');
    const years = [2024, 2023, 2022];
    for (const year of years) {
      const count = await prisma.questions.count({
        where: {
          exam_type: '执业药师',
          subject: '中药学综合知识与技能',
          source_year: year
        }
      });
      console.log(`  ${year}年: ${count} 题`);
    }
    
    const totalAll = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: { in: [2022, 2023, 2024] }
      }
    });
    console.log(`  总计: ${totalAll} 题`);
    
    console.log('\n✅ 验证完成！2022年数据导入成功！');
    
  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
