import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function listMissingOptions() {
  try {
    console.log('📋 需要人工补充选项的12道题目清单\n');
    console.log('=' .repeat(80));

    const questions = await prisma.questions.findMany({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能'
      },
      orderBy: {
        created_at: 'asc'
      },
      select: {
        content: true,
        options: true,
        correct_answer: true,
        chapter: true
      }
    });

    // 需要补充的题号（题13已修复）
    const needFixQuestions = [17, 18, 27, 31, 33, 36, 91, 94, 101, 104, 106, 110];

    // 读取JSON源文件以对比
    const jsonPath = path.join(__dirname, 'shuju', '2024年执业药师西药师药学综合与技能历年真题.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const jsonQuestions = JSON.parse(jsonData);

    needFixQuestions.forEach(num => {
      const dbQuestion = questions[num - 1];
      const jsonQuestion = jsonQuestions[num - 1];
      const currentOptions = Array.isArray(dbQuestion.options) ? dbQuestion.options : [];

      console.log(`\n题${num}（${dbQuestion.chapter}）`);
      console.log('─'.repeat(80));
      console.log(`题目：${dbQuestion.content.substring(0, 100)}${dbQuestion.content.length > 100 ? '...' : ''}`);
      console.log(`\n当前选项数量：${currentOptions.length}个`);
      console.log('现有选项：');
      
      if (currentOptions.length > 0) {
        currentOptions.forEach((opt: any) => {
          if (typeof opt === 'string') {
            console.log(`  ${opt}`);
          } else if (typeof opt === 'object' && opt !== null) {
            console.log(`  ${opt.key || ''}.${opt.value || ''}`);
          }
        });
      } else {
        console.log('  （无选项）');
      }

      console.log(`\n正确答案：${dbQuestion.correct_answer}`);
      
      // 分析缺失情况
      const allLetters = ['A', 'B', 'C', 'D', 'E'];
      const existingLetters = currentOptions
        .map((opt: any) => {
          if (typeof opt === 'string') {
            const match = opt.match(/^([A-E])\./);
            return match ? match[1] : null;
          }
          return null;
        })
        .filter((l: any) => l !== null);

      const missingLetters = allLetters.filter(l => !existingLetters.includes(l));
      
      if (missingLetters.length > 0) {
        console.log(`\n⚠️  缺失的选项：${missingLetters.join(', ')}`);
      }

      console.log('\n' + '═'.repeat(80));
    });

    // 生成补充模板
    console.log('\n\n');
    console.log('=' .repeat(80));
    console.log('📝 补充选项模板（复制后填写）');
    console.log('=' .repeat(80));
    
    console.log('\n```typescript');
    console.log('// 补充缺失选项的数据');
    console.log('const missingOptionsData: Record<number, string[]> = {');
    
    needFixQuestions.forEach(num => {
      const dbQuestion = questions[num - 1];
      const currentOptions = Array.isArray(dbQuestion.options) ? dbQuestion.options : [];
      console.log(`  ${num}: [ // 当前${currentOptions.length}个选项，需要补充到5个`);
      console.log(`    'A. [待补充]',`);
      console.log(`    'B. [待补充]',`);
      console.log(`    'C. [待补充]',`);
      console.log(`    'D. [待补充]',`);
      console.log(`    'E. [待补充]'`);
      console.log(`  ],`);
    });
    
    console.log('};');
    console.log('```');

    // 统计信息
    console.log('\n\n');
    console.log('=' .repeat(80));
    console.log('📊 统计信息');
    console.log('=' .repeat(80));
    
    const stats = {
      total: needFixQuestions.length,
      best: 0,
      pairing: 0,
      comprehensive: 0,
      multiple: 0
    };

    needFixQuestions.forEach(num => {
      const chapter = questions[num - 1]?.chapter;
      if (chapter?.includes('最佳选择题')) stats.best++;
      else if (chapter?.includes('配伍选择题')) stats.pairing++;
      else if (chapter?.includes('综合分析题')) stats.comprehensive++;
      else if (chapter?.includes('多项选择题')) stats.multiple++;
    });

    console.log(`\n需要补充的题目总数：${stats.total}道`);
    console.log(`  - 最佳选择题：${stats.best}道（题17, 18, 27, 31, 33, 36）`);
    console.log(`  - 配伍选择题：${stats.pairing}道`);
    console.log(`  - 综合分析题：${stats.comprehensive}道（题91, 94, 101, 104, 106, 110）`);
    console.log(`  - 多项选择题：${stats.multiple}道`);

    console.log('\n\n💡 提示：');
    console.log('1. 请根据考试大纲或标准答案补充完整的5个选项');
    console.log('2. 选项格式：A.选项内容（注意大写字母+英文点号+内容）');
    console.log('3. 补充完成后，运行更新脚本：npx tsx update-missing-options.ts');
    console.log('4. 建议先补充最佳选择题，因为这些题相对独立');

  } catch (error) {
    console.error('❌ 列出失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

listMissingOptions();
