/**
 * 将 `shuju/执业药师西药二补充.json` 中杂乱的 JSON 块规范为统一结构。
 * 运行后会生成 `shuju/执业药师西药二补充.normalized.json`，供 import-supplement-points-to-tree.ts 使用。
 *
 * 用法：
 *   npx tsx scripts/normalize-supplement.ts
 */

import fs from 'fs'
import path from 'path'

const SOURCE_FILE = path.join(process.cwd(), 'shuju', '执业药师西药二补充.json')
const TARGET_FILE = path.join(process.cwd(), 'shuju', '执业药师西药二补充.normalized.json')

const CHAPTER_REGEX = /第\s*([一二三四五六七八九十]+)\s*章/
const SECTION_REGEX = /第\s*([一二三四五六七八九十]+)\s*节/

const CHINESE_ORDINALS: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  十一: 11,
  十二: 12,
  十三: 13,
  十四: 14,
  十五: 15,
  十六: 16,
  十七: 17,
  十八: 18,
  十九: 19,
  二十: 20
}

function decodeOrdinal(text?: string): number | null {
  if (!text) return null
  const simpleMatch = text.match(/\bC(\d+)\.(\d+)/)
  if (simpleMatch) return parseInt(simpleMatch[1], 10)
  const chapterMatch = text.match(CHAPTER_REGEX)
  if (chapterMatch) {
    const chinese = chapterMatch[1]
    return CHINESE_ORDINALS[chinese] ?? null
  }
  return null
}

function decodeSection(text?: string): number | null {
  if (!text) return null
  const simpleMatch = text.match(/\bC(\d+)\.(\d+)/)
  if (simpleMatch) return parseInt(simpleMatch[2], 10)
  const sectionMatch = text.match(SECTION_REGEX)
  if (sectionMatch) {
    const chinese = sectionMatch[1]
    return CHINESE_ORDINALS[chinese] ?? null
  }
  return null
}

function parseJSONBlocks(raw: string): any[] {
  const blocks: any[] = []
  let depth = 0
  let buffer = ''
  let inString = false
  let escape = false
  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i]
    buffer += char
    if (escape) {
      escape = false
      continue
    }
    if (char === '\\') {
      escape = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (char === '{') {
      depth += 1
    } else if (char === '}') {
      depth -= 1
      if (depth === 0) {
        const trimmed = buffer.trim()
        if (trimmed) {
          try {
            blocks.push(JSON.parse(trimmed))
          } catch {
            // ignore
          }
        }
        buffer = ''
      }
    } else if (depth === 0) {
      buffer = ''
    }
  }
  return blocks
}

function toPoints(entry: any): Array<{ title: string; content: string }> {
  const points: Array<{ title: string; content: string }> = []
  const candidates = [
    entry?.points,
    entry?.knowledgePoints,
    entry?.items,
    entry?.list,
    entry?.考点,
    entry?.考点内容,
    entry?.考点梳理
  ]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      candidate.forEach(item => {
        if (typeof item === 'string') {
          points.push({ title: item.trim(), content: item.trim() })
        } else if (typeof item === 'object' && item) {
          const title =
            item?.title || item?.name || item?.考点 || item?.topic || item?.label
          const content = item?.content || item?.内容 || JSON.stringify(item)
          if (title) {
            points.push({ title: title.trim(), content: content?.trim?.() || '' })
          }
        }
      })
    } else if (typeof candidate === 'string') {
      const lines = candidate
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length)
      lines.forEach(line => {
        const cleaned = line.replace(/^(考点|【考点】|[-•①②③④⑤⑥⑦⑧⑨⑩])/u, '').trim()
        if (cleaned) points.push({ title: cleaned, content: cleaned })
      })
    }
  }
  return points
}

function traverseBlock(block: any): Array<{ chapter: string; section: string; points: any[] }> {
  const normalized: Array<{ chapter: string; section: string; points: any[] }> = []
  if (!block) return normalized

  const tryChapter = block.chapter || block?.章节信息?.章 || block.chapterTitle || block?.chapter_name
  const trySection = block.section || block?.章节信息?.节 || block.sectionTitle || block?.section_name
  if (tryChapter && trySection) {
    const chapter = tryChapter.trim()
    const section = trySection.trim()
    normalized.push({
      chapter,
      section,
      points: toPoints(block)
    })
  } else if (typeof block === 'object' && !Array.isArray(block)) {
    Object.keys(block).forEach(key => {
      if (key.match(/^第.+章$/)) {
        const chapter = key.trim()
        const sections = block[key]
        if (sections && typeof sections === 'object') {
          Object.keys(sections).forEach(secKey => {
            const sectionEntry = sections[secKey]
            normalized.push({
              chapter,
              section: secKey.trim(),
              points: toPoints(sectionEntry)
            })
          })
        }
      }
      if (key.toLowerCase() === 'chapter' && Array.isArray(block.sections)) {
        const chapter = block[key]
        block.sections.forEach((sectionItem: any) => {
          normalized.push({
            chapter,
            section: sectionItem.section || sectionItem.title || sectionItem.节,
            points: toPoints(sectionItem)
          })
        })
      }
    })
  }
  return normalized.filter(item => item.points?.length)
}

function normalize(): Array<{ chapter: string; section: string; points: any[] }> {
  const raw = fs.readFileSync(SOURCE_FILE, 'utf-8')
  const parsedBlocks = parseJSONBlocks(raw)
  const normalized: Array<{ chapter: string; section: string; points: any[] }> = []
  parsedBlocks.forEach(block => {
    normalized.push(...traverseBlock(block))
  })
  return normalized
}

function saveNormalized(data: Array<{ chapter: string; section: string; points: any[] }>) {
  fs.writeFileSync(TARGET_FILE, JSON.stringify(data, null, 2), { encoding: 'utf-8' })
  console.log(`normalized file saved: ${TARGET_FILE} (${data.length} blocks)`)
}

saveNormalized(normalize())

