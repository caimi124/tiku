/**
 * 西药药二知识图谱导入工具函数
 * 提供数据转换和验证的核心功能
 */

// 中文数字映射表
const CHINESE_NUMBER_MAP: Record<string, number> = {
  '零': 0, '一': 1, '二': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
  '十': 10, '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15
};

/**
 * 中文数字转阿拉伯数字
 * @param chinese 中文数字字符串（如 "七"、"十二"）
 * @returns 对应的阿拉伯数字，无法转换时返回 0
 */
export function chineseToNumber(chinese: string): number {
  if (!chinese || typeof chinese !== 'string') {
    return 0;
  }
  
  const trimmed = chinese.trim();
  
  // 直接查找映射
  if (CHINESE_NUMBER_MAP[trimmed] !== undefined) {
    return CHINESE_NUMBER_MAP[trimmed];
  }
  
  // 处理 "十X" 格式（如 "十一" 到 "十九"）
  if (trimmed.startsWith('十') && trimmed.length === 2) {
    const unit = CHINESE_NUMBER_MAP[trimmed[1]];
    if (unit !== undefined && unit >= 1 && unit <= 9) {
      return 10 + unit;
    }
  }
  
  // 如果输入已经是数字字符串，直接转换
  const num = parseInt(trimmed, 10);
  if (!isNaN(num)) {
    return num;
  }
  
  return 0;
}

// 口诀提取的正则模式
const MNEMONIC_PATTERNS = [
  /【润德巧记】([^【】\n]+)/g,
  /【巧记】([^【】\n]+)/g,
  /【口诀】([^【】\n]+)/g,
  /【记忆口诀】([^【】\n]+)/g,
  /【速记】([^【】\n]+)/g
];

/**
 * 从文本中提取口诀/巧记内容
 * @param text 包含口诀的文本
 * @returns 提取出的口诀数组
 */
export function extractMnemonics(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  const mnemonics: string[] = [];
  
  for (const pattern of MNEMONIC_PATTERNS) {
    // 重置正则表达式的 lastIndex
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const content = match[1].trim();
      if (content && !mnemonics.includes(content)) {
        mnemonics.push(content);
      }
    }
  }
  
  return mnemonics;
}

// 高重要性关键词
const HIGH_IMPORTANCE_KEYWORDS = ['禁用', '禁忌', '不良反应', '慎用', '注意事项'];
const MEDIUM_IMPORTANCE_KEYWORDS = ['临床应用', '适应证', '用法用量'];

/**
 * 根据内容计算重要性等级
 * @param content 知识点内容
 * @returns 重要性等级 1-5
 */
export function calculateImportance(content: string): number {
  if (!content || typeof content !== 'string') {
    return 3; // 默认中等重要性
  }
  
  // 检查高重要性关键词
  for (const keyword of HIGH_IMPORTANCE_KEYWORDS) {
    if (content.includes(keyword)) {
      return content.includes('禁用') || content.includes('禁忌') ? 5 : 4;
    }
  }
  
  // 检查中等重要性关键词
  for (const keyword of MEDIUM_IMPORTANCE_KEYWORDS) {
    if (content.includes(keyword)) {
      return 4;
    }
  }
  
  return 3;
}

/**
 * 生成节点代码
 * @param chapter 章节号
 * @param section 小节号（可选）
 * @param point 知识点号（可选）
 * @returns 节点代码字符串
 */
export function generateNodeCode(
  chapter: number,
  section?: number,
  point?: number
): string {
  if (chapter <= 0) {
    return '';
  }
  
  if (section === undefined || section === null) {
    return `C${chapter}`;
  }
  
  if (point === undefined || point === null) {
    return `C${chapter}.${section}`;
  }
  
  return `C${chapter}.${section}.${point}`;
}

/**
 * 验证节点代码格式
 * @param code 节点代码
 * @returns 是否符合格式要求
 */
export function isValidNodeCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // 章节格式: C{n}
  const chapterPattern = /^C\d+$/;
  // 小节格式: C{n}.{m}
  const sectionPattern = /^C\d+\.\d+$/;
  // 知识点格式: C{n}.{m}.{p}
  const pointPattern = /^C\d+\.\d+\.\d+$/;
  
  return chapterPattern.test(code) || sectionPattern.test(code) || pointPattern.test(code);
}


// 内容项类型定义
export interface ContentItem {
  type: 'text' | 'table' | 'image';
  content: string;
  images?: string[];
  ocr_text?: string;
}

/**
 * 将内容项数组构建为单一文本
 * @param contentItems 内容项数组
 * @returns 合并后的文本内容
 */
