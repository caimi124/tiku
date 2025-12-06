/**
 * Property tests for ContentTypeCard utilities
 * 
 * **Feature: knowledge-page-redesign, Property 3: 考点内容分类完整性**
 * **Validates: Requirements 1.5**
 */

import fc from 'fast-check'
import {
  ContentType,
  ALL_CONTENT_TYPES,
  CONTENT_TYPE_CONFIG,
  getContentTypeConfig,
  isValidContentType,
  getContentTypeLabel,
  getContentTypeIcon,
  KnowledgeContent,
  categorizeContent,
  hasContentType,
  getContentTypes
} from './content-type-utils'

// Arbitraries
const contentTypeArbitrary = fc.constantFrom<ContentType>(...ALL_CONTENT_TYPES)
const stringArrayArbitrary = fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 5 })

const adverseReactionArbitrary = fc.record({
  content: fc.string({ minLength: 1, maxLength: 100 }),
  severity: fc.constantFrom<'severe' | 'moderate' | 'mild'>('severe', 'moderate', 'mild')
})

const knowledgeContentArbitrary = fc.record({
  mechanism: fc.option(stringArrayArbitrary, { nil: undefined }),
  pharmacokinetics: fc.option(stringArrayArbitrary, { nil: undefined }),
  adverseReactions: fc.option(fc.array(adverseReactionArbitrary, { minLength: 1, maxLength: 5 }), { nil: undefined }),
  clinicalApplications: fc.option(stringArrayArbitrary, { nil: undefined }),
  interactions: fc.option(stringArrayArbitrary, { nil: undefined }),
  memoryTips: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined })
})

describe('Property 3: 考点内容分类完整性', () => {

  it('all content types have valid configuration', () => {
    fc.assert(
      fc.property(contentTypeArbitrary, (type) => {
        const config = getContentTypeConfig(type)
        
        return (
          config.type === type &&
          typeof config.label === 'string' && config.label.length > 0 &&
          typeof config.icon === 'string' && config.icon.length > 0 &&
          typeof config.bgColor === 'string' &&
          typeof config.textColor === 'string' &&
          typeof config.borderColor === 'string'
        )
      }),
      { numRuns: 20 }
    )
  })

  it('isValidContentType returns true for all valid types', () => {
    fc.assert(
      fc.property(contentTypeArbitrary, (type) => {
        return isValidContentType(type) === true
      }),
      { numRuns: 20 }
    )
  })

  it('isValidContentType returns false for invalid types', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => 
          !ALL_CONTENT_TYPES.includes(s as ContentType)
        ),
        (invalidType) => {
          return isValidContentType(invalidType) === false
        }
      ),
      { numRuns: 50 }
    )
  })

  it('getContentTypeLabel returns non-empty string', () => {
    fc.assert(
      fc.property(contentTypeArbitrary, (type) => {
        const label = getContentTypeLabel(type)
        return typeof label === 'string' && label.length > 0
      }),
      { numRuns: 20 }
    )
  })

  it('getContentTypeIcon returns non-empty string', () => {
    fc.assert(
      fc.property(contentTypeArbitrary, (type) => {
        const icon = getContentTypeIcon(type)
        return typeof icon === 'string' && icon.length > 0
      }),
      { numRuns: 20 }
    )
  })

  it('categorizeContent returns correct types for non-empty content', () => {
    fc.assert(
      fc.property(knowledgeContentArbitrary, (content) => {
        const categorized = categorizeContent(content)
        
        // Each categorized item should have valid type and non-empty items
        return categorized.every(item => 
          isValidContentType(item.type) && 
          Array.isArray(item.items) && 
          item.items.length > 0
        )
      }),
      { numRuns: 50 }
    )
  })

  it('categorizeContent covers all present content types', () => {
    fc.assert(
      fc.property(knowledgeContentArbitrary, (content) => {
        const categorized = categorizeContent(content)
        const categorizedTypes = categorized.map(c => c.type)
        const presentTypes = getContentTypes(content)
        
        // All present types should be in categorized result
        return presentTypes.every(type => categorizedTypes.includes(type))
      }),
      { numRuns: 50 }
    )
  })

  it('hasContentType correctly identifies present types', () => {
    fc.assert(
      fc.property(
        knowledgeContentArbitrary,
        contentTypeArbitrary,
        (content, type) => {
          const hasType = hasContentType(content, type)
          const presentTypes = getContentTypes(content)
          
          return hasType === presentTypes.includes(type)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('getContentTypes returns subset of ALL_CONTENT_TYPES', () => {
    fc.assert(
      fc.property(knowledgeContentArbitrary, (content) => {
        const types = getContentTypes(content)
        return types.every(type => ALL_CONTENT_TYPES.includes(type))
      }),
      { numRuns: 50 }
    )
  })

  it('empty content returns empty categorization', () => {
    const emptyContent: KnowledgeContent = {}
    const categorized = categorizeContent(emptyContent)
    expect(categorized).toEqual([])
  })

  it('content with only mechanism is categorized correctly', () => {
    const content: KnowledgeContent = {
      mechanism: ['作用机制1', '作用机制2']
    }
    const categorized = categorizeContent(content)
    
    expect(categorized.length).toBe(1)
    expect(categorized[0].type).toBe('mechanism')
    expect(categorized[0].items).toEqual(['作用机制1', '作用机制2'])
  })

  it('content with all types is fully categorized', () => {
    const content: KnowledgeContent = {
      mechanism: ['机制'],
      pharmacokinetics: ['药动学'],
      adverseReactions: [{ content: '不良反应', severity: 'moderate' }],
      clinicalApplications: ['临床应用'],
      interactions: ['相互作用'],
      memoryTips: '记忆口诀'
    }
    const categorized = categorizeContent(content)
    
    expect(categorized.length).toBe(6)
    expect(getContentTypes(content).length).toBe(6)
  })

  it('ALL_CONTENT_TYPES contains exactly 6 types', () => {
    expect(ALL_CONTENT_TYPES.length).toBe(6)
    expect(ALL_CONTENT_TYPES).toContain('mechanism')
    expect(ALL_CONTENT_TYPES).toContain('pharmacokinetics')
    expect(ALL_CONTENT_TYPES).toContain('adverse')
    expect(ALL_CONTENT_TYPES).toContain('clinical')
    expect(ALL_CONTENT_TYPES).toContain('interaction')
    expect(ALL_CONTENT_TYPES).toContain('memory')
  })

  it('each content type has unique label', () => {
    const labels = ALL_CONTENT_TYPES.map(type => getContentTypeLabel(type))
    const uniqueLabels = new Set(labels)
    expect(uniqueLabels.size).toBe(ALL_CONTENT_TYPES.length)
  })

  it('each content type has unique icon', () => {
    const icons = ALL_CONTENT_TYPES.map(type => getContentTypeIcon(type))
    const uniqueIcons = new Set(icons)
    expect(uniqueIcons.size).toBe(ALL_CONTENT_TYPES.length)
  })
})
