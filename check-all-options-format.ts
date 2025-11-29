import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllFormats() {
  console.log('检查所有年份和科目的选项格式...\n');

  // 获取所有不同的年份和科目组合
  const combinations = await prisma.questions.groupBy({
    by: ['source_year', 'subject'],
    _count: true,
    orderBy: [
      { source_year: 'desc' },
      { subject: 'asc' }
    ]
  });

  for (const combo of combinations) {
    console.log(`\n=== ${combo.source_year}年 ${combo.subject} (${combo._count}题) ===`);
    
    // 获取第一题的选项格式
    const firstQuestion = await prisma.questions.findFirst({
      where: {
        source_year: combo.source_year,
        subject: combo.subject
      },
      select: {
        options: true
      }
    });

    if (firstQuestion && firstQuestion.options) {
      const options = firstQuestion.options as any[];
      if (options.length > 0) {
        const firstOption = options[0];
        const hasValue = 'value' in firstOption;
        const hasText = 'text' in firstOption;
        
        console.log(`选项格式: ${JSON.stringify(firstOption)}`);
        console.log(`使用字段: ${hasValue ? 'value ✅' : hasText ? 'text ❌' : '未知 ❓'}`);
        
        if (hasText && !hasValue) {
          console.log(`⚠️  需要修正: 使用了text字段，前端期望value字段`);
        }
      }
    }
  }

  await prisma.$disconnect();
}

checkAllFormats().catch(console.error);
