import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

const prisma = new PrismaClient();

// Supabase配置
const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';
const supabase = createClient(supabaseUrl, supabaseKey);

interface QuestionJSON {
  number: number;
  question: string;
  images: string[];
  options: string[];
  answer: string;
  analysis: string;
}

// 上传图片到Supabase Storage
async function uploadImage(imagePath: string, imageName: string): Promise<string | null> {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const fileName = `yaoxue-yiyao-2024/${imageName}`;
    
    // 上传到Supabase Storage
    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error(`❌ 上传图片失败 ${imageName}:`, error.message);
      return null;
    }

    // 获取公共URL
    const { data: urlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error: any) {
    console.error(`❌ 读取图片失败 ${imagePath}:`, error.message);
    return null;
  }
}

// 解析选项
function parseOptions(optionsArray: string[]): { key: string; value: string }[] {
  return optionsArray.map(opt => {
    const match = opt.match(/^([A-E])\.\s*(.*)$/);
    if (match) {
      return { key: match[1], value: match[2].trim() };
    }
    return { key: '', value: opt };
  });
}

// 确定题型
function getQuestionType(number: number): string {
  if (number >= 1 && number <= 40) return 'single'; // 最佳选择题
  if (number >= 41 && number <= 80) return 'match'; // 配伍选择题
  if (number >= 81 && number <= 100) return 'comprehensive'; // 综合分析题
  if (number >= 101 && number <= 120) return 'multiple'; // 多项选择题
  return 'single';
}

// 确定章节
function getChapter(number: number): string {
  if (number >= 1 && number <= 40) return '一、最佳选择题';
  if (number >= 41 && number <= 80) return '二、配伍选择题';
  if (number >= 81 && number <= 100) return '三、综合分析题';
  if (number >= 101 && number <= 120) return '四、多项选择题';
  return '未分类';
}

async function main() {
  console.log('🚀 开始导入2024年执业药师药学专业知识（一）真题\n');

  try {
    // 检查并创建Storage bucket
    console.log('🔍 检查Storage bucket...\n');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (!buckets?.find(b => b.name === 'question-images')) {
      console.log('📦 创建 question-images bucket...\n');
      const { error: createError } = await supabase.storage.createBucket('question-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png']
      });
      
      if (createError) {
        console.log('⚠️  Bucket创建失败，可能已存在:', createError.message);
      } else {
        console.log('✅ Bucket创建成功\n');
      }
    } else {
      console.log('✅ Bucket已存在\n');
    }

    // 读取JSON文件
    const jsonPath = path.join(__dirname, '../shuju/2024年执业药师中药药一历年真题/questions.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const questions: QuestionJSON[] = JSON.parse(jsonContent);

    console.log(`📖 读取到 ${questions.length} 道题目\n`);

    // 1. 首先上传所有图片
    console.log('📤 开始上传图片...\n');
    const imageDir = path.join(__dirname, '../shuju/2024年执业药师中药药一历年真题/img');
    const imageMap = new Map<string, string>();

    // 获取所有需要上传的图片
    const allImages = new Set<string>();
    questions.forEach(q => {
      q.images.forEach(img => allImages.add(img));
    });

    let uploadedCount = 0;
    for (const imageName of allImages) {
      const imagePath = path.join(imageDir, imageName);
      if (fs.existsSync(imagePath)) {
        const publicUrl = await uploadImage(imagePath, imageName);
        if (publicUrl) {
          imageMap.set(imageName, publicUrl);
          uploadedCount++;
          console.log(`✅ [${uploadedCount}/${allImages.size}] 上传成功: ${imageName}`);
        }
      } else {
        console.log(`⚠️  图片不存在: ${imagePath}`);
      }
    }

    console.log(`\n📊 图片上传完成: ${uploadedCount}/${allImages.size}\n`);

    // 2. 删除已存在的2024年药学专业知识（一）题目
    const deleted = await prisma.questions.deleteMany({
      where: {
        exam_type: '执业药师',
        subject: '药学专业知识（一）',
        source_year: 2024,
      },
    });
    console.log(`🗑️  已清理旧数据: ${deleted.count} 条\n`);

    // 3. 导入题目
    console.log('📝 开始导入题目...\n');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      try {
        // 处理图片 - 优先使用上传的URL，否则使用本地路径
        const imageData = q.images.map(img => {
          const uploadedUrl = imageMap.get(img);
          if (uploadedUrl) {
            return uploadedUrl;
          }
          // 使用相对路径，前端可以直接访问
          return `/shuju/2024年执业药师中药药一历年真题/img/${img}`;
        });

        // 构建content，如果有图片则添加到内容中
        let content = q.question;
        if (imageData.length > 0) {
          content += '\n\n【题目包含图片】';
        }

        await prisma.questions.create({
          data: {
            exam_type: '执业药师',
            subject: '药学专业知识（一）',
            chapter: getChapter(q.number),
            question_type: getQuestionType(q.number),
            content: content,
            options: parseOptions(q.options),
            correct_answer: q.answer,
            explanation: q.analysis || '',
            difficulty: 2,
            knowledge_points: [],
            source_type: '历年真题',
            source_year: 2024,
            is_published: true,
            // 将图片信息存储到ai_explanation字段
            ai_explanation: imageData.length > 0 ? JSON.stringify({ images: imageData }) : null,
          },
        });

        successCount++;
        const progress = `[${i + 1}/${questions.length}]`;
        const preview = q.question.substring(0, 30);
        const imageInfo = q.images.length > 0 ? `📷×${q.images.length}` : '';
        console.log(`✅ ${progress} ${preview}... ${imageInfo}`);
      } catch (error: any) {
        errorCount++;
        console.error(`❌ [${i + 1}] 导入失败:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 导入统计:');
    console.log(`   ✅ 成功: ${successCount} 道`);
    console.log(`   ❌ 失败: ${errorCount} 道`);
    console.log(`   📝 总计: ${questions.length} 道`);
    console.log(`   📷 图片: ${uploadedCount} 张`);
    console.log(`${'='.repeat(60)}\n`);

    // 验证
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '药学专业知识（一）',
        source_year: 2024,
      },
    });
    console.log(`✨ 数据库中现有【2024年药学专业知识（一）】题目: ${total} 道\n`);
    console.log('🎉 导入完成！\n');

  } catch (error: any) {
    console.error('❌ 导入失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
