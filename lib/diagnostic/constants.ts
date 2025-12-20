export type SubjectConfig = {
  label: string;
  license: string;
  available: boolean;
  default_question_count: number;
};

export const CHAPTER_META: Record<string, { title: string }> = {
  C1: { title: "第一章 精神与中枢神经系统用药" },
  C2: { title: "第二章 消化系统用药" },
  C3: { title: "第三章 呼吸系统疾病用药" },
  C4: { title: "第四章 消化道功能与肝胆辅助用药" },
  C5: { title: "第五章 骨骼肌肉与康复系统用药" },
  C6: { title: "第六章 内分泌及代谢性疾病用药" },
  C7: { title: "第七章 心血管系统用药" },
  C8: { title: "第八章 泌尿系统与肾病用药" },
  C9: { title: "第九章 抗感染与免疫调节用药" },
  C10: { title: "第十章 血液系统与止血辅助用药" },
  C11: { title: "第十一章 肿瘤治疗与支持用药" },
  C12: { title: "第十二章 急症与毒理用药" },
  C13: { title: "第十三章 皮肤与皮肤病用药" },
};

export const ALL_CHAPTER_CODES = Object.keys(CHAPTER_META);

export const SUBJECT_CONFIG: Record<string, SubjectConfig> = {
  "western-1": {
    label: "药学专业知识（一）",
    license: "western",
    available: false,
    default_question_count: 0,
  },
  "western-2": {
    label: "药学专业知识（二）",
    license: "western",
    available: true,
    default_question_count: 8,
  },
  "western-3": {
    label: "药学综合知识与技能",
    license: "western",
    available: false,
    default_question_count: 0,
  },
  "tcm-1": {
    label: "中药学专业知识（一）",
    license: "tcm",
    available: false,
    default_question_count: 0,
  },
  "tcm-2": {
    label: "中药学专业知识（二）",
    license: "tcm",
    available: false,
    default_question_count: 0,
  },
  "tcm-3": {
    label: "中药学综合知识与技能",
    license: "tcm",
    available: false,
    default_question_count: 0,
  },
};
