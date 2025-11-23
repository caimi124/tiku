import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

// 转换选项格式：对象 -> 数组
function formatOptions(options: any) {
  if (!options) return [];
  
  // 如果已经是数组格式，直接返回
  if (Array.isArray(options)) return options;
  
  // 如果是对象格式，转换为数组
  if (typeof options === 'object') {
    return Object.entries(options).map(([key, value]) => ({
      key,
      value: value as string
    }));
  }
  
  return [];
}

async function testApiFormat() {
  try {
    console.log('🧪 测试API数据格式转换\n');
    
    // 获取一道题目
    const question = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024
      }
    });
    
    if (!question) {
      console.log('❌ 未找到题目');
      return;
    }
    
    console.log('📝 原始数据库格式:');
    console.log('题目ID:', question.id);
    console.log('题目内容:', question.content.substring(0, 30) + '...');
    console.log('题型:', question.question_type);
    console.log('选项类型:', typeof question.options);
    console.log('选项原始数据:', JSON.stringify(question.options, null, 2));
    
    console.log('\n✨ 转换后的API格式:');
    const formattedOptions = formatOptions(question.options);
    console.log('选项类型:', Array.isArray(formattedOptions) ? '数组' : typeof formattedOptions);
    console.log('选项数量:', formattedOptions.length);
    console.log('选项数据:', JSON.stringify(formattedOptions, null, 2));
    
    // 验证格式
    console.log('\n✅ 格式验证:');
    const isValid = formattedOptions.every((opt: any) => 
      opt.hasOwnProperty('key') && opt.hasOwnProperty('value')
    );
    console.log('数组格式正确:', isValid);
    console.log('前端可以使用 .map():', Array.isArray(formattedOptions));
    
    // 统计所有题型
    console.log('\n📊 题型统计:');
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
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiFormat();
