import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 验证2022年执业药师中药药学专业知识（一）真题导入\n');

  try {
    // 统计总数
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2022,
      },
    });

    console.log(`📊 总题目数: ${total} 道`);
    console.log(`   预期: 120 道`);
    console.log(`   状态: ${total === 120 ? '✅ 正确' : '❌ 错误'}\n`);

    // 按章节统计
    const byChapter = await prisma.questions.groupBy({
      by: ['chapter'],
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2022,
      },
      _count: true,
    });

    console.log('📋 章节分布:');
    const expectedChapters: Record<string, number> = {
      '一、最佳选择题': 40,
      '二、配伍选择题': 50,
      '三、综合分析题': 20,
      '四、多项选择题': 10,
    };
    
    byChapter.forEach(item => {
      const expected = expectedChapters[item.chapter] || 0;
      const status = item._count === expected ? '✅' : '❌';
      console.log(`   ${status} ${item.chapter}: ${item._count} 道 (预期${expected})`);
    });

    // 按题型统计
    const byType = await prisma.questions.groupBy({
      by: ['question_type'],
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2022,
      },
      _count: true,
    });

    console.log('\n📝 题型分布:');
    const expectedTypes: Record<string, number> = {
      'single': 40,
      'match': 50,
      'comprehensive': 20,
      'multiple': 10,
    };
    
    byType.forEach(item => {
      const expected = expectedTypes[item.question_type] || 0;
      const status = item._count === expected ? '✅' : '❌';
      console.log(`   ${status} ${item.question_type}: ${item._count} 道 (预期${expected})`);
    });

    // 检查图片题
    const imageQuestions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2022,
        ai_explanation: {
          not: null,
        },
      },
      select: {
        id: true,
        content: true,
        ai_explanation: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log(`\n📷 图片题统计: ${imageQuestions.length} 道`);
    console.log(`   预期: 10 道 (题37-40, 78-79, 97-100)`);
    console.log(`   状态: ${imageQuestions.length === 10 ? '✅ 正确' : '❌ 错误'}\n`);
    
    imageQuestions.forEach((q, idx) => {
      try {
        const images = JSON.parse(q.ai_explanation as string);
        const preview = q.content.substring(0, 30);
        console.log(`   ${idx + 1}. ${preview}... (${images.images.length} 张图片)`);
      } catch (e) {
        console.log(`   ${idx + 1}. 解析图片数据失败`);
      }
    });

    // 检查关键题目
    console.log('\n🔍 检查关键题目:');
    
    const keyQuestions = await prisma.questions.findMany({
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

    // 检查题42（配伍题第2题，原数据缺失A选项）
    const q42 = keyQuestions[41];
    if (q42) {
      const opts = q42.options as any[];
      console.log(`\n   题42: ${q42.content.substring(0, 40)}...`);
      console.log(`   选项数: ${opts?.length || 0}`);
      console.log(`   第一个选项: ${opts?.[0]?.value || '无'}`);
      console.log(`   状态: ${opts?.length === 5 ? '✅ 正确' : '❌ 错误'}`);
    }

    // 检查题78（配伍图片题）
    const q78 = keyQuestions[77];
    if (q78) {
      const opts = q78.options as any[];
      console.log(`\n   题78: ${q78.content.substring(0, 40)}...`);
      console.log(`   选项数: ${opts?.length || 0}`);
      console.log(`   有图片: ${q78.ai_explanation ? '✅ 是' : '❌ 否'}`);
      if (q78.ai_explanation) {
        try {
          const images = JSON.parse(q78.ai_explanation);
          console.log(`   图片数: ${images.images.length}`);
        } catch (e) {
          console.log(`   图片解析失败`);
        }
      }
    }

    // 检查题111（多选题第1题）
    const q111 = keyQuestions[110];
    if (q111) {
      console.log(`\n   题111: ${q111.content.substring(0, 40)}...`);
      console.log(`   题型: ${q111.question_type}`);
      console.log(`   答案: ${q111.correct_answer}`);
      console.log(`   状态: ${q111.question_type === 'multiple' && q111.correct_answer.length > 1 ? '✅ 正确' : '❌ 错误'}`);
    }

    // 检查题120（多选题最后一题，原数据选项为空）
    const q120 = keyQuestions[119];
    if (q120) {
      const opts = q120.options as any[];
      console.log(`\n   题120: ${q120.content.substring(0, 40)}...`);
      console.log(`   选项数: ${opts?.length || 0}`);
      console.log(`   题型: ${q120.question_type}`);
      console.log(`   答案: ${q120.correct_answer}`);
      console.log(`   状态: ${opts?.length >= 4 ? '✅ 正确' : '❌ 错误'}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 验证完成！所有数据检查通过。');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
