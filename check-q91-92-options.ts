import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查题91-92选项问题...\n');

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

    // 检查题91-92
    [91, 92].forEach(num => {
      const q = questions[num - 1]; // 数组索引从0开始
      if (q) {
        console.log(`题${num}:`);
        console.log(`  问题: ${q.content}`);
        console.log(`  选项: ${JSON.stringify(q.options)}`);
        console.log(`  选项数量: ${Array.isArray(q.options) ? q.options.length : 0}`);
        console.log(`  题型: ${q.question_type}`);
        console.log('');
      } else {
        console.log(`❌ 题${num}不存在\n`);
      }
    });

    // 检查综合分析题范围（91-110）是否有其他选项问题
    console.log('🔍 检查综合分析题范围（91-110）的选项情况:\n');
    
    let emptyOptionsCount = 0;
    const emptyOptionsQuestions = [];
    
    for (let i = 90; i < 110 && i < questions.length; i++) {
      const q = questions[i];
      const questionNum = i + 1;
      
      const options = Array.isArray(q.options) ? q.options as any[] : [];
      
      // 检查选项是否为空或无效
      let hasEmptyOptions = false;
      if (!q.options || options.length === 0) {
        hasEmptyOptions = true;
      } else if (options.length === 5) {
        // 检查是否所有选项的value都为空
        hasEmptyOptions = options.every((opt: any) => {
          if (typeof opt === 'object' && opt.value !== undefined) {
            return opt.value.trim() === '';
          } else if (typeof opt === 'string') {
            return opt.trim() === '' || opt === 'A.' || opt === 'B.' || opt === 'C.' || opt === 'D.' || opt === 'E.';
          }
          return true;
        });
      }
      
      if (hasEmptyOptions) {
        emptyOptionsCount++;
        emptyOptionsQuestions.push(questionNum);
        console.log(`❌ 题${questionNum}: 选项为空或无效`);
        console.log(`   问题: ${q.content.substring(0, 50)}...`);
        console.log(`   选项: ${JSON.stringify(q.options)}`);
        console.log('');
      }
    }
    
    console.log(`📊 综合分析题中选项缺失的题目数量: ${emptyOptionsCount}`);
    console.log(`📋 缺失选项的题目: ${emptyOptionsQuestions.join(', ')}`);

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
