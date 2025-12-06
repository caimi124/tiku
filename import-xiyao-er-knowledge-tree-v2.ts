/**
 * 西药二（药学专业知识二）知识图谱完整导入脚本 V2
 * 
 * 包含详细的药物信息、作用机制、不良反应等内容
 */

import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

// 科目代码
const SUBJECT_CODE = 'xiyao-er'

// 知识图谱数据结构
interface KnowledgeNode {
  code: string
  title: string
  children?: KnowledgeNode[]
  importance?: number  // 1-5, 默认3
  content?: string
  examYears?: string[] // 考试年份
  keyDrugs?: string[]  // 关键药物
}

// 完整的西药二知识图谱（含详细内容）
const knowledgeTree: KnowledgeNode[] = [
  {
    code: '1',
    title: '第一章 精神与中枢神经系统用药',
    importance: 5,
    children: [
      {
        code: '1.1',
        title: '第一节 镇静催眠药、中枢肌松药',
        children: [
          {
            code: '1.1.1',
            title: '第一亚类 镇静催眠药',
            children: [
              { 
                code: '1.1.1.1', 
                title: '考点1 药物分类与作用机制', 
                importance: 5,
                examYears: ['2020', '2021', '2022', '2023', '2024'],
                content: `【作用机制分类】
1. 巴比妥类：增强GABA_A受体功能，延长Cl⁻通道开放时间
2. 苯二氮䓬类（BZDs）：增强GABA_A受体功能，增加Cl⁻通道开放频率
3. 非苯二氮䓬类（Z-drugs）：选择性作用于GABA_A受体α1亚基
4. 褪黑素受体激动剂：激动MT1/MT2受体，调节昼夜节律
5. 醛类（水合氯醛）：抑制中枢神经系统

【记忆口诀】苯二氮䓬频率增，巴比妥类时间延`,
                keyDrugs: ['地西泮', '艾司唑仑', '三唑仑', '唑吡坦', '佐匹克隆']
              },
              { 
                code: '1.1.1.2', 
                title: '考点2 镇静与催眠药的药理作用', 
                importance: 4,
                content: `【药理作用】
1. 镇静作用：消除紧张、焦虑
2. 催眠作用：诱导和维持睡眠
3. 抗焦虑作用：缓解焦虑症状
4. 抗惊厥作用：控制癫痫发作
5. 肌肉松弛作用：缓解肌肉痉挛
6. 顺行性遗忘：麻醉前给药`
              },
              { 
                code: '1.1.1.3', 
                title: '考点3 巴比妥类的临床用药评价', 
                importance: 4,
                examYears: ['2021', '2022', '2023'],
                content: `【代表药物】苯巴比妥、司可巴比妥
【不良反应】
- 严重：呼吸抑制、依赖性、戒断症状
- 中度：宿醉效应、肝酶诱导
- 轻度：嗜睡、共济失调

【禁忌】严重肝肾功能不全、呼吸功能不全、卟啉病`
              },
              { 
                code: '1.1.1.4', 
                title: '考点4 醛类的临床用药评价', 
                importance: 3,
                content: `【代表药物】水合氯醛
【特点】起效快，作用时间短
【用途】小儿高热惊厥、破伤风
【不良反应】胃肠道刺激、肝肾损害`
              },
              { 
                code: '1.1.1.5', 
                title: '考点5 苯二氮䓬类的临床用药评价', 
                importance: 5,
                examYears: ['2020', '2021', '2022', '2023', '2024'],
                content: `【代表药物分类】
- 长效：地西泮（t1/2 20-100h）
- 中效：艾司唑仑（t1/2 10-24h）
- 短效：三唑仑（t1/2 2-5h）
- 超短效：咪达唑仑（t1/2 1.5-2.5h）

【不良反应】
🔴 严重：呼吸抑制、反常反应、依赖性
🟡 中度：宿醉效应、顺行性遗忘、反跳性失眠
🟢 轻度：头晕、嗜睡、乏力

【禁忌】重症肌无力、急性闭角型青光眼、严重呼吸功能不全

【记忆口诀】地西泮长艾司中，三唑短效咪超短`,
                keyDrugs: ['地西泮', '艾司唑仑', '三唑仑', '咪达唑仑', '劳拉西泮']
              },
              { 
                code: '1.1.1.6', 
                title: '考点6 非苯二氮䓬类的临床用药评价', 
                importance: 5,
                examYears: ['2020', '2021', '2022', '2023', '2024'],
                content: `【代表药物】
- 唑吡坦（t1/2 2.5h）：入睡困难首选
- 佐匹克隆（t1/2 5h）：右旋体更优
- 扎来普隆（t1/2 1h）：超短效

【作用特点】
- 选择性作用于GABA_A受体α1亚基
- 催眠作用强，肌松、抗惊厥作用弱
- 对睡眠结构影响小
- 依赖性和戒断症状较轻

【记忆口诀】Z药选择α1，催眠强来肌松弱`,
                keyDrugs: ['唑吡坦', '佐匹克隆', '扎来普隆']
              },
              { 
                code: '1.1.1.7', 
                title: '考点7 褪黑素类的临床用药评价', 
                importance: 3,
                content: `【代表药物】雷美替胺
【作用机制】激动MT1/MT2受体，调节昼夜节律
【特点】无依赖性，老年人适用
【记忆口诀】雷美替胺调节律，老年失眠无依赖`
              },
            ]
          },
          {
            code: '1.1.2',
            title: '第二亚类 中枢肌松药',
            children: [
              { 
                code: '1.1.2.1', 
                title: '考点1 药物分类与代表药品', 
                importance: 3,
                content: `【药物分类】
1. 巴氯芬：激动GABA_B受体，抑制脊髓反射
2. 替扎尼定：α2受体激动，抑制脊髓中间神经元
3. 乙哌立松：抑制脊髓反射+血管扩张

【记忆口诀】巴氯芬激动B，替扎尼定α2`,
                keyDrugs: ['巴氯芬', '替扎尼定', '乙哌立松']
              },
              { 
                code: '1.1.2.2', 
                title: '考点2 药物临床用药评价', 
                importance: 3,
                content: `【临床应用】
- 脑卒中后肌痉挛
- 脊髓损伤后肌痉挛
- 多发性硬化

【不良反应】嗜睡、头晕、肌无力`
              },
            ]
          }
        ]
      },
      {
        code: '1.2',
        title: '第二节 抗癫痫药',
        importance: 5,
        children: [
          { 
            code: '1.2.1', 
            title: '考点1 药物分类与作用机制', 
            importance: 5,
            examYears: ['2020', '2021', '2022', '2023', '2024'],
            content: `【作用机制分类】
1. 钠通道阻滞剂：卡马西平、苯妥英钠、拉莫三嗪
2. 钙通道阻滞剂：乙琥胺（T型Ca²⁺通道）
3. GABA增强剂：丙戊酸钠、苯巴比妥
4. 新型抗癫痫药：左乙拉西坦（结合SV2A蛋白）`,
            keyDrugs: ['卡马西平', '苯妥英钠', '丙戊酸钠', '左乙拉西坦', '拉莫三嗪']
          },
          { 
            code: '1.2.2', 
            title: '考点2 卡马西平的临床用药评价', 
            importance: 5,
            examYears: ['2020', '2021', '2022', '2023', '2024'],
            content: `【作用机制】阻滞电压依赖性Na⁺通道

【药动学】
- 口服吸收慢而不规则
- 自身诱导代谢（2-4周达稳态）
- 活性代谢产物：10,11-环氧化物

【不良反应】
🔴 严重：Stevens-Johnson综合征（HLA-B*1502相关）、中毒性表皮坏死松解症、再生障碍性贫血、低钠血症
🟡 中度：肝功能损害、心脏传导阻滞
🟢 轻度：头晕、嗜睡、共济失调

【禁忌】房室传导阻滞、骨髓抑制病史

【记忆口诀】卡马西平钠通道，自身诱导要记牢；皮肤反应最严重，亚裔基因要筛查`,
            keyDrugs: ['卡马西平', '奥卡西平']
          },
          { 
            code: '1.2.3', 
            title: '考点3 苯妥英钠的临床用药评价', 
            importance: 5,
            examYears: ['2020', '2021', '2022', '2023', '2024'],
            content: `【药动学特点】
- 非线性动力学（零级消除）
- 治疗窗窄（10-20μg/mL）
- 血浆蛋白结合率高（90%）

【不良反应】
🔴 严重：心律失常（静脉给药过快）、紫癜、Stevens-Johnson综合征
🟡 中度：牙龈增生（长期用药）、多毛症、骨软化
🟢 轻度：眼球震颤、共济失调

【记忆口诀】苯妥英钠零级消，治疗窗窄要监测；牙龈增生多毛症，长期用药要注意`,
            keyDrugs: ['苯妥英钠']
          },
          { 
            code: '1.2.4', 
            title: '考点4 丙戊酸钠的临床用药评价', 
            importance: 5,
            examYears: ['2020', '2021', '2022', '2023', '2024'],
            content: `【作用机制】多机制
- 阻滞Na⁺通道
- 阻滞T型Ca²⁺通道
- 增强GABA能传递

【不良反应】
🔴 严重：肝毒性（<2岁儿童风险高）、胰腺炎、致畸性（神经管缺陷）、血小板减少
🟡 中度：体重增加、脱发、震颤
🟢 轻度：恶心、呕吐、嗜睡

【禁忌】肝病、妊娠（致畸）、线粒体疾病

【记忆口诀】丙戊酸钠广谱抗，肝毒致畸要警惕；小于两岁风险高，孕妇禁用记心间`,
            keyDrugs: ['丙戊酸钠']
          },
          { 
            code: '1.2.5', 
            title: '考点5 左乙拉西坦的临床用药评价', 
            importance: 4,
            content: `【作用机制】结合突触囊泡蛋白SV2A
【特点】
- 新型抗癫痫药
- 药物相互作用少
- 肾脏排泄为主
【不良反应】嗜睡、头晕、行为异常`,
            keyDrugs: ['左乙拉西坦']
          },
          { 
            code: '1.2.6', 
            title: '考点6 拉莫三嗪的临床用药评价', 
            importance: 4,
            content: `【作用机制】阻滞电压依赖性Na⁺通道
【不良反应】
- 皮疹（严重时可致Stevens-Johnson综合征）
- 需缓慢加量以减少皮疹风险`,
            keyDrugs: ['拉莫三嗪']
          },
          { 
            code: '1.2.7', 
            title: '考点7 抗癫痫药的特殊人群用药', 
            importance: 4,
            content: `【妊娠期】
- 丙戊酸钠禁用（致畸风险最高）
- 首选拉莫三嗪、左乙拉西坦

【老年人】
- 注意药物相互作用
- 从小剂量开始

【儿童】
- 丙戊酸钠<2岁肝毒性风险高`
          },
        ]
      },
      {
        code: '1.3',
        title: '第三节 抗抑郁药',
        importance: 5,
        children: [
          { 
            code: '1.3.1', 
            title: '考点1 药物分类与作用机制', 
            importance: 5,
            examYears: ['2020', '2021', '2022', '2023', '2024'],
            content: `【药物分类】
1. SSRIs（选择性5-HT再摄取抑制剂）
   - 氟西汀、帕罗西汀、舍曲林、西酞普兰、艾司西酞普兰
   - 机制：选择性抑制5-HT再摄取

2. SNRIs（5-HT和NE再摄取抑制剂）
   - 文拉法辛、度洛西汀
   - 机制：抑制5-HT和NE再摄取

3. NaSSA（去甲肾上腺素能和特异性5-HT能抗抑郁药）
   - 米氮平
   - 机制：阻断α2受体和5-HT2/3受体

4. 三环类（TCAs）
   - 阿米替林、丙米嗪
   - 机制：抑制5-HT和NE再摄取+多受体阻断`,
            keyDrugs: ['氟西汀', '帕罗西汀', '舍曲林', '文拉法辛', '米氮平']
          },
          { 
            code: '1.3.2', 
            title: '考点2 选择性5-羟色胺再摄取抑制剂（SSRI）的临床用药评价', 
            importance: 5,
            examYears: ['2020', '2021', '2022', '2023', '2024'],
            content: `【代表药物比较】
| 药物 | 半衰期 | 特点 |
|------|--------|------|
| 氟西汀 | 1-3天 | 半衰期最长，CYP2D6抑制 |
| 帕罗西汀 | 21h | 抗胆碱作用最强 |
| 舍曲林 | 26h | 对CYP影响小 |
| 西酞普兰 | 35h | 选择性最高 |
| 艾司西酞普兰 | 27-32h | S-异构体，疗效更好 |

【不良反应】
🔴 严重：5-HT综合征（与MAOIs合用）、出血风险增加、QT间期延长
🟡 中度：性功能障碍、撤药综合征、低钠血症
🟢 轻度：恶心、腹泻、头痛、失眠

【禁忌】与MAOIs合用（间隔≥2周）

【记忆口诀】SSRI选择5-HT，氟西汀长帕罗胆；舍曲林安全性好，西酞普兰选择高`,
            keyDrugs: ['氟西汀', '帕罗西汀', '舍曲林', '西酞普兰', '艾司西酞普兰']
          },
          { 
            code: '1.3.3', 
            title: '考点3 5-HT及去甲肾上腺素再摄取抑制剂（SNRI）的临床用药评价', 
            importance: 4,
            content: `【代表药物】文拉法辛、度洛西汀
【特点】
- 双重作用机制
- 对疼痛性抑郁效果好
【不良反应】
- 血压升高（高剂量）
- 撤药综合征明显`,
            keyDrugs: ['文拉法辛', '度洛西汀']
          },
          { 
            code: '1.3.4', 
            title: '考点4 米氮平的临床用药评价', 
            importance: 3,
            content: `【作用机制】阻断α2受体和5-HT2/3受体
【特点】
- 镇静作用强
- 增加食欲
- 性功能障碍少
【不良反应】体重增加、嗜睡`,
            keyDrugs: ['米氮平']
          },
          { 
            code: '1.3.5', 
            title: '考点5 三环、四环类抗抑郁药的临床用药评价', 
            importance: 4,
            content: `【代表药物】阿米替林、丙米嗪
【不良反应】
- 抗胆碱作用：口干、便秘、尿潴留、视物模糊
- 心脏毒性：心律失常、传导阻滞
- 体位性低血压
【禁忌】心脏病、青光眼、前列腺增生`,
            keyDrugs: ['阿米替林', '丙米嗪']
          },
          { 
            code: '1.3.6', 
            title: '考点6 抗抑郁药的使用注意事项', 
            importance: 4,
            content: `【注意事项】
1. 起效时间：2-4周
2. 疗程：首次发作≥6个月，复发≥2年
3. 停药：需逐渐减量
4. 自杀风险：治疗初期可能增加
5. 5-HT综合征：与MAOIs、曲马多等合用风险`
          },
        ]
      },
      {
        code: '1.5',
        title: '第五节 中枢镇痛药',
        importance: 5,
        children: [
          { 
            code: '1.5.1', 
            title: '考点1 药物分类与代表药品', 
            importance: 5,
            examYears: ['2020', '2021', '2022', '2023', '2024'],
            content: `【阿片受体分类与效应】
μ受体：镇痛（脊髓上）、呼吸抑制、欣快感、缩瞳、便秘
κ受体：镇痛（脊髓）、镇静、烦躁不安
δ受体：镇痛、情绪调节

【药物分类】
1. 强阿片类：吗啡、芬太尼、羟考酮、氢吗啡酮
2. 弱阿片类：可待因、曲马多
3. 阿片受体部分激动剂：丁丙诺啡
4. 阿片受体拮抗剂：纳洛酮、纳曲酮`,
            keyDrugs: ['吗啡', '芬太尼', '羟考酮', '曲马多', '纳洛酮']
          },
          { 
            code: '1.5.2', 
            title: '考点2 阿片类镇痛药的止痛强度', 
            importance: 5,
            examYears: ['2020', '2021', '2022', '2023', '2024'],
            content: `【镇痛强度比较（吗啡=1）】
- 舒芬太尼 = 1000
- 芬太尼 = 100-200
- 瑞芬太尼 = 100-200
- 氢吗啡酮 = 5-7
- 羟考酮 = 1.5
- 吗啡 = 1
- 哌替啶 = 0.1
- 曲马多 = 0.1

【记忆口诀】芬太尼百倍强，舒芬千倍更厉害；哌替啶弱十倍，曲马多也差不多`
          },
          { 
            code: '1.5.3', 
            title: '考点3 阿片受体的生理效应', 
            importance: 5,
            content: `【μ受体效应】
- 镇痛（脊髓上水平）
- 呼吸抑制
- 欣快感
- 缩瞳
- 便秘
- 恶心呕吐
- 尿潴留`
          },
          { 
            code: '1.5.4', 
            title: '考点4 吗啡的临床用药评价', 
            importance: 5,
            examYears: ['2020', '2021', '2022', '2023', '2024'],
            content: `【药动学】
- 口服首过效应明显（生物利用度25%）
- 肝脏代谢，主要代谢产物M6G有活性
- 肾功能不全时M6G蓄积

【不良反应】
🔴 严重：呼吸抑制（最危险）、依赖性、胆道痉挛
🟡 中度：便秘（最常见，不耐受）、恶心呕吐、尿潴留
🟢 轻度：缩瞳、嗜睡、皮肤瘙痒

【禁忌】呼吸抑制、颅内压增高、支气管哮喘急性发作、胆绞痛（单用）

【记忆口诀】吗啡μ受体全激动，镇痛镇静抑呼吸；便秘最常不耐受，呼吸抑制最危险`,
            keyDrugs: ['吗啡']
          },
          { 
            code: '1.5.5', 
            title: '考点5 镇痛药的临床应用注意', 
            importance: 4,
            content: `【WHO三阶梯镇痛原则】
第一阶梯：非阿片类（NSAIDs）
第二阶梯：弱阿片类±非阿片类
第三阶梯：强阿片类±非阿片类

【用药原则】
- 口服给药
- 按时给药
- 按阶梯给药
- 个体化给药
- 注意具体细节`
          },
        ]
      },
      {
        code: '1.6',
        title: '第六节 抗帕金森病药',
        importance: 5,
        children: [
          { 
            code: '1.6.1', 
            title: '考点1 药物分类与代表药品', 
            importance: 5,
            content: `【药物分类】
1. 多巴胺前体：左旋多巴/卡比多巴
2. DA受体激动剂：普拉克索、罗匹尼罗
3. MAO-B抑制剂：司来吉兰、雷沙吉兰
4. COMT抑制剂：恩他卡朋
5. 抗胆碱药：苯海索`,
            keyDrugs: ['左旋多巴', '普拉克索', '司来吉兰', '恩他卡朋', '苯海索']
          },
          { 
            code: '1.6.2', 
            title: '考点2 左旋多巴的临床用药评价', 
            importance: 5,
            examYears: ['2020', '2021', '2022', '2023', '2024'],
            content: `【作用机制】多巴胺前体，透过血脑屏障，在脑内转化为多巴胺

【药动学】
- 口服吸收受高蛋白饮食影响
- 外周脱羧酶代谢（需合用抑制剂）
- "开-关"现象（长期用药）

【不良反应】
🔴 严重：运动并发症（剂末现象、开关现象）、异动症、精神症状
🟡 中度：体位性低血压、心律失常、恶心呕吐
🟢 轻度：尿液变色

【禁忌】闭角型青光眼、精神病
【相互作用】与MAOIs合用禁忌（高血压危象）；维生素B6加速外周代谢

【记忆口诀】左旋多巴补DA，蜜月期后并发多；开关现象异动症，长期用药要注意`,
            keyDrugs: ['左旋多巴', '卡比多巴', '苄丝肼']
          },
        ]
      },
      {
        code: '1.7',
        title: '第七节 抗精神病药',
        importance: 5,
        children: [
          { 
            code: '1.7.1', 
            title: '考点1 药物分类与作用机制', 
            importance: 5,
            content: `【药物分类】
1. 第一代（典型）：氯丙嗪、氟哌啶醇
   - 机制：阻断D2受体
2. 第二代（非典型）：利培酮、奥氮平、喹硫平、阿立哌唑
   - 机制：阻断D2+5-HT2A受体`,
            keyDrugs: ['氯丙嗪', '氟哌啶醇', '利培酮', '奥氮平', '喹硫平', '阿立哌唑']
          },
          { 
            code: '1.7.3', 
            title: '考点3 第二代抗精神病药的临床用药评价', 
            importance: 5,
            examYears: ['2020', '2021', '2022', '2023', '2024'],
            content: `【代表药物比较】
| 药物 | 特点 | 主要不良反应 |
|------|------|--------------|
| 利培酮 | EPS风险相对高 | 高泌乳素血症 |
| 奥氮平 | 代谢综合征风险高 | 体重增加、血糖升高 |
| 喹硫平 | 镇静作用强 | 嗜睡、体位性低血压 |
| 阿立哌唑 | DA部分激动剂 | 静坐不能 |

【不良反应】
🔴 严重：恶性抗精神病药综合征（NMS）、QT间期延长、粒细胞缺乏（氯氮平）
🟡 中度：锥体外系症状（EPS）、代谢综合征、高泌乳素血症
🟢 轻度：镇静、口干、便秘

【记忆口诀】一代阻断D2多，二代加上5-HT；奥氮平胖利培乳，喹硫平困阿立动`
          },
        ]
      }
    ]
  },
]

