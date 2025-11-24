import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查题93-96选项修复情况...\n');

  try {
    // 获取2022年的题目
    const questions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2022,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log(`📊 数据库中2022年题目总数: ${questions.length}\n`);

    // 检查题93-96
    [93, 94, 95, 96].forEach(num => {
      const q = questions[num - 1]; // 数组索引从0开始
      if (q) {
        console.log(`题${num}:`);
        console.log(`  问题: ${q.content}`);
        
        // 解析选项
        const options = Array.isArray(q.options) ? q.options as any[] : [];
        if (options.length > 0 && typeof options[0] === 'object' && options[0].value !== undefined) {
          // 显示选项内容
          const optionTexts = options.map(opt => `${opt.key}.${opt.value}`);
          console.log(`  选项: ${optionTexts.join(' ')}`);
          
          // 检查是否有内容
          const hasContent = options.some(opt => opt.value && opt.value.trim() !== '');
          console.log(`  状态: ${hasContent ? '✅ 有内容' : '❌ 无内容'}`);
        } else {
          console.log(`  选项: ${JSON.stringify(q.options)}`);
          console.log(`  状态: ❌ 格式错误`);
        }
        
        console.log(`  答案: ${q.correct_answer}`);
        console.log('');
      } else {
        console.log(`❌ 题${num}不存在\n`);
      }
    });

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
