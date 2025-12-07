/**
 * 完整修复知识图谱数据
 * 
 * 1. 清理现有数据
 * 2. 按照章节→节→考点+小节总结的结构重新导入
 * 3. 导入老司机内容到expert_tips表
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

// 西药药二的章节结构（按照教材标准结构）
const CHAPTERS = [
  { code: '1', title: '第一章 精神与中枢神经系统疾病用药', sections: [
    { code: '1.1', title: '第一节 镇静催眠药' },
    { code: '1.2', title: '第二节 抗癫痫药' },
    { code: '1.3', title: '第三节 抗精神病药' },
    { code: '1.4', title: '第四节 抗抑郁药' },
    { code: '1.5', title: '第五节 抗焦虑药' },
    { code: '1.6', title: '第六节 脑功能改善及抗记忆障碍药' },
  ]},
  { code: '2', title: '第二章 解热、镇痛、抗炎、抗风湿及抗痛风药', sections: [
    { code: '2.1', title: '第一节 解热、镇痛、抗炎药' },
    { code: '2.2', title: '第二节 抗风湿药' },
    { code: '2.3', title: '第三节 抗痛风药' },
  ]},
  { code: '3', title: '第三章 呼吸系统疾病用药', sections: [
    { code: '3.1', title: '第一节 镇咳药' },
    { code: '3.2', title: '第二节 祛痰药' },
    { code: '3.3', title: '第三节 平喘药' },
  ]},
  { code: '4', title: '第四章 消化系统疾病用药', sections: [
    { code: '4.1', title: '第一节 抑酸剂、抗酸药与胃黏膜保护药' },
    { code: '4.2', title: '第二节 解痉药、胃肠动力药与功能性胃肠病治疗药' },
    { code: '4.3', title: '第三节 止吐药' },
    { code: '4.4', title: '第四节 肝胆疾病用药' },
    { code: '4.5', title: '第五节 泻药与便秘治疗药' },
    { code: '4.6', title: '第六节 止泻药与肠道抗感染药' },
    { code: '4.7', title: '第七节 助消化药' },
  ]},
];

// 从JSON文件中提取的药物数据映射到考点
const DRUG_TO_SECTION = {
  // 第一章 精神与中枢神经系统疾病用药
  '苯巴比妥': '1.1', '司可巴比妥': '1.1', '水合氯醛': '1.1',
  '地西泮': '1.1', '艾司唑仑': '1.1', '三唑仑': '1.1',
  '唑吡坦': '1.1', '佐匹克隆': '1.1', '扎来普隆': '1.1',
  '雷美替胺': '1.1', '巴氯芬': '1.1', '乙哌立松': '1.1',
  '卡马西平': '1.2',
  
  // 第二章 解热、镇痛、抗炎、抗风湿及抗痛风药
  '阿司匹林': '2.1', '布洛芬': '2.1', '萘普生': '2.1',
  '吲哚美辛': '2.1', '双氯芬酸': '2.1', '对乙酰氨基酚': '2.1',
  '贝诺酯': '2.1', '赖氨匹林': '2.1', '二氟尼柳': '2.1',
  '舒林酸': '2.1', '氟比洛芬': '2.1', '酮洛芬': '2.1',
  '非诺洛芬钙': '2.1', '奥沙普秦': '2.1', '保泰松': '2.1',
  '安乃近': '2.1', '氨基比林': '2.1', '萘丁美酮': '2.1',
  '塞来昔布': '2.1', '依托考昔': '2.1', '美洛昔康': '2.1',
  '尼美舒利': '2.1', '帕瑞昔布': '2.1', '伐地考昔': '2.1',
  '艾瑞昔布': '2.1',
  '甲氨蝶呤': '2.2', '来氟米特': '2.2',
  '别嘌醇': '2.3', '非布司他': '2.3', '秋水仙碱': '2.3',
  '丙磺舒': '2.3', '苯溴马隆': '2.3',
  
  // 第三章 呼吸系统疾病用药
  '可待因': '3.1', '右美沙芬': '3.1', '喷托维林': '3.1',
  '苯丙哌林': '3.1', '吗啡': '3.1',
  '愈创甘油醚': '3.2', '氨溴索': '3.2', '溴己新': '3.2',
  '乙酰半胱氨酸': '3.2', '羧甲司坦': '3.2',
  '异丙托溴铵': '3.3', '布地奈德': '3.3', '氟替卡松': '3.3',
  '倍氯米松': '3.3', '色甘酸钠': '3.3', '特布他林': '3.3',
  '沙美特罗': '3.3', '福莫特罗': '3.3', '茚达特罗': '3.3',
  '沙丁胺醇': '3.3', '噻托溴铵': '3.3', '多索茶碱': '3.3',
  '孟鲁司特': '3.3',
  
  // 第四章 消化系统疾病用药
  '奥美拉唑': '4.1', '兰索拉唑': '4.1', '泮托拉唑': '4.1',
  '雷贝拉唑': '4.1', '艾司奥美拉唑': '4.1', '伏诺拉生': '4.1',
  '西咪替丁': '4.1', '雷尼替丁': '4.1', '法莫替丁': '4.1',
  '米索前列醇': '4.1', '铝碳酸镁': '4.1', '硫糖铝': '4.1',
  '枸橼酸铋钾': '4.1',
  '东莨菪碱': '4.2', '甲氧氯普胺': '4.2', '多潘立酮': '4.2',
  '莫沙必利': '4.2', '伊托必利': '4.2',
  '苯海拉明': '4.3', '氯丙嗪': '4.3', '昂丹司琼': '4.3',
  '帕洛诺司琼': '4.3', '阿瑞匹坦': '4.3', '劳拉西泮': '4.3',
  '奥氮平': '4.3',
  '牛磺熊去氧胆酸': '4.4', '熊去氧胆酸': '4.4', '鹅去氧胆酸': '4.4',
  '去氢胆酸': '4.4', '丁二磺酸腺苷蛋氨酸': '4.4',
  '奥德昔巴特': '4.5', '氯马昔巴特': '4.5', '利奈昔巴特': '4.5',
  '比沙可啶': '4.5', '乳果糖': '4.5', '聚乙二醇': '4.5',
  '蒙脱石散': '4.6', '洛哌丁胺': '4.6',
};

async function main() {
  const client = await pool.connect();
  
  try {
    console.log('=== 开始修复知识图谱数据 ===\n');
    
    // 读取JSON数据
    const jsonPath = path.join(__dirname, 'shuju', '西药药二_知识点_完整版.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const drugInfo = jsonData['药物信息'];
    
    console.log(`读取到 ${Object.keys(drugInfo).length} 个药物数据\n`);
    
    // Step 1: 清理现有数据
    console.log('Step 1: 清理现有数据...');
    await client.query('DELETE FROM knowledge_tree WHERE subject_code = $1', ['xiyao_yaoxue_er']);
    await client.query('DELETE FROM expert_tips');
    console.log('✓ 清理完成\n');
    
    // Step 2: 插入章节和节
    console.log('Step 2: 插入章节和节结构...');
    let chapterOrder = 0;
    let sectionOrder = 0;
    
    for (const chapter of CHAPTERS) {
      chapterOrder++;
      const chapterId = `xiyao_er_ch${chapter.code}`;
      
      // 插入章节
      await client.query(`
        INSERT INTO knowledge_tree (id, code, title, node_type, level, sort_order, subject_code, importance)
        VALUES ($1, $2, $3, 'chapter', 1, $4, 'xiyao_yaoxue_er', 3)
      `, [chapterId, chapter.code, chapter.title, chapterOrder]);
      
      console.log(`  ✓ 章节: ${chapter.title}`);
      
      // 插入节
      for (const section of chapter.sections) {
        sectionOrder++;
        const sectionId = `xiyao_er_sec${section.code}`;
        
        await client.query(`
          INSERT INTO knowledge_tree (id, code, title, node_type, level, sort_order, subject_code, parent_id, importance)
          VALUES ($1, $2, $3, 'section', 2, $4, 'xiyao_yaoxue_er', $5, 3)
        `, [sectionId, section.code, section.title, sectionOrder, chapterId]);
        
        console.log(`    ✓ 节: ${section.title}`);
      }
    }
    console.log('✓ 章节结构插入完成\n');
    
    // Step 3: 插入考点（药物）
    console.log('Step 3: 插入考点（药物）...');
    let pointOrder = 0;
    let pointCount = 0;
    
    for (const [drugName, drugData] of Object.entries(drugInfo)) {
      const sectionCode = DRUG_TO_SECTION[drugName];
      if (!sectionCode) {
        console.log(`  ⚠ 跳过未映射的药物: ${drugName}`);
        continue;
      }
      
      pointOrder++;
      pointCount++;
      const pointId = `xiyao_er_pt_${drugName}`;
      const sectionId = `xiyao_er_sec${sectionCode}`;
      
      // 构建内容
      const content = buildDrugContent(drugData);
      const memoryTips = drugData['作用特点']?.['特殊特点']?.join('\n') || '';
      
      // 判断重要性（根据不良反应和药物相互作用的丰富程度）
      let importance = 3;
      if (drugData['不良反应']?.['严重']?.length > 0) importance = 5;
      else if (drugData['不良反应']?.['典型']?.length > 0) importance = 4;
      
      await client.query(`
        INSERT INTO knowledge_tree (id, code, title, content, node_type, drug_name, level, sort_order, subject_code, parent_id, importance, memory_tips)
        VALUES ($1, $2, $3, $4, 'point', $5, 3, $6, 'xiyao_yaoxue_er', $7, $8, $9)
      `, [pointId, `${sectionCode}.${pointOrder}`, drugName, content, drugName, pointOrder, sectionId, importance, memoryTips]);
    }
    console.log(`✓ 插入了 ${pointCount} 个考点\n`);
    
    // Step 4: 为每个节添加小节总结
    console.log('Step 4: 添加小节总结节点...');
    let summaryCount = 0;
    
    for (const chapter of CHAPTERS) {
      for (const section of chapter.sections) {
        summaryCount++;
        const sectionId = `xiyao_er_sec${section.code}`;
        const summaryId = `xiyao_er_summary_${section.code}`;
        
        // 获取该节下的所有考点
        const pointsResult = await client.query(`
          SELECT title, importance FROM knowledge_tree 
          WHERE parent_id = $1 AND node_type = 'point'
          ORDER BY sort_order
        `, [sectionId]);
        
        // 构建小节总结内容
        const summaryContent = buildSectionSummary(section.title, pointsResult.rows);
        
        await client.query(`
          INSERT INTO knowledge_tree (id, code, title, content, node_type, level, sort_order, subject_code, parent_id, importance)
          VALUES ($1, $2, $3, $4, 'section_summary', 3, 9999, 'xiyao_yaoxue_er', $5, 4)
        `, [summaryId, `${section.code}.summary`, `${section.title} - 小节总结`, summaryContent, sectionId]);
      }
    }
    console.log(`✓ 添加了 ${summaryCount} 个小节总结\n`);
    
    // Step 5: 导入老司机内容
    console.log('Step 5: 导入老司机内容...');
    let tipsCount = 0;
    
    for (const [drugName, drugData] of Object.entries(drugInfo)) {
      const sectionCode = DRUG_TO_SECTION[drugName];
      if (!sectionCode) continue;
      
      const pointId = `xiyao_er_pt_${drugName}`;
      const expertTips = buildExpertTips(drugName, drugData);
      
      if (expertTips) {
        tipsCount++;
        await client.query(`
          INSERT INTO expert_tips (knowledge_point_id, exam_patterns, trap_analysis, memory_techniques, exam_tactics, predictions)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          pointId,
          JSON.stringify(expertTips.examPatterns),
          JSON.stringify(expertTips.trapAnalysis),
          JSON.stringify(expertTips.memoryTechniques),
          JSON.stringify(expertTips.examTactics),
          JSON.stringify(expertTips.predictions)
        ]);
      }
    }
    console.log(`✓ 导入了 ${tipsCount} 条老司机内容\n`);
    
    // Step 6: 验证数据
    console.log('Step 6: 验证数据...');
    const stats = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE node_type = 'chapter') as chapters,
        COUNT(*) FILTER (WHERE node_type = 'section') as sections,
        COUNT(*) FILTER (WHERE node_type = 'point') as points,
        COUNT(*) FILTER (WHERE node_type = 'section_summary') as summaries,
        COUNT(*) FILTER (WHERE importance >= 4) as high_freq
      FROM knowledge_tree
      WHERE subject_code = 'xiyao_yaoxue_er'
    `);
    
    const tipsStats = await client.query('SELECT COUNT(*) as count FROM expert_tips');
    
    console.log('数据统计:');
    console.log(`  - 章节: ${stats.rows[0].chapters}`);
    console.log(`  - 节: ${stats.rows[0].sections}`);
    console.log(`  - 考点: ${stats.rows[0].points}`);
    console.log(`  - 小节总结: ${stats.rows[0].summaries}`);
    console.log(`  - 高频考点: ${stats.rows[0].high_freq}`);
    console.log(`  - 老司机内容: ${tipsStats.rows[0].count}`);
    
    console.log('\n=== 修复完成! ===');
    
  } catch (error) {
    console.error('错误:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// 构建药物内容
function buildDrugContent(drugData) {
  const parts = [];
  
  // 分类信息
  if (drugData['分类']) {
    parts.push(`【分类】${drugData['分类']}`);
  }
  if (drugData['亚类']) {
    parts.push(`【亚类】${drugData['亚类']}`);
  }
  
  // 作用机制
  const mechanism = drugData['作用特点']?.['作用机制'];
  if (mechanism && mechanism.length > 0) {
    parts.push(`【作用机制】\n${mechanism.join('\n')}`);
  }
  
  // 不良反应
  const adverse = drugData['不良反应'];
  if (adverse) {
    const reactions = [];
    if (adverse['严重']?.length > 0) reactions.push(`严重: ${adverse['严重'].join('; ')}`);
    if (adverse['典型']?.length > 0) reactions.push(`典型: ${adverse['典型'].join('; ')}`);
    if (reactions.length > 0) {
      parts.push(`【不良反应】\n${reactions.join('\n')}`);
    }
  }
  
  // 药物相互作用
  const interactions = drugData['药物相互作用']?.['一般'];
  if (interactions && interactions.length > 0) {
    parts.push(`【药物相互作用】\n${interactions.join('\n')}`);
  }
  
  // 禁忌证
  if (drugData['禁忌证']?.length > 0) {
    parts.push(`【禁忌证】\n${drugData['禁忌证'].join('\n')}`);
  }
  
  return parts.join('\n\n');
}

// 构建小节总结内容
function buildSectionSummary(sectionTitle, points) {
  const parts = [`【${sectionTitle}】考点梳理\n`];
  
  points.forEach((point, index) => {
    const freqTag = point.importance >= 4 ? ' 🔥高频' : '';
    parts.push(`${index + 1}. ${point.title}${freqTag}`);
  });
  
  parts.push('\n【学习建议】');
  parts.push('- 重点掌握高频考点的作用机制和不良反应');
  parts.push('- 注意药物之间的对比和区别');
  parts.push('- 结合临床应用场景记忆');
  
  return parts.join('\n');
}

// 构建老司机内容
function buildExpertTips(drugName, drugData) {
  const tips = {
    examPatterns: [],
    trapAnalysis: [],
    memoryTechniques: [],
    examTactics: [],
    predictions: []
  };
  
  // 从特殊特点提取记忆技巧
  const specialFeatures = drugData['作用特点']?.['特殊特点'] || [];
  if (specialFeatures.length > 0) {
    tips.memoryTechniques.push({
      type: 'mnemonic',
      title: `${drugName}记忆要点`,
      content: specialFeatures[0],
      example: specialFeatures.length > 1 ? specialFeatures[1] : ''
    });
  }
  
  // 从不良反应提取坑位分析
  const severeReactions = drugData['不良反应']?.['严重'] || [];
  if (severeReactions.length > 0) {
    tips.trapAnalysis.push({
      name: `${drugName}不良反应陷阱`,
      description: '考试常考的不良反应相关题目',
      commonMistakes: ['混淆不同药物的不良反应', '忽略严重不良反应的处理方法'],
      solution: severeReactions[0]
    });
  }
  
  // 从禁忌证提取应试战术
  const contraindications = drugData['禁忌证'] || [];
  if (contraindications.length > 0) {
    tips.examTactics.push({
      trigger: `看到${drugName}相关题目`,
      response: `注意禁忌证: ${contraindications[0]}`
    });
  }
  
  // 只有有内容时才返回
  const hasContent = tips.memoryTechniques.length > 0 || 
                     tips.trapAnalysis.length > 0 || 
                     tips.examTactics.length > 0;
  
  return hasContent ? tips : null;
}

main().catch(console.error);
