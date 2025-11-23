import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MTAzOCwiZXhwIjoyMDc4NzU3MDM4fQ.i0nA_AOLnBdeK7chICmeltFchkdJmYKMVqVxu8IaofE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 根据题号和规则匹配图片
function getImageNames(questionNumber: number): string[] {
  const images: string[] = [];
  
  // 最佳选择题：8、9、10、11题
  if ([8, 9, 10, 11].includes(questionNumber)) {
    ['A', 'B', 'C', 'D', 'E'].forEach(option => {
      images.push(`${questionNumber}-${option}.jpeg`);
    });
  }
  // 配伍选择题：61-62、63-64题
  else if (questionNumber === 61 || questionNumber === 62) {
    ['A', 'B', 'C', 'D', 'E'].forEach(option => {
      images.push(`61-62-${option} .jpeg`); // 注意文件名中有空格
    });
  }
  else if (questionNumber === 63 || questionNumber === 64) {
    ['A', 'B', 'C', 'D', 'E'].forEach(option => {
      images.push(`63-64-${option}.jpeg`);
    });
  }
  // 综合分析题：90-92题
  else if (questionNumber >= 90 && questionNumber <= 92) {
    ['A', 'B', 'C', 'D', 'E'].forEach(option => {
      images.push(`90-92-${option}.jpeg`);
    });
  }

  return images;
}

// 查找实际文件名（处理空格等情况）
function findImageFile(baseDir: string, imageName: string): string | null {
  if (fs.existsSync(path.join(baseDir, imageName))) {
    return imageName;
  }
  const noSpace = imageName.replace(/\s/g, '');
  if (fs.existsSync(path.join(baseDir, noSpace))) {
    return noSpace;
  }
  const withSpace = imageName.replace('.jpeg', ' .jpeg');
  if (fs.existsSync(path.join(baseDir, withSpace))) {
    return withSpace;
  }
  return null;
}

// 从题目内容中提取题号
function extractQuestionNumber(content: string): number | null {
  // 尝试匹配题号模式
  const patterns = [
    /^(\d+)[、.]/,  // 开头数字
    /题(\d+)/,      // "题8"
    /第(\d+)题/     // "第8题"
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
}

async function fixZhongyaoImages() {
  console.log('🔧 修复中药学专业知识（一）图片显示问题\n');
  console.log('═'.repeat(70));

  try {
    // 1. 获取所有带图片标记的题目
    console.log('\n📊 步骤1：查询所有图片题目\n');
    
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_type', '执业药师')
      .eq('subject', '中药学专业知识（一）')
      .eq('source_year', 2024)
      .or('content.ilike.%图示%,content.ilike.%[图示]%');

    if (error) {
      console.error('❌ 查询失败:', error.message);
      return;
    }

    console.log(`找到 ${questions?.length || 0} 道图片题目\n`);

    if (!questions || questions.length === 0) {
      console.log('⚠️  没有找到图片题目');
      return;
    }

    // 2. 检查本地图片文件
    const imageDir = path.join(__dirname, 'public/shuju/2024年执业药师中药药一历年真题/img');
    
    if (!fs.existsSync(imageDir)) {
      console.error('❌ 图片目录不存在:', imageDir);
      return;
    }

    console.log('✅ 图片目录存在\n');

    // 3. 为每道题目匹配图片并更新数据库
    console.log('🔄 步骤2：更新图片信息\n');
    
    let successCount = 0;
    let errorCount = 0;

    // 定义图片题号映射（手动确认的题号）
    const imageQuestionMap: Record<number, number[]> = {
      8: [8],
      9: [9],
      10: [10],
      11: [11],
      61: [61, 62],
      62: [61, 62],
      63: [63, 64],
      64: [63, 64],
      90: [90, 91, 92],
      91: [90, 91, 92],
      92: [90, 91, 92]
    };

    for (const question of questions) {
      try {
        const content = question.content;
        console.log(`处理: ${content.substring(0, 40)}...`);
        
        // 从JSON文件读取题号（更准确）
        const jsonPath = path.join(__dirname, 'shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json');
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const allQuestions = JSON.parse(jsonContent);
        
        // 找到匹配的题目
        const matchedQuestion = allQuestions.find((q: any) => 
          q.question === content || content.includes(q.question.substring(0, 20))
        );
        
        if (!matchedQuestion) {
          console.log('   ⚠️  无法匹配题号\n');
          continue;
        }
        
        const questionNumber = matchedQuestion.number;
        console.log(`   题号: ${questionNumber}`);
        
        // 获取该题的图片文件名
        const imageNames = getImageNames(questionNumber);
        
        if (imageNames.length === 0) {
          console.log(`   ⚠️  题号${questionNumber}不在图片题范围内\n`);
          continue;
        }
        
        // 检查图片文件是否存在，并构建URL
        const imageUrls: string[] = [];
        for (const imageName of imageNames) {
          const actualFileName = findImageFile(imageDir, imageName);
          if (actualFileName) {
            // 使用相对路径，前端可以直接访问
            const imageUrl = `/shuju/2024年执业药师中药药一历年真题/img/${actualFileName}`;
            imageUrls.push(imageUrl);
          }
        }
        
        console.log(`   找到 ${imageUrls.length} 张图片`);
        
        if (imageUrls.length > 0) {
          // 更新数据库
          const { error: updateError } = await supabase
            .from('questions')
            .update({
              ai_explanation: JSON.stringify({ images: imageUrls })
            })
            .eq('id', question.id);
          
          if (updateError) {
            console.log(`   ❌ 更新失败: ${updateError.message}\n`);
            errorCount++;
          } else {
            console.log(`   ✅ 更新成功\n`);
            successCount++;
          }
        } else {
          console.log(`   ⚠️  未找到图片文件\n`);
          errorCount++;
        }
        
      } catch (err: any) {
        console.error(`   ❌ 处理失败: ${err.message}\n`);
        errorCount++;
      }
    }

    console.log('═'.repeat(70));
    console.log('\n📊 更新统计:');
    console.log(`   ✅ 成功: ${successCount} 道`);
    console.log(`   ❌ 失败: ${errorCount} 道`);
    console.log('═'.repeat(70));

    // 4. 验证更新结果
    console.log('\n🔍 步骤3：验证更新结果\n');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('questions')
      .select('content, ai_explanation')
      .eq('exam_type', '执业药师')
      .eq('subject', '中药学专业知识（一）')
      .eq('source_year', 2024)
      .not('ai_explanation', 'is', null);

    if (verifyError) {
      console.error('⚠️  验证查询失败:', verifyError.message);
    } else {
      console.log(`✅ 数据库中有 ${verifyData?.length || 0} 道题目包含图片信息\n`);
      
      if (verifyData && verifyData.length > 0) {
        verifyData.slice(0, 3).forEach((q: any, i: number) => {
          console.log(`示例 ${i + 1}: ${q.content.substring(0, 30)}...`);
          try {
            const imageData = JSON.parse(q.ai_explanation);
            console.log(`   图片数量: ${imageData.images?.length || 0}`);
          } catch (e) {
            console.log(`   ⚠️  JSON解析失败`);
          }
        });
      }
    }

    console.log('\n✅ 修复完成！\n');
    console.log('💡 现在访问 https://yikaobiguo.com/practice/history/2024?subject=中药学专业知识（一）');
    console.log('   图片应该可以正常显示了\n');

  } catch (error: any) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixZhongyaoImages();
