import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase配置
const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MTAzOCwiZXhwIjoyMDc4NzU3MDM4fQ.i0nA_AOLnBdeK7chICmeltFchkdJmYKMVqVxu8IaofE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

async function importDataViaAPI() {
  console.log('🚀 通过Supabase API导入所有历年真题\n');
  console.log('═'.repeat(70));

  try {
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
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('exam_type', '执业药师')
        .eq('subject', dataFile.subject)
        .eq('source_year', dataFile.year);

      if (deleteError) {
        console.log(`   ⚠️  清理失败: ${deleteError.message}`);
      } else {
        console.log(`   ✅ 旧数据已清理\n`);
      }

      // 准备批量插入数据
      console.log('📝 准备导入题目...\n');
      const dataToInsert = questions.map(q => ({
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
      }));

      // 分批导入（每次50条）
      const batchSize = 50;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < dataToInsert.length; i += batchSize) {
        const batch = dataToInsert.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('questions')
          .insert(batch);

        if (error) {
          console.error(`   ❌ 批次 ${Math.floor(i/batchSize) + 1} 导入失败:`, error.message);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
          console.log(`   ✅ 进度: ${Math.min(i + batchSize, dataToInsert.length)}/${dataToInsert.length}`);
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
    const { data: verifyData, error: verifyError } = await supabase
      .from('questions')
      .select('source_year, subject')
      .eq('source_type', '历年真题')
      .eq('exam_type', '执业药师');

    if (verifyError) {
      console.log('⚠️  验证失败:', verifyError.message);
    } else if (verifyData) {
      const stats: Record<string, Record<string, number>> = {};
      verifyData.forEach((item: any) => {
        const year = item.source_year?.toString() || '未知';
        const subject = item.subject || '未知';
        if (!stats[year]) stats[year] = {};
        if (!stats[year][subject]) stats[year][subject] = 0;
        stats[year][subject]++;
      });

      console.log('📊 生产数据库中的历年真题:');
      Object.keys(stats).sort((a, b) => Number(b) - Number(a)).forEach(year => {
        console.log(`\n   ${year}年:`);
        Object.keys(stats[year]).forEach(subject => {
          console.log(`      ${subject}: ${stats[year][subject]}道 ✅`);
        });
      });
    }

    console.log('\n🎉 导入完成！\n');
    console.log('💡 现在访问 https://yikaobiguo.com/practice/history?exam=pharmacist');
    console.log('   应该可以看到所有历年真题了！\n');
    console.log('⏰ 请等待1-2分钟让Vercel缓存刷新\n');

  } catch (error: any) {
    console.error('\n❌ 导入失败:', error.message);
    console.error('错误详情:', error);
  }
}

importDataViaAPI();
