/**
 * 回填知识点 learn_mode / importance_level / error_pattern_tags
 * 运行方式：node scripts/backfill-knowledge-point-fields.mjs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const QUESTION_THRESHOLDS = [
  { level: 5, threshold: 20 },
  { level: 4, threshold: 12 },
  { level: 3, threshold: 6 },
  { level: 2, threshold: 2 },
  { level: 1, threshold: 1 },
]

const WRONG_THRESHOLDS = [
  { level: 5, threshold: 50 },
  { level: 4, threshold: 30 },
  { level: 3, threshold: 15 },
  { level: 2, threshold: 6 },
  { level: 1, threshold: 1 },
]

const PRACTICE_TAG = 'KEYWORD_MISREAD'
const BOTH_TAGS = new Set([
  'FIRST_LINE_CHOICE',
  'INDICATION_CONTRA',
  'ADR_RECOGNITION',
  'DOSE_ADJUSTMENT',
  'GUIDELINE_REGIMEN',
])

function bucket(value, thresholds) {
  for (const entry of thresholds) {
    if (value >= entry.threshold) {
      return entry.level
    }
  }
  return value > 0 ? 1 : 0
}

function calculateImportance(questionCount, wrongTotal) {
  if (questionCount === 0 && wrongTotal === 0) {
    return 3
  }

  const questionScore = bucket(questionCount, QUESTION_THRESHOLDS) || 1
  const wrongScore = bucket(wrongTotal, WRONG_THRESHOLDS) || 1

  const average = Math.round((Math.max(questionScore, 1) + Math.max(wrongScore, 1)) / 2)
  return Math.max(1, Math.min(5, average))
}

function inferLearnMode(tags = []) {
  const tagSet = new Set((tags || []).filter(Boolean))

  if (tagSet.has(PRACTICE_TAG)) {
    return 'PRACTICE'
  }

  if (tagSet.has('MECHANISM_CLASS')) {
    if ([...BOTH_TAGS].some(tag => tagSet.has(tag))) {
      return 'BOTH'
    }
    return 'MEMORIZE'
  }

  if ([...BOTH_TAGS].some(tag => tagSet.has(tag))) {
    return 'BOTH'
  }

  return 'BOTH'
}

async function main() {
  console.log('🚧 开始回填知识点字段...')

  const questionStats = await prisma.$queryRaw(`
    SELECT kp, COUNT(*) AS question_count
    FROM (
      SELECT id, UNNEST(knowledge_points) AS kp
      FROM questions
      WHERE knowledge_points IS NOT NULL AND array_length(knowledge_points, 1) > 0
    ) q
    GROUP BY kp
  `)

  const wrongStats = await prisma.$queryRaw(`
    SELECT kp, SUM(COALESCE(wq.wrong_count, 0)) AS wrong_total
    FROM wrong_questions wq
    JOIN questions q ON q.id = wq.question_id
    CROSS JOIN LATERAL UNNEST(q.knowledge_points) AS kp(kp)
    WHERE q.knowledge_points IS NOT NULL
    GROUP BY kp
  `)

  const questionMap = new Map()
  questionStats.forEach(row => {
    questionMap.set(String(row.kp), Number(row.question_count ?? 0))
  })

  const wrongMap = new Map()
  wrongStats.forEach(row => {
    wrongMap.set(String(row.kp), Number(row.wrong_total ?? 0))
  })

  const knowledgeNodes = await prisma.$queryRaw(`
    SELECT id, importance, learn_mode, error_pattern_tags
    FROM knowledge_tree
    WHERE node_type = 'knowledge_point'
  `)

  let processed = 0

  for (const node of knowledgeNodes) {
    const questionCount = questionMap.get(node.id) ?? 0
    const wrongTotal = wrongMap.get(node.id) ?? 0
    const importanceLevel = calculateImportance(questionCount, wrongTotal)
    const tags = Array.isArray(node.error_pattern_tags) ? node.error_pattern_tags : []
    const learnMode = inferLearnMode(tags)

    await prisma.$executeRaw(`
      UPDATE knowledge_tree
      SET 
        importance = ${importanceLevel},
        importance_level = ${importanceLevel},
        learn_mode = ${learnMode},
        error_pattern_tags = ${tags},
        updated_at = NOW()
      WHERE id = ${node.id}
    `)

    await prisma.$executeRaw(`
      UPDATE knowledge_points
      SET 
        importance_level = ${importanceLevel},
        learn_mode = ${learnMode},
        error_pattern_tags = ${tags},
        updated_at = NOW()
      WHERE id = ${node.id}
    `)

    processed++
  }

  const coverageResult = await prisma.$queryRaw(`
    SELECT 
      COUNT(*) FILTER (WHERE importance_level IS NOT NULL AND learn_mode IS NOT NULL) AS filled,
      COUNT(*) AS total
    FROM knowledge_tree
    WHERE node_type = 'knowledge_point'
  `)

  const filled = Number(coverageResult[0]?.filled ?? 0)
  const total = Number(coverageResult[0]?.total ?? 0)
  const coverage = total > 0 ? ((filled / total) * 100).toFixed(1) : '0.0'

  const unmappedQuestions = await prisma.$queryRaw(`
    SELECT 
      COALESCE(subject, '未指定科目') AS subject, 
      COUNT(*) AS count
    FROM questions
    WHERE array_length(knowledge_points, 1) = 0 OR knowledge_points IS NULL
    GROUP BY COALESCE(subject, '未指定科目')
    ORDER BY count DESC
  `)

  console.log(`✅ 回填完成: ${processed} 个知识点`)
  console.log(`📊 字段覆盖率: ${coverage}% (${filled}/${total})`)
  console.log('📌 仍缺失 KP 映射的题目数量:')

  if (unmappedQuestions.length === 0) {
    console.log('   无，所有题目已绑定知识点')
  } else {
    unmappedQuestions.forEach(row => {
      console.log(`   ${row.subject}: ${row.count}`)
    })
  }
}

main()
  .catch(error => {
    console.error('❌ 回填脚本出错:', error)
  })
  .finally(() => {
    prisma.$disconnect()
  })

