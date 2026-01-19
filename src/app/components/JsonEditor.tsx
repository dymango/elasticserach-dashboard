'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  DocumentCheckIcon, 
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function JsonEditor({ value, onChange, placeholder }: JsonEditorProps) {
  const [error, setError] = useState<string>('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  // 同步滚动
  useEffect(() => {
    const textarea = textareaRef.current
    const lineNumbers = lineNumbersRef.current

    if (textarea && lineNumbers) {
      const handleScroll = () => {
        lineNumbers.scrollTop = textarea.scrollTop
      }

      textarea.addEventListener('scroll', handleScroll)
      return () => textarea.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // 格式化 JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(value)
      const formatted = JSON.stringify(parsed, null, 2)
      onChange(formatted)
      setError('')
    } catch (err) {
      setError('Invalid JSON format')
    }
  }

  // 压缩 JSON
  const minifyJson = () => {
    try {
      const parsed = JSON.parse(value)
      const minified = JSON.stringify(parsed)
      onChange(minified)
      setError('')
    } catch (err) {
      setError('Invalid JSON format')
    }
  }

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // 实时验证
    if (newValue.trim()) {
      try {
        JSON.parse(newValue)
        setError('')
      } catch (err) {
        setError('Invalid JSON')
      }
    } else {
      setError('')
    }
  }

  // 处理 Tab 键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)
      
      // 设置光标位置
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  // 获取行数
  const lineCount = value ? value.split('\n').length : 1

  return (
    <div className="flex-1 relative">
      <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">JSON Query</span>
            {error && (
              <div className="flex items-center gap-1 text-red-500">
                <ExclamationCircleIcon className="w-4 h-4" />
                <span className="text-xs">{error}</span>
              </div>
            )}
            {!error && value && (
              <div className="flex items-center gap-1 text-green-500">
                <DocumentCheckIcon className="w-4 h-4" />
                <span className="text-xs">Valid JSON</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={formatJson}
              className="p-1.5 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"
              title="Format JSON"
            >
              <DocumentCheckIcon className="w-4 h-4" />
            </button>
            <button
              onClick={minifyJson}
              className="p-1.5 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"
              title="Minify JSON"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Container */}
        <div className="relative flex h-[180px]">
          {/* Line Numbers */}
          <div 
            ref={lineNumbersRef}
            className="w-12 bg-gray-50 border-r border-gray-200 overflow-hidden select-none flex-shrink-0"
          >
            <div className="py-2 pr-2 text-right">
              {Array.from({ length: lineCount }, (_, i) => (
                <div 
                  key={i} 
                  className="text-xs text-gray-400 font-mono"
                  style={{ 
                    lineHeight: '1.4rem',
                    height: '1.4rem'
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="flex-1 relative overflow-hidden">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-full px-4 py-2 font-mono text-sm focus:outline-none bg-transparent block overflow-auto resize-none"
              spellCheck={false}
              style={{
                lineHeight: '1.4rem',
                tabSize: 2,
              }}
            />
            
            {/* Placeholder Example - 只在没有 placeholder prop 且没有 value 时显示 */}
            {!value && !placeholder && (
              <div className="absolute top-2 left-4 text-xs text-gray-400 pointer-events-none font-mono whitespace-pre">
{`{
  "query": {
    "match_all": {}
  }
}`}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {value.length} characters • {lineCount} lines
          </span>
          <span className="text-xs text-gray-500">
            Tab to indent • Ctrl+Enter to execute
          </span>
        </div>
      </div>
    </div>
  )
}