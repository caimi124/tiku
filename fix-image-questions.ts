import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

const prisma = new PrismaClient();

// 定义哪些题目有图片
const IMAGE_MAPPING: Record<string, string[]> = {
  // 最佳选择题 8-11
  '图示中药为半枝莲的是': ['8-A.jpeg', '8-B.jpeg', '8-C.jpeg', '8-D.jpeg', '8-E.jpeg'],
  '图示中药为自然铜的是': ['9-A.jpeg', '9-B.jpeg', '9-C.jpeg', '9-D.jpeg', '9-E.jpeg'],
  '图示中药为香加皮的是': ['10-A.jpeg', '10-B.jpeg', '10-C.jpeg', '10-D.jpeg', '10-E.jpeg'],
  '图示中药为知母的是': ['11-A.jpeg', '11-B.jpeg', '11-C.jpeg', '11-D.jpeg', '11-E .jpeg'],
  
  // 配伍选择题 61-62（共用图片）
  '图示中药为茜草的是': ['61-62-A .jpeg', '61-62-B .jpeg', '61-62-C .jpeg', '61-62-D .jpeg', '61-62-E .jpeg'],
  '图示中药为威灵仙的是': ['61-62-A .jpeg', '61-62-B .jpeg', '61-62-C .jpeg', '61-62-D .jpeg', '61-62-E .jpeg'],
  
  // 配伍选择题 63-64（共用图片）
  '图示中药为肉桂的是': ['63-64-A .jpeg', '63-64-B.jpeg', '63-64-C.jpeg', '63-64-D.jpeg', '63-64-E.jpeg'],
  '图示中药为秦皮的是': ['63-64-A .jpeg', '63-64-B.jpeg', '63-64-C.jpeg', '63-64-D.jpeg', '63-64-E.jpeg'],
  
  // 综合分析题 90-92（共用图片）
  '结构类型为木脂素类化合物的是': ['90-92-A.jpeg', '90-92-B.jpeg', '90-92-C.jpeg', '90-92-D.jpeg', '90-92-E.jpeg'],
  '结构类型为香豆素类化合物的是': ['90-92-A.jpeg', '90-92-B.jpeg', '90-92-C.jpeg', '90-92-D.jpeg', '90-92-E.jpeg'],
  '结构类型为黄酮类化合物的是': ['90-92-A.jpeg', '90-92-B.jpeg', '90-92-C.jpeg', '90-92-D.jpeg', '90-92-E.jpeg'],
};

async function fixImageQuestions() {
  console.log('🔧 开始修复图片题目的ai_explanation字段\n');

  const imageDir = path.join(__dirname, 'public/shuju/2024年执业药师中药药一历年真题/img');
  
  // 检查文件名变体（处理空格）
  function findActualFileName(imageName: string): string | null {
    if (fs.existsSync(path.join(imageDir, imageName))) {
      return imageName;
    }
    const noSpace = imageName.replace(/\s/g, '');
    if (fs.existsSync(path.join(imageDir, noSpace))) {
      return noSpace;
    }
    const withSpace = imageName.replace('.jpeg', ' .jpeg');
    if (fs.existsSync(path.join(imageDir, withSpace))) {
      return withSpace;
    }
    return null;
  }

  let updatedCount = 0;
  let errorCount = 0;

  for (const [questionContent, imageNames] of Object.entries(IMAGE_MAPPING)) {
    try {
      // 查找匹配的题目
      const questions = await prisma.questions.findMany({
        where: {
          exam_type: '执业药师',
          subject: '中药学专业知识（一）',
          source_year: 2024,
          content: {
            contains: questionContent
          }
        }
      });

      if (questions.length === 0) {
        console.log(`⚠️  未找到题目: ${questionContent}`);
        continue;
      }

      // 构建图片路径数组
      const imagePaths: string[] = [];
      for (const imgName of imageNames) {
        const actualFileName = findActualFileName(imgName);
        if (actualFileName) {
          imagePaths.push(`/shuju/2024年执业药师中药药一历年真题/img/${actualFileName}`);
        } else {
          console.log(`⚠️  图片文件不存在: ${imgName}`);
        }
      }

      if (imagePaths.length === 0) {
        console.log(`❌ 题目"${questionContent}"没有找到任何图片文件`);
        errorCount++;
        continue;
      }

      // 更新所有匹配的题目
      for (const question of questions) {
        const aiExplanation = JSON.stringify({ images: imagePaths });
        
        await prisma.questions.update({
          where: { id: question.id },
          data: {
            ai_explanation: aiExplanation,
            content: question.content.includes('【题目包含图片】') 
              ? question.content 
              : question.content + '\n\n【题目包含图片】'
          }
        });

        console.log(`✅ 已更新: ${questionContent.substring(0, 30)}... (${imagePaths.length}张图片)`);
        updatedCount++;
      }

    } catch (error: any) {
      console.error(`❌ 更新失败: ${questionContent}`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 修复完成:`);
  console.log(`   ✅ 成功: ${updatedCount} 道题`);
  console.log(`   ❌ 失败: ${errorCount} 道题`);
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

fixImageQuestions().catch(console.error);
