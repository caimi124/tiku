import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 验证题43、44、97-100的选项和图片\n');

  try {
    // 检查题43-44
    const q43_44 = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        content: {
          contains: '类圆形',
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log('=' .repeat(60));
    console.log('【题43-44】配伍选择题验证');
    console.log('='.repeat(60) + '\n');

    q43_44.forEach((q, index) => {
      const preview = q.content.substring(0, 50);
      console.log(`题目 ${index === 0 ? 43 : 44}:`);
      console.log(`  内容: ${preview}...`);
      console.log(`  章节: ${q.chapter}`);
      console.log(`  题型: ${q.question_type}`);
      const options = Array.isArray(q.options) ? q.options : [];
      console.log(`  选项数量: ${options.length}`);
      if (options.length > 0) {
        console.log(`  选项示例:`);
        options.forEach((opt: any) => {
          console.log(`    ${opt.key}. ${opt.value || '(图片选项)'}`);
        });
      }
      console.log(`  正确答案: ${q.correct_answer}`);
      console.log();
    });

    // 检查图示题97-100
    const q97_100 = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        content: {
          contains: '图示',
        },
        chapter: '三、综合分析题',
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log('='.repeat(60));
    console.log('【题97-100】图示题验证');
    console.log('='.repeat(60) + '\n');

    q97_100.forEach((q, index) => {
      const preview = q.content.substring(0, 40);
      console.log(`题目 ${97 + index}:`);
      console.log(`  内容: ${preview}...`);
      console.log(`  章节: ${q.chapter}`);
      console.log(`  题型: ${q.question_type}`);
      const opts = Array.isArray(q.options) ? q.options : [];
      console.log(`  选项数量: ${opts.length}`);
      
      if (q.ai_explanation) {
        try {
          const data = JSON.parse(q.ai_explanation);
          console.log(`  图片数量: ${data.images?.length || 0}`);
          if (data.images && data.images.length > 0) {
            console.log(`  首张图片: ${data.images[0]}`);
          }
        } catch (e) {
          console.log(`  ⚠️ 图片数据解析失败`);
        }
      }
      
      console.log(`  正确答案: ${q.correct_answer}`);
      console.log();
    });

    console.log('='.repeat(60));
    console.log('✅ 验证完成！');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