export function buildContentText(contentItems: ContentItem[]): string {
  if (!contentItems || !Array.isArray(contentItems)) {
    return '';
  }
  
  const parts: string[] = [];
  
  for (const item of contentItems) {
    if (!item) continue;
    
    if (item.type === 'text' && item.content) {
      parts.push(item.content.trim());
    } else if (item.type === 'table' && item.content) {
      parts.push(item.content.trim());
    } else if (item.type === 'image') {
      // 图片类型，如果有 OCR 文本则添加
      if (item.ocr_text && item.ocr_text.trim()) {
        parts.push(item.ocr_text.trim());
      }
      // 记录图片引用
      if (item.images && item.images.length > 0) {
        parts.push(`[图片: ${item.images.join(', ')}]`);
      }
    }
  }
  
  return parts.filter(p => p).join('\n\n');
}

// 知识点数据结构
export interface KnowledgePoint {
  number: number;
  title: string;
  content: ContentItem[];
}

export interface PartContent {
  general_content: ContentItem[];
  knowledge_points: KnowledgePoint[];
}

export interface Section {
  section_number: string;
  section_title: string;
  parts: {
    考点梳理?: PartContent;
    考点透析?: PartContent;
    重点强化?: PartContent;
  };
}

export interface Chapter {
  chapter_number: string;
  chapter_title: string;
  sections: Section[];
}

// 数据库节点类型
export type NodeType = 'chapter' | 'section' | 'point';

export interface KnowledgeTreeNode {
  code: string;
  title: string;
  content: string;
  node_type: NodeType;
  importance: number;
  parent_id: string | null;
  subject_code: string;
  level: number;
  sort_order: number;
  memory_tips: string | null;
  point_type: string | null;
}

/**
 * 获取节点类型对应的层级
 * @param nodeType 节点类型
 * @returns 层级数字
 */
export function getNodeLevel(nodeType: NodeType): number {
  switch (nodeType) {
    case 'chapter': return 1;
    case 'section': return 2;
    case 'point': return 3;
    default: return 0;
  }
}

/**
 * 验证节点类型和层级是否一致
 * @param nodeType 节点类型
 * @param level 层级
 * @returns 是否一致
 */
export function isNodeTypeLevelConsistent(nodeType: NodeType, level: number): boolean {
  return getNodeLevel(nodeType) === level;
}

/**
 * 合并章节数据（按 chapter_number 去重）
 * @param chapters 章节数组
 * @returns 合并后的章节数组
 */
export function mergeChapters(chapters: Chapter[]): Chapter[] {
  const chapterMap = new Map<string, Chapter>();
  
  for (const chapter of chapters) {
    const key = chapter.chapter_number;
    
    if (chapterMap.has(key)) {
      // 合并小节
      const existing = chapterMap.get(key)!;
      const existingSectionNumbers = new Set(
        existing.sections.map(s => s.section_number)
      );
      
      for (const section of chapter.sections) {
        if (!existingSectionNumbers.has(section.section_number)) {
          existing.sections.push(section);
          existingSectionNumbers.add(section.section_number);
        }
      }
    } else {
      // 深拷贝章节
      chapterMap.set(key, {
        ...chapter,
        sections: [...chapter.sections]
      });
    }
  }
  
  // 按章节号排序
  return Array.from(chapterMap.values()).sort((a, b) => {
    return chineseToNumber(a.chapter_number) - chineseToNumber(b.chapter_number);
  });
}

/**
 * 统计合并结果
 */
export interface MergeStatistics {
  totalChapters: number;
  totalSections: number;
  totalPoints: number;
  sourceFiles: string[];
}

/**
 * 计算章节数据的统计信息
 * @param chapters 章节数组
 * @param sourceFiles 源文件列表
 * @returns 统计信息
 */
export function calculateStatistics(
  chapters: Chapter[],
  sourceFiles: string[] = []
): MergeStatistics {
  let totalSections = 0;
  let totalPoints = 0;
  
  for (const chapter of chapters) {
    totalSections += chapter.sections.length;
    
    for (const section of chapter.sections) {
      // 统计各部分的知识点
      const parts = section.parts;
      if (parts.考点梳理?.knowledge_points) {
        totalPoints += parts.考点梳理.knowledge_points.length;
      }
      if (parts.考点透析?.knowledge_points) {
        totalPoints += parts.考点透析.knowledge_points.length;
      }
      if (parts.重点强化?.knowledge_points) {
        totalPoints += parts.重点强化.knowledge_points.length;
      }
      
      // 如果没有明确的知识点，但有 general_content，也算作一个知识点
      if (totalPoints === 0) {
        if (parts.考点梳理?.general_content?.length) totalPoints++;
        if (parts.考点透析?.general_content?.length) totalPoints++;
        if (parts.重点强化?.general_content?.length) totalPoints++;
      }
    }
  }
  
  return {
    totalChapters: chapters.length,
    totalSections,
    totalPoints,
    sourceFiles
  };
}
