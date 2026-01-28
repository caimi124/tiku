/**
 * 测试解析函数
 */

const content = `第一阶段 建立框架 初学

【考点 c5.2.1｜M02｜本页定位】
快速入门：帮你建立一张清晰的降压药"家族地图"，从核心系统到代表成员一目了然，为后续学习打好地基。

【考点 c5.2.1｜M03｜考什么 & 怎么考】
考题主要考查三点：一是降压药的五大"家族"归属；二是各"家族"中的"明星成员"（代表药）；三是给你一个药名，你能快速说出它属于哪个"家族"。

【考点 c5.2.1｜M04｜核心结构】
一、干预RAS系统家族：ACEI（普利）、ARB（沙坦）、ARNI。
二、拦截钙离子家族：钙通道阻滞剂（CCB），分"地平"类和"非地平"类。
三、排水减容家族：利尿剂，分噻嗪类、袢利尿剂、保钾利尿剂。
四、阻断交感家族：β受体阻滞剂（洛尔）、α1受体阻滞剂。
五、其他独立成员：中枢降压药、直接扩血管药等。

【考点 c5.2.1｜M05｜必背要点】

掌握五大分类框架：RAS系统药、CCB、利尿剂、受体阻滞剂、其他。

记住"普利"是ACEI，"沙坦"是ARB，"地平"是CCB（二氢吡啶类）。

"洛尔"是β受体阻滞剂，"噻嗪"或"米/尼"多提示利尿剂。

第二阶段 复习查漏 默认推荐

【考点 c5.2.1｜M03｜考什么 & 怎么考】
高频考查"见名知类"——通过药名词尾快速识别类别。`

function parsePointContent(content: string) {
  // 统一处理换行符
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalizedContent.split('\n')
  const stages: any[] = []
  let currentStage: any = null
  let currentModule: any = null
  let currentModuleLines: string[] = []

  console.log(`总行数: ${lines.length}`)
  console.log(`前10行:`)
  lines.slice(0, 10).forEach((line, idx) => {
    console.log(`  ${idx + 1}: "${line}" (长度: ${line.length})`)
  })

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 识别阶段
    const stageMatch = line.match(/^第[一二三]阶段[：:]?/)
    if (stageMatch) {
      console.log(`\n找到阶段: ${line}`)
      // 保存上一个模块
      if (currentModule && currentModuleLines.length > 0) {
        currentModule.content = currentModuleLines.join('\n').trim()
        if (currentStage) {
          currentStage.modules.push(currentModule)
        }
        currentModuleLines = []
      }
      
      // 保存上一个阶段
      if (currentStage) {
        stages.push(currentStage)
      }
      
      // 创建新阶段
      const stageName = line.trim()
      currentStage = {
        stageName,
        modules: []
      }
      currentModule = null
      continue
    }
    
    // 识别模块
    const moduleMatch = line.match(/【考点\s+[^｜]+\｜(M0[2-6])\｜([^】]+)】/)
    if (moduleMatch) {
      console.log(`找到模块: ${moduleMatch[1]} - ${moduleMatch[2]}`)
      // 保存上一个模块
      if (currentModule && currentModuleLines.length > 0) {
        currentModule.content = currentModuleLines.join('\n').trim()
        if (currentStage) {
          currentStage.modules.push(currentModule)
        }
        currentModuleLines = []
      }
      
      // 创建新模块
      const moduleCode = moduleMatch[1]
      const moduleName = moduleMatch[2].trim()
      currentModule = {
        moduleCode,
        moduleName,
        content: ''
      }
      continue
    }
    
    // 收集模块内容
    if (currentModule) {
      currentModuleLines.push(line)
    } else if (currentStage && !currentModule) {
      if (line.trim() || currentModuleLines.length > 0) {
        currentModuleLines.push(line)
      }
    }
  }
  
  // 保存最后一个模块
  if (currentModule && currentModuleLines.length > 0) {
    currentModule.content = currentModuleLines.join('\n').trim()
    if (currentStage) {
      currentStage.modules.push(currentModule)
    }
  }
  
  // 保存最后一个阶段
  if (currentStage) {
    stages.push(currentStage)
  }
  
  return {
    stages,
    rawContent: content
  }
}

const result = parsePointContent(content)
console.log(`\n解析结果:`)
console.log(`阶段数: ${result.stages.length}`)
result.stages.forEach((stage, idx) => {
  console.log(`\n阶段 ${idx + 1}: ${stage.stageName}`)
  console.log(`  模块数: ${stage.modules.length}`)
  stage.modules.forEach((module: any) => {
    console.log(`    - ${module.moduleCode}: ${module.moduleName} (内容长度: ${module.content.length})`)
  })
})
