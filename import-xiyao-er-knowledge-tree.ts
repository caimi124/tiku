/**
 * 西药二（药学专业知识二）知识图谱完整导入脚本
 * 
 * 包含13章完整内容的树状结构
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
}

// 完整的西药二知识图谱
const knowledgeTree: KnowledgeNode[] = [
  {
    code: '1',
    title: '第一章 精神与中枢神经系统用药',
    children: [
      {
        code: '1.1',
        title: '第一节 镇静催眠药、中枢肌松药',
        children: [
          {
            code: '1.1.1',
            title: '第一亚类 镇静催眠药',
            children: [
              { code: '1.1.1.1', title: '考点1 药物分类与作用机制', importance: 5 },
              { code: '1.1.1.2', title: '考点2 镇静与催眠药的药理作用', importance: 4 },
              { code: '1.1.1.3', title: '考点3 巴比妥类的临床用药评价', importance: 4 },
              { code: '1.1.1.4', title: '考点4 醛类的临床用药评价', importance: 3 },
              { code: '1.1.1.5', title: '考点5 苯二氮䓬类的临床用药评价', importance: 5 },
              { code: '1.1.1.6', title: '考点6 非苯二氮䓬类的临床用药评价', importance: 5 },
              { code: '1.1.1.7', title: '考点7 褪黑素类的临床用药评价', importance: 3 },
            ]
          },
          {
            code: '1.1.2',
            title: '第二亚类 中枢肌松药',
            children: [
              { code: '1.1.2.1', title: '考点1 药物分类与代表药品', importance: 3 },
              { code: '1.1.2.2', title: '考点2 药物临床用药评价', importance: 3 },
            ]
          }
        ]
      },
      {
        code: '1.2',
        title: '第二节 抗癫痫药',
        children: [
          { code: '1.2.1', title: '考点1 药物分类与作用机制', importance: 5 },
          { code: '1.2.2', title: '考点2 卡马西平的临床用药评价', importance: 5 },
          { code: '1.2.3', title: '考点3 苯妥英钠的临床用药评价', importance: 5 },
          { code: '1.2.4', title: '考点4 丙戊酸钠的临床用药评价', importance: 5 },
          { code: '1.2.5', title: '考点5 左乙拉西坦的临床用药评价', importance: 4 },
          { code: '1.2.6', title: '考点6 拉莫三嗪的临床用药评价', importance: 4 },
          { code: '1.2.7', title: '考点7 抗癫痫药的特殊人群用药', importance: 4 },
        ]
      },
      {
        code: '1.3',
        title: '第三节 抗抑郁药',
        children: [
          { code: '1.3.1', title: '考点1 药物分类与作用机制', importance: 5 },
          { code: '1.3.2', title: '考点2 选择性5-羟色胺再摄取抑制剂（SSRI）的临床用药评价', importance: 5 },
          { code: '1.3.3', title: '考点3 5-HT及去甲肾上腺素再摄取抑制剂（SNRI）的临床用药评价', importance: 4 },
          { code: '1.3.4', title: '考点4 米氮平的临床用药评价', importance: 3 },
          { code: '1.3.5', title: '考点5 三环、四环类抗抑郁药的临床用药评价', importance: 4 },
          { code: '1.3.6', title: '考点6 抗抑郁药的使用注意事项', importance: 4 },
        ]
      },
      {
        code: '1.4',
        title: '第四节 抗记忆障碍及改善神经功能药',
        children: [
          { code: '1.4.1', title: '考点1 药物分类与作用机制', importance: 4 },
          { code: '1.4.2', title: '考点2 药物的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '1.5',
        title: '第五节 中枢镇痛药',
        children: [
          { code: '1.5.1', title: '考点1 药物分类与代表药品', importance: 5 },
          { code: '1.5.2', title: '考点2 阿片类镇痛药的止痛强度', importance: 5 },
          { code: '1.5.3', title: '考点3 阿片受体的生理效应', importance: 5 },
          { code: '1.5.4', title: '考点4 吗啡的临床用药评价', importance: 5 },
          { code: '1.5.5', title: '考点5 镇痛药的临床应用注意', importance: 4 },
        ]
      },
      {
        code: '1.6',
        title: '第六节 抗帕金森病药',
        children: [
          { code: '1.6.1', title: '考点1 药物分类与代表药品', importance: 5 },
          { code: '1.6.2', title: '考点2 左旋多巴的临床用药评价', importance: 5 },
          { code: '1.6.3', title: '考点3 恩他卡朋的临床用药评价', importance: 3 },
          { code: '1.6.4', title: '考点4 苯海索的临床用药评价', importance: 4 },
          { code: '1.6.5', title: '考点5 多巴胺（DA）受体激动剂的临床用药评价', importance: 4 },
          { code: '1.6.6', title: '考点6 单胺氧化酶-B（MAO-B）抑制剂的临床用药评价', importance: 3 },
        ]
      },
      {
        code: '1.7',
        title: '第七节 抗精神病药',
        children: [
          { code: '1.7.1', title: '考点1 药物分类与作用机制', importance: 5 },
          { code: '1.7.2', title: '考点2 第一代抗精神病药的临床用药评价', importance: 4 },
          { code: '1.7.3', title: '考点3 第二代抗精神病药的临床用药评价', importance: 5 },
          { code: '1.7.4', title: '考点4 碳酸锂的临床用药评价', importance: 4 },
        ]
      }
    ]
  },
  {
    code: '2',
    title: '第二章 解热、镇痛、抗炎、抗风湿及抗痛风药',
    children: [
      {
        code: '2.1',
        title: '第一节 解热、镇痛、抗炎药',
        children: [
          { code: '2.1.1', title: '考点1 药物分类与作用机制', importance: 5 },
          { code: '2.1.2', title: '考点2 药物临床用药评价', importance: 5 },
        ]
      },
      {
        code: '2.2',
        title: '第二节 抗风湿药',
        children: [
          { code: '2.2.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '2.2.2', title: '考点2 药物临床用药评价', importance: 4 },
        ]
      },
      {
        code: '2.3',
        title: '第三节 抗痛风药',
        children: [
          { code: '2.3.1', title: '考点1 药物分类与作用机制', importance: 5 },
          { code: '2.3.2', title: '考点2 秋水仙碱的临床用药评价', importance: 5 },
          { code: '2.3.3', title: '考点3 促进尿酸排泄药的临床用药评价', importance: 4 },
          { code: '2.3.4', title: '考点4 抑制尿酸生成药的临床用药评价', importance: 5 },
        ]
      }
    ]
  },
  {
    code: '3',
    title: '第三章 呼吸系统用药',
    children: [
      {
        code: '3.1',
        title: '第一节 镇咳药',
        children: [
          { code: '3.1.1', title: '考点1 药物分类与作用机制', importance: 4 },
          { code: '3.1.2', title: '考点2 药物临床用药评价', importance: 4 },
        ]
      },
      {
        code: '3.2',
        title: '第二节 祛痰药',
        children: [
          { code: '3.2.1', title: '考点1 药物分类与作用机制', importance: 4 },
          { code: '3.2.2', title: '考点2 恶心性和刺激性祛痰药的临床用药评价', importance: 3 },
          { code: '3.2.3', title: '考点3 黏痰溶解剂的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '3.3',
        title: '第三节 平喘药',
        children: [
          { code: '3.3.1', title: '考点1 药物分类与代表药品', importance: 5 },
          { code: '3.3.2', title: '考点2 β₂受体激动剂的临床用药评价', importance: 5 },
          { code: '3.3.3', title: '考点3 M胆碱受体拮抗剂的临床用药评价', importance: 4 },
          { code: '3.3.4', title: '考点4 黄嘌呤类药物（磷酸二酯酶抑制剂）的临床用药评价', importance: 5 },
          { code: '3.3.5', title: '考点5 过敏介质阻释剂（奥马珠单抗）的临床用药评价', importance: 3 },
          { code: '3.3.6', title: '考点6 吸入型肾上腺糖皮质激素（ICS）的临床用药评价', importance: 5 },
          { code: '3.3.7', title: '考点7 白三烯受体拮抗剂（LTRA）的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '3.4',
        title: '第四节 特发性肺纤维化的治疗药物',
        children: [
          { code: '3.4.1', title: '考点1 药物临床用药评价', importance: 3 },
        ]
      }
    ]
  },
  {
    code: '4',
    title: '第四章 消化系统用药',
    children: [
      {
        code: '4.1',
        title: '第一节 抑酸剂、抗酸药与胃黏膜保护药',
        children: [
          { code: '4.1.1', title: '考点1 药物分类与代表药品', importance: 5 },
          { code: '4.1.2', title: '考点2 质子泵抑制剂（PPI）的临床用药评价', importance: 5 },
          { code: '4.1.3', title: '考点3 钾离子竞争性酸阻滞剂（P-CABs）的临床用药评价', importance: 4 },
          { code: '4.1.4', title: '考点4 H₂受体拮抗剂的临床用药评价', importance: 5 },
          { code: '4.1.5', title: '考点5 前列腺素类抑酸剂的临床用药评价', importance: 3 },
          { code: '4.1.6', title: '考点6 抗酸药的临床用药评价', importance: 4 },
          { code: '4.1.7', title: '考点7 胃黏膜保护药的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '4.2',
        title: '第二节 解痉药、胃肠动力药与功能性胃肠病治疗药',
        children: [
          { code: '4.2.1', title: '考点1 解痉药的分类与代表药品', importance: 4 },
          { code: '4.2.2', title: '考点2 抗胆碱M受体药的临床用药评价', importance: 4 },
          { code: '4.2.3', title: '考点3 匹维溴铵的临床用药评价', importance: 3 },
          { code: '4.2.4', title: '考点4 胃肠动力药的分类与作用机制', importance: 4 },
          { code: '4.2.5', title: '考点5 胃肠动力药的临床用药评价', importance: 5 },
          { code: '4.2.6', title: '考点6 曲美布汀的临床用药评价', importance: 3 },
        ]
      },
      {
        code: '4.3',
        title: '第三节 止吐药',
        children: [
          { code: '4.3.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '4.3.2', title: '考点2 止吐药的临床用药评价', importance: 4 },
          { code: '4.3.3', title: '考点3 抗肿瘤治疗相关性恶心呕吐的处理原则', importance: 4 },
          { code: '4.3.4', title: '考点4 依据化疗药的催吐性选用止吐药', importance: 4 },
        ]
      },
      {
        code: '4.4',
        title: '第四节 肝胆疾病用药',
        children: [
          { code: '4.4.1', title: '考点1 肝胆疾病用药的分类与代表药品', importance: 4 },
          { code: '4.4.2', title: '考点2 肝胆疾病用药的临床用药评价', importance: 4 },
          { code: '4.4.3', title: '考点3 胆疾病用药的分类与代表药品', importance: 3 },
          { code: '4.4.4', title: '考点4 胆疾病用药的临床用药评价', importance: 3 },
        ]
      },
      {
        code: '4.5',
        title: '第五节 泻药与便秘治疗药',
        children: [
          { code: '4.5.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '4.5.2', title: '考点2 药物临床用药评价', importance: 4 },
          { code: '4.5.3', title: '考点3 特殊人群便秘用药', importance: 4 },
        ]
      },
      {
        code: '4.6',
        title: '第六节 止泻药、肠道抗感染药、肠道抗炎药',
        children: [
          { code: '4.6.1', title: '考点1 止泻药的分类与代表药品', importance: 4 },
          { code: '4.6.2', title: '考点2 止泻药的临床用药评价', importance: 4 },
          { code: '4.6.3', title: '考点3 肠道抗感染药的临床用药评价', importance: 3 },
          { code: '4.6.4', title: '考点4 肠道抗炎药的分类与代表药品', importance: 4 },
          { code: '4.6.5', title: '考点5 肠道抗炎药的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '4.7',
        title: '第七节 助消化药',
        children: [
          { code: '4.7.1', title: '考点1 助消化药的临床用药评价', importance: 3 },
        ]
      }
    ]
  },

  {
    code: '5',
    title: '第五章 心血管系统用药',
    children: [
      {
        code: '5.1',
        title: '第一节 抗心律失常药',
        children: [
          { code: '5.1.1', title: '考点1 药物分类与作用机制', importance: 5 },
          { code: '5.1.2', title: '考点2 Ⅰ类抗心律失常药的临床用药评价', importance: 4 },
          { code: '5.1.3', title: '考点3 钾通道阻滞剂的临床用药评价', importance: 5 },
          { code: '5.1.4', title: '考点4 非二氢吡啶类钙通道阻滞剂的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '5.2',
        title: '第二节 抗高血压药',
        children: [
          { code: '5.2.1', title: '考点1 药物分类与代表药品', importance: 5 },
          { code: '5.2.2', title: '考点2 ACEI类的临床用药评价', importance: 5 },
          { code: '5.2.3', title: '考点3 ARB类的临床用药评价', importance: 5 },
          { code: '5.2.4', title: '考点4 三代钙通道阻滞剂（CCB）的对比', importance: 5 },
          { code: '5.2.5', title: '考点5 钙通道阻滞剂（CCB）的临床用药评价', importance: 5 },
          { code: '5.2.6', title: '考点6 受体拮抗剂的临床用药评价', importance: 4 },
          { code: '5.2.7', title: '考点7 其他抗高血压药的临床用药评价', importance: 3 },
        ]
      },
      {
        code: '5.3',
        title: '第三节 调节血脂药',
        children: [
          { code: '5.3.1', title: '考点1 药物分类与代表药品', importance: 5 },
          { code: '5.3.2', title: '考点2 羟甲基戊二酰辅酶A还原酶抑制剂的临床用药评价', importance: 5 },
          { code: '5.3.3', title: '考点3 其他调血脂药的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '5.4',
        title: '第四节 抗心绞痛药',
        children: [
          { code: '5.4.1', title: '考点1 药物分类与代表药品', importance: 5 },
          { code: '5.4.2', title: '考点2 硝酸酯类药物的临床用药评价', importance: 5 },
        ]
      },
      {
        code: '5.5',
        title: '第五节 抗心力衰竭药',
        children: [
          { code: '5.5.1', title: '考点1 药物分类与代表药品', importance: 5 },
          { code: '5.5.2', title: '考点2 强心苷类药物的临床用药评价', importance: 5 },
          { code: '5.5.3', title: '考点3 伊伐布雷定的临床用药评价', importance: 3 },
          { code: '5.5.4', title: '考点4 沙库巴曲缬沙坦钠的临床用药评价', importance: 4 },
        ]
      }
    ]
  },
  {
    code: '6',
    title: '第六章 血液系统用药',
    children: [
      {
        code: '6.1',
        title: '第一节 抗血栓药',
        children: [
          { code: '6.1.1', title: '考点1 药物分类与代表药品', importance: 5 },
          { code: '6.1.2', title: '考点2 维生素K拮抗剂的临床用药评价', importance: 5 },
          { code: '6.1.3', title: '考点3 肝素类的临床用药评价', importance: 5 },
          { code: '6.1.4', title: '考点4 直接抗凝药的临床用药评价', importance: 5 },
          { code: '6.1.5', title: '考点5 血栓素A₂（TXA₂）抑制剂的临床用药评价', importance: 5 },
          { code: '6.1.6', title: '考点6 （ADP）P2Y₁₂受体拮抗剂的临床用药评价', importance: 5 },
          { code: '6.1.7', title: '考点7 溶栓药（溶栓酶）的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '6.2',
        title: '第二节 抗出血药',
        children: [
          { code: '6.2.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '6.2.2', title: '考点2 维生素K类的临床用药评价', importance: 5 },
          { code: '6.2.3', title: '考点3 凝血因子的临床用药评价', importance: 3 },
          { code: '6.2.4', title: '考点4 蛇毒血凝酶的临床用药评价', importance: 3 },
          { code: '6.2.5', title: '考点5 抗纤维蛋白溶解药的临床用药评价', importance: 4 },
          { code: '6.2.6', title: '考点6 促血小板生成药的临床用药评价', importance: 3 },
          { code: '6.2.7', title: '考点7 其他抗出血药的临床用药评价', importance: 3 },
        ]
      },
      {
        code: '6.3',
        title: '第三节 抗贫血药',
        children: [
          { code: '6.3.1', title: '考点1 药物分类与适应证', importance: 5 },
          { code: '6.3.2', title: '考点2 铁剂的临床用药评价', importance: 5 },
          { code: '6.3.3', title: '考点3 叶酸的临床用药评价', importance: 4 },
          { code: '6.3.4', title: '考点4 维生素B12的临床用药评价', importance: 4 },
          { code: '6.3.5', title: '考点5 重组人促红素的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '6.4',
        title: '第四节 升白细胞药',
        children: [
          { code: '6.4.1', title: '考点1 代表药品与临床用药评价', importance: 4 },
        ]
      },
      {
        code: '6.5',
        title: '第五节 骨髓保护药',
        children: [
          { code: '6.5.1', title: '考点1 药物分类与临床用药评价（曲拉西利、瑞波西利、哌柏西利）', importance: 3 },
        ]
      }
    ]
  },
  {
    code: '7',
    title: '第七章 泌尿系统用药',
    children: [
      {
        code: '7.1',
        title: '第一节 利尿药',
        children: [
          { code: '7.1.1', title: '考点1 药物分类与作用部位', importance: 5 },
          { code: '7.1.2', title: '考点2 袢利尿药的临床用药评价', importance: 5 },
          { code: '7.1.3', title: '考点3 噻嗪类与类噻嗪类利尿药的临床用药评价', importance: 5 },
          { code: '7.1.4', title: '考点4 留钾利尿药的临床用药评价', importance: 5 },
          { code: '7.1.5', title: '考点5 渗透性利尿药（甘露醇）的临床用药评价', importance: 4 },
          { code: '7.1.6', title: '考点6 加压素受体（V₂R）拮抗药的临床用药评价', importance: 3 },
          { code: '7.1.7', title: '重点强化——利尿药不良反应的对比', importance: 5 },
        ]
      },
      {
        code: '7.2',
        title: '第二节 治疗男性勃起功能障碍药',
        children: [
          { code: '7.2.1', title: '考点1 药物分类与代表药品', importance: 3 },
          { code: '7.2.2', title: '考点2 5型磷酸二酯酶抑制剂的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '7.3',
        title: '第三节 治疗良性前列腺增生用药',
        children: [
          { code: '7.3.1', title: '考点1 药物分类与作用机制', importance: 4 },
          { code: '7.3.2', title: '考点2 α1受体拮抗药的临床用药评价', importance: 5 },
          { code: '7.3.3', title: '考点3 5α还原酶抑制剂的临床用药评价', importance: 4 },
          { code: '7.3.4', title: '重点强化——α受体拮抗药与5α还原酶抑制剂的对比', importance: 4 },
        ]
      },
      {
        code: '7.4',
        title: '第四节 治疗膀胱过度活动症用药',
        children: [
          { code: '7.4.1', title: '考点1 药物分类与作用机制', importance: 3 },
          { code: '7.4.2', title: '考点2 M受体拮抗药的临床用药评价', importance: 4 },
        ]
      }
    ]
  },
  {
    code: '8',
    title: '第八章 内分泌系统用药',
    children: [
      {
        code: '8.1',
        title: '第一节 下丘脑-垂体激素及相关药物',
        children: [
          { code: '8.1.1', title: '考点1 重组人生长激素的临床用药评价', importance: 3 },
          { code: '8.1.2', title: '考点2 生长抑素的临床用药评价', importance: 3 },
          { code: '8.1.3', title: '考点3 促皮质素（ACTH）的临床用药评价', importance: 3 },
          { code: '8.1.4', title: '考点4 醋酸去氨加压素的临床用药评价', importance: 3 },
        ]
      },
      {
        code: '8.2',
        title: '第二节 肾上腺糖皮质激素类药物',
        children: [
          { code: '8.2.1', title: '考点1 药物分类与代表药品', importance: 5 },
          { code: '8.2.2', title: '考点2 药理作用与临床应用', importance: 5 },
          { code: '8.2.3', title: '考点3 治疗方案及疗程', importance: 4 },
          { code: '8.2.4', title: '考点4 临床应用注意', importance: 5 },
        ]
      },
      {
        code: '8.3',
        title: '第三节 甲状腺激素类药物与抗甲状腺药物',
        children: [
          { code: '8.3.1', title: '考点1 甲状腺激素的生理活性', importance: 4 },
          { code: '8.3.2', title: '考点2 甲状腺激素类药物的代表药品', importance: 4 },
          { code: '8.3.3', title: '考点3 甲状腺激素类药物的临床用药评价', importance: 4 },
          { code: '8.3.4', title: '考点4 抗甲状腺药物的分类与代表药品', importance: 5 },
          { code: '8.3.5', title: '考点5 硫脲类药物的临床用药评价', importance: 5 },
          { code: '8.3.6', title: '考点6 碘化钾的临床用药评价', importance: 3 },
          { code: '8.3.7', title: '重点强化——甲状腺激素和硫脲类抗甲状腺药物的对比', importance: 4 },
        ]
      },
      {
        code: '8.4',
        title: '第四节 胰岛素与其他影响血糖的药物',
        children: [
          { code: '8.4.1', title: '考点1 胰岛素和胰岛素类似物的分类与代表药品', importance: 5 },
          { code: '8.4.2', title: '考点2 胰岛素和胰岛素类似物的临床用药评价', importance: 5 },
          { code: '8.4.3', title: '考点3 口服降糖药与肠促胰素类降糖药的分类与代表药品', importance: 5 },
          { code: '8.4.4', title: '考点4 磺酰脲类促胰岛素分泌药的临床用药评价', importance: 5 },
          { code: '8.4.5', title: '考点5 格列奈类促胰岛素分泌药的临床用药评价', importance: 4 },
          { code: '8.4.6', title: '考点6 双胍类药物的临床用药评价', importance: 5 },
          { code: '8.4.7', title: '考点7 α-葡萄糖苷酶抑制剂的临床用药评价', importance: 5 },
          { code: '8.4.8', title: '考点8 胰岛素增敏剂的临床用药评价', importance: 4 },
          { code: '8.4.9', title: '考点9 二肽基肽酶-4抑制剂的临床用药评价', importance: 4 },
          { code: '8.4.10', title: '考点10 钠-葡萄糖协同转运蛋白2抑制剂的临床用药评价', importance: 5 },
          { code: '8.4.11', title: '考点11 葡萄糖激酶激活剂的临床用药评价', importance: 3 },
          { code: '8.4.12', title: '考点12 肠促胰素类降糖药的临床用药评价', importance: 5 },
          { code: '8.4.13', title: '重点强化——胰岛素与口服降糖药的对比', importance: 5 },
        ]
      },
      {
        code: '8.5',
        title: '第五节 调节骨代谢药物',
        children: [
          { code: '8.5.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '8.5.2', title: '考点2 钙剂的临床用药评价', importance: 4 },
          { code: '8.5.3', title: '考点3 维生素D及其活性代谢物的临床用药评价', importance: 4 },
          { code: '8.5.4', title: '考点4 双膦酸盐类的临床用药评价', importance: 5 },
          { code: '8.5.5', title: '考点5 地舒单抗的临床用药评价', importance: 3 },
          { code: '8.5.6', title: '考点6 降钙素的临床用药评价', importance: 4 },
          { code: '8.5.7', title: '考点7 雌激素受体调节剂的临床用药评价', importance: 3 },
          { code: '8.5.8', title: '考点8 特立帕肽的临床用药评价', importance: 3 },
          { code: '8.5.9', title: '重点强化——调节骨代谢药的作用特点', importance: 4 },
        ]
      },
      {
        code: '8.6',
        title: '第六节 减重药',
        children: [
          { code: '8.6.1', title: '考点1 药物分类与代表药品', importance: 3 },
          { code: '8.6.2', title: '考点2 奥利司他的临床用药评价', importance: 3 },
        ]
      },
      {
        code: '8.7',
        title: '第七节 性激素类',
        children: [
          { code: '8.7.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '8.7.2', title: '考点2 雌激素类的临床用药评价', importance: 4 },
          { code: '8.7.3', title: '考点3 孕激素类的临床用药评价', importance: 4 },
          { code: '8.7.4', title: '考点4 性激素类避孕药的临床用药评价', importance: 4 },
        ]
      }
    ]
  },

  {
    code: '9',
    title: '第九章 抗感染药物',
    children: [
      {
        code: '9.1',
        title: '第一节 抗菌药物总论',
        children: [
          { code: '9.1.1', title: '考点1 常用术语', importance: 5 },
          { code: '9.1.2', title: '考点2 病原微生物的耐药性', importance: 4 },
          { code: '9.1.3', title: '考点3 抗菌药物的药代动力学/药效学（PK/PD）', importance: 5 },
          { code: '9.1.4', title: '考点4 常见抗菌药物的清除途径', importance: 4 },
          { code: '9.1.5', title: '考点5 抗菌药物的分类与作用机制', importance: 5 },
        ]
      },
      {
        code: '9.2',
        title: '第二节 青霉素类抗菌药物',
        children: [
          { code: '9.2.1', title: '考点1 药物分类与作用机制', importance: 5 },
          { code: '9.2.2', title: '考点2 药物临床用药评价', importance: 5 },
        ]
      },
      {
        code: '9.3',
        title: '第三节 头孢菌素类抗菌药物',
        children: [
          { code: '9.3.1', title: '考点1 药物分类与作用机制', importance: 5 },
          { code: '9.3.2', title: '考点2 各代头孢菌素类抗菌药物的对比', importance: 5 },
          { code: '9.3.3', title: '考点3 药物临床用药评价', importance: 5 },
          { code: '9.3.4', title: '重点强化——可导致双硫仑样反应药物总结', importance: 5 },
        ]
      },
      {
        code: '9.4',
        title: '第四节 β-内酰胺酶抑制剂及其与β-内酰胺类抗生素配伍的复方制剂',
        children: [
          { code: '9.4.1', title: '考点1 代表药品与作用机制', importance: 4 },
          { code: '9.4.2', title: '考点2 药物临床用药评价（克拉维酸、舒巴坦、他唑巴坦、阿维巴坦等）', importance: 4 },
        ]
      },
      {
        code: '9.5',
        title: '第五节 碳青霉烯类抗菌药物',
        children: [
          { code: '9.5.1', title: '考点1 代表药品与作用机制（厄他培南、美罗培南、亚胺培南、比阿培南）', importance: 5 },
          { code: '9.5.2', title: '考点2 药物临床用药评价', importance: 5 },
        ]
      },
      {
        code: '9.6',
        title: '第六节 其他β-内酰胺类抗菌药物',
        children: [
          { code: '9.6.1', title: '考点1 药物分类与作用机制（头霉素类、氯头孢烯类、氨曲南）', importance: 4 },
          { code: '9.6.2', title: '考点2 药物临床用药评价', importance: 4 },
          { code: '9.6.3', title: '重点强化——β-内酰胺类药物总结', importance: 5 },
        ]
      },
      {
        code: '9.7',
        title: '第七节 氨基糖苷类抗菌药物',
        children: [
          { code: '9.7.1', title: '考点1 代表药品与作用机制（庆大霉素、阿米卡星、链霉素等）', importance: 5 },
          { code: '9.7.2', title: '考点2 药物临床用药评价', importance: 5 },
        ]
      },
      {
        code: '9.8',
        title: '第八节 四环素类抗菌药物',
        children: [
          { code: '9.8.1', title: '考点1 代表药品与作用机制（四环素、多西环素、替加环素等）', importance: 4 },
          { code: '9.8.2', title: '考点2 药物临床用药评价', importance: 4 },
          { code: '9.8.3', title: '重点强化——作用于30S亚基的药物', importance: 4 },
        ]
      },
      {
        code: '9.9',
        title: '第九节 大环内酯类抗菌药物',
        children: [
          { code: '9.9.1', title: '考点1 药物分类与作用机制（红霉素、阿奇霉素、克拉霉素等）', importance: 5 },
          { code: '9.9.2', title: '考点2 药物临床用药评价', importance: 5 },
        ]
      },
      {
        code: '9.10',
        title: '第十节 林可霉素类抗菌药物',
        children: [
          { code: '9.10.1', title: '考点1 代表药品与作用机制（林可霉素、克林霉素）', importance: 4 },
          { code: '9.10.2', title: '考点2 药物临床用药评价', importance: 4 },
        ]
      },
      {
        code: '9.11',
        title: '第十一节 酰胺醇类抗菌药物',
        children: [
          { code: '9.11.1', title: '考点1 代表药品与作用机制（氯霉素、甲砜霉素）', importance: 4 },
          { code: '9.11.2', title: '考点2 药物临床用药评价', importance: 4 },
          { code: '9.11.3', title: '重点强化——作用于50S亚基的药物', importance: 4 },
        ]
      },
      {
        code: '9.12',
        title: '第十二节 喹诺酮类抗菌药物',
        children: [
          { code: '9.12.1', title: '考点1 药物分类与作用机制（诺氟沙星、左氧氟沙星、莫西沙星等）', importance: 5 },
          { code: '9.12.2', title: '考点2 药物临床用药评价', importance: 5 },
        ]
      },
      {
        code: '9.13',
        title: '第十三节 磺胺类抗菌药物',
        children: [
          { code: '9.13.1', title: '考点1 药物分类与代表药品（磺胺嘧啶、复方磺胺甲噁唑等）', importance: 4 },
          { code: '9.13.2', title: '考点2 药物临床用药评价', importance: 4 },
          { code: '9.13.3', title: '重点强化——影响核酸/叶酸合成的药物', importance: 4 },
        ]
      },
      {
        code: '9.14',
        title: '第十四节 糖肽类抗菌药物',
        children: [
          { code: '9.14.1', title: '考点1 代表药品与作用机制（万古霉素、替考拉宁）', importance: 5 },
          { code: '9.14.2', title: '考点2 药物临床用药评价', importance: 5 },
        ]
      },
      {
        code: '9.15',
        title: '第十五节 其他抗菌药物',
        children: [
          { code: '9.15.1', title: '考点1 利奈唑胺的临床用药评价', importance: 4 },
          { code: '9.15.2', title: '考点2 多黏菌素的临床用药评价', importance: 3 },
          { code: '9.15.3', title: '考点3 磷霉素的临床用药评价', importance: 3 },
        ]
      },
      {
        code: '9.16',
        title: '第十六节 硝基呋喃类抗菌药物',
        children: [
          { code: '9.16.1', title: '考点1 代表药品与作用机制（呋喃妥因、呋喃唑酮）', importance: 3 },
          { code: '9.16.2', title: '考点2 药物临床用药评价', importance: 3 },
        ]
      },
      {
        code: '9.17',
        title: '第十七节 硝基咪唑类抗菌药物',
        children: [
          { code: '9.17.1', title: '考点1 代表药品与作用机制（甲硝唑、替硝唑、奥硝唑）', importance: 5 },
          { code: '9.17.2', title: '考点2 药物临床用药评价', importance: 5 },
          { code: '9.17.3', title: '重点强化——其他类药物总结', importance: 4 },
        ]
      },
      {
        code: '9.18',
        title: '第十八节 抗结核分枝杆菌药',
        children: [
          { code: '9.18.1', title: '考点1 药物分类与代表药品（异烟肼、利福平、吡嗪酰胺、乙胺丁醇）', importance: 5 },
          { code: '9.18.2', title: '考点2 异烟肼的临床用药评价', importance: 5 },
          { code: '9.18.3', title: '考点3 利福平的临床用药评价', importance: 5 },
          { code: '9.18.4', title: '考点4 吡嗪酰胺的临床用药评价', importance: 4 },
          { code: '9.18.5', title: '考点5 乙胺丁醇的临床用药评价', importance: 4 },
          { code: '9.18.6', title: '重点强化——抗结核药的不良反应', importance: 5 },
        ]
      },
      {
        code: '9.19',
        title: '第十九节 抗真菌药',
        children: [
          { code: '9.19.1', title: '考点1 药物分类与代表药品（两性霉素B、三唑类、棘白菌素类、氟胞嘧啶）', importance: 5 },
          { code: '9.19.2', title: '考点2 两性霉素B的临床用药评价', importance: 5 },
          { code: '9.19.3', title: '考点3 三唑类的临床用药评价', importance: 5 },
          { code: '9.19.4', title: '考点4 棘白菌素类的临床用药评价', importance: 4 },
          { code: '9.19.5', title: '考点5 氟胞嘧啶的临床用药评价', importance: 3 },
          { code: '9.19.6', title: '重点强化——抗真菌药物抗菌谱总结', importance: 5 },
        ]
      },
      {
        code: '9.20',
        title: '第二十节 抗疱疹病毒药物',
        children: [
          { code: '9.20.1', title: '考点1 药物分类与代表药品（阿昔洛韦、更昔洛韦、伐昔洛韦等）', importance: 4 },
          { code: '9.20.2', title: '考点2 药物临床用药评价', importance: 4 },
        ]
      },
      {
        code: '9.21',
        title: '第二十一节 抗流感病毒药',
        children: [
          { code: '9.21.1', title: '考点1 药物分类与代表药品（奥司他韦、玛巴洛沙韦、阿比多尔等）', importance: 5 },
          { code: '9.21.2', title: '考点2 神经氨酸酶抑制剂的临床用药评价', importance: 5 },
          { code: '9.21.3', title: '考点3 RNA聚合酶抑制剂的临床用药评价', importance: 4 },
          { code: '9.21.4', title: '考点4 血细胞凝聚素抑制剂的临床用药评价', importance: 3 },
        ]
      },
      {
        code: '9.22',
        title: '第二十二节 抗新型冠状病毒药',
        children: [
          { code: '9.22.1', title: '考点1 药物分类与代表药品（莫诺拉韦、奈玛特韦/利托那韦等）', importance: 4 },
        ]
      },
      {
        code: '9.23',
        title: '第二十三节 抗肝炎病毒药物',
        children: [
          { code: '9.23.1', title: '考点1 药物分类与代表药品（核苷（酸）类药、干扰素、直接抗病毒药物）', importance: 5 },
          { code: '9.23.2', title: '考点2 核苷（酸）类药物的临床用药评价', importance: 5 },
          { code: '9.23.3', title: '考点3 干扰素的临床用药评价', importance: 4 },
          { code: '9.23.4', title: '考点4 治疗慢性丙型肝炎药的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '9.24',
        title: '第二十四节 抗艾滋病病毒药物',
        children: [
          { code: '9.24.1', title: '考点1 药物分类与代表药品（NRTI、NNRTI、PI、INSTI、FI等）', importance: 4 },
          { code: '9.24.2', title: '考点2 药物临床用药评价（暴露前预防PrEP、暴露后预防PEP）', importance: 4 },
          { code: '9.24.3', title: '重点强化——抗病毒药的分类与代表药品', importance: 4 },
        ]
      },
      {
        code: '9.25',
        title: '第二十五节 抗原虫药',
        children: [
          { code: '9.25.1', title: '考点1 药物分类与代表药品（双碘喹啉、甲硝唑、伯氨喹、氯喹等）', importance: 4 },
          { code: '9.25.2', title: '考点2 抗原虫药的临床用药评价', importance: 4 },
          { code: '9.25.3', title: '考点3 抗疟药的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '9.26',
        title: '第二十六节 抗蠕虫药',
        children: [
          { code: '9.26.1', title: '考点1 药物分类与代表药品（阿苯达唑、甲苯咪唑、吡喹酮等）', importance: 4 },
          { code: '9.26.2', title: '考点2 抗肠道线虫药的临床用药评价', importance: 3 },
          { code: '9.26.3', title: '考点3 吡喹酮的临床用药评价', importance: 4 },
          { code: '9.26.4', title: '重点强化——抗寄生虫药的主要适应证', importance: 4 },
        ]
      }
    ]
  },

  {
    code: '10',
    title: '第十章 抗肿瘤药',
    children: [
      {
        code: '10.1',
        title: '第一节 直接影响DNA结构和功能的药物',
        children: [
          { code: '10.1.1', title: '考点1 药物分类与代表药品（烷化剂、铂类、抗生素类、拓扑异构酶抑制剂）', importance: 5 },
          { code: '10.1.2', title: '考点2 破坏DNA的烷化剂的临床用药评价', importance: 5 },
          { code: '10.1.3', title: '考点3 破坏DNA的铂类化合物的临床用药评价', importance: 5 },
          { code: '10.1.4', title: '考点4 破坏DNA的抗生素的临床用药评价', importance: 4 },
          { code: '10.1.5', title: '考点5 拓扑异构酶抑制剂的临床用药评价', importance: 5 },
          { code: '10.1.6', title: '考点6 典型抗肿瘤药物的溶剂要求', importance: 4 },
          { code: '10.1.7', title: '重点强化——直接影响DNA结构和功能重点药物总结', importance: 5 },
        ]
      },
      {
        code: '10.2',
        title: '第二节 干扰核酸生物合成的药物（抗代谢药）',
        children: [
          { code: '10.2.1', title: '考点1 药物分类与代表药品（甲氨蝶呤、氟尿嘧啶、阿糖胞苷等）', importance: 5 },
          { code: '10.2.2', title: '考点2 干扰核酸生物合成的药物（抗代谢药）的临床用药评价', importance: 5 },
        ]
      },
      {
        code: '10.3',
        title: '第三节 干扰转录过程和阻止RNA合成的药物（作用于核酸转录药物）',
        children: [
          { code: '10.3.1', title: '考点1 蒽环类抗肿瘤抗生素的临床用药评价（柔红霉素、多柔比星等）', importance: 5 },
        ]
      },
      {
        code: '10.4',
        title: '第四节 干扰有丝分裂药物',
        children: [
          { code: '10.4.1', title: '考点1 药物分类与作用机制（长春碱类、紫杉醇类、高三尖杉酯碱类、门冬酰胺酶）', importance: 5 },
          { code: '10.4.2', title: '考点2 长春碱类的临床用药评价', importance: 4 },
          { code: '10.4.3', title: '考点3 紫杉醇类的临床用药评价', importance: 5 },
        ]
      },
      {
        code: '10.5',
        title: '第五节 调节体内激素平衡的药物',
        children: [
          { code: '10.5.1', title: '考点1 药物分类与代表药品（抗雌激素类、抗雄激素类、GnRH激动剂/抑制剂等）', importance: 5 },
          { code: '10.5.2', title: '考点2 抗雌激素类的临床用药评价', importance: 5 },
          { code: '10.5.3', title: '考点3 抗雄激素类（氟他胺）的临床用药评价', importance: 4 },
          { code: '10.5.4', title: '考点4 促性腺激素释放激素（GnRH）激动剂/抑制剂的临床用药评价', importance: 4 },
          { code: '10.5.5', title: '重点强化——调节激素平衡抗肿瘤药适应证', importance: 4 },
        ]
      },
      {
        code: '10.6',
        title: '第六节 生物靶向治疗药物',
        children: [
          { code: '10.6.1', title: '考点1 药物分类与代表药品（生物反应调节剂、酪氨酸激酶抑制剂、单克隆抗体、ADC）', importance: 5 },
          { code: '10.6.2', title: '考点2 酪氨酸激酶抑制剂的临床用药评价', importance: 5 },
          { code: '10.6.3', title: '考点3 单克隆抗体的临床用药评价', importance: 5 },
          { code: '10.6.4', title: '考点4 靶向抗肿瘤药的适应证', importance: 5 },
        ]
      },
      {
        code: '10.7',
        title: '第七节 其他抗肿瘤药物',
        children: [
          { code: '10.7.1', title: '考点1 药物分类与代表药品（细胞分化诱导剂）', importance: 3 },
          { code: '10.7.2', title: '考点2 细胞分化诱导剂的临床用药评价', importance: 3 },
        ]
      }
    ]
  },
  {
    code: '11',
    title: '第十一章 调节水、电解质、酸碱平衡与营养用药',
    children: [
      {
        code: '11.1',
        title: '第一节 糖类、盐类、酸碱平衡调节药',
        children: [
          { code: '11.1.1', title: '考点1 葡萄糖的临床用药评价', importance: 4 },
          { code: '11.1.2', title: '考点2 氯化钠的临床用药评价', importance: 4 },
          { code: '11.1.3', title: '考点3 氯化钾的临床用药评价', importance: 5 },
          { code: '11.1.4', title: '考点4 门冬氨酸钾镁的临床用药评价', importance: 3 },
          { code: '11.1.5', title: '考点5 氯化钙的临床用药评价', importance: 4 },
          { code: '11.1.6', title: '考点6 乳酸钠的临床用药评价', importance: 3 },
        ]
      },
      {
        code: '11.2',
        title: '第二节 微量元素与维生素',
        children: [
          { code: '11.2.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '11.2.2', title: '考点2 常见微量元素的生理功能、临床监测及注意事项', importance: 4 },
          { code: '11.2.3', title: '考点3 水溶性维生素的临床用药评价', importance: 4 },
          { code: '11.2.4', title: '考点4 脂溶性维生素的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '11.3',
        title: '第三节 肠内营养药',
        children: [
          { code: '11.3.1', title: '考点1 药物分类与代表药品', importance: 3 },
          { code: '11.3.2', title: '考点2 肠内营养粉剂（TP）的临床用药评价', importance: 3 },
          { code: '11.3.3', title: '考点3 肠内营养乳剂（TPF-D）的临床用药评价', importance: 3 },
        ]
      },
      {
        code: '11.4',
        title: '第四节 肠外营养药',
        children: [
          { code: '11.4.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '11.4.2', title: '考点2 氨基酸类制剂的临床用药评价', importance: 4 },
          { code: '11.4.3', title: '考点3 脂肪乳类制剂的临床用药评价', importance: 4 },
        ]
      }
    ]
  },
  {
    code: '12',
    title: '第十二章 眼科用药、耳鼻咽喉科用药及口腔科用药',
    children: [
      {
        code: '12.1',
        title: '第一节 眼科用药',
        children: [
          { code: '12.1.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '12.1.2', title: '考点2 眼科用药的临床用药评价', importance: 4 },
        ]
      },
      {
        code: '12.2',
        title: '第二节 耳鼻咽喉科用药',
        children: [
          { code: '12.2.1', title: '考点1 药物分类与代表药品', importance: 3 },
        ]
      },
      {
        code: '12.3',
        title: '第三节 口腔科用药',
        children: [
          { code: '12.3.1', title: '考点1 分类与代表药品', importance: 3 },
        ]
      }
    ]
  },
  {
    code: '13',
    title: '第十三章 皮肤用药及抗过敏用药',
    children: [
      {
        code: '13.1',
        title: '第一节 体外杀寄生虫与皮肤感染治疗药',
        children: [
          { code: '13.1.1', title: '考点1 代表药品与临床用药评价', importance: 3 },
        ]
      },
      {
        code: '13.2',
        title: '第二节 局部用抗真菌药',
        children: [
          { code: '13.2.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '13.2.2', title: '考点2 药物临床用药评价', importance: 4 },
        ]
      },
      {
        code: '13.3',
        title: '第三节 痤疮治疗药',
        children: [
          { code: '13.3.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '13.3.2', title: '考点2 非抗生素类抗菌药（过氧苯甲酰）的临床用药评价', importance: 3 },
          { code: '13.3.3', title: '考点3 抗角化药的临床用药评价', importance: 4 },
          { code: '13.3.4', title: '考点4 痤疮推荐治疗方案', importance: 4 },
        ]
      },
      {
        code: '13.4',
        title: '第四节 外用糖皮质激素',
        children: [
          { code: '13.4.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '13.4.2', title: '考点2 药物临床用药评价', importance: 4 },
        ]
      },
      {
        code: '13.5',
        title: '第五节 治疗白癜风药',
        children: [
          { code: '13.5.1', title: '考点1 药物分类与代表药品', importance: 3 },
          { code: '13.5.2', title: '考点2 药物临床用药评价', importance: 3 },
        ]
      },
      {
        code: '13.6',
        title: '第六节 治疗银屑病药',
        children: [
          { code: '13.6.1', title: '考点1 药物分类与代表药品', importance: 4 },
          { code: '13.6.2', title: '考点2 药物临床用药评价', importance: 4 },
        ]
      },
      {
        code: '13.7',
        title: '第七节 妇科外用药',
        children: [
          { code: '13.7.1', title: '考点1 药物分类与临床用药评价', importance: 3 },
        ]
      },
      {
        code: '13.8',
        title: '第八节 消毒防腐药',
        children: [
          { code: '13.8.1', title: '考点1 代表药物与临床用药评价', importance: 3 },
        ]
      },
      {
        code: '13.9',
        title: '第九节 抗过敏药',
        children: [
          { code: '13.9.1', title: '考点1 药物分类与代表药品', importance: 5 },
          { code: '13.9.2', title: '考点2 药物临床用药评价', importance: 5 },
        ]
      }
    ]
  }
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
    console.log('开始导入西药二知识图谱...')
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
    console.log('\n西药二知识图谱导入成功！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('导入出错:', error)
    process.exit(1)
  })
