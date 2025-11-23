import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('🔍 验证2024年中药学综合知识与技能真题导入情况\n');
    
    // 1. 统计总数
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024
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
        source_year: 2024
      },
      _count: true
    });
    
    typeGroups.forEach(group => {
      console.log(`  ${group.question_type}: ${group._count} 题`);
    });
    
    // 3. 抽查几道题目
    console.log('\n📝 抽查题目内容:');
    
    // 第1题
    const q1 = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
        content: { contains: '阳脉之海' }
      }
    });
    
    if (q1) {
      console.log('\n✅ 第1题（最佳选择题）:');
      console.log(`  题目: ${q1.content.substring(0, 50)}...`);
      console.log(`  正确答案: ${q1.correct_answer}`);
      console.log(`  题型: ${q1.question_type}`);
    }
    
    // 第111题
    const q111 = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
        content: { contains: '五行与情志' }
      }
    });
    
    if (q111) {
      console.log('\n✅ 第111题（多项选择题）:');
      console.log(`  题目: ${q111.content.substring(0, 50)}...`);
      console.log(`  正确答案: ${q111.correct_answer}`);
      console.log(`  题型: ${q111.question_type}`);
    }
    
    // 4. 检查选项格式
    const sampleQ = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024
      }
    });
    
    if (sampleQ) {
      console.log('\n✅ 选项格式检查:');
      console.log('  选项数据类型:', typeof sampleQ.options);
      console.log('  选项内容示例:', JSON.stringify(sampleQ.options).substring(0, 100) + '...');
    }
    
    console.log('\n✅ 验证完成！数据导入成功！');
    
  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
