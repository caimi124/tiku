/**
 * 同步桌面目录的文件到项目目录
 */

import { readdir, copyFile, mkdir, access } from 'fs/promises'
import { join } from 'path'
import { constants } from 'fs'

const DESKTOP_DIR = 'C:\\Users\\chupi\\Desktop\\执业药师西药二考点'
const PROJECT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log('🔄 开始同步文件...\n')
  console.log(`桌面目录: ${DESKTOP_DIR}`)
  console.log(`项目目录: ${PROJECT_DIR}\n`)
  
  try {
    // 检查桌面目录是否存在
    const desktopExists = await fileExists(DESKTOP_DIR)
    if (!desktopExists) {
      console.log(`❌ 桌面目录不存在: ${DESKTOP_DIR}`)
      return
    }
    
    // 确保项目目录存在
    await mkdir(PROJECT_DIR, { recursive: true })
    
    // 读取桌面目录的文件
    const desktopFiles = await readdir(DESKTOP_DIR)
    const txtFiles = desktopFiles.filter(f => f.endsWith('.txt'))
    
    console.log(`找到 ${txtFiles.length} 个 .txt 文件\n`)
    
    let copied = 0
    let skipped = 0
    let failed = 0
    
    for (const file of txtFiles) {
      const sourcePath = join(DESKTOP_DIR, file)
      const targetPath = join(PROJECT_DIR, file)
      
      try {
        // 检查目标文件是否已存在
        const targetExists = await fileExists(targetPath)
        
        if (targetExists) {
          console.log(`⏭️  跳过（已存在）: ${file}`)
          skipped++
        } else {
          await copyFile(sourcePath, targetPath)
          console.log(`✅ 复制: ${file}`)
          copied++
        }
      } catch (error) {
        console.error(`❌ 复制失败: ${file}`, error instanceof Error ? error.message : String(error))
        failed++
      }
    }
    
    console.log('\n📊 同步统计:')
    console.log(`   复制: ${copied}`)
    console.log(`   跳过: ${skipped}`)
    console.log(`   失败: ${failed}`)
    console.log(`   总计: ${txtFiles.length}`)
    
  } catch (error) {
    console.error('❌ 同步失败:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main().catch(console.error)
