'use client'

interface ResultCardProps {
  data: any
  index?: number
}

export default function ResultCard({ data, index }: ResultCardProps) {
  // 提取特殊字段
  const { _id, _index, _score, ...sourceData } = data

  // 递归渲染 JSON 对象
  const renderJsonValue = (value: any, depth: number = 0): React.ReactNode => {
    const indent = '  '.repeat(depth)
    
    if (value === null) {
      return <span className="text-gray-400">null</span>
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-orange-500">{value.toString()}</span>
    }
    
    if (typeof value === 'number') {
      return <span className="text-purple-600">{value}</span>
    }
    
    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span>[]</span>
      return (
        <>
          {'[\n'}
          {value.map((item, i) => (
            <span key={i}>
              {indent}  {renderJsonValue(item, depth + 1)}
              {i < value.length - 1 ? ',' : ''}
              {'\n'}
            </span>
          ))}
          {indent}{']'}
        </>
      )
    }
    
    if (typeof value === 'object') {
      const entries = Object.entries(value)
      if (entries.length === 0) return <span>{'{}'}</span>
      
      return (
        <>
          {'{\n'}
          {entries.map(([key, val], i) => (
            <span key={key}>
              {indent}  <span className="text-blue-600 font-semibold">"{key}"</span>: {renderJsonValue(val, depth + 1)}
              {i < entries.length - 1 ? ',' : ''}
              {'\n'}
            </span>
          ))}
          {indent}{'}'}
        </>
      )
    }
    
    return <span>{String(value)}</span>
  }

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
      {/* Meta 信息 */}
      <div className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-200">
        {index !== undefined && (
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
            #{index + 1}
          </span>
        )}
        <span className="text-xs text-gray-600">
          Index: <span className="text-blue-600 font-medium">{_index}</span>
        </span>
        <span className="text-xs text-gray-600">
          ID: <span className="text-purple-600 font-medium">{_id}</span>
        </span>
      </div>

      {/* 数据内容 - 自定义高亮 */}
      <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-gray-800">
          {renderJsonValue(sourceData)}
        </pre>
      </div>
    </div>
  )
}