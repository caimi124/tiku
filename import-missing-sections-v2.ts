/**
 * 导入缺失章节的考点数据（改进版）
 * 支持从多个数据源提取数据并导入
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
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

// 需要导入的章节数据（手动整理）
const missingSectionsData: Record<string, {
  sectionCode: string
  sectionTitle: string
  chapterCode: string
  points: Array<{
    title: string
    content: string
    point_type?: string
    drug_name?: string
    importance?: number
  }>
}> = {
  'C6.5': {
    sectionCode: 'C6.5',
    sectionTitle: '第五节 骨髓保护药',
    chapterCode: 'C6',
    points: [
      {
        title: '药物分类与临床用药评价',
        content: `化疗药物可引起骨髓抑制，导致造血干细胞启动自我更新并增殖分化成造血祖细胞以维持造血系统稳定，当化疗药物引起造血干细胞自我更新能力发生障碍时，会导致骨髓损伤。细胞周期蛋白依赖性激酶（CDK）是细胞周期调控的关键酶，骨髓中造血干细胞和造血祖细胞产生中性粒细胞、红细胞和血小板增殖过程依赖于 CDK4/6 的活性。CDK4/6 抑制剂（曲拉西利）可将骨髓细胞阻滞在 G1 期，避免化疗损伤，起到骨髓保护作用。

代表药品：曲拉西利

临床用药评价：
(1) 是CDK4 和6 的短暂性抑制剂，化疗前给药，短暂将骨髓细胞阻滞在 G1 期，避免化疗损伤，且药效短暂可逆，半衰期仅 14 小时，用药32 小时后骨髓造血干/祖细胞即逐渐恢复增殖，对骨髓的全系不良反应均有保护作用。
(2) 适用于既往未接受过系统性化疗的广泛期小细胞肺癌患者，在接受含铂类药物联合依托泊苷方案治疗前预防性给药，降低化疗引起的骨髓抑制的发生率。
(3) 连续多日给予曲拉西利时，2 次给药时间间隔应不超过28 小时。`,
        importance: 4,
      },
    ],
  },
  'C7.1': {
    sectionCode: 'C7.1',
    sectionTitle: '第一节 利尿药',
    chapterCode: 'C7',
    points: [
      {
        title: '药物分类与作用部位',
        content: `利尿药是通过作用于肾脏促进钠和水从体内排出，增加尿流速率的药物。利尿药不仅可以改变 Na⁺ 的排泄，还可以影响其他离子和尿酸的排泄。此外，利尿药也可间接地改变肾脏的血流动力学。临床上应用的利尿药大多数是通过增加肾脏 Na⁺ 的排泄，从而增加水的排泄，故称为"排钠利尿药"；而渗透性利尿药和抗利尿激素拮抗药是直接增加无溶质水的排泄，故称为"排水利尿药"。

分类：
1. 袢利尿药：代表药品：呋塞米类、托拉塞米类、布美他尼
   作用部位：髓袢升支粗段
   备注：Na⁺-K⁺-2Cl⁻ 共转运体抑制药/ 强效利尿药

2. 远曲小管利尿药（Na⁺-Cl⁻ 共转运体抑制药/ 中效利尿药）：
   代表药品：噻嗪类利尿药：氢氯噻嗪、氯噻嗪；类噻嗪类利尿药：氯达帕胺、氯噻酮
   作用部位：远曲小管近端

3. 皮质集合管利尿药（留钾利尿药 / 低效利尿药）：
   代表药品：肾小管上皮 Na⁺ 通道抑制药：氨氯噻嗪、氯噻嗪；盐皮质素受体拮抗药（螺内酯受体拮抗药）：螺内酯、依普利酮、非奈利酮
   作用部位：远曲小管末端和皮质集合管

4. 碳酸酐酶抑制剂：
   代表药品：乙酰唑胺、双醋唑胺
   作用部位：近曲（球）小管

5. 渗透性利尿药（脱水药）：
   代表药品：甘露醇（高渗）、山梨醇、异山梨醇
   作用部位：肾小管

6. 其他利尿药：
   代表药品：血管加压素拮抗药：托伐普坦；钠-葡萄糖协同转运蛋白2 抑制药：恩格列净、达格列净、卡格列净
   作用部位：髓质集合管；近曲小管

润德巧记：强效他不利；中效噻嗪达；低效螺氨氯。`,
        importance: 5,
      },
      {
        title: '袢利尿药的临床用药评价',
        content: `作用特点：
(1) 利尿作用快速而强，不易导致酸中毒，是目前最有效的利尿药。
(2) 用于水肿相关性疾病：①心力衰竭：扩张静脉容量血管，增加全身静脉血容量，降低左心室充盈压，是症状性心力衰竭治疗的基石药物；②肝硬化：用于醛固酮受体拮抗药治疗失败后的联合用药，或初始治疗时直接与醛固酮受体拮抗剂联合；③肾脏疾病：是首选初始治疗药物，可预防急性肾衰竭，也是改善其他利尿药无效的肾病综合征水肿的唯一药物。
(3) 用于高血压：①轻度肾功能不全或心力衰竭的高血压患者；②高血钾症、高尿酸血症、低钠血症，急性药物、毒物中毒；③急性药源性、毒源性水肿等。
(4) 用于高镁血症、高钾血症、低钠血症；急性药物、毒物中毒；抗利尿激素分泌过多综合征等。
(5) 具有"天花板"效应，在确定有效利尿量后，每日利尿作用强度通过增减给药频率来控制。
(6) 效价强度：布美他尼 > 托拉塞米 > 呋塞米类 > 依他尼酸。
(7) 布美他尼及托拉塞米较呋塞米口服吸收率更稳定，治疗充血性心力衰竭较呋塞米更可靠，布美他尼对某些呋塞米无效的患者仍然有效。

典型不良反应：
(1) 电解质紊乱：低血容量、低血压、低血钾、低血钠、低血氯、低血镁、低血钙、低血磷、低血糖、低蛋白血症、高尿酸血症、高血糖、高血脂、高血酮。
(2) 耳毒性：依他尼酸易引起，布美他尼、托拉塞米耳毒性较小。
(3) 呋塞米类、布美他尼、托拉塞米均含磺酰胺基团，容易出现磺胺过敏反应，依他尼酸为非磺胺类结构，不会出现磺胺过敏反应。
(4) 利尿抵抗。

禁忌：
(1) 严重低钾血症和低钠血症。
(2) 痛风患者。
(3) 对磺胺药过敏者（主要针对含磺酰胺基团的袢利尿药）。
(4) 不可逆转的无尿患者。`,
        importance: 5,
      },
    ],
  },
  'C7.2': {
    sectionCode: 'C7.2',
    sectionTitle: '第二节 治疗男性勃起功能障碍药',
    chapterCode: 'C7',
    points: [
      {
        title: '药物分类与代表药品',
        content: `5型磷酸二酯酶抑制剂：
代表药品：西地那非、他达拉非、伐地那非、阿伐那非

作用机制：通过抑制5型磷酸二酯酶（PDE-5），减少环磷酸鸟苷（cGMP）的降解，增加海绵体内cGMP水平，松弛海绵体平滑肌，血液流入海绵体，产生勃起。`,
        importance: 4,
      },
      {
        title: '5型磷酸二酯酶抑制剂的临床用药评价',
        content: `作用特点：
(1) 需要在性刺激下才能发挥疗效。
(2) 不能用于女性。
(3) 不适用于18岁以下人群。

典型不良反应：
(1) 头痛、面部潮红、消化不良、鼻塞、头晕、视觉异常。
(2) 西地那非和伐地那非可能引起蓝视症。
(3) 他达拉非可能引起背痛和肌肉痛。

禁忌：
(1) 正在使用硝酸酯类药物（如硝酸甘油、单硝酸异山梨酯）的患者禁用。
(2) 严重心血管疾病患者禁用。
(3) 对药物过敏者禁用。

药物相互作用：
(1) 与硝酸酯类药物合用可导致严重低血压。
(2) 与α受体阻滞剂合用需谨慎，可能引起低血压。`,
        importance: 5,
      },
    ],
  },
  'C9.5': {
    sectionCode: 'C9.5',
    sectionTitle: '第五节 碳青霉烯类抗菌药物',
    chapterCode: 'C9',
    points: [
      {
        title: '代表药品与作用机制',
        content: `代表药品：亚胺培南、美罗培南、厄他培南、比阿培南、多尼培南

作用机制：通过与青霉素结合蛋白（PBP）结合，抑制细菌细胞壁合成，导致细菌死亡。

抗菌谱：对革兰阳性菌、革兰阴性菌、厌氧菌均有强大的抗菌活性。`,
        importance: 4,
      },
      {
        title: '临床用药评价',
        content: `适应证：
(1) 严重感染：如医院获得性肺炎、复杂性腹腔感染、复杂性尿路感染等。
(2) 多重耐药菌感染：如产ESBLs菌株、产AmpC酶菌株等。

典型不良反应：
(1) 中枢神经系统毒性：如癫痫发作，特别是亚胺培南。
(2) 胃肠道反应：恶心、呕吐、腹泻。
(3) 过敏反应。

注意事项：
(1) 亚胺培南需与西司他丁合用，以减轻肾毒性。
(2) 美罗培南对中枢神经系统毒性较低。
(3) 肾功能不全患者需调整剂量。`,
        importance: 5,
      },
    ],
  },
  'C9.6': {
    sectionCode: 'C9.6',
    sectionTitle: '第六节 其他β内酰胺类抗菌药物',
    chapterCode: 'C9',
    points: [
      {
        title: '代表药品与作用机制',
        content: `分类：
1. 单环β-内酰胺类：氨曲南
2. 头霉素类：头孢西丁、头孢美唑、头孢替坦
3. 氧头孢烯类：拉氧头孢、氟氧头孢
4. 碳青霉烯类：见第五节

氨曲南：
(1) 仅对需氧G⁻菌包括铜绿假单胞菌有效，对G⁺菌和厌氧菌作用差。
(2) 肾毒性低，常作为氨基糖苷类的替代品。
(3) 与青霉素类及头孢菌素类交叉过敏反应，可用于对青霉素类、头孢菌素类过敏的患者。但结构与头孢他啶相似，对头孢他啶有严重过敏反应者慎用。
(4) 不能渗入脑脊液，不能治疗脑膜炎。`,
        importance: 4,
      },
    ],
  },
  'C9.7': {
    sectionCode: 'C9.7',
    sectionTitle: '第七节 氨基糖苷类抗菌药物',
    chapterCode: 'C9',
    points: [
      {
        title: '代表药品与作用机制',
        content: `代表药品：链霉素、庆大霉素、妥布霉素、阿米卡星、奈替米星、依替米星

作用机制：通过与细菌核糖体30S亚基结合，抑制细菌蛋白质合成。

抗菌谱：主要对革兰阴性菌有强大的抗菌活性，对部分革兰阳性菌也有作用。`,
        importance: 4,
      },
      {
        title: '临床用药评价',
        content: `典型不良反应：
(1) 耳毒性：前庭功能损害和耳蜗神经损害。
(2) 肾毒性：是最常见的不良反应。
(3) 神经肌肉阻滞：可引起呼吸抑制。
(4) 过敏反应。

注意事项：
(1) 肾功能不全患者需调整剂量。
(2) 避免与有耳毒性、肾毒性的药物合用。
(3) 孕妇禁用。`,
        importance: 5,
      },
    ],
  },
  'C9.8': {
    sectionCode: 'C9.8',
    sectionTitle: '第八节 四环素类抗菌药物',
    chapterCode: 'C9',
    points: [
      {
        title: '药物临床用药评价',
        content: `代表药品：四环素、多西环素、米诺环素、替加环素

作用机制：通过与细菌核糖体30S亚基结合，抑制细菌蛋白质合成。

抗菌谱：对革兰阳性菌、革兰阴性菌、立克次体、支原体、衣原体、螺旋体等有抗菌活性。

典型不良反应：
(1) 胃肠道反应：恶心、呕吐、腹泻。
(2) 二重感染：长期使用可导致菌群失调。
(3) 肝毒性：大剂量使用可引起肝损害。
(4) 牙齿和骨骼发育影响：8岁以下儿童禁用。
(5) 光敏反应。

注意事项：
(1) 与含钙、镁、铝、铁等金属离子的药物或食物同服，可形成络合物，影响吸收。
(2) 应餐前1小时或餐后2小时服用。
(3) 孕妇、哺乳期妇女、8岁以下儿童禁用。`,
        importance: 5,
      },
    ],
  },
  'C11.2': {
    sectionCode: 'C11.2',
    sectionTitle: '第二节 微量元素与维生素',
    chapterCode: 'C11',
    points: [
      {
        title: '水溶性维生素的临床用药评价',
        content: `水溶性维生素包括：维生素B1、B2、B6、B12、C、叶酸、烟酸、泛酸等。

维生素C：
(1) 作用特点：①为高效抗氧化剂，减轻抗坏血酸过氧化物酶基底的氧化应力；②减少毛细血管的通透性，减低毛细血管脆性；③增强机体解毒功能和对传染病的抵抗力
(2) 适应证：防治坏血病、牙龈出血、各种急慢性传染病及紫癜等的辅助治疗
(3) 典型不良反应：①皮肤红亮、头痛、尿频、恶心、呕吐、腹泻、胃部不适、胃痉挛；②长期大量（2g/d以上）应用可能引起泌尿系统尿酸盐、半胱氨酸盐或草酸盐结石
(4) 维生素C促进去铁胶与铁的络合，从而使尿铁排出增加。维生素C与铁络合，可形成易于吸收的二价铁盐，提高铁的吸收率。`,
        importance: 4,
      },
    ],
  },
  'C11.3': {
    sectionCode: 'C11.3',
    sectionTitle: '第三节 肠内营养药',
    chapterCode: 'C11',
    points: [
      {
        title: '肠内营养药的分类与临床用药评价',
        content: `肠内营养药是指通过胃肠道提供营养支持的药物，适用于不能正常进食或营养摄入不足的患者。

分类：
1. 整蛋白型：适用于胃肠道功能正常的患者
2. 短肽型：适用于胃肠道功能部分受损的患者
3. 氨基酸型：适用于胃肠道功能严重受损的患者

临床用药评价：
(1) 肠内营养优于肠外营养，更符合生理状态。
(2) 可维持肠道黏膜屏障功能。
(3) 减少感染并发症。
(4) 费用较低。

注意事项：
(1) 需要评估患者的胃肠道功能。
(2) 注意监测血糖、电解质等指标。
(3) 避免过快输注，防止胃肠道不耐受。`,
        importance: 4,
      },
    ],
  },
}

// 获取章节和小节的ID
async function getSectionIds(): Promise<Map<string, { chapterId: string; sectionId: string }>> {
  const ids = new Map<string, { chapterId: string; sectionId: string }>()
  
  for (const [key, sectionData] of Object.entries(missingSectionsData)) {
    // 获取章节ID
    const { data: chapter } = await supabase
      .from('knowledge_tree')
      .select('id')
      .eq('subject_code', subjectCode)
      .eq('node_type', 'chapter')
      .eq('code', sectionData.chapterCode)
      .single()
    
    if (!chapter) {
      console.error(`❌ 未找到章节 ${sectionData.chapterCode}`)
      continue
    }
    
    // 获取小节ID
    const { data: section } = await supabase
      .from('knowledge_tree')
      .select('id')
      .eq('subject_code', subjectCode)
      .eq('node_type', 'section')
      .eq('code', sectionData.sectionCode)
      .single()
    
    if (!section) {
      console.error(`❌ 未找到小节 ${sectionData.sectionCode}`)
      continue
    }
    
    ids.set(key, { chapterId: chapter.id, sectionId: section.id })
  }
  
  return ids
}

// 导入考点数据
async function importPoints() {
  console.log('🔍 开始导入缺失章节的考点数据...\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // 1. 获取章节和小节ID
  console.log('📋 获取章节和小节ID...')
  const sectionIds = await getSectionIds()
  
  if (sectionIds.size === 0) {
    console.error('❌ 未找到任何章节或小节')
    return
  }
  
  console.log(`✅ 找到 ${sectionIds.size} 个小节\n`)
  
  // 2. 导入考点
  let totalImported = 0
  let totalFailed = 0
  
  for (const [key, sectionData] of Object.entries(missingSectionsData)) {
    const ids = sectionIds.get(key)
    if (!ids) {
      console.error(`❌ 未找到 ${key} 的ID`)
      continue
    }
    
    console.log(`\n📝 处理 ${key} - ${sectionData.sectionTitle}`)
    console.log(`   小节ID: ${ids.sectionId}`)
    console.log(`   考点数量: ${sectionData.points.length}`)
    
    // 转换为数据库格式
    const dbRecords = sectionData.points.map((point, index) => {
      const pointCode = `${sectionData.sectionCode}.${index + 1}`
      const pointId = `xiyao_er_${pointCode.replace(/\./g, '_').replace(/C/g, '')}`
      
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
        parent_id: ids.sectionId,
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
      console.error(`   ❌ 导入失败:`, error.message)
      totalFailed += dbRecords.length
    } else {
      totalImported += dbRecords.length
      console.log(`   ✅ 成功导入 ${dbRecords.length} 个考点`)
      dbRecords.forEach((record, idx) => {
        console.log(`      ${idx + 1}. ${record.code} - ${record.title}`)
      })
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`\n📊 导入完成:`)
  console.log(`   成功: ${totalImported} 个考点`)
  console.log(`   失败: ${totalFailed} 个考点`)
  console.log('\n✅ 导入完成!\n')
}

// 运行导入
importPoints()
  .then(() => {
    console.log('✅ 脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error)
    process.exit(1)
  })

