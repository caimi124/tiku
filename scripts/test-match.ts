/**
 * 测试文件匹配逻辑
 */

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findPointFiles(code: string, allFiles: string[]): string[] {
  const codeNorm = code.trim().toLowerCase()
  const pattern = new RegExp(`^${escapeRegExp(codeNorm)}(?!\\d)`)
  
  return allFiles.filter(file => {
    const fileName = file.toLowerCase()
    return pattern.test(fileName) && fileName.endsWith('.txt')
  })
}

// 测试
const code = 'C7.2.2'
const files = [
  'c7.2.2 5型磷酸二酯酶仰制剂的临床用药评价.txt',
  'c7.2.20 测试.txt',
  'c7.2.2测试.txt'
]

console.log('Code:', code)
console.log('Normalized:', code.trim().toLowerCase())
console.log('Pattern:', `^${escapeRegExp(code.trim().toLowerCase())}(?!\\d)`)
console.log('\nFiles:')
files.forEach(file => {
  const matches = findPointFiles(code, [file])
  console.log(`  ${file}: ${matches.length > 0 ? '✅ 匹配' : '❌ 不匹配'}`)
})
