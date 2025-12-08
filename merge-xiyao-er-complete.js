/**
 * 西药药二知识图谱数据合并脚本
 * 将多个JSON源文件合并为单一完整的知识图谱数据
 */

const fs = require('fs');
const path = require('path');

// 中文数字映射表
const CHINESE_NUMBER_MAP = {
  '零': 0, '一': 1, '二': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
  '十': 10, '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15
};

/**
 * 中文数字转阿拉伯数字
 */
function chineseToNumber(chinese) {
  if (!chinese || typeof chinese !== 'string') return 0;
  const trimmed = chinese.trim();
  if (CHINESE_NUMBER_MAP[trimmed] !== undefined) {
    return CHINESE_NUMBER_MAP[trimmed];
  }
  // 处理 "十X" 格式
  if (trimmed.startsWith('十') && trimmed.length === 2) {
    const unit = CHINESE_NUMBER_MAP[trimmed[1]];
    if (unit !== undefined && unit >= 1 && unit <= 9) {
      return 10 + unit;
    }
  }
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * 合并章节数据
 */
function mergeChapters(chapters) {
  const chapterMap = new Map();
  
  for (const chapter of chapters) {
    const key = chapter.chapter_number;
    
    if (chapterMap.has(key)) {
      // 合并小节
      const existing = chapterMap.get(key);
      const existingSectionNumbers = new Set(
        existing.sections.map(s => s.section_number)
      );
      
      for (const section of chapter.sections) {
        if (!existingSectionNumbers.has(section.section_number)) {
          existing.sections.push(section);
          existingSectionNumbers.add(section.section_number);
        }
      }
    } else {
      // 深拷贝章节
      chapterMap.set(key, {
        ...chapter,
        sections: [...chapter.sections]
      });
    }
  }
  
  // 按章节号排序
  return Array.from(chapterMap.values()).sort((a, b) => {
    return chineseToNumber(a.chapter_number) - chineseToNumber(b.chapter_number);
  });
}

/**
 * 对章节内的小节进行排序
 */
function sortSections(chapters) {
  for (const chapter of chapters) {
    chapter.sections.sort((a, b) => {
      return chineseToNumber(a.section_number) - chineseToNumber(b.section_number);
    });
  }
  return chapters;
}

/**
 * 计算统计信息
 */
function calculateStatistics(chapters, sourceFiles) {
  let totalSections = 0;
  let totalPoints = 0;
  let totalGeneralContent = 0;
  
  for (const chapter of chapters) {
    totalSections += chapter.sections.length;
    
    for (const section of chapter.sections) {
      const parts = section.parts || {};
      
      // 统计知识点
      if (parts.考点梳理?.knowledge_points) {
        totalPoints += parts.考点梳理.knowledge_points.length;
      }
      if (parts.考点透析?.knowledge_points) {
        totalPoints += parts.考点透析.knowledge_points.length;
      }
      if (parts.重点强化?.knowledge_points) {
        totalPoints += parts.重点强化.knowledge_points.length;
      }
      
      // 统计通用内容
      if (parts.考点梳理?.general_content) {
        totalGeneralContent += parts.考点梳理.general_content.length;
      }
      if (parts.考点透析?.general_content) {
        totalGeneralContent += parts.考点透析.general_content.length;
      }
      if (parts.重点强化?.general_content) {
        totalGeneralContent += parts.重点强化.general_content.length;
      }
    }
  }
  
  return {
    totalChapters: chapters.length,
    totalSections,
    totalPoints,
    totalGeneralContent,
    sourceFiles
  };
}

/**
 * 主函数：合并所有JSON文件
 */
async function main() {
  console.log('=== 西药药二知识图谱数据合并 ===\n');
  
  // 源文件列表
  const sourceFiles = [
    'shuju/执业药师西药二1-50页修改版.json',
    'shuju/执业药师西药二50-100页.json',
    'shuju/执业药师西药二101-150页.json',
    'shuju/执业药师西药二151-200页.json',
    'shuju/执业药师药二201-222页.json'
  ];
  
  // 读取所有源文件
  const allChapters = [];
  const loadedFiles = [];
  
  for (const filePath of sourceFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ 文件不存在，跳过: ${filePath}`);
      continue;
    }
    
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        allChapters.push(...data);
        loadedFiles.push(filePath);
        console.log(`✅ 已加载: ${filePath} (${data.length} 个章节)`);
      } else {
        console.log(`⚠️ 文件格式不正确，跳过: ${filePath}`);
      }
    } catch (error) {
      console.log(`❌ 读取文件失败: ${filePath}`, error.message);
    }
  }
  
  console.log(`\n📊 共加载 ${loadedFiles.length} 个文件，${allChapters.length} 个章节条目\n`);
  
  // 合并章节
  console.log('🔄 正在合并章节...');
  let mergedChapters = mergeChapters(allChapters);
  
  // 排序小节
  console.log('🔄 正在排序小节...');
  mergedChapters = sortSections(mergedChapters);
  
  // 计算统计信息
  const stats = calculateStatistics(mergedChapters, loadedFiles);
  
  console.log('\n📈 合并统计:');
  console.log(`   - 章节数: ${stats.totalChapters}`);
  console.log(`   - 小节数: ${stats.totalSections}`);
  console.log(`   - 知识点数: ${stats.totalPoints}`);
  console.log(`   - 通用内容数: ${stats.totalGeneralContent}`);
  
  // 输出合并后的数据
  const outputPath = 'shuju/西药药二_合并完整版.json';
  const outputData = {
    metadata: {
      title: '西药药二知识图谱完整版',
      subject_code: 'xiyao_yaoxue_er',
      created_at: new Date().toISOString(),
      statistics: stats
    },
    chapters: mergedChapters
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), outputPath),
    JSON.stringify(outputData, null, 2),
    'utf-8'
  );
  
  console.log(`\n✅ 合并完成！输出文件: ${outputPath}`);
  
  // 输出章节详情
  console.log('\n📚 章节详情:');
  for (const chapter of mergedChapters) {
    const chapterNum = chineseToNumber(chapter.chapter_number);
    console.log(`   第${chapter.chapter_number}章 (${chapterNum}): ${chapter.chapter_title}`);
    console.log(`      - 小节数: ${chapter.sections.length}`);
    for (const section of chapter.sections) {
      console.log(`      - 第${section.section_number}节: ${section.section_title}`);
    }
  }
  
  return { chapters: mergedChapters, statistics: stats };
}

// 运行主函数
main().catch(console.error);
