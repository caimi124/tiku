import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log('🧪 测试图片上传到Supabase Storage\n');

  try {
    // 检查bucket是否存在
    console.log('1️⃣ 检查Storage bucket...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ 获取bucket列表失败:', listError);
      return;
    }

    console.log(`   找到 ${buckets?.length || 0} 个buckets`);
    const hasQuestionImages = buckets?.find(b => b.name === 'question-images');
    console.log(`   question-images bucket: ${hasQuestionImages ? '✅存在' : '❌不存在'}\n`);

    // 尝试上传一张测试图片
    console.log('2️⃣ 尝试上传测试图片...');
    const testImagePath = path.join(__dirname, 'shuju/2024年执业药师中药药一历年真题/img/8-A.jpeg');
    
    if (!fs.existsSync(testImagePath)) {
      console.error(`❌ 测试图片不存在: ${testImagePath}`);
      return;
    }

    console.log(`   图片路径: ${testImagePath}`);
    console.log(`   图片大小: ${fs.statSync(testImagePath).size} bytes`);

    const imageBuffer = fs.readFileSync(testImagePath);
    const fileName = 'test-upload/8-A.jpeg';

    console.log(`   开始上传到: ${fileName}`);
    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error('❌ 上传失败:', error);
      return;
    }

    console.log('✅ 上传成功!');
    console.log('   数据:', data);

    // 获取公共URL
    const { data: urlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(fileName);

    console.log(`   公共URL: ${urlData.publicUrl}\n`);

    console.log('3️⃣ 测试完成！\n');

  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
  }
}

testUpload();
