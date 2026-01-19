'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import JsonEditor from './JsonEditor'

interface QuerySearchProps {
  onSearch: (index: string, query: string, page: number, pageSize: number) => void
  onIndicesLoad?: (indices: string[]) => void
}

interface Index {
  name: string
  docCount: number
  size: string
}

export default function QuerySearch({ onSearch, onIndicesLoad }: QuerySearchProps) {
  const [indices, setIndices] = useState<Index[]>([])
  const [selectedIndex, setSelectedIndex] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // 默认加载 match_all 查询
  useEffect(() => {
    const defaultQuery = JSON.stringify({
      query: {
        match_all: {}
      }
    }, null, 2)
    setQuery(defaultQuery)
  }, [])

  // 加载索引列表
  useEffect(() => {
    const fetchIndices = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/elasticsearch/indices')
        const data = await response.json()

        if (data.success) {
          setIndices(data.data)
          if (data.data.length > 0) {
            setSelectedIndex(data.data[0].name)
          }
          
          // 通知父组件索引列表
          if (onIndicesLoad) {
            onIndicesLoad(data.data.map((idx: Index) => idx.name))
          }
        } else {
          console.error('Failed to load indices:', data.error)
          alert('Failed to load indices: ' + data.error)
        }
      } catch (error) {
        console.error('Error loading indices:', error)
        alert('Error loading indices. Please check your Elasticsearch connection.')
      } finally {
        setLoading(false)
      }
    }

    fetchIndices()
  }, [onIndicesLoad])

  const handleSearch = () => {
    // 如果没有输入，使用默认的 match_all 查询
    let searchQuery = query.trim()
    
    if (!searchQuery) {
      searchQuery = JSON.stringify({
        query: {
          match_all: {}
        }
      }, null, 2)
    }
    
    // 验证 JSON
    try {
      JSON.parse(searchQuery)
      onSearch(selectedIndex, searchQuery, 1, 10) // 重置到第一页，默认10条
    } catch (err) {
      alert('Please enter valid JSON')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter 执行搜索
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        {/* Index Selector */}
        <div className="relative">
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(e.target.value)}
            disabled={loading || indices.length === 0}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <option>Loading...</option>
            ) : indices.length === 0 ? (
              <option>No indices found</option>
            ) : (
              indices.map((index) => (
                <option key={index.name} value={index.name}>
                  {index.name}
                </option>
              ))
            )}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex-1"></div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!selectedIndex || loading}
          className="px-6 py-3 bg-[#003d5c] text-white rounded-lg text-sm font-medium hover:bg-[#004d6d] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Execute Query
        </button>
      </div>

      {/* JSON Editor */}
      <div onKeyDown={handleKeyPress}>
        <JsonEditor
          value={query}
          onChange={setQuery}
        />
      </div>

      {/* Quick Tips */}
      <div className="flex items-center gap-6 text-xs text-gray-500 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
        <span className="font-medium text-blue-700">💡 Quick Tips:</span>
        <span>• Tab for indent</span>
        <span>• Ctrl/Cmd + Enter to execute</span>
        <span>• Use format button to beautify</span>
        <span>• Empty query will use match_all</span>
      </div>
    </div>
  )
}