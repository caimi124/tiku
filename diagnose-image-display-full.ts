import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MTAzOCwiZXhwIjoyMDc4NzU3MDM4fQ.i0nA_AOLnBdeK7chICmeltFchkdJmYKMVqVxu8IaofE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseImageDisplay() {
  console.log('🔍 全面诊断图片显示问题（数据库 → API → 前端）\n');
  console.log('═'.repeat(70));

  try {
    // 1. 检查数据库中的图片数据
    console.log('\n📊 步骤1：检查数据库中的图片题数据\n');
    
    const { data: imageQuestions, error } = await supabase
      .from('questions')
      .select('id, content, ai_explanation, options')
      .eq('exam_type', '执业药师')
      .eq('subject', '中药学专业知识（一）')
      .eq('source_year', 2024)
      .not('ai_explanation', 'is', null)
      .limit(3);

    if (error) {
      console.error('❌ 查询失败:', error.message);
      return;
    }

    console.log(`找到 ${imageQuestions?.length || 0} 道有图片数据的题目\n`);

    if (imageQuestions && imageQuestions.length > 0) {
      imageQuestions.forEach((q: any, index: number) => {
        console.log(`题目 ${index + 1}:`);
        console.log(`   内容: ${q.content.substring(0, 40)}...`);
        console.log(`   ai_explanation: ${JSON.stringify(q.ai_explanation).substring(0, 100)}...`);
        
        try {
          const imageData = typeof q.ai_explanation === 'string' 
            ? JSON.parse(q.ai_explanation) 
            : q.ai_explanation;
          
          if (imageData && imageData.images) {
            console.log(`   图片数量: ${imageData.images.length}`);
            console.log(`   第一张图片URL: ${imageData.images[0]}`);
          }
        } catch (e) {
          console.log(`   ⚠️  ai_explanation不是有效的JSON`);
        }
        console.log('');
      });
    }

    // 2. 测试生产环境API返回的数据
    console.log('\n🌐 步骤2：测试生产环境API返回的数据\n');
    
    const apiUrl = 'https://yikaobiguo.com/api/questions?sourceYear=2024&subject=中药学专业知识（一）&limit=3';
    console.log(`API URL: ${apiUrl}\n`);
    
    const response = await fetch(apiUrl);
    const apiData = await response.json();
    
    if (apiData.success && apiData.data && apiData.data.questions) {
      console.log(`✅ API返回成功，共 ${apiData.data.total} 道题`);
      console.log(`✅ 返回了 ${apiData.data.questions.length} 道题的数据\n`);
      
      // 检查是否有图片题
      const questionsWithImages = apiData.data.questions.filter((q: any) => 
        q.content && (q.content.includes('图示') || q.content.includes('[图示]'))
      );
      
      console.log(`找到 ${questionsWithImages.length} 道图片题\n`);
      
      if (questionsWithImages.length > 0) {
        const q = questionsWithImages[0];
        console.log('第一道图片题的API返回数据：');
        console.log(`   内容: ${q.content.substring(0, 50)}...`);
        console.log(`   ai_explanation字段: ${q.ai_explanation ? '存在' : '不存在'}`);
        console.log(`   aiExplanation字段: ${q.aiExplanation ? '存在' : '不存在'}`);
        
        if (q.aiExplanation) {
          console.log(`   aiExplanation内容: ${JSON.stringify(q.aiExplanation).substring(0, 200)}...`);
        } else if (q.ai_explanation) {
          console.log(`   ai_explanation内容: ${JSON.stringify(q.ai_explanation).substring(0, 200)}...`);
        } else {
          console.log(`   ⚠️  两个字段都不存在！这是问题所在！`);
        }
      }
    } else {
      console.log(`❌ API返回失败: ${apiData.error || '未知错误'}`);
    }

    // 3. 检查API代码的字段映射
    console.log('\n\n📝 步骤3：问题分析\n');
    console.log('═'.repeat(70));
    
    console.log('\n数据库字段名: ai_explanation (snake_case)');
    console.log('API应该返回: aiExplanation (camelCase)');
    console.log('\n检查API代码中的formatQuestion函数是否正确映射字段...\n');

    console.log('✅ 诊断完成\n');

  } catch (error: any) {
    console.error('❌ 诊断失败:', error.message);
  }
}

diagnoseImageDisplay();
