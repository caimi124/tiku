/**
 * Property tests for KeywordHighlight component
 * 
 * **Feature: knowledge-page-redesign, Property 10: 关键词高亮正确性**
 * **Validates: Requirements 3.6**
 */

import fc from 'fast-check'
import { 
  highlightKeywords, 
  containsKeyword, 
  getMatchedKeywords,
  KeywordConfig,
  DEFAULT_KEYWORDS 
} from '../../lib/keyword-highlight-utils'

// Test keywords
const testKeywords: KeywordConfig[] = [
  { keyword: '首选', className: 'highlight-green' },
  { keyword: '禁忌', className: 'highlight-red' },
  { keyword: '禁用', className: 'highlight-red' },
  { keyword: '慎用', className: 'highlight-yellow' },
  { keyword: '相互作用', className: 'highlight-purple' },
]

describe('Property 10: 关键词高亮正确性', () => {
  
  it('text without keywords returns single unhighlighted part', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => 
          !testKeywords.some(k => s.includes(k.keyword))
        ),
        (text) => {
          const parts = highlightKeywords(text, testKeywords)
          
          return (
            parts.length === 1 &&
            parts[0].text === text &&
            parts[0].isHighlighted === false
          )
        }
      ),
      { numRuns: 50 }
    )
  })

  it('text with single keyword is correctly split and highlighted', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...testKeywords.map(k => k.keyword)),
        fc.string({ minLength: 0, maxLength: 50 }).filter(s => 
          !testKeywords.some(k => s.includes(k.keyword))
        ),
        fc.string({ minLength: 0, maxLength: 50 }).filter(s => 
          !testKeywords.some(k => s.includes(k.keyword))
        ),
        (keyword, prefix, suffix) => {
          const text = `${prefix}${keyword}${suffix}`
          const parts = highlightKeywords(text, testKeywords)
          
          // Find the highlighted part
          const highlightedPart = parts.find(p => p.isHighlighted)
          
          return (
            highlightedPart !== undefined &&
            highlightedPart.text === keyword &&
            highlightedPart.className !== undefined
          )
        }
      ),
      { numRuns: 50 }
    )
  })

  it('all keywords in text are highlighted', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...testKeywords.map(k => k.keyword)), { minLength: 1, maxLength: 3 }),
        (keywords) => {
          const text = keywords.join(' 一些文字 ')
          const parts = highlightKeywords(text, testKeywords)
          
          const highlightedKeywords = parts
            .filter(p => p.isHighlighted)
            .map(p => p.text)
          
          // All keywords should be highlighted
          return keywords.every(k => highlightedKeywords.includes(k))
        }
      ),
      { numRuns: 50 }
    )
  })

  it('highlighted parts have correct className', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...testKeywords),
        (keywordConfig) => {
          const text = `测试${keywordConfig.keyword}文本`
          const parts = highlightKeywords(text, testKeywords)
          
          const highlightedPart = parts.find(p => p.text === keywordConfig.keyword)
          
          return (
            highlightedPart !== undefined &&
            highlightedPart.isHighlighted === true &&
            highlightedPart.className === keywordConfig.className
          )
        }
      ),
      { numRuns: 20 }
    )
  })

  it('containsKeyword returns true when keyword exists', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...testKeywords.map(k => k.keyword)),
        fc.string({ minLength: 0, maxLength: 50 }),
        (keyword, surrounding) => {
          const text = `${surrounding}${keyword}${surrounding}`
          return containsKeyword(text, testKeywords) === true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('containsKeyword returns false when no keyword exists', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => 
          !testKeywords.some(k => s.includes(k.keyword))
        ),
        (text) => {
          return containsKeyword(text, testKeywords) === false
        }
      ),
      { numRuns: 50 }
    )
  })

  it('getMatchedKeywords returns all matching keywords', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...testKeywords.map(k => k.keyword)), { minLength: 1, maxLength: 3 }),
        (keywords) => {
          const uniqueKeywords = [...new Set(keywords)]
          const text = uniqueKeywords.join(' ')
          const matched = getMatchedKeywords(text, testKeywords)
          
          return uniqueKeywords.every(k => matched.includes(k))
        }
      ),
      { numRuns: 50 }
    )
  })

  it('concatenated parts equal original text', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (text) => {
          const parts = highlightKeywords(text, testKeywords)
          const reconstructed = parts.map(p => p.text).join('')
          
          return reconstructed === text
        }
      ),
      { numRuns: 100 }
    )
  })

  it('empty text returns single empty part', () => {
    const parts = highlightKeywords('', testKeywords)
    expect(parts).toEqual([{ text: '', isHighlighted: false }])
  })

  it('DEFAULT_KEYWORDS contains expected keywords', () => {
    const expectedKeywords = ['首选', '禁忌', '禁用', '慎用', '相互作用']
    const defaultKeywordTexts = DEFAULT_KEYWORDS.map(k => k.keyword)
    
    expectedKeywords.forEach(keyword => {
      expect(defaultKeywordTexts).toContain(keyword)
    })
  })
})
