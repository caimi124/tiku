import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const localPrisma = new PrismaClient();

async function check() {
  console.log('🔍 检查本地数据库中的图片数据\n');

  try {
    // 检查本地数据库
    const localCount = await localPrisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
      }
    });
    
    console.log(`📊 本地数据库2023年题目数量: ${localCount}`);

    const localWithImages = await localPrisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        ai_explanation: {
          not: null
        }
      }
    });

    console.log(`📷 本地数据库有图片数据的题目: ${localWithImages}`);

    if (localWithImages > 0) {
      const sample = await localPrisma.questions.findFirst({
        where: {
          exam_type: '执业药师',
          subject: '中药学专业知识（一）',
          source_year: 2023,
          ai_explanation: {
            not: null
          }
        }
      });

      console.log('\n示例题目:');
      console.log('内容:', sample?.content.substring(0, 50));
      console.log('ai_explanation:', sample?.ai_explanation?.substring(0, 100));
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n💡 分析结果:\n');

    if (localCount > 0 && localWithImages > 0) {
      console.log('✅ 本地数据库有数据，且有图片信息');
      console.log('\n❌ 问题确认：');
      console.log('   1. 图片数据只在本地数据库');
      console.log('   2. 生产环境（Vercel）连接的是Supabase数据库');
      console.log('   3. 导入脚本使用的是.env.local（本地数据库）');
      console.log('   4. 生产数据库中没有2023年的图片数据');
      console.log('\n✅ 解决方案：');
      console.log('   需要重新运行导入脚本，但连接到生产数据库（Supabase）');
    } else {
      console.log('⚠️ 本地数据库也没有数据');
    }

    // 检查环境变量
    console.log('\n\n📋 当前环境变量:\n');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    if (process.env.DATABASE_URL?.includes('supabase')) {
      console.log('✅ 连接的是Supabase生产数据库');
    } else if (process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1')) {
      console.log('⚠️ 连接的是本地数据库');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await localPrisma.$disconnect();
  }
}

check();
