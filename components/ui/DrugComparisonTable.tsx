/**
 * DrugComparisonTable 组件
 * 表格形式展示药物对比，支持横向滚动
 * 
 * Requirements: 3.3
 */

'use client'

import React from 'react'
import { KeywordHighlight } from './KeywordHighlight'

export interface DrugComparisonData {
  headers: string[]
  rows: {
    label: string
    values: string[]
  }[]
}

export interface DrugComparisonTableProps {
  data: DrugComparisonData
  title?: string
  className?: string
  enableHighlight?: boolean
}

export function DrugComparisonTable({
  data,
  title,
  className = '',
  enableHighlight = true
}: DrugComparisonTableProps) {
  const renderCell = (text: string) => {
    if (enableHighlight) {
      return <KeywordHighlight text={text} />
    }
    return text
  }

  return (
    <div className={`rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {title && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 sticky left-0 bg-gray-50 z-10">
                对比项
              </th>
              {data.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-800 border-b border-gray-100 sticky left-0 bg-inherit z-10">
                  {row.label}
                </td>
                {row.values.map((value, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100"
                  >
                    {renderCell(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * 简化的药物对比卡片
 */
export interface SimpleDrugComparisonProps {
  drug1: {
    name: string
    features: string[]
  }
  drug2: {
    name: string
    features: string[]
  }
  title?: string
  className?: string
}

export function SimpleDrugComparison({
  drug1,
  drug2,
  title,
  className = ''
}: SimpleDrugComparisonProps) {
  return (
    <div className={`rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {title && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        {/* Drug 1 */}
        <div className="p-4">
          <h4 className="font-semibold text-blue-700 mb-3">{drug1.name}</h4>
          <ul className="space-y-2">
            {drug1.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-400 mt-1">•</span>
                <KeywordHighlight text={feature} />
              </li>
            ))}
          </ul>
        </div>
        
        {/* Drug 2 */}
        <div className="p-4">
          <h4 className="font-semibold text-green-700 mb-3">{drug2.name}</h4>
          <ul className="space-y-2">
            {drug2.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-400 mt-1">•</span>
                <KeywordHighlight text={feature} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
