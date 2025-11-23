import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 诊断选项错位问题\n');

  try {
    // 检查题40
    console.log('='.repeat(60));
    console.log('【题40】图示题验证');
    console.log('='.repeat(60) + '\n');
    
    const q40 = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        content: {
          contains: '图示药材为栀子',
        },
      },
    });

    if (q40.length > 0) {
      const q = q40[0];
      console.log('题目内容:', q.content.substring(0, 50));
      console.log('选项数量:', Array.isArray(q.options) ? q.options.length : 0);
      if (Array.isArray(q.options) && q.options.length > 0) {
        console.log('选项内容:');
        q.options.forEach((opt: any) => {
          console.log(`  ${opt.key}. ${opt.value || '(空)'}`);
        });
      }
      console.log();
    }

    // 检查题41-42
    console.log('='.repeat(60));
    console.log('【题41-42】配伍题验证');
    console.log('='.repeat(60) + '\n');
    
    const q41_42 = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        content: {
          contains: '鹿茸',
        },
      },
      orderBy: {
        created_at: 'asc',
      },
      take: 2,
    });

    q41_42.forEach((q, index) => {
      console.log(`题目 ${41 + index}:`);
      console.log('  内容:', q.content.substring(0, 40));
      const opts = Array.isArray(q.options) ? q.options : [];
      console.log('  选项数量:', opts.length);
      if (opts.length > 0) {
        console.log('  选项内容:');
        opts.forEach((opt: any) => {
          console.log(`    ${opt.key}. ${opt.value || '(空)'}`);
        });
      }
      console.log();
    });

    // 检查题91-93
    console.log('='.repeat(60));
    console.log('【题91-93】综合分析题验证');
    console.log('='.repeat(60) + '\n');
    
    const q91_93 = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        content: {
          contains: '煅后',
        },
        chapter: '三、综合分析题',
      },
      orderBy: {
        created_at: 'asc',
      },
      take: 3,
    });

    q91_93.forEach((q, index) => {
      console.log(`题目 ${91 + index}:`);
      console.log('  内容:', q.content.substring(0, 60));
      const opts = Array.isArray(q.options) ? q.options : [];
      console.log('  选项数量:', opts.length);
      if (opts.length > 0) {
        console.log('  选项内容:');
        opts.forEach((opt: any) => {
          console.log(`    ${opt.key}. ${opt.value || '(空)'}`);
        });
      }
      console.log();
    });

    console.log('='.repeat(60));
    console.log('✅ 诊断完成');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ 诊断失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
