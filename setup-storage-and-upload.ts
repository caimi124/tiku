import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const prisma = new PrismaClient();

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

// 上传图片到Supabase Storage
async function uploadImage(imagePath: string, imageName: string): Promise<string | null> {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const fileName = `zhongyao-yaoxue-yiyao-2024/${imageName.replace(/\s/g, '')}`;
    
    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error(`   ❌ 上传失败 ${imageName}:`, error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error: any) {
    console.error(`   ❌ 读取失败 ${imagePath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 设置Supabase Storage并上传图片\n');

  try {
    // 1. 创建bucket（使用Supabase Dashboard或SQL）
    console.log('📦 步骤1: 创建Storage Bucket');
    console.log('   请在Supabase Dashboard中手动创建 "question-images" bucket');
    console.log('   设置为公开访问（public: true）\n');
    
    console.log('⏸️  按回车继续（请先确认bucket已创建）...\n');

    // 2. 收集所有图片文件
    console.log('📂 步骤2: 收集图片文件');
    const imageDir = path.join(__dirname, 'shuju/2024年执业药师中药药一历年真题/img');
    const allFiles = fs.readdirSync(imageDir).filter(f => f.endsWith('.jpeg'));
    console.log(`   找到 ${allFiles.length} 张图片\n`);

    // 3. 上传所有图片
    console.log('📤 步骤3: 上传图片到Supabase Storage\n');
    const imageMap = new Map<string, string>();
    let uploadedCount = 0;

    for (const fileName of allFiles) {
      const imagePath = path.join(imageDir, fileName);
      const publicUrl = await uploadImage(imagePath, fileName);
      
      if (publicUrl) {
        imageMap.set(fileName, publicUrl);
        imageMap.set(fileName.replace(/\s/g, ''), publicUrl);
        uploadedCount++;
        console.log(`   ✅ [${uploadedCount}/${allFiles.length}] ${fileName}`);
      }
    }

    console.log(`\n📊 上传完成: ${uploadedCount}/${allFiles.length} 张\n`);

    // 4. 更新数据库中的图片URL
    console.log('🔄 步骤4: 更新数据库中的图片URL\n');
    
    const questions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2024,
        ai_explanation: {
          not: null,
        },
      },
    });

    console.log(`   找到 ${questions.length} 道图片题目`);

    let updatedCount = 0;
    for (const q of questions) {
      if (!q.ai_explanation) continue;

      const imageData = JSON.parse(q.ai_explanation);
      if (!imageData.images || imageData.images.length === 0) continue;

      // 将本地路径替换为Supabase URL
      const updatedImages = imageData.images.map((localPath: string) => {
        const fileName = path.basename(localPath);
        const cleanFileName = fileName.replace(/\s/g, '');
        return imageMap.get(fileName) || imageMap.get(cleanFileName) || localPath;
      });

      // 检查是否有更新
      const hasUpdate = updatedImages.some((url: string, index: number) => 
        url !== imageData.images[index] && !url.startsWith('/')
      );

      if (hasUpdate) {
        await prisma.questions.update({
          where: { id: q.id },
          data: {
            ai_explanation: JSON.stringify({ images: updatedImages }),
          },
        });
        updatedCount++;
        console.log(`   ✅ 更新题目: ${q.content.substring(0, 30)}...`);
      }
    }

    console.log(`\n📊 更新完成: ${updatedCount} 道题目\n`);
    console.log('✅ 所有步骤完成！\n');

  } catch (error: any) {
    console.error('❌ 操作失败:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
