const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  const client = await pool.connect();
  try {
    const codes = ['C1.5', 'C1.6'];
    for (const code of codes) {
      const section = await client.query(
        'SELECT id, code, title FROM knowledge_tree WHERE code = $1 AND node_type = $2',
        [code, 'section']
      );
      console.log('section', code, section.rows);
      if (section.rows.length) {
        const row = section.rows[0];
        const points = await client.query(
          'SELECT id, code, title, node_type, importance FROM knowledge_tree WHERE parent_id = $1 ORDER BY sort_order',
          [row.id]
        );
        console.log('points under', code, points.rows);
      }
    }
  } finally {
    client.release();
    pool.end();
  }
})();
