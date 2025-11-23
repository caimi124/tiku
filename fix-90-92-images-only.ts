import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function fix90_92Images() {
  console.log('🔧 只修复第90-92题的图片数据\n');
  console.log('⚠️  不影响其他任何题目\n');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. 查找第90-92题（通过内容匹配，避免使用question_number）
    const allQuestions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2024
      }
    });

    console.log(`📊 总题数: ${allQuestions.length}\n`);

    // 找到第90-92题
    const q90 = allQuestions.find(q => q.content.includes('结构类型为香豆素类化合物的是'));
    const q91 = allQuestions.find(q => q.content.includes('结构类型为有机酸类化合物的是'));
    const q92 = allQuestions.find(q => q.content.includes('结构类型为黄酮类化合物的是'));

    if (!q90 || !q91 || !q92) {
      console.log('❌ 未找到第90-92题！');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ 找到第90-92题\n');
    
    // 2. 准备图片数据
    const imageUrls = [
      '/shuju/2024年执业药师中药药一历年真题/img/90-92-A.jpeg',
      '/shuju/2024年执业药师中药药一历年真题/img/90-92-B.jpeg',
      '/shuju/2024年执业药师中药药一历年真题/img/90-92-C.jpeg',
      '/shuju/2024年执业药师中药药一历年真题/img/90-92-D.jpeg',
      '/shuju/2024年执业药师中药药一历年真题/img/90-92-E.jpeg'
    ];

    const aiExplanationData = JSON.stringify({ images: imageUrls });

    // 3. 检查当前状态
    console.log('📋 当前状态：\n');
    [q90, q91, q92].forEach((q, idx) => {
      console.log(`题${90 + idx}: ${q.content.substring(0, 40)}...`);
      console.log(`  当前有图片数据: ${q.ai_explanation ? 'Yes' : 'No'}`);
      if (q.ai_explanation) {
        try {
          const data = JSON.parse(q.ai_explanation);
          console.log(`  图片数量: ${data.images?.length || 0}`);
        } catch (e) {
          console.log(`  ❌ 数据解析失败`);
        }
      }
    });

    console.log('\n' + '='.repeat(80) + '\n');

    // 4. 更新这三道题
    console.log('🔧 开始更新...\n');

    await prisma.questions.update({
      where: { id: q90.id },
      data: { ai_explanation: aiExplanationData }
    });
    console.log('✅ 题90更新完成');

    await prisma.questions.update({
      where: { id: q91.id },
      data: { ai_explanation: aiExplanationData }
    });
    console.log('✅ 题91更新完成');

    await prisma.questions.update({
      where: { id: q92.id },
      data: { ai_explanation: aiExplanationData }
    });
    console.log('✅ 题92更新完成');

    console.log('\n' + '='.repeat(80) + '\n');

    // 5. 验证更新结果
    const updated90 = await prisma.questions.findUnique({ where: { id: q90.id } });
    const updated91 = await prisma.questions.findUnique({ where: { id: q91.id } });
    const updated92 = await prisma.questions.findUnique({ where: { id: q92.id } });

    console.log('📊 更新后状态：\n');
    [updated90, updated91, updated92].forEach((q, idx) => {
      if (q) {
        console.log(`题${90 + idx}: ${q.content.substring(0, 40)}...`);
        console.log(`  有图片数据: ${q.ai_explanation ? 'Yes ✅' : 'No ❌'}`);
        if (q.ai_explanation) {
          try {
            const data = JSON.parse(q.ai_explanation);
            console.log(`  图片数量: ${data.images?.length || 0}`);
          } catch (e) {
            console.log(`  ❌ 数据解析失败`);
          }
        }
        console.log('');
      }
    });

    console.log('='.repeat(80));
    console.log('\n🎉 修复完成！只修改了第90-92题，其他题目未受影响。\n');

  } catch (error: any) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fix90_92Images();
