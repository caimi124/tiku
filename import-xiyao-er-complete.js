/**
 * 西药药二知识图谱完整导入脚本
 * 从合并后的JSON文件导入到数据库
 * 
 * 使用方法: node import-xiyao-er-complete.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 生成UUID
function generateUUID() {
  return crypto.randomUUID();
}

// 数据库连接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const SUBJECT_CODE = 'xiyao_yaoxue_er';

// 中文数字映射表
const CHINESE_NUMBER_MAP = {
  '零': 0, '一': 1, '二': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
  '十': 10, '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15,
  '十六': 16, '十七': 17, '十八': 18, '十九': 19, '二十': 20,
  '二十一': 21, '二十二': 22, '二十三': 23, '二十四': 24, '二十五': 25,
  '二十六': 26
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
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * 生成节点代码
 */
function generateNodeCode(chapter, section, point) {
  if (section === undefined) return `C${chapter}`;
  if (point === undefined) return `C${chapter}.${section}`;
  return `C${chapter}.${section}.${point}`;
}

/**
 * 提取口诀
 */
function extractMnemonics(text) {
  if (!text) return [];
  const mnemonics = [];
  const patterns = [
    /【润德巧记】([^【】\n]+)/g,
    /【巧记】([^【】\n]+)/g,
    /【口诀】([^【】\n]+)/g,
    /【记忆口诀】([^【】\n]+)/g,
    /【速记】([^【】\n]+)/g
  ];
  
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const content = match[1].trim();
      if (content && content.length < 200 && !mnemonics.includes(content)) {
        mnemonics.push(content);
      }
    }
  }
  return mnemonics;
}

/**
 * 计算重要性
 */
function calculateImportance(content) {
  if (!content) return 3;
  if (content.includes('禁用') || content.includes('禁忌')) return 5;
  if (content.includes('不良反应') || content.includes('慎用') || content.includes('注意事项')) return 4;
  if (content.includes('临床应用') || content.includes('适应证')) return 4;
  return 3;
}

/**
 * 构建内容文本
 */
function buildContentText(contentItems) {
  if (!contentItems || !Array.isArray(contentItems)) return '';
  
  const parts = [];
  for (const item of contentItems) {
    if (!item) continue;
    if (item.type === 'text' && item.content) {
      parts.push(item.content.trim());
    } else if (item.type === 'table' && item.content) {
      parts.push(item.content.trim());
    } else if (item.type === 'image') {
      if (item.ocr_text && item.ocr_text.trim()) {
        parts.push(item.ocr_text.trim());
      }
      if (item.images && item.images.length > 0) {
        parts.push(`[图片: ${item.images.join(', ')}]`);
      }
    }
  }
  return parts.filter(p => p).join('\n\n');
}


/**
 * 主导入函数
 */