// ============================================
// 导入函数
// ============================================

async function clearExistingData(client: any) {
  console.log('清除现有西药二知识图谱数据...')
  await client.query(`DELETE FROM knowledge_tree WHERE subject_code = $1`, [SUBJECT_CODE])
  console.log('清除完成')
}

async function insertNode(
  client: any,
  node: KnowledgeNode,
  parentId: string | null,
  level: number,
  sortOrder: number
): Promise<string> {
  // 确定节点类型
  let nodeType: string
  if (level === 1) nodeType = 'chapter'
  else if (level === 2) nodeType = 'section'
  else if (level === 3) nodeType = 'subsection'
  else nodeType = 'point'

  const result = await client.query(
    `INSERT INTO knowledge_tree (
      code, title, content, node_type, importance, parent_id, 
      subject_code, level, sort_order
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id`,
    [
      node.code,
      node.title,
      node.content || null,
      nodeType,
      node.importance || 3,
      parentId,
      SUBJECT_CODE,
      level,
      sortOrder
    ]
  )

  const nodeId = result.rows[0].id

  // 递归插入子节点
  if (node.children && node.children.length > 0) {
    for (let i = 0; i < node.children.length; i++) {
      await insertNode(client, node.children[i], nodeId, level + 1, i + 1)
    }
  }

  return nodeId
}

