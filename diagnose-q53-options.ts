import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 诊断题53配伍题选项缺失问题...\n');

  try {
    const questions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2022,
      },
      orderBy: {
        created_at: 'asc',
      },
      take: 120,
    });

    // 检查题53
    const q53 = questions[52]; // 索引从0开始
    console.log('题53详情:');
    console.log('  题目:', q53.content);
    console.log('  选项数:', (q53.options as any[])?.length || 0);
    console.log('  选项内容:', q53.options);
    console.log('  答案:', q53.correct_answer);
    console.log('  题型:', q53.question_type);
    console.log('  章节:', q53.chapter);

    // 检查配伍题范围（41-90）中的选项问题
    console.log('\n🔍 检查配伍题选项缺失情况:');
    let emptyOptionsCount = 0;
    
    for (let i = 40; i < 90; i++) { // 题41-90
      const q = questions[i];
      const opts = q.options as any[];
      if (!opts || opts.length === 0 || (opts.length > 0 && !opts[0].value)) {
        console.log(`  ❌ 题${q.content.substring(0, 10)}... - 选项缺失或为空`);
        emptyOptionsCount++;
      }
    }

    console.log(`\n📊 配伍题选项缺失统计: ${emptyOptionsCount}/50 题`);

    // 查找有效选项的配伍题
    console.log('\n🔍 查找有效选项的配伍题:');
    for (let i = 40; i < 90; i++) {
      const q = questions[i];
      const opts = q.options as any[];
      if (opts && opts.length > 0 && opts[0].value && opts[0].value.trim() !== '') {
        console.log(`  ✅ 题${i+1}: ${opts[0].value} (${opts.length}个选项)`);
        if (i < 45) break; // 只显示前几个有效的
      }
    }

  } catch (error) {
    console.error('❌ 诊断失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