async function importKnowledgeTree() {
  const client = await pool.connect();
  
  try {
    console.log('=== 西药药二知识图谱导入 ===\n');
    
    // 读取合并后的数据
    const dataPath = path.join(process.cwd(), 'shuju/西药药二_合并完整版.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error('合并数据文件不存在，请先运行 merge-xiyao-er-complete.js');
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);
    const chapters = data.chapters;
    
    console.log(`📖 读取到 ${chapters.length} 个章节\n`);
    
    // 开始事务
    await client.query('BEGIN');
    console.log('🔄 开始事务...\n');
    
    // 清除现有数据
    console.log('🗑️ 清除现有西药药二数据...');
    await client.query(
      'DELETE FROM knowledge_tree WHERE subject_code = $1',
      [SUBJECT_CODE]
    );
    
    // 统计
    let chapterCount = 0;
    let sectionCount = 0;
    let pointCount = 0;
    
    // 导入章节
    for (const chapter of chapters) {
      const chapterNum = chineseToNumber(chapter.chapter_number);
      const chapterId = generateUUID();
      const chapterCode = generateNodeCode(chapterNum);
      const chapterTitle = `第${chapter.chapter_number}章 ${chapter.chapter_title}`;
      
      await client.query(`
        INSERT INTO knowledge_tree (id, code, title, content, node_type, importance, parent_id, subject_code, level, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        chapterId,
        chapterCode,
        chapterTitle,
        '',
        'chapter',
        3,
        null,
        SUBJECT_CODE,
        1,
        chapterNum
      ]);
      
      chapterCount++;
      console.log(`✅ 章节: ${chapterTitle}`);
      
      // 导入小节
      for (let sIdx = 0; sIdx < chapter.sections.length; sIdx++) {
        const section = chapter.sections[sIdx];
        const sectionNum = chineseToNumber(section.section_number);
        const sectionId = generateUUID();
        const sectionCode = generateNodeCode(chapterNum, sectionNum);
        const sectionTitle = `第${section.section_number}节 ${section.section_title}`;
        
        // 构建小节内容（合并考点梳理和考点透析的通用内容）
        let sectionContent = '';
        const parts = section.parts || {};
        
        if (parts.考点梳理?.general_content) {
          sectionContent += buildContentText(parts.考点梳理.general_content);
        }
        if (parts.考点透析?.general_content) {
          const content = buildContentText(parts.考点透析.general_content);
          if (content) {
            sectionContent += (sectionContent ? '\n\n' : '') + content;
          }
        }
        
        // 提取口诀
        const mnemonics = extractMnemonics(sectionContent);
        const memoryTips = mnemonics.length > 0 ? mnemonics.join('\n') : null;
        
        await client.query(`
          INSERT INTO knowledge_tree (id, code, title, content, node_type, importance, parent_id, subject_code, level, sort_order, memory_tips)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          sectionId,
          sectionCode,
          sectionTitle,
          sectionContent,
          'section',
          calculateImportance(sectionContent),
          chapterId,
          SUBJECT_CODE,
          2,
          sectionNum,
          memoryTips
        ]);
        
        sectionCount++;
        
        // 导入知识点
        let pointIndex = 0;
        let hasKnowledgePoints = false;
        
        // 从考点透析导入知识点
        if (parts.考点透析?.knowledge_points && parts.考点透析.knowledge_points.length > 0) {
          hasKnowledgePoints = true;
          for (const kp of parts.考点透析.knowledge_points) {
            pointIndex++;
            const pointId = generateUUID();
            const pointCode = generateNodeCode(chapterNum, sectionNum, pointIndex);
            const pointTitle = kp.title || `考点${kp.number || pointIndex}`;
            const pointContent = buildContentText(kp.content);
            const pointMnemonics = extractMnemonics(pointContent);
            
            await client.query(`
              INSERT INTO knowledge_tree (id, code, title, content, node_type, importance, parent_id, subject_code, level, sort_order, memory_tips, point_type)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
              pointId,
              pointCode,
              pointTitle,
              pointContent,
              'point',
              calculateImportance(pointContent),
              sectionId,
              SUBJECT_CODE,
              3,
              pointIndex,
              pointMnemonics.length > 0 ? pointMnemonics.join('\n') : null,
              '考点透析'
            ]);
            
            pointCount++;
          }
        }
        
        // 从考点梳理导入知识点
        if (parts.考点梳理?.knowledge_points && parts.考点梳理.knowledge_points.length > 0) {
          hasKnowledgePoints = true;
          for (const kp of parts.考点梳理.knowledge_points) {
            pointIndex++;
            const pointId = generateUUID();
            const pointCode = generateNodeCode(chapterNum, sectionNum, pointIndex);
            const pointTitle = kp.title || `考点${kp.number || pointIndex}`;
            const pointContent = buildContentText(kp.content);
            const pointMnemonics = extractMnemonics(pointContent);
            
            await client.query(`
              INSERT INTO knowledge_tree (id, code, title, content, node_type, importance, parent_id, subject_code, level, sort_order, memory_tips, point_type)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
              pointId,
              pointCode,
              pointTitle,
              pointContent,
              'point',
              calculateImportance(pointContent),
              sectionId,
              SUBJECT_CODE,
              3,
              pointIndex,
              pointMnemonics.length > 0 ? pointMnemonics.join('\n') : null,
              '考点梳理'
            ]);
            
            pointCount++;
          }
        }
        
        // 如果没有独立的知识点，但有general_content，则将其作为一个整体考点导入
        if (!hasKnowledgePoints) {
          let combinedContent = '';
          
          // 合并考点透析的general_content
          if (parts.考点透析?.general_content && parts.考点透析.general_content.length > 0) {
            combinedContent += buildContentText(parts.考点透析.general_content);
          }
          
          // 合并考点梳理的general_content
          if (parts.考点梳理?.general_content && parts.考点梳理.general_content.length > 0) {
            const content = buildContentText(parts.考点梳理.general_content);
            if (content) {
              combinedContent += (combinedContent ? '\n\n' : '') + content;
            }
          }
          
          // 如果有内容，创建一个整体考点
          if (combinedContent && combinedContent.trim().length > 0) {
            pointIndex++;
            const pointId = generateUUID();
            const pointCode = generateNodeCode(chapterNum, sectionNum, pointIndex);
            const pointTitle = section.section_title; // 使用小节标题作为考点标题
            const pointMnemonics = extractMnemonics(combinedContent);
            
            await client.query(`
              INSERT INTO knowledge_tree (id, code, title, content, node_type, importance, parent_id, subject_code, level, sort_order, memory_tips, point_type)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
              pointId,
              pointCode,
              pointTitle,
              combinedContent,
              'point',
              calculateImportance(combinedContent),
              sectionId,
              SUBJECT_CODE,
              3,
              pointIndex,
              pointMnemonics.length > 0 ? pointMnemonics.join('\n') : null,
              '综合考点'
            ]);
            
            pointCount++;
            console.log(`   📝 补充考点: ${sectionTitle} (从general_content)`);
          }
        }
      }
    }
    
    // 提交事务
    await client.query('COMMIT');
    console.log('\n✅ 事务提交成功！\n');
    
    // 输出统计
    console.log('📊 导入统计:');
    console.log(`   - 章节数: ${chapterCount}`);
    console.log(`   - 小节数: ${sectionCount}`);
    console.log(`   - 知识点数: ${pointCount}`);
    console.log(`   - 总节点数: ${chapterCount + sectionCount + pointCount}`);
    
    // 验证导入结果
    const result = await client.query(
      'SELECT node_type, COUNT(*) as count FROM knowledge_tree WHERE subject_code = $1 GROUP BY node_type',
      [SUBJECT_CODE]
    );
    
    console.log('\n📈 数据库验证:');
    for (const row of result.rows) {
      console.log(`   - ${row.node_type}: ${row.count}`);
    }
    
    return {
      success: true,
      totalNodes: chapterCount + sectionCount + pointCount,
      chapters: chapterCount,
      sections: sectionCount,
      points: pointCount
    };
    
  } catch (error) {
    // 回滚事务
    await client.query('ROLLBACK');
    console.error('\n❌ 导入失败，事务已回滚');
    console.error('错误信息:', error.message);
    
    return {
      success: false,
      error: error.message
    };
    
  } finally {
    client.release();
    await pool.end();
  }
}

// 运行导入
importKnowledgeTree()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 导入完成！');
    } else {
      console.log('\n💥 导入失败！');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('致命错误:', error);
    process.exit(1);
  });
