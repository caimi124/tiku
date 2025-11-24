import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查2022年图片是否已在数据库中...\n');

  try {
    // 获取2022年的所有题目
    const questions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2022,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log(`📊 数据库中2022年题目总数: ${questions.length}`);

    // 查找包含图片的题目
    const imageQuestions = questions.filter(q => {
      if (!q.ai_explanation) return false;
      try {
        const aiExplanation = JSON.parse(q.ai_explanation as string);
        return aiExplanation && aiExplanation.images && aiExplanation.images.length > 0;
      } catch (e) {
        return false;
      }
    });

    console.log(`🖼️  包含图片的题目数量: ${imageQuestions.length}`);

    if (imageQuestions.length > 0) {
      console.log('\n📋 图片题目详情:');
      
      let totalImages = 0;
      let existingImages = 0;
      let missingImages = 0;

      for (const q of imageQuestions) {
        const aiExplanation = JSON.parse(q.ai_explanation as string);
        const images = aiExplanation.images || [];
        
        console.log(`\n题${questions.indexOf(q) + 1}: ${q.content.substring(0, 30)}...`);
        console.log(`  图片数量: ${images.length}`);
        
        for (const imagePath of images) {
          totalImages++;
          const fullPath = path.join('E:\\tiku\\public', imagePath);
          const exists = fs.existsSync(fullPath);
          
          if (exists) {
            existingImages++;
            console.log(`  ✅ ${imagePath}`);
          } else {
            missingImages++;
            console.log(`  ❌ ${imagePath} (文件不存在)`);
          }
        }
      }

      console.log('\n📊 图片统计:');
      console.log(`  总图片数: ${totalImages}`);
      console.log(`  存在的图片: ${existingImages}`);
      console.log(`  缺失的图片: ${missingImages}`);
      
      if (missingImages === 0) {
        console.log('\n🎉 所有图片都已正确存储在public目录中！');
      } else {
        console.log('\n⚠️  有图片文件缺失，需要检查图片复制是否完整。');
      }
    } else {
      console.log('\n⚠️  数据库中没有找到包含图片的题目！');
    }

    // 检查public目录中的图片文件
    const publicImageDir = 'E:\\tiku\\public\\shuju\\2022年执业药师中药师药一历年真题图片';
    if (fs.existsSync(publicImageDir)) {
      const imageFiles = fs.readdirSync(publicImageDir).filter(file => 
        file.toLowerCase().endsWith('.jpg') || 
        file.toLowerCase().endsWith('.jpeg') || 
        file.toLowerCase().endsWith('.png')
      );
      console.log(`\n📁 public目录中的图片文件数量: ${imageFiles.length}`);
      
      if (imageFiles.length > 0) {
        console.log('前5个图片文件:');
        imageFiles.slice(0, 5).forEach(file => {
          console.log(`  - ${file}`);
        });
      }
    } else {
      console.log('\n❌ public目录中的图片文件夹不存在！');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
