import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugFrontendIssue() {
  console.log('调试2022年前端显示问题...\n');

  // 1. 检查数据库中的实际数据
  const questions = await prisma.questions.findMany({
    where: {
      source_year: 2022,
      subject: '中药学专业知识（二）'
    },
    select: {
      id: true,
      exam_type: true,
      subject: true,
      question_type: true,
      content: true,
      source_year: true,
      is_published: true,
      created_at: true
    },
    take: 5,
    orderBy: {
      created_at: 'asc'
    }
  });

  console.log('=== 数据库查询结果 ===');
  console.log(`找到题目数量: ${questions.length}`);
  
  if (questions.length > 0) {
    console.log('\n前5题详情:');
    questions.forEach((q, idx) => {
      console.log(`题${idx + 1}:`);
      console.log(`  ID: ${q.id}`);
      console.log(`  考试类型: ${q.exam_type}`);
      console.log(`  科目: ${q.subject}`);
      console.log(`  题型: ${q.question_type}`);
      console.log(`  内容: ${q.content.substring(0, 30)}...`);
      console.log(`  年份: ${q.source_year}`);
      console.log(`  发布状态: ${q.is_published}`);
      console.log(`  创建时间: ${q.created_at}`);
      console.log('');
    });
  } else {
    console.log('❌ 未找到任何题目！');
  }

  // 2. 检查所有2022年的科目
  console.log('=== 2022年所有科目 ===');
  const allSubjects = await prisma.questions.groupBy({
    by: ['subject'],
    where: {
      source_year: 2022
    },
    _count: true
  });

  allSubjects.forEach(s => {
    console.log(`科目: "${s.subject}" - ${s._count} 题`);
  });

  // 3. 模拟前端API调用
  console.log('\n=== 模拟前端API调用 ===');
  const apiQuery = {
    source_year: 2022,
    subject: '中药学专业知识（二）',
    is_published: true
  };

  const apiResult = await prisma.questions.findMany({
    where: apiQuery,
    take: 5,
    orderBy: {
      created_at: 'asc'
    }
  });

  console.log(`API查询条件:`, JSON.stringify(apiQuery, null, 2));
  console.log(`API查询结果: ${apiResult.length} 题`);

  // 4. 检查字段名称是否匹配
  console.log('\n=== 字段名称检查 ===');
  if (apiResult.length > 0) {
    const sample = apiResult[0];
    console.log('数据库字段名:');
    console.log(`  source_year: ${sample.source_year}`);
    console.log(`  subject: "${sample.subject}"`);
    console.log(`  exam_type: "${sample.exam_type}"`);
    console.log(`  question_type: "${sample.question_type}"`);
    console.log(`  is_published: ${sample.is_published}`);
  }

  // 5. 检查URL编码问题
  console.log('\n=== URL编码检查 ===');
  const encodedSubject = encodeURIComponent('中药学专业知识（二）');
  const decodedSubject = decodeURIComponent('%E4%B8%AD%E8%8D%AF%E5%AD%A6%E4%B8%93%E4%B8%9A%E7%9F%A5%E8%AF%86%EF%BC%88%E4%BA%8C%EF%BC%89');
  
  console.log(`原始科目名: "中药学专业知识（二）"`);
  console.log(`编码后: "${encodedSubject}"`);
  console.log(`URL中的编码: "%E4%B8%AD%E8%8D%AF%E5%AD%A6%E4%B8%93%E4%B8%9A%E7%9F%A5%E8%AF%86%EF%BC%88%E4%BA%8C%EF%BC%89"`);
  console.log(`解码后: "${decodedSubject}"`);
  console.log(`匹配检查: ${decodedSubject === '中药学专业知识（二）' ? '✅ 匹配' : '❌ 不匹配'}`);

  await prisma.$disconnect();
}

debugFrontendIssue().catch(console.error);
