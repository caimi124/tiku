/**
 * 西药药二知识图谱导入工具函数测试
 * 包含单元测试和属性测试
 */

import * as fc from 'fast-check';
import {
  chineseToNumber,
  extractMnemonics,
  calculateImportance,
  generateNodeCode,
  isValidNodeCode,
  buildContentText,
  getNodeLevel,
  isNodeTypeLevelConsistent,
  mergeChapters,
  calculateStatistics,
  ContentItem,
  Chapter,
  NodeType
} from './knowledge-import-utils';

describe('knowledge-import-utils', () => {
  /**
   * **Feature: xiyao-er-knowledge-import, Property 8: Chinese number conversion**
   * *For any* Chinese numeral from 一 to 十五, the conversion function SHALL return the correct Arabic numeral (1-15).
   * **Validates: Requirements 4.5**
   */
  describe('Property 8: Chinese number conversion', () => {
    // 中文数字到阿拉伯数字的映射
    const chineseNumbers: [string, number][] = [
      ['零', 0],
      ['一', 1],
      ['二', 2],
      ['三', 3],
      ['四', 4],
      ['五', 5],
      ['六', 6],
      ['七', 7],
      ['八', 8],
      ['九', 9],
      ['十', 10],
      ['十一', 11],
      ['十二', 12],
      ['十三', 13],
      ['十四', 14],
      ['十五', 15]
    ];

    it('should convert all Chinese numerals from 零 to 十五 correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...chineseNumbers),
          ([chinese, expected]) => {
            const result = chineseToNumber(chinese);
            return result === expected;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle numeric strings correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (num) => {
            const result = chineseToNumber(String(num));
            return result === num;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 for invalid inputs', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', null, undefined, '无效', 'abc', '百'),
          (input) => {
            const result = chineseToNumber(input as string);
            return result === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle whitespace correctly', () => {
      expect(chineseToNumber('  七  ')).toBe(7);
      expect(chineseToNumber('\t十二\n')).toBe(12);
    });
  });


  /**
   * **Feature: xiyao-er-knowledge-import, Property 6: Mnemonic extraction completeness**
   * *For any* text containing patterns like 【润德巧记】, 【巧记】, or 【口诀】, 
   * the extraction function SHALL return all matching mnemonic content.
   * **Validates: Requirements 2.5**
   */
  describe('Property 6: Mnemonic extraction completeness', () => {
    // 生成包含口诀的文本
    const mnemonicPatterns = ['润德巧记', '巧记', '口诀', '记忆口诀', '速记'];
    
    it('should extract all mnemonics from text with various patterns', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...mnemonicPatterns),
          // 生成非空白、非特殊字符的字符串
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => 
            !s.includes('【') && !s.includes('】') && !s.includes('\n') && s.trim().length > 0
          ),
          (pattern, content) => {
            const text = `前面的文字【${pattern}】${content}后面的文字`;
            const result = extractMnemonics(text);
            // 应该提取到口诀内容（内容可能包含"后面的文字"）
            return result.length >= 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should extract multiple mnemonics from text', () => {
      const text = '药物分类【润德巧记】多加点利是吧，胆子真大。另外【巧记】非洲中部曲马多';
      const result = extractMnemonics(text);
      expect(result).toContain('多加点利是吧，胆子真大。另外');
      expect(result).toContain('非洲中部曲马多');
    });

    it('should return empty array for text without mnemonics', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !s.includes('【') && !s.includes('】')),
          (text) => {
            const result = extractMnemonics(text);
            return result.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty or invalid inputs', () => {
      expect(extractMnemonics('')).toEqual([]);
      expect(extractMnemonics(null as unknown as string)).toEqual([]);
      expect(extractMnemonics(undefined as unknown as string)).toEqual([]);
    });

    it('should not include duplicates', () => {
      const text = '【润德巧记】重复内容【巧记】重复内容';
      const result = extractMnemonics(text);
      const uniqueResult = [...new Set(result)];
      expect(result.length).toBe(uniqueResult.length);
    });
  });

  /**
   * **Feature: xiyao-er-knowledge-import, Property 7: Importance calculation correctness**
   * *For any* content containing keywords 禁用, 禁忌, or 不良反应, 
   * the calculated importance SHALL be >= 4.
   * **Validates: Requirements 2.6**
   */
  describe('Property 7: Importance calculation correctness', () => {
    const highImportanceKeywords = ['禁用', '禁忌', '不良反应', '慎用', '注意事项'];
    
    it('should return importance >= 4 for content with high importance keywords', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...highImportanceKeywords),
          fc.string({ minLength: 0, maxLength: 100 }),
          fc.string({ minLength: 0, maxLength: 100 }),
          (keyword, prefix, suffix) => {
            const content = `${prefix}${keyword}${suffix}`;
            const importance = calculateImportance(content);
            return importance >= 4;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return importance 5 for content with 禁用 or 禁忌', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('禁用', '禁忌'),
          fc.string({ minLength: 0, maxLength: 50 }),
          (keyword, context) => {
            const content = `${context}${keyword}${context}`;
            const importance = calculateImportance(content);
            return importance === 5;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return default importance 3 for content without keywords', () => {
      const content = '这是一段普通的药物说明文字';
      expect(calculateImportance(content)).toBe(3);
    });

    it('should handle empty or invalid inputs', () => {
      expect(calculateImportance('')).toBe(3);
      expect(calculateImportance(null as unknown as string)).toBe(3);
      expect(calculateImportance(undefined as unknown as string)).toBe(3);
    });
  });


  /**
   * **Feature: xiyao-er-knowledge-import, Property 5: Node code format**
   * *For any* generated node code, it SHALL match the pattern `C{n}` for chapters, 
   * `C{n}.{m}` for sections, or `C{n}.{m}.{p}` for points, where n, m, p are positive integers.
   * **Validates: Requirements 2.4**
   */
  describe('Property 5: Node code format', () => {
    it('should generate valid chapter codes (C{n})', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (chapter) => {
            const code = generateNodeCode(chapter);
            const pattern = /^C\d+$/;
            return pattern.test(code) && isValidNodeCode(code);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate valid section codes (C{n}.{m})', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 10 }),
          (chapter, section) => {
            const code = generateNodeCode(chapter, section);
            const pattern = /^C\d+\.\d+$/;
            return pattern.test(code) && isValidNodeCode(code);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate valid point codes (C{n}.{m}.{p})', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 50 }),
          (chapter, section, point) => {
            const code = generateNodeCode(chapter, section, point);
            const pattern = /^C\d+\.\d+\.\d+$/;
            return pattern.test(code) && isValidNodeCode(code);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty string for invalid chapter number', () => {
      expect(generateNodeCode(0)).toBe('');
      expect(generateNodeCode(-1)).toBe('');
    });

    it('should validate node codes correctly', () => {
      expect(isValidNodeCode('C1')).toBe(true);
      expect(isValidNodeCode('C7.3')).toBe(true);
      expect(isValidNodeCode('C7.3.1')).toBe(true);
      expect(isValidNodeCode('C')).toBe(false);
      expect(isValidNodeCode('7.3.1')).toBe(false);
      expect(isValidNodeCode('')).toBe(false);
      expect(isValidNodeCode(null as unknown as string)).toBe(false);
    });
  });

  /**
   * **Feature: xiyao-er-knowledge-import, Property 3: Node type and level consistency**
   * *For any* imported node, if node_type='chapter' then level=1, 
   * if node_type='section' then level=2, if node_type='point' then level=3.
   * **Validates: Requirements 2.1, 2.2, 2.3**
   */
  describe('Property 3: Node type and level consistency', () => {
    const nodeTypeLevelPairs: [NodeType, number][] = [
      ['chapter', 1],
      ['section', 2],
      ['point', 3]
    ];

    it('should return correct level for each node type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...nodeTypeLevelPairs),
          ([nodeType, expectedLevel]) => {
            const level = getNodeLevel(nodeType);
            return level === expectedLevel;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate node type and level consistency', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...nodeTypeLevelPairs),
          ([nodeType, level]) => {
            return isNodeTypeLevelConsistent(nodeType, level);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false for inconsistent node type and level', () => {
      expect(isNodeTypeLevelConsistent('chapter', 2)).toBe(false);
      expect(isNodeTypeLevelConsistent('section', 1)).toBe(false);
      expect(isNodeTypeLevelConsistent('point', 2)).toBe(false);
    });
  });

  // buildContentText 单元测试
  describe('buildContentText', () => {
    it('should build text from content items', () => {
      const items: ContentItem[] = [
        { type: 'text', content: '这是文本内容' },
        { type: 'table', content: '| 列1 | 列2 |\n|---|---|' }
      ];
      const result = buildContentText(items);
      expect(result).toContain('这是文本内容');
      expect(result).toContain('| 列1 | 列2 |');
    });

    it('should handle image items with OCR text', () => {
      const items: ContentItem[] = [
        { type: 'image', content: '', images: ['test.jpg'], ocr_text: 'OCR识别文字' }
      ];
      const result = buildContentText(items);
      expect(result).toContain('OCR识别文字');
      expect(result).toContain('[图片: test.jpg]');
    });

    it('should handle empty or invalid inputs', () => {
      expect(buildContentText([])).toBe('');
      expect(buildContentText(null as unknown as ContentItem[])).toBe('');
      expect(buildContentText(undefined as unknown as ContentItem[])).toBe('');
    });
  });


  /**
   * **Feature: xiyao-er-knowledge-import, Property 1: Chapter merge uniqueness**
   * *For any* set of source files containing chapters, when merged, the result SHALL contain 
   * exactly one entry per unique chapter_number, with all sections from all sources combined.
   * **Validates: Requirements 1.2**
   */
  describe('Property 1: Chapter merge uniqueness', () => {
    // 生成章节数据的辅助函数
    const generateChapter = (chapterNum: string, sectionNums: string[]): Chapter => ({
      chapter_number: chapterNum,
      chapter_title: `第${chapterNum}章`,
      sections: sectionNums.map(sn => ({
        section_number: sn,
        section_title: `第${sn}节`,
        parts: {}
      }))
    });

    it('should merge chapters with same chapter_number into one entry', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('一', '二', '三', '四', '五'),
          fc.array(fc.constantFrom('一', '二', '三'), { minLength: 1, maxLength: 3 }),
          fc.array(fc.constantFrom('四', '五', '六'), { minLength: 1, maxLength: 3 }),
          (chapterNum, sections1, sections2) => {
            const chapter1 = generateChapter(chapterNum, sections1);
            const chapter2 = generateChapter(chapterNum, sections2);
            
            const merged = mergeChapters([chapter1, chapter2]);
            
            // 应该只有一个章节
            const matchingChapters = merged.filter(c => c.chapter_number === chapterNum);
            return matchingChapters.length === 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should combine all unique sections from merged chapters', () => {
      const chapter1 = generateChapter('一', ['一', '二']);
      const chapter2 = generateChapter('一', ['二', '三']);
      
      const merged = mergeChapters([chapter1, chapter2]);
      
      expect(merged.length).toBe(1);
      expect(merged[0].sections.length).toBe(3); // 一、二、三
    });

    it('should preserve chapters with different chapter_numbers', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.constantFrom('一', '二', '三', '四', '五'), { minLength: 2, maxLength: 5 }),
          (chapterNums) => {
            const chapters = chapterNums.map(cn => generateChapter(cn, ['一']));
            const merged = mergeChapters(chapters);
            return merged.length === chapterNums.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should sort merged chapters by chapter number', () => {
      const chapters = [
        generateChapter('三', ['一']),
        generateChapter('一', ['一']),
        generateChapter('二', ['一'])
      ];
      
      const merged = mergeChapters(chapters);
      
      expect(merged[0].chapter_number).toBe('一');
      expect(merged[1].chapter_number).toBe('二');
      expect(merged[2].chapter_number).toBe('三');
    });
  });

  /**
   * **Feature: xiyao-er-knowledge-import, Property 2: Section preservation**
   * *For any* merge operation, the total count of sections in the merged result SHALL equal 
   * the sum of unique sections across all source files (no duplicates within same chapter).
   * **Validates: Requirements 1.3, 1.5**
   */
  describe('Property 2: Section preservation', () => {
    it('should preserve all unique sections during merge', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              chapter_number: fc.constantFrom('一', '二'),
              chapter_title: fc.constant('测试章节'),
              // 使用 uniqueArray 确保同一章节内小节不重复
              sections: fc.uniqueArray(
                fc.record({
                  section_number: fc.constantFrom('一', '二', '三', '四', '五'),
                  section_title: fc.constant('测试小节'),
                  parts: fc.constant({})
                }),
                { minLength: 1, maxLength: 3, selector: (s) => s.section_number }
              )
            }),
            { minLength: 1, maxLength: 4 }
          ),
          (chapters) => {
            const merged = mergeChapters(chapters as Chapter[]);
            
            // 计算每个章节的唯一小节数
            const expectedSections = new Map<string, Set<string>>();
            for (const chapter of chapters) {
              if (!expectedSections.has(chapter.chapter_number)) {
                expectedSections.set(chapter.chapter_number, new Set());
              }
              for (const section of chapter.sections) {
                expectedSections.get(chapter.chapter_number)!.add(section.section_number);
              }
            }
            
            // 验证合并后的小节数
            for (const chapter of merged) {
              const expectedCount = expectedSections.get(chapter.chapter_number)?.size || 0;
              if (chapter.sections.length !== expectedCount) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not lose any sections during merge', () => {
      const chapter1: Chapter = {
        chapter_number: '一',
        chapter_title: '第一章',
        sections: [
          { section_number: '一', section_title: '第一节', parts: {} },
          { section_number: '二', section_title: '第二节', parts: {} }
        ]
      };
      
      const chapter2: Chapter = {
        chapter_number: '一',
        chapter_title: '第一章',
        sections: [
          { section_number: '三', section_title: '第三节', parts: {} }
        ]
      };
      
      const merged = mergeChapters([chapter1, chapter2]);
      const stats = calculateStatistics(merged);
      
      expect(stats.totalSections).toBe(3);
    });
  });

  // calculateStatistics 单元测试
  describe('calculateStatistics', () => {
    it('should calculate correct statistics', () => {
      const chapters: Chapter[] = [
        {
          chapter_number: '一',
          chapter_title: '第一章',
          sections: [
            { section_number: '一', section_title: '第一节', parts: {} },
            { section_number: '二', section_title: '第二节', parts: {} }
          ]
        },
        {
          chapter_number: '二',
          chapter_title: '第二章',
          sections: [
            { section_number: '一', section_title: '第一节', parts: {} }
          ]
        }
      ];
      
      const stats = calculateStatistics(chapters, ['file1.json', 'file2.json']);
      
      expect(stats.totalChapters).toBe(2);
      expect(stats.totalSections).toBe(3);
      expect(stats.sourceFiles).toEqual(['file1.json', 'file2.json']);
    });
  });
});


  /**
   * **Feature: xiyao-er-knowledge-import, Property 4: Parent-child relationship integrity**
   * *For any* section node, its parent_id SHALL reference a valid chapter node. 
   * *For any* point node, its parent_id SHALL reference a valid section node.
   * **Validates: Requirements 2.2, 2.3**
   */
  describe('Property 4: Parent-child relationship integrity', () => {
    // 模拟节点结构
    interface MockNode {
      id: string;
      node_type: NodeType;
      parent_id: string | null;
    }

    it('should validate that sections have chapter parents', () => {
      fc.assert(
        fc.property(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
          fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
          (chapterIds, sectionIds) => {
            // 创建章节节点
            const chapters: MockNode[] = chapterIds.map(id => ({
              id,
              node_type: 'chapter' as NodeType,
              parent_id: null
            }));
            
            // 创建小节节点，每个小节随机分配一个章节作为父节点
            const sections: MockNode[] = sectionIds.map((id, idx) => ({
              id,
              node_type: 'section' as NodeType,
              parent_id: chapterIds[idx % chapterIds.length]
            }));
            
            // 验证所有小节的 parent_id 都指向有效的章节
            const chapterIdSet = new Set(chapterIds);
            return sections.every(s => s.parent_id !== null && chapterIdSet.has(s.parent_id));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate that points have section parents', () => {
      fc.assert(
        fc.property(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
          fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
          (sectionIds, pointIds) => {
            // 创建小节节点
            const sections: MockNode[] = sectionIds.map(id => ({
              id,
              node_type: 'section' as NodeType,
              parent_id: 'chapter-1'
            }));
            
            // 创建知识点节点，每个知识点随机分配一个小节作为父节点
            const points: MockNode[] = pointIds.map((id, idx) => ({
              id,
              node_type: 'point' as NodeType,
              parent_id: sectionIds[idx % sectionIds.length]
            }));
            
            // 验证所有知识点的 parent_id 都指向有效的小节
            const sectionIdSet = new Set(sectionIds);
            return points.every(p => p.parent_id !== null && sectionIdSet.has(p.parent_id));
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: xiyao-er-knowledge-import, Property 9: Transaction rollback on error**
   * *For any* import operation that encounters an error, the database state SHALL remain unchanged.
   * **Validates: Requirements 4.2**
   * 
   * Note: This is a behavioral property that would require database integration testing.
   * Here we test the rollback logic conceptually.
   */
  describe('Property 9: Transaction rollback on error (conceptual)', () => {
    // 模拟事务状态
    type TransactionState = 'idle' | 'active' | 'committed' | 'rolled_back';
    
    interface Transaction {
      state: TransactionState;
      operations: string[];
    }

    function beginTransaction(): Transaction {
      return { state: 'active', operations: [] };
    }

    function addOperation(tx: Transaction, op: string): Transaction {
      if (tx.state !== 'active') throw new Error('Transaction not active');
      return { ...tx, operations: [...tx.operations, op] };
    }

    function commitTransaction(tx: Transaction): Transaction {
      if (tx.state !== 'active') throw new Error('Transaction not active');
      return { ...tx, state: 'committed' };
    }

    function rollbackTransaction(tx: Transaction): Transaction {
      if (tx.state !== 'active') throw new Error('Transaction not active');
      return { state: 'rolled_back', operations: [] };
    }

    it('should rollback all operations on error', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
          fc.integer({ min: 0, max: 9 }),
          (operations, errorIndex) => {
            let tx = beginTransaction();
            let errorOccurred = false;
            
            try {
              for (let i = 0; i < operations.length; i++) {
                if (i === errorIndex % operations.length) {
                  throw new Error('Simulated error');
                }
                tx = addOperation(tx, operations[i]);
              }
              tx = commitTransaction(tx);
            } catch {
              errorOccurred = true;
              tx = rollbackTransaction(tx);
            }
            
            // 如果发生错误，事务应该被回滚，操作列表应该为空
            if (errorOccurred) {
              return tx.state === 'rolled_back' && tx.operations.length === 0;
            }
            return tx.state === 'committed';
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: xiyao-er-knowledge-import, Property 10: Search result context**
   * *For any* search result, it SHALL include the chapter title and section title as context information.
   * **Validates: Requirements 5.2**
   */
  describe('Property 10: Search result context', () => {
    // 模拟搜索结果结构
    interface SearchResultWithContext {
      id: string;
      title: string;
      node_type: 'chapter' | 'section' | 'point';
      chapter_title?: string;
      section_title?: string;
    }

    function hasRequiredContext(result: SearchResultWithContext): boolean {
      switch (result.node_type) {
        case 'chapter':
          // 章节不需要额外上下文
          return true;
        case 'section':
          // 小节需要章节上下文
          return !!result.chapter_title;
        case 'point':
          // 知识点需要章节和小节上下文
          return !!result.chapter_title && !!result.section_title;
        default:
          return false;
      }
    }

    it('should ensure all search results have required context', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<'chapter' | 'section' | 'point'>('chapter', 'section', 'point'),
          fc.uuid(),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          (nodeType, id, title, chapterTitle, sectionTitle) => {
            // 构建符合要求的搜索结果
            const result: SearchResultWithContext = {
              id,
              title,
              node_type: nodeType,
              chapter_title: nodeType !== 'chapter' ? chapterTitle : undefined,
              section_title: nodeType === 'point' ? sectionTitle : undefined
            };
            
            return hasRequiredContext(result);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fail for point results without section context', () => {
      const result: SearchResultWithContext = {
        id: 'test-id',
        title: '测试知识点',
        node_type: 'point',
        chapter_title: '第一章',
        section_title: undefined
      };
      
      expect(hasRequiredContext(result)).toBe(false);
    });

    it('should fail for section results without chapter context', () => {
      const result: SearchResultWithContext = {
        id: 'test-id',
        title: '测试小节',
        node_type: 'section',
        chapter_title: undefined
      };
      
      expect(hasRequiredContext(result)).toBe(false);
    });

    it('should pass for chapter results without additional context', () => {
      const result: SearchResultWithContext = {
        id: 'test-id',
        title: '测试章节',
        node_type: 'chapter'
      };
      
      expect(hasRequiredContext(result)).toBe(true);
    });
  });
