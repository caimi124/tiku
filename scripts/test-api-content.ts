/**
 * 测试 API 返回内容
 */

async function test() {
  const code = 'C5.2.1'
  const url = `http://localhost:3000/api/knowledge-point/content/${code}`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('API 响应:')
    console.log(JSON.stringify(data, null, 2))
    
    if (data.success && data.data) {
      console.log(`\n解析结果:`)
      console.log(`  阶段数: ${data.data.stages?.length || 0}`)
      if (data.data.stages) {
        data.data.stages.forEach((stage: any, idx: number) => {
          console.log(`  阶段 ${idx + 1}: ${stage.stageName}`)
          console.log(`    模块数: ${stage.modules?.length || 0}`)
          if (stage.modules) {
            stage.modules.forEach((module: any) => {
              console.log(`      - ${module.moduleCode}: ${module.moduleName} (内容长度: ${module.content?.length || 0})`)
            })
          }
        })
      }
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

test()
