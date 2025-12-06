/**
 * 直接执行 SQL 创建学习系统表 - 简化版
 */

const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('🚀 连接数据库...');
  
  try {
    await client.connect();
    console.log('✅ 数据库连接成功！\n');
    
    // 1. 创建 daily_learning_stats 表
    console.log('📝 创建 daily_learning_stats 表...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_learning_stats (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id UUID NOT NULL,
        stat_date DATE NOT NULL,
        study_minutes INT DEFAULT 0,
        questions_done INT DEFAULT 0,
        correct_count INT DEFAULT 0,
        new_points_learned INT DEFAULT 0,
        weak_points_reviewed INT DEFAULT 0,
        points_mastered INT DEFAULT 0,
        chapters_studied TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, stat_date)
      )
    `);
    console.log('✅ daily_learning_stats 表创建成功');
    
    // 2. 创建索引
    console.log('📝 创建索引...');
    try {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_daily_learning_stats_user ON daily_learning_stats(user_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_daily_learning_stats_date ON daily_learning_stats(stat_date DESC)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_daily_learning_stats_user_date ON daily_learning_stats(user_id, stat_date DESC)`);
      console.log('✅ 索引创建成功');
    } catch (e) {
      console.log('⚠️ 索引可能已存在');
    }
    
    // 3. 创建 review_queue 表
    console.log('📝 创建 review_queue 表...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS review_queue (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id UUID NOT NULL,
        knowledge_point_id TEXT NOT NULL,
        priority_score DECIMAL(5,2) DEFAULT 50,
        importance INT DEFAULT 3,
        mastery_score DECIMAL(5,2) DEFAULT 0,
        is_urgent BOOLEAN DEFAULT FALSE,
        marked_by_user BOOLEAN DEFAULT FALSE,
        added_at TIMESTAMPTZ DEFAULT NOW(),
        last_reviewed_at TIMESTAMPTZ,
        next_review_at TIMESTAMPTZ,
        UNIQUE(user_id, knowledge_point_id)
      )
    `);
    console.log('✅ review_queue 表创建成功');
    
    // 4. 创建 review_queue 索引
    try {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_review_queue_user ON review_queue(user_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_review_queue_priority ON review_queue(user_id, priority_score DESC)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_review_queue_urgent ON review_queue(user_id, is_urgent)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_review_queue_next_review ON review_queue(user_id, next_review_at)`);
      console.log('✅ review_queue 索引创建成功');
    } catch (e) {
      console.log('⚠️ 索引可能已存在');
    }
    
    // 5. 增强 study_plans 表
    console.log('📝 增强 study_plans 表...');
    try {
      await client.query(`ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS target_exam_date DATE`);
      await client.query(`ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS daily_target_minutes INT DEFAULT 60`);
      await client.query(`ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS daily_target_questions INT DEFAULT 30`);
      console.log('✅ study_plans 表增强成功');
    } catch (e) {
      console.log('⚠️ study_plans 字段可能已存在:', e.message);
    }
    
    // 6. 创建计算优先级的函数
    console.log('📝 创建优先级计算函数...');
    await client.query(`
      CREATE OR REPLACE FUNCTION calculate_review_priority(
        p_mastery_score DECIMAL,
        p_importance INT,
        p_days_since_review INT
      ) RETURNS DECIMAL AS $func$
      BEGIN
        RETURN LEAST(100, GREATEST(0,
          (100 - COALESCE(p_mastery_score, 0)) * 0.4 +
          COALESCE(p_importance, 3) * 10 * 0.3 +
          LEAST(30, COALESCE(p_days_since_review, 0)) * 3.33 * 0.3
        ));
      END;
      $func$ LANGUAGE plpgsql
    `);
    console.log('✅ 优先级计算函数创建成功');
    
    // 7. 创建连续学习天数函数
    console.log('📝 创建连续学习天数函数...');
    await client.query(`
      CREATE OR REPLACE FUNCTION get_learning_streak(p_user_id UUID)
      RETURNS INT AS $func$
      DECLARE
        v_streak INT := 0;
        v_check_date DATE := CURRENT_DATE;
        v_has_record BOOLEAN;
      BEGIN
        LOOP
          SELECT EXISTS(
            SELECT 1 FROM daily_learning_stats 
            WHERE user_id = p_user_id 
              AND stat_date = v_check_date 
              AND questions_done > 0
          ) INTO v_has_record;
          
          IF v_has_record THEN
            v_streak := v_streak + 1;
            v_check_date := v_check_date - INTERVAL '1 day';
          ELSE
            EXIT;
          END IF;
          
          IF v_streak >= 365 THEN
            EXIT;
          END IF;
        END LOOP;
        
        RETURN v_streak;
      END;
      $func$ LANGUAGE plpgsql
    `);
    console.log('✅ 连续学习天数函数创建成功');
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ 所有表和函数创建完成！');
    console.log('='.repeat(50));
    
    // 验证
    console.log('\n🔍 验证表结构...');
    const tables = ['daily_learning_stats', 'review_queue', 'study_plans'];
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table} - ${result.rows[0].count} 条记录`);
      } catch (err) {
        console.log(`❌ ${table} - 错误: ${err.message}`);
      }
    }
    
  } catch (err) {
    console.error('❌ 错误:', err.message);
  } finally {
    await client.end();
    console.log('\n👋 完成');
  }
}

main();
