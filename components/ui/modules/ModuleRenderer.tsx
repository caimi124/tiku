/**
 * 模块渲染器
 * 
 * 根据模块类型渲染对应的组件
 */

'use client'

import type { Module } from '@/lib/knowledge/pointPage.types'
import { ExamMapModule } from './ExamMapModule'
import { ClassificationMapModule } from './ClassificationMapModule'
import { HighYieldModule } from './HighYieldModule'
import { CoreDrugsModule } from './CoreDrugsModule'
import { SourceMaterialModule } from './SourceMaterialModule'
import { ExamDistributionModule } from './ExamDistributionModule'

export interface ModuleRendererProps {
  module: Module
  content?: string // 原始内容（用于 sourceMaterial 模块）
  className?: string
}

export function ModuleRenderer({ module, content, className }: ModuleRendererProps) {
  switch (module.type) {
    case "examMap":
      return <ExamMapModule module={module} className={className} />
    case "classificationMap":
      return <ClassificationMapModule module={module} className={className} />
    case "highYield":
      return <HighYieldModule module={module} className={className} />
    case "coreDrugs":
      return <CoreDrugsModule module={module} className={className} />
    case "sourceMaterial":
      return <SourceMaterialModule module={module} content={content} className={className} />
    case "examDistribution":
      return <ExamDistributionModule module={module} className={className} />
    default:
      return null
  }
}

export default ModuleRenderer

