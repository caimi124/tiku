/**
 * 导入 C9.22 - 第二十二节 抗新型冠状病毒药 的考点数据
 * 使用前请先补充 C9.22-抗新型冠状病毒药-考点梳理.md 文件中的内容
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tparjdkxxtnentsdazfw.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MTAzOCwiZXhwIjoyMDc4NzU3MDM4fQ.i0nA_AOLnBdeK7chICmeltFchkdJmYKMVqVxu8IaofE'

if (!supabaseKey) {
  console.error('❌ 请设置 SUPABASE_SERVICE_ROLE_KEY 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const subjectCode = 'xiyao_yaoxue_er'

// C9.22 的考点数据
const c9_22_points: Array<{
  title: string
  content: string
  point_type?: string
  drug_name?: string
  importance?: number
}> = [
  {
    title: '药物分类与代表药品',
    content: `分类：

1. 3CL蛋白酶抑制剂
   代表药品：奈玛特韦/利托那韦、先诺特韦/利托那韦、来瑞特韦、阿泰特韦/利托那韦

2. RNA依赖性RNA聚合酶（RdRp）抑制剂
   代表药品：瑞德西韦、莫诺拉韦、阿兹夫定、氢溴酸氘瑞米德韦

3. 阻断刺突-ACE2相互作用的抑制剂
   代表药品：贝特洛韦单抗、安巴韦单抗/罗米司韦单抗

作用机制：

1. 3CL蛋白酶抑制剂：抑制新冠病毒3CL蛋白酶（主蛋白酶），阻止病毒多聚蛋白水解，抑制病毒复制。

2. RdRp抑制剂：抑制新冠病毒RNA依赖性RNA聚合酶，干扰病毒RNA合成，阻止病毒复制。

3. 单克隆抗体：结合新冠病毒刺突蛋白，阻断其与人体细胞ACE2受体结合，阻止病毒侵入。`,
    importance: 5,
  },
  {
    title: '临床用药评价',
    content: `适应证：

成人伴有进展为重症高风险因素的轻至中度新型冠状病毒感染（COVID-19）患者。

关键时机：症状出现后5日内尽快开始治疗。

典型不良反应：

1. 奈玛特韦/利托那韦：腹泻、味觉倒错、肝酶升高
2. 莫诺拉韦：腹泻、恶心、头晕
3. 阿兹夫定：肝功能异常、胃肠道反应
4. 来瑞特韦：高脂血症、高尿酸血症

药物相互作用：

1. 奈玛特韦/利托那韦：
   - CYP3A强效抑制剂，升高经CYP3A代谢药物浓度
   - 禁止联用：胺碘酮、秋水仙碱、洛伐他汀、辛伐他汀、西地那非、咪达唑仑等
   - P-糖蛋白（P-gp）抑制剂

2. 阿兹夫定：P-gp底物及弱效诱导剂，与P-gp抑制剂/诱导剂联用需谨慎

3. 莫诺拉韦：无明显临床意义相互作用

4. 来瑞特韦等：与经CYP3A代谢药物有相互作用

注意事项：

1. 肝功能不全：
   - 奈玛特韦/利托那韦：重度（Child-Pugh C级）禁用
   - 其他多数轻中度无需调整

2. 肾功能不全：
   - 奈玛特韦/利托那韦：中度需减量，重度禁用
   - 莫诺拉韦等：通常无需调整

3. 妊娠及哺乳期：
   - 多数不建议使用，需权衡利弊
   - 用药期间及结束后应避孕或停止哺乳

4. 漏服处理：
   - 奈玛特韦/利托那韦：漏服≤8小时补服，＞8小时跳过勿补
   - 莫诺拉韦：漏服≤10小时补服，＞10小时跳过勿补

禁忌证：

1. 对药物成分过敏者禁用
2. 奈玛特韦/利托那韦：禁止与强效CYP3A诱导剂（利福平、圣约翰草）及特定药物同用
3. 重度肝肾功能不全患者（针对特定药物）禁用`,
    importance: 5,
  },
  {
    title: '重要细节与总结',
    content: `重要细节：

1. 用药时机：症状出现5日内是关键

2. 利托那韦作用：抑制CYP3A酶，提升奈玛特韦血药浓度，本身抗病毒作用弱

3. 耐药性：小分子药物耐药性低，单克隆抗体耐药性高

4. 剂型服用：奈玛特韦片需整片吞服；复方制剂必须同服

记忆要点：

1. 分类：3CL酶、RdRp酶、单抗

2. 时机：5天内，轻中度有重症风险

3. 禁忌：CYP3A相互作用是关键，他汀类、抗心律失常药需警惕`,
    importance: 4,
  },
]

async function importC9_22Points() {
  console.log('🔍 开始导入 C9.22 - 第二十二节 抗新型冠状病毒药 的考点数据...\n')
  
  // 获取小节ID
  const { data: section } = await supabase
    .from('knowledge_tree')
    .select('id')
    .eq('subject_code', subjectCode)
    .eq('node_type', 'section')
    .eq('code', 'C9.22')
    .single()
  
  if (!section) {
    console.error('❌ 未找到小节 C9.22')
    return
  }
  
  console.log(`✅ 找到小节ID: ${section.id}\n`)
  
  // 转换为数据库格式
  const dbRecords = c9_22_points.map((point, index) => {
    const pointCode = `C9.22.${index + 1}`
    const pointId = `xiyao_er_9_22_${index + 1}`
    
    return {
      id: pointId,
      code: pointCode,
      title: point.title,
      content: point.content || null,
      node_type: 'point',
      point_type: point.point_type || null,
      drug_name: point.drug_name || null,
      importance: point.importance || 3,
      importance_level: point.importance || 3,
      learn_mode: 'BOTH',
      error_pattern_tags: [],
      memory_tips: null,
      parent_id: section.id,
      subject_code: subjectCode,
      level: 3,
      sort_order: index + 1,
    }
  })
  
  // 导入
  const { error } = await supabase
    .from('knowledge_tree')
    .upsert(dbRecords, { onConflict: 'id' })
  
  if (error) {
    console.error('❌ 导入失败:', error.message)
  } else {
    console.log(`✅ 成功导入 ${dbRecords.length} 个考点:`)
    dbRecords.forEach((record, idx) => {
      console.log(`   ${idx + 1}. ${record.code} - ${record.title}`)
    })
    console.log('\n✅ 导入完成!\n')
  }
}

importC9_22Points()
  .then(() => {
    console.log('✅ 脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error)
    process.exit(1)
  })

