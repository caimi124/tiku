/**
 * Property tests for AdverseReactionBadge component
 * 
 * **Feature: knowledge-page-redesign, Property 8: 不良反应颜色映射一致性**
 * **Validates: Requirements 3.2**
 */

import fc from 'fast-check'
import {
  SeverityLevel,
  SEVERITY_CONFIG,
  getSeverityConfig,
  isValidSeverity,
  getSeverityBgColor,
  getSeverityTextColor,
  AdverseReaction
} from '../../lib/adverse-reaction-utils'

// Arbitraries
const severityArbitrary = fc.constantFrom<SeverityLevel>('severe', 'moderate', 'mild')
const contentArbitrary = fc.string({ minLength: 1, maxLength: 100 })

const adverseReactionArbitrary = fc.record({
  content: contentArbitrary,
  severity: severityArbitrary
})

describe('Property 8: 不良反应颜色映射一致性', () => {

  it('severe severity maps to red color', () => {
    const config = getSeverityConfig('severe')
    expect(config.bgColor).toContain('red')
    expect(config.textColor).toContain('red')
    expect(config.borderColor).toContain('red')
  })

  it('moderate severity maps to yellow color', () => {
    const config = getSeverityConfig('moderate')
    expect(config.bgColor).toContain('yellow')
    expect(config.textColor).toContain('yellow')
    expect(config.borderColor).toContain('yellow')
  })

  it('mild severity maps to green color', () => {
    const config = getSeverityConfig('mild')
    expect(config.bgColor).toContain('green')
    expect(config.textColor).toContain('green')
    expect(config.borderColor).toContain('green')
  })

  it('all severity levels have consistent color mapping', () => {
    fc.assert(
      fc.property(severityArbitrary, (severity) => {
        const config = getSeverityConfig(severity)
        
        // Each severity must have all required properties
        return (
          typeof config.bgColor === 'string' &&
          typeof config.textColor === 'string' &&
          typeof config.borderColor === 'string' &&
          typeof config.label === 'string' &&
          typeof config.icon === 'string'
        )
      }),
      { numRuns: 20 }
    )
  })

  it('severity color mapping is deterministic', () => {
    fc.assert(
      fc.property(severityArbitrary, (severity) => {
        const config1 = getSeverityConfig(severity)
        const config2 = getSeverityConfig(severity)
        
        return (
          config1.bgColor === config2.bgColor &&
          config1.textColor === config2.textColor &&
          config1.borderColor === config2.borderColor
        )
      }),
      { numRuns: 50 }
    )
  })

  it('isValidSeverity returns true for valid severities', () => {
    fc.assert(
      fc.property(severityArbitrary, (severity) => {
        return isValidSeverity(severity) === true
      }),
      { numRuns: 20 }
    )
  })

  it('isValidSeverity returns false for invalid severities', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => 
          !['severe', 'moderate', 'mild'].includes(s)
        ),
        (invalidSeverity) => {
          return isValidSeverity(invalidSeverity) === false
        }
      ),
      { numRuns: 50 }
    )
  })

  it('getSeverityBgColor returns correct background color', () => {
    fc.assert(
      fc.property(severityArbitrary, (severity) => {
        const bgColor = getSeverityBgColor(severity)
        const config = SEVERITY_CONFIG[severity]
        
        return bgColor === config.bgColor
      }),
      { numRuns: 20 }
    )
  })

  it('getSeverityTextColor returns correct text color', () => {
    fc.assert(
      fc.property(severityArbitrary, (severity) => {
        const textColor = getSeverityTextColor(severity)
        const config = SEVERITY_CONFIG[severity]
        
        return textColor === config.textColor
      }),
      { numRuns: 20 }
    )
  })

  it('all severity levels have unique colors', () => {
    const severities: SeverityLevel[] = ['severe', 'moderate', 'mild']
    const bgColors = severities.map(s => getSeverityBgColor(s))
    const uniqueBgColors = new Set(bgColors)
    
    expect(uniqueBgColors.size).toBe(severities.length)
  })

  it('severity labels are non-empty strings', () => {
    fc.assert(
      fc.property(severityArbitrary, (severity) => {
        const config = getSeverityConfig(severity)
        return config.label.length > 0
      }),
      { numRuns: 20 }
    )
  })

  it('severity icons are non-empty strings', () => {
    fc.assert(
      fc.property(severityArbitrary, (severity) => {
        const config = getSeverityConfig(severity)
        return config.icon.length > 0
      }),
      { numRuns: 20 }
    )
  })

  it('adverse reaction with any severity has valid color mapping', () => {
    fc.assert(
      fc.property(adverseReactionArbitrary, (reaction) => {
        const config = getSeverityConfig(reaction.severity)
        
        // Verify color mapping based on severity
        if (reaction.severity === 'severe') {
          return config.bgColor.includes('red')
        } else if (reaction.severity === 'moderate') {
          return config.bgColor.includes('yellow')
        } else if (reaction.severity === 'mild') {
          return config.bgColor.includes('green')
        }
        return false
      }),
      { numRuns: 50 }
    )
  })
})
