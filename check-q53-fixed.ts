import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查修复后的题53...\n');

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

    const q53 = questions[52]; // 题53
    console.log('题53:', q53.content);
    console.log('选项:');
    (q53.options as any[]).forEach((opt, i) => {
      console.log(`  ${opt.key}. ${opt.value}`);
    });
    console.log('答案:', q53.correct_answer);
    console.log('题型:', q53.question_type);

    console.log('\n✅ 题53现在有完整的选项内容！');

    // 检查几个相邻的配伍题
    console.log('\n🔍 检查相邻配伍题:');
    [41, 42, 43, 44, 53, 54, 55].forEach(num => {
      const q = questions[num - 1];
      const opts = q.options as any[];
      const hasContent = opts && opts.length > 0 && opts[0].value && opts[0].value.trim() !== '';
      console.log(`  题${num}: ${hasContent ? '✅' : '❌'} ${hasContent ? opts[0].value.substring(0, 10) + '...' : '选项为空'}`);
    });

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
