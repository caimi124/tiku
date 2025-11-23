/**
 * 完整数据流诊断脚本
 * 检查：数据库 → API → 前端 的完整链路
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function diagnoseFull() {
  console.log('🔍 完整数据流诊断\n');
  console.log('='.repeat(80));
  
  // ========== 第一步：检查数据库 ==========
  console.log('\n📊 第一步：检查数据库中的图片数据\n');
  
  const questionsWithImages = await prisma.questions.findMany({
    where: {
      exam_type: '执业药师',
      subject: '中药学专业知识（一）',
      source_year: 2024,
      ai_explanation: {
        not: null
      }
    },
    orderBy: {
      created_at: 'asc'
    },
    take: 3
  });

  console.log(`找到 ${questionsWithImages.length} 道包含图片的题目\n`);
  
  questionsWithImages.forEach((q, idx) => {
    console.log(`题目 ${idx + 1}:`);
    console.log(`  ID: ${q.id}`);
    console.log(`  题型: ${q.question_type}`);
    console.log(`  题干: ${q.content.substring(0, 50)}...`);
    console.log(`  选项类型: ${typeof q.options}`);
    console.log(`  选项内容: ${JSON.stringify(q.options).substring(0, 100)}...`);
    console.log(`  ai_explanation: ${q.ai_explanation?.substring(0, 150)}...`);
    
    // 解析图片数据
    if (q.ai_explanation) {
      try {
        const data = JSON.parse(q.ai_explanation);
        console.log(`  ✅ 图片数据解析成功:`);
        console.log(`     图片数量: ${data.images?.length || 0}`);
        if (data.images && data.images.length > 0) {
          console.log(`     第一张图片: ${data.images[0]}`);
        }
      } catch (e) {
        console.log(`  ❌ 图片数据解析失败`);
      }
    }
    console.log('');
  });

  // ========== 第二步：模拟API返回 ==========
  console.log('\n🌐 第二步：模拟API数据格式化\n');
  
  if (questionsWithImages.length > 0) {
    const testQuestion = questionsWithImages[0];
    
    // 模拟API的formatOptions函数
    function formatOptions(options: any) {
      if (!options) return [];
      if (Array.isArray(options)) return options;
      if (typeof options === 'object') {
        return Object.entries(options).map(([key, value]) => ({
          key,
          value: value as string
        }));
      }
      return [];
    }
    
    // 模拟API的formatQuestion函数
    const apiResponse = {
      id: testQuestion.id,
      content: testQuestion.content,
      options: formatOptions(testQuestion.options),
      correctAnswer: testQuestion.correct_answer,
      questionType: testQuestion.question_type,
      aiExplanation: testQuestion.ai_explanation,
      chapter: testQuestion.chapter,
      knowledgePoints: testQuestion.knowledge_points || [],
    };
    
    console.log('API返回的数据格式:');
    console.log(JSON.stringify(apiResponse, null, 2));
  }

  // ========== 第三步：检查前端数据处理 ==========
  console.log('\n🎨 第三步：前端数据处理验证\n');
  
  if (questionsWithImages.length > 0) {
    const testQuestion = questionsWithImages[0];
    
    console.log('前端应该这样处理图片:');
    console.log('```typescript');
    console.log('if (currentQuestion.aiExplanation) {');
    console.log('  const data = JSON.parse(currentQuestion.aiExplanation);');
    console.log('  if (data.images && data.images.length > optionIndex) {');
    console.log('    optionImage = data.images[optionIndex];');
    console.log('  }');
    console.log('}');
    console.log('```\n');
    
    if (testQuestion.ai_explanation) {
      try {
        const data = JSON.parse(testQuestion.ai_explanation);
        if (data.images) {
          console.log('图片数组内容:');
          data.images.forEach((img: string, idx: number) => {
            console.log(`  选项 ${String.fromCharCode(65 + idx)}: ${img}`);
          });
        }
      } catch (e) {
        console.log('❌ 无法解析图片数据');
      }
    }
  }

  // ========== 第四步：诊断结果总结 ==========
  console.log('\n' + '='.repeat(80));
  console.log('📋 诊断结果总结\n');
  
  const checks = [
    {
      name: '数据库存储图片路径',
      status: questionsWithImages.some(q => q.ai_explanation !== null),
      detail: `${questionsWithImages.filter(q => q.ai_explanation !== null).length} 道题包含图片数据`
    },
    {
      name: 'ai_explanation格式正确',
      status: questionsWithImages.some(q => {
        try {
          const data = JSON.parse(q.ai_explanation || '');
          return data.images && Array.isArray(data.images);
        } catch {
          return false;
        }
      }),
      detail: 'JSON格式包含images数组'
    },
    {
      name: '选项格式',
      status: questionsWithImages.some(q => 
        typeof q.options === 'object' || Array.isArray(q.options)
      ),
      detail: typeof questionsWithImages[0]?.options === 'object' ? '对象格式' : '数组格式'
    }
  ];
  
  checks.forEach(check => {
    const icon = check.status ? '✅' : '❌';
    console.log(`${icon} ${check.name}: ${check.detail}`);
  });
  
  console.log('\n' + '='.repeat(80));
  
  await prisma.$disconnect();
}

diagnoseFull().catch(console.error);
