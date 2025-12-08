/**
 * 老司机模式 - Prompt模板管理器属性测试
 * Expert Driver Mode - Prompt Template Manager Property Tests
 */

import * as fc from 'fast-check';
import {
  PromptTemplateManager,
  promptTemplateManager,
  getCurrentTemplateVersion,
  compareVersions,
  incrementVersion,
} from './prompt-template-manager';
import { PromptTemplate, STYLE_VARIANTS, CONSTRAINTS } from './types';

// ============ 生成器 ============

// 生成有效的版本号
const validVersionArb = fc.tuple(
  fc.integer({ min: 1, max: 99 }),
  fc.integer({ min: 0, max: 99 })
).map(([major, minor]) => `v${major}.${minor}`);

// 生成版本号对
const versionPairArb = fc.tuple(validVersionArb, validVersionArb);

// ============ 属性测试 ============

describe('Expert Driver Mode - Prompt Template Manager Property Tests', () => {
  /**
   * **Feature: expert-driver-mode, Property 17: Prompt Template Version Tracking**
   * **Validates: Requirements 8.5**
   */
  describe('Property 17: Prompt Template Version Tracking', () => {
    test('current template should always have a valid version', () => {
      const template = promptTemplateManager.getCurrentTemplate();
      expect(template.version).toMatch(/^v\d+\.\d+$/);
    });

    test('registered templates should be retrievable by version', () => {
      fc.assert(
        fc.property(validVersionArb, (version) => {
          const manager = new PromptTemplateManager();
          const template: PromptTemplate = {
            version,
            system_prompt: 'test system prompt',
            user_prompt_template: 'test user prompt {{knowledge_point_text}}',
            json_schema: {},
            forbidden_patterns: [],
            style_rules: [],
            is_active: false,
          };
          
          manager.registerTemplate(template);
          const retrieved = manager.getTemplateByVersion(version);
          
          return retrieved !== null && retrieved.version === version;
        }),
        { numRuns: 100 }
      );
    });

    test('template version should be preserved after registration', () => {
      fc.assert(
        fc.property(validVersionArb, (version) => {
          const manager = new PromptTemplateManager();
          const originalVersion = version;
          
          const template: PromptTemplate = {
            version: originalVersion,
            system_prompt: 'test',
            user_prompt_template: 'test {{knowledge_point_text}}',
            json_schema: {},
            forbidden_patterns: [],
            style_rules: [],
            is_active: false,
          };
          
          manager.registerTemplate(template);
          const retrieved = manager.getTemplateByVersion(originalVersion);
          
          return retrieved?.version === originalVersion;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: expert-driver-mode, Property 18: Template Version Increment**
   * **Validates: Requirements 8.6**
   */
  describe('Property 18: Template Version Increment', () => {
    test('minor increment should produce greater version', () => {
      fc.assert(
        fc.property(validVersionArb, (version) => {
          const newVersion = incrementVersion(version, 'minor');
          return compareVersions(newVersion, version) > 0;
        }),
        { numRuns: 100 }
      );
    });

    test('major increment should produce greater version', () => {
      fc.assert(
        fc.property(validVersionArb, (version) => {
          const newVersion = incrementVersion(version, 'major');
          return compareVersions(newVersion, version) > 0;
        }),
        { numRuns: 100 }
      );
    });

    test('major increment should reset minor to 0', () => {
      fc.assert(
        fc.property(validVersionArb, (version) => {
          const newVersion = incrementVersion(version, 'major');
          const match = newVersion.match(/^v(\d+)\.(\d+)$/);
          return match !== null && match[2] === '0';
        }),
        { numRuns: 100 }
      );
    });

    test('version comparison should be transitive', () => {
      fc.assert(
        fc.property(
          validVersionArb,
          validVersionArb,
          validVersionArb,
          (v1, v2, v3) => {
            const cmp12 = compareVersions(v1, v2);
            const cmp23 = compareVersions(v2, v3);
            const cmp13 = compareVersions(v1, v3);
            
            // 如果 v1 < v2 且 v2 < v3，则 v1 < v3
            if (cmp12 < 0 && cmp23 < 0) {
              return cmp13 < 0;
            }
            // 如果 v1 > v2 且 v2 > v3，则 v1 > v3
            if (cmp12 > 0 && cmp23 > 0) {
              return cmp13 > 0;
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('version comparison should be reflexive (v == v)', () => {
      fc.assert(
        fc.property(validVersionArb, (version) => {
          return compareVersions(version, version) === 0;
        }),
        { numRuns: 100 }
      );
    });

    test('version comparison should be antisymmetric', () => {
      fc.assert(
        fc.property(versionPairArb, ([v1, v2]) => {
          const cmp12 = compareVersions(v1, v2);
          const cmp21 = compareVersions(v2, v1);
          return cmp12 === -cmp21;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Additional Template Manager Tests', () => {
    test('setting active template should deactivate others', () => {
      const manager = new PromptTemplateManager();
      
      const template1: PromptTemplate = {
        version: 'v1.0',
        system_prompt: 'test1',
        user_prompt_template: 'test {{knowledge_point_text}}',
        json_schema: {},
        forbidden_patterns: [],
        style_rules: [],
        is_active: true,
      };
      
      const template2: PromptTemplate = {
        version: 'v2.0',
        system_prompt: 'test2',
        user_prompt_template: 'test {{knowledge_point_text}}',
        json_schema: {},
        forbidden_patterns: [],
        style_rules: [],
        is_active: false,
      };
      
      manager.registerTemplate(template1);
      manager.registerTemplate(template2);
      manager.setActiveTemplate('v2.0');
      
      const current = manager.getCurrentTemplate();
      expect(current.version).toBe('v2.0');
    });

    test('user prompt should contain knowledge point placeholder', () => {
      const manager = new PromptTemplateManager();
      const userPrompt = manager.generateUserPrompt('测试知识点');
      expect(userPrompt).toContain('测试知识点');
    });

    test('getAllVersions should return sorted versions', () => {
      const manager = new PromptTemplateManager();
      const versions = manager.getAllVersions();
      
      for (let i = 1; i < versions.length; i++) {
        expect(compareVersions(versions[i - 1], versions[i])).toBeLessThanOrEqual(0);
      }
    });
  });
});
