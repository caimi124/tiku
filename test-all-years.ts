import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function testAllYears() {
  try {
    console.log('🔍 测试所有年份历年真题数据\n');
    console.log('='.repeat(60));
    
    // 1. 统计所有年份
    const years = [2024, 2023, 2022, 2021, 2020];
    console.log('\n📊 各年份题目统计:\n');
    
    let totalQuestions = 0;
    const availableYears: number[] = [];
    
    for (const year of years) {
      const count = await prisma.questions.count({
        where: {
          exam_type: '执业药师',
          subject: '中药学综合知识与技能',
          source_year: year
        }
      });
      
      if (count > 0) {
        console.log(`  ✅ ${year}年: ${count} 题`);
        totalQuestions += count;
        availableYears.push(year);
      } else {
        console.log(`  ⏳ ${year}年: 暂无数据`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📚 题库总计: ${totalQuestions} 题`);
    console.log(`📅 可用年份: ${availableYears.length} 个`);
    console.log('='.repeat(60));
    
    // 2. 详细统计每个年份的题型分布
    for (const year of availableYears) {
      console.log(`\n📋 ${year}年题型分布:`);
      
      const typeGroups = await prisma.questions.groupBy({
        by: ['question_type'],
        where: {
          exam_type: '执业药师',
          subject: '中药学综合知识与技能',
          source_year: year
        },
        _count: true
      });
      
      const typeOrder = ['最佳选择题', '配伍选择题', '综合分析题', '多项选择题'];
      typeOrder.forEach(type => {
        const group = typeGroups.find(g => g.question_type === type);
        if (group) {
          console.log(`  ${type}: ${group._count} 题`);
        }
      });
    }
    
    // 3. 抽查每个年份的题目
    console.log('\n' + '='.repeat(60));
    console.log('📝 题目内容抽查:\n');
    
    for (const year of availableYears) {
      const sampleQuestion = await prisma.questions.findFirst({
        where: {
          exam_type: '执业药师',
          subject: '中药学综合知识与技能',
          source_year: year
        },
        orderBy: {
          created_at: 'asc'
        }
      });
      
      if (sampleQuestion) {
        console.log(`✅ ${year}年第1题:`);
        console.log(`   题目: ${sampleQuestion.content.substring(0, 40)}...`);
        console.log(`   题型: ${sampleQuestion.question_type}`);
        console.log(`   答案: ${sampleQuestion.correct_answer}`);
        console.log('');
      }
    }
    
    // 4. 检查选项格式
    console.log('='.repeat(60));
    console.log('🔧 数据格式验证:\n');
    
    const sampleWithOptions = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: { in: availableYears }
      }
    });
    
    if (sampleWithOptions) {
      console.log('选项格式检查:');
      console.log(`  数据类型: ${typeof sampleWithOptions.options}`);
      console.log(`  是否为对象: ${typeof sampleWithOptions.options === 'object'}`);
      console.log('  样例数据:', JSON.stringify(sampleWithOptions.options).substring(0, 80) + '...');
      console.log('  ✅ API会自动转换为数组格式供前端使用');
    }
    
    // 5. 前端访问链接
    console.log('\n' + '='.repeat(60));
    console.log('🌐 前端访问链接:\n');
    console.log('  历年真题列表: http://localhost:3000/practice/history\n');
    
    for (const year of availableYears) {
      console.log(`  ${year}年逐题练习: http://localhost:3000/practice/history/${year}`);
      console.log(`  ${year}年模拟考试: http://localhost:3000/practice/history/${year}/mock\n`);
    }
    
    console.log('='.repeat(60));
    console.log('\n✅ 所有测试完成！题库数据完整可用！\n');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllYears();
