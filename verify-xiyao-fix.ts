import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('✅ 验证修复结果...\n');

    const questions = await prisma.questions.findMany({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能'
      },
      orderBy: {
        created_at: 'asc'
      },
      select: {
        content: true,
        options: true
      }
    });

    // 验证题13
    console.log('=' .repeat(60));
    console.log('验证题13的选项');
    console.log('=' .repeat(60));
    const q13 = questions[12];
    console.log('\n题13选项:');
    if (Array.isArray(q13.options)) {
      q13.options.forEach((opt: any, idx: number) => {
        if (typeof opt === 'string') {
          console.log(`  ${opt}`);
        }
      });
      console.log(`\n选项数量: ${q13.options.length}个`);
      if (q13.options.length === 5) {
        console.log('✅ 题13修复成功！');
      }
    }

    // 验证题91-95
    console.log('\n\n' + '='.repeat(60));
    console.log('验证综合分析题（题91-95）');
    console.log('='.repeat(60));
    
    questions.slice(90, 95).forEach((q, idx) => {
      console.log(`\n题${91 + idx}:`);
      console.log(`  内容长度: ${q.content.length}字符`);
      console.log(`  是否包含案例标记: ${q.content.includes('【案例') ? '是 ✅' : '否 ❌'}`);
      console.log(`  内容预览: ${q.content.substring(0, 100)}...`);
    });

    console.log('\n\n✨ 验证完成！');

  } catch (error) {
    console.error('❌ 验证失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verify();
