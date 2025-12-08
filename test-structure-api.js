const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testStructureAPI() {
  const client = await pool.connect();
  try {
    const subject = 'xiyao_yaoxue_er';
    
    // 模拟 /api/knowledge/structure 的查询
    const { rows: chapters } = await client.query(`
      SELECT id, code, title, parent_id, node_type, importance
      FROM knowledge_tree
      WHERE subject_code = $1
        AND node_type IN ('chapter', 'section', 'point', 'knowledge_point')
      ORDER BY code
    `, [subject]);
    
    console.log('查询到的节点总数:', chapters.length);
    
    const chapterNodes = chapters.filter(n => n.node_type === 'chapter');
    const sectionNodes = chapters.filter(n => n.node_type === 'section');
    const pointNodes = chapters.filter(n => n.node_type === 'point' || n.node_type === 'knowledge_point');
    
    console.log('章节数:', chapterNodes.length);
    console.log('小节数:', sectionNodes.length);
    console.log('知识点数:', pointNodes.length);
    
    // 构建结构
    const structure = chapterNodes.map(chapter => {
      const chapterSections = sectionNodes.filter(s => s.parent_id === chapter.id);
      
      let chapterPointCount = 0;
      let chapterHighFreqCount = 0;
      
      const sections = chapterSections.map(section => {
        const sectionPoints = pointNodes.filter(p => p.parent_id === section.id);
        const highFreqPoints = sectionPoints.filter(p => (p.importance || 0) >= 4);
        
        chapterPointCount += sectionPoints.length;
        chapterHighFreqCount += highFreqPoints.length;
        
        return {
          id: section.id,
          code: section.code,
          title: section.title,
          point_count: sectionPoints.length,
          high_frequency_count: highFreqPoints.length
        };
      });
      
      return {
        id: chapter.id,
        code: chapter.code,
        title: chapter.title,
        point_count: chapterPointCount,
        high_frequency_count: chapterHighFreqCount,
        sections
      };
    });
    
    console.log('\n构建的结构:');
    structure.forEach(ch => {
      console.log(`${ch.code}: ${ch.title} (${ch.point_count}个考点, ${ch.sections.length}个小节)`);
    });
    
    console.log('\n模拟API返回:');
    console.log(JSON.stringify({
      success: true,
      data: {
        structure: structure.slice(0, 2), // 只显示前2章
        stats: {
          total_chapters: chapterNodes.length,
          total_sections: sectionNodes.length,
          total_points: pointNodes.length
        }
      }
    }, null, 2));
    
  } finally {
    client.release();
    pool.end();
  }
}

testStructureAPI().catch(console.error);
