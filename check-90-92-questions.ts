import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MTAzOCwiZXhwIjoyMDc4NzU3MDM4fQ.i0nA_AOLnBdeK7chICmeltFchkdJmYKMVqVxu8IaofE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check90to92() {
  console.log('🔍 检查90-92题的详细信息\n');

  try {
    // 读取JSON文件，找到90-92题
    const jsonPath = path.join(__dirname, 'shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const allQuestions = JSON.parse(jsonContent);
    
    const questions90to92 = allQuestions.filter((q: any) => q.number >= 90 && q.number <= 92);
    
    console.log('📋 JSON文件中的90-92题:\n');
    questions90to92.forEach((q: any) => {
      console.log(`题${q.number}: ${q.question.substring(0, 50)}...`);
      console.log(`   包含"图示": ${q.question.includes('图示') || q.question.includes('[图示]') ? '✅' : '❌'}`);
      console.log('');
    });

    // 查询数据库中的90-92题
    console.log('\n📊 数据库中的90-92题:\n');
    
    const { data: dbQuestions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_type', '执业药师')
      .eq('subject', '中药学专业知识（一）')
      .eq('source_year', 2024)
      .eq('chapter', '三、综合分析题');

    if (error) {
      console.error('❌ 查询失败:', error.message);
      return;
    }

    console.log(`找到 ${dbQuestions?.length || 0} 道综合分析题\n`);

    if (dbQuestions && dbQuestions.length > 0) {
      // 匹配90-92题
      const matched90to92 = dbQuestions.filter((q: any) => {
        return questions90to92.some((jq: any) => 
          q.content.includes(jq.question.substring(0, 20))
        );
      });

      console.log(`其中匹配到90-92题: ${matched90to92.length} 道\n`);

      matched90to92.forEach((q: any) => {
        console.log(`ID: ${q.id}`);
        console.log(`内容: ${q.content.substring(0, 60)}...`);
        console.log(`ai_explanation: ${q.ai_explanation || '空'}`);
        console.log('');
      });

      // 如果90-92题没有图片信息，添加图片
      if (matched90to92.length > 0 && matched90to92.some((q: any) => !q.ai_explanation)) {
        console.log('🔧 发现90-92题缺少图片信息，现在添加...\n');
        
        const imageUrls = ['A', 'B', 'C', 'D', 'E'].map(option => 
          `/shuju/2024年执业药师中药药一历年真题/img/90-92-${option}.jpeg`
        );

        for (const q of matched90to92) {
          if (!q.ai_explanation) {
            const { error: updateError } = await supabase
              .from('questions')
              .update({
                ai_explanation: JSON.stringify({ images: imageUrls })
              })
              .eq('id', q.id);
            
            if (updateError) {
              console.log(`❌ 更新失败 ${q.id}: ${updateError.message}`);
            } else {
              console.log(`✅ 更新成功: ${q.content.substring(0, 40)}...`);
            }
          }
        }

        console.log('\n✅ 90-92题图片信息已更新\n');
      } else {
        console.log('✅ 90-92题已包含图片信息\n');
      }
    }

  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
  }
}

check90to92();
