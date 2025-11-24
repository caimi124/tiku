import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查数据库中ai_explanation字段...\n');

  try {
    // 获取2022年的题37-40（应该是图片题）
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

    console.log(`📊 数据库中2022年题目总数: ${questions.length}`);

    // 检查题37-40的ai_explanation字段
    [37, 38, 39, 40, 78, 79, 97, 98, 99, 100].forEach(num => {
      const q = questions[num - 1]; // 数组索引从0开始
      if (q) {
        console.log(`\n题${num}:`);
        console.log(`  问题: ${q.content.substring(0, 30)}...`);
        console.log(`  ai_explanation: ${q.ai_explanation}`);
        console.log(`  ai_explanation类型: ${typeof q.ai_explanation}`);
        
        if (q.ai_explanation) {
          try {
            const parsed = JSON.parse(q.ai_explanation as string);
            console.log(`  解析后的内容:`, parsed);
          } catch (e) {
            console.log(`  ❌ JSON解析失败: ${e}`);
          }
        }
      } else {
        console.log(`\n❌ 题${num}不存在`);
      }
    });

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