async function importKnowledgeTree() {
  const client = await pool.connect()
  
  try {
    console.log('开始导入西药二知识图谱（V2版本）...')
    console.log(`共 ${knowledgeTree.length} 章`)
    
    await client.query('BEGIN')
    
    // 清除现有数据
    await clearExistingData(client)
    
    // 统计
    let totalChapters = 0
    let totalSections = 0
    let totalPoints = 0
    
    // 导入每一章
    for (let i = 0; i < knowledgeTree.length; i++) {
      const chapter = knowledgeTree[i]
      console.log(`导入: ${chapter.title}`)
      
      await insertNode(client, chapter, null, 1, i + 1)
      totalChapters++
      
      // 统计节和考点
      if (chapter.children) {
        for (const section of chapter.children) {
          totalSections++
          if (section.children) {
            for (const item of section.children) {
              if (item.children) {
                totalPoints += item.children.length
              } else {
                totalPoints++
              }
            }
          }
        }
      }
    }
    
    await client.query('COMMIT')
    
    console.log('\n========== 导入完成 ==========')
    console.log(`章节数: ${totalChapters}`)
    console.log(`小节数: ${totalSections}`)
    console.log(`考点数: ${totalPoints}`)
    console.log('================================')
    
    // 验证
    const countResult = await client.query(
      `SELECT node_type, COUNT(*) as count FROM knowledge_tree 
       WHERE subject_code = $1 GROUP BY node_type ORDER BY node_type`,
      [SUBJECT_CODE]
    )
    
    console.log('\n数据库验证:')
    for (const row of countResult.rows) {
      console.log(`  ${row.node_type}: ${row.count}`)
    }
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('导入失败:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// 执行导入
importKnowledgeTree()
  .then(() => {
    console.log('\n西药二知识图谱（V2版本）导入成功！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('导入出错:', error)
    process.exit(1)
  })
