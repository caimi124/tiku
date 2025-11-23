import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// 直接连接生产数据库
const DATABASE_URL = 'postgresql://postgres:bdcW5inRuvSMfwYN@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

interface QuestionJSON {
  number: number;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
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
function getQuestionType(number: number, options: string[], answer: string): string {
  if (answer && answer.length > 1 && /^[A-E]+$/.test(answer.replace(/,\s*/g, ''))) {
    return 'multiple';
  }
  if (number >= 41 && number <= 90) {
    return 'match';
  }
  if (number >= 91 && number <= 110) {
    return 'comprehensive';
  }
  return 'single';
}

// 确定章节
function getChapter(number: number): string {
  if (number >= 1 && number <= 40) return '一、最佳选择题';
  if (number >= 41 && number <= 90) return '二、配伍选择题';
  if (number >= 91 && number <= 110) return '三、综合分析题';
  if (number >= 111 && number <= 120) return '四、多项选择题';
  return '未分类';
}

async function importData() {
  console.log('🚀 开始导入所有历年真题到生产数据库\n');
  console.log('═'.repeat(70));

  try {
    // 测试连接
    console.log('\n📡 步骤1：连接生产数据库...');
    await prisma.$connect();
    console.log('✅ 生产数据库连接成功\n');

    // 定义所有数据文件
    const dataFiles = [
      {
        year: 2024,
        subject: '中药学综合知识与技能',
        file: 'shuju/2024年执业药师中药师药学综合与技能历年真题.json'
      },
      {
        year: 2023,
        subject: '中药学综合知识与技能',
        file: 'shuju/2023年执业药师中药师药学综合与技能历年真题.json'
      },
      {
        year: 2022,
        subject: '中药学综合知识与技能',
        file: 'shuju/2022年执业药师中药师药学综合与技能历年真题.json'
      },
      {
        year: 2024,
        subject: '中药学专业知识（一）',
        file: 'shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json'
      }
    ];

    let totalImported = 0;
    let totalErrors = 0;

    // 导入每个文件
    for (const dataFile of dataFiles) {
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`📚 导入 ${dataFile.year}年 ${dataFile.subject}`);
      console.log(`${'─'.repeat(70)}\n`);

      const filePath = path.join(__dirname, dataFile.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  文件不存在: ${filePath}`);
        continue;
      }

      // 读取JSON文件
      const jsonContent = fs.readFileSync(filePath, 'utf-8');
      const questions: QuestionJSON[] = JSON.parse(jsonContent);

      console.log(`📖 读取到 ${questions.length} 道题目`);

      // 删除已存在的同年份同科目数据
      console.log('🗑️  清理旧数据...');
      const deleted = await prisma.questions.deleteMany({
        where: {
          exam_type: '执业药师',
          subject: dataFile.subject,
          source_year: dataFile.year,
        },
      });
      console.log(`   已删除 ${deleted.count} 条旧数据\n`);

      // 导入题目
      console.log('📝 开始导入题目...\n');
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        try {
          await prisma.questions.create({
            data: {
              exam_type: '执业药师',
              subject: dataFile.subject,
              chapter: getChapter(q.number),
              question_type: getQuestionType(q.number, q.options, q.answer),
              content: q.question,
              options: parseOptions(q.options),
              correct_answer: q.answer,
              explanation: q.analysis || '',
              difficulty: 2,
              knowledge_points: [],
              source_type: '历年真题',
              source_year: dataFile.year,
              is_published: true,
            },
          });

          successCount++;
          if ((i + 1) % 20 === 0) {
            console.log(`   进度: ${i + 1}/${questions.length}`);
          }
        } catch (error: any) {
          errorCount++;
          console.error(`   ❌ Q${q.number} 导入失败:`, error.message);
        }
      }

      console.log(`\n   ✅ 成功: ${successCount} 道`);
      console.log(`   ❌ 失败: ${errorCount} 道`);

      totalImported += successCount;
      totalErrors += errorCount;
    }

    console.log(`\n${'═'.repeat(70)}`);
    console.log('📊 导入统计汇总:');
    console.log(`${'═'.repeat(70)}`);
    console.log(`   ✅ 总成功: ${totalImported} 道`);
    console.log(`   ❌ 总失败: ${totalErrors} 道`);
    console.log(`${'═'.repeat(70)}\n`);

    // 验证数据
    console.log('🔍 验证生产数据库...\n');
    const byYearAndSubject = await prisma.questions.groupBy({
      by: ['source_year', 'subject'],
      where: {
        source_type: '历年真题',
        exam_type: '执业药师'
      },
      _count: {
        id: true
      },
      orderBy: [
        { source_year: 'desc' },
        { subject: 'asc' }
      ]
    });

    console.log('📊 生产数据库中的历年真题:');
    const yearGroups: Record<number, any[]> = {};
    byYearAndSubject.forEach(item => {
      const year = item.source_year || 0;
      if (!yearGroups[year]) {
        yearGroups[year] = [];
      }
      yearGroups[year].push(item);
    });

    Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a)).forEach(year => {
      console.log(`\n   ${year}年:`);
      yearGroups[Number(year)].forEach((item: any) => {
        console.log(`      ${item.subject}: ${item._count.id}道 ✅`);
      });
    });

    console.log('\n🎉 导入完成！\n');
    console.log('💡 现在访问 https://yikaobiguo.com/practice/history?exam=pharmacist');
    console.log('   应该可以看到所有历年真题了！\n');

  } catch (error: any) {
    console.error('\n❌ 导入失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
