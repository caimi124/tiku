/**
 * Property tests for NumberHighlight component
 * 
 * **Feature: knowledge-page-redesign, Property 9: 数字高亮正确性**
 * **Validates: Requirements 3.4**
 */

import fc from 'fast-check'
import {
  highlightNumbers,
  containsNumber,
  extractNumbers,
  extractNumbersWithUnits
} from '../../lib/number-highlight-utils'

describe('Property 9: 数字高亮正确性', () => {

  it('text without numbers returns single unhighlighted part', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => !/\d/.test(s)),
        (text) => {
          const parts = highlightNumbers(text)

          return (
            parts.length === 1 &&
            parts[0].text === text &&
            parts[0].isNumber === false
          )
        }
      ),
      { numRuns: 50 }
    )
  })

  it('text with single number is correctly split and highlighted', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 9999 }),
        fc.string({ minLength: 0, maxLength: 30 }).filter(s => !/\d/.test(s)),
        fc.string({ minLength: 0, maxLength: 30 }).filter(s => !/\d/.test(s)),
        (num, prefix, suffix) => {
          const text = `${prefix}${num}${suffix}`
          const parts = highlightNumbers(text)

          // Find the highlighted part
          const numberPart = parts.find(p => p.isNumber)

          return (
            numberPart !== undefined &&
            numberPart.text === String(num)
          )
        }
      ),
      { numRuns: 50 }
    )
  })

  it('all numbers in text are highlighted', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 999 }), { minLength: 1, maxLength: 5 }),
        (numbers) => {
          const text = numbers.join(' 文字 ')
          const parts = highlightNumbers(text)

          const highlightedNumbers = parts
            .filter(p => p.isNumber)
            .map(p => parseInt(p.text, 10))

          // All numbers should be highlighted
          return numbers.every(n => highlightedNumbers.includes(n))
        }
      ),
      { numRuns: 50 }
    )
  })

  it('decimal numbers are correctly highlighted', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9999 }),
        fc.integer({ min: 0, max: 9 }),
        (intPart, decPart) => {
          const numStr = `${intPart}.${decPart}`
          const text = `剂量${numStr}mg`
          const parts = highlightNumbers(text)

          const numberPart = parts.find(p => p.isNumber)

          return (
            numberPart !== undefined &&
            numberPart.text === numStr
          )
        }
      ),
      { numRuns: 50 }
    )
  })

  it('containsNumber returns true when number exists', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 9999 }),
        fc.string({ minLength: 0, maxLength: 50 }).filter(s => !/\d/.test(s)),
        (num, surrounding) => {
          const text = `${surrounding}${num}${surrounding}`
          return containsNumber(text) === true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('containsNumber returns false when no number exists', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => !/\d/.test(s)),
        (text) => {
          return containsNumber(text) === false
        }
      ),
      { numRuns: 50 }
    )
  })

  it('extractNumbers returns all numbers in text', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 999 }), { minLength: 1, maxLength: 5 }),
        (numbers) => {
          const text = numbers.join(' 分隔 ')
          const extracted = extractNumbers(text)

          return numbers.every(n => extracted.includes(String(n)))
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
          const parts = highlightNumbers(text)
          const reconstructed = parts.map(p => p.text).join('')

          return reconstructed === text
        }
      ),
      { numRuns: 100 }
    )
  })

  it('empty text returns single empty part', () => {
    const parts = highlightNumbers('')
    expect(parts).toEqual([{ text: '', isNumber: false }])
  })

  it('numbers with units are detected', () => {
    const testCases = [
      { text: '剂量100mg', expectedNumber: '100', expectedUnit: 'mg' },
      { text: '年龄18岁', expectedNumber: '18', expectedUnit: '岁' },
      { text: '持续7天', expectedNumber: '7', expectedUnit: '天' },
      { text: '浓度50%', expectedNumber: '50', expectedUnit: '%' },
    ]

    testCases.forEach(({ text, expectedNumber, expectedUnit }) => {
      const result = extractNumbersWithUnits(text)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].number).toBe(expectedNumber)
      expect(result[0].unit).toBe(expectedUnit)
    })
  })

  it('range numbers are correctly highlighted', () => {
    const rangeTexts = ['10-20mg', '5~10岁', '3-5天']

    rangeTexts.forEach(text => {
      const parts = highlightNumbers(text)
      const numberPart = parts.find(p => p.isNumber)

      expect(numberPart).toBeDefined()
      expect(numberPart?.isNumber).toBe(true)
    })
  })
})
