import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MTAzOCwiZXhwIjoyMDc4NzU3MDM4fQ.i0nA_AOLnBdeK7chICmeltFchkdJmYKMVqVxu8IaofE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseImageIssue() {
  console.log('🔍 诊断中药学专业知识（一）图片显示问题\n');
  console.log('═'.repeat(70));

  try {
    // 1. 检查90-92题的数据库记录
    console.log('\n📊 步骤1：检查90-92题的数据库记录\n');
    
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_type', '执业药师')
      .eq('subject', '中药学专业知识（一）')
      .eq('source_year', 2024)
      .gte('content', '90')
      .order('content', { ascending: true });

    if (error) {
      console.error('❌ 查询失败:', error.message);
      return;
    }

    // 找出90-92题（通过题目内容判断）
    const imageQuestions = questions?.filter((q: any) => {
      return q.content.includes('图示') || q.content.includes('[图示]');
    }).slice(0, 3); // 取前3道图片题

    console.log(`找到 ${imageQuestions?.length || 0} 道包含图片的题目\n`);

    if (imageQuestions && imageQuestions.length > 0) {
      imageQuestions.forEach((q: any, index: number) => {
        console.log(`题目 ${index + 1}:`);
        console.log(`   ID: ${q.id}`);
        console.log(`   内容: ${q.content.substring(0, 50)}...`);
        console.log(`   章节: ${q.chapter}`);
        console.log(`   ai_explanation: ${q.ai_explanation || '空'}`);
        
        if (q.ai_explanation) {
          try {
            const imageData = JSON.parse(q.ai_explanation);
            console.log(`   图片数据:`);
            console.log(`      格式: ${typeof imageData}`);
            console.log(`      内容: ${JSON.stringify(imageData, null, 2)}`);
            if (imageData.images) {
              console.log(`      图片数量: ${imageData.images.length}`);
              imageData.images.forEach((url: string, i: number) => {
                console.log(`         [${i}] ${url}`);
              });
            }
          } catch (e) {
            console.log(`   ⚠️  JSON解析失败`);
          }
        }
        console.log('');
      });
    }

    // 2. 检查本地图片文件
    console.log('\n📂 步骤2：检查本地图片文件\n');
    
    const publicImageDir = path.join(__dirname, 'public/shuju/2024年执业药师中药药一历年真题/img');
    const sourceImageDir = path.join(__dirname, 'shuju/2024年执业药师中药药一历年真题/img');
    
    console.log(`Public目录: ${publicImageDir}`);
    console.log(`存在: ${fs.existsSync(publicImageDir) ? '✅' : '❌'}\n`);
    
    if (fs.existsSync(publicImageDir)) {
      const files = fs.readdirSync(publicImageDir);
      const imageFiles = files.filter(f => f.includes('90-92'));
      console.log(`90-92相关图片 (public):`);
      imageFiles.forEach(f => {
        const stat = fs.statSync(path.join(publicImageDir, f));
        console.log(`   ✅ ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
      });
    }
    
    console.log(`\n源文件目录: ${sourceImageDir}`);
    console.log(`存在: ${fs.existsSync(sourceImageDir) ? '✅' : '❌'}\n`);
    
    if (fs.existsSync(sourceImageDir)) {
      const files = fs.readdirSync(sourceImageDir);
      const imageFiles = files.filter(f => f.includes('90-92'));
      console.log(`90-92相关图片 (source):`);
      imageFiles.forEach(f => {
        const stat = fs.statSync(path.join(sourceImageDir, f));
        console.log(`   ✅ ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
      });
    }

    // 3. 分析问题
    console.log('\n\n🔬 步骤3：问题分析\n');
    console.log('═'.repeat(70));
    
    const hasImages = imageQuestions?.some((q: any) => q.ai_explanation);
    const publicExists = fs.existsSync(publicImageDir);
    
    if (!hasImages) {
      console.log('❌ 问题1: 数据库中ai_explanation字段为空');
      console.log('   解决: 需要重新导入数据并正确设置图片路径');
    } else {
      console.log('✅ 数据库中有图片数据');
    }
    
    if (!publicExists) {
      console.log('❌ 问题2: public文件夹中没有图片');
      console.log('   解决: 需要将图片复制到public文件夹');
    } else {
      console.log('✅ public文件夹中有图片文件');
    }

    console.log('\n' + '═'.repeat(70));
    console.log('✅ 诊断完成\n');

  } catch (error: any) {
    console.error('❌ 诊断失败:', error.message);
  }
}

diagnoseImageIssue();
