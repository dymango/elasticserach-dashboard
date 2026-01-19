'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { 
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline'

interface IndexInfo {
  index: string
  health: string
  status: string
  docsCount: number
  storeSize: string
  primaryShards: number
  replicas: number
}

type SortField = keyof IndexInfo
type SortOrder = 'asc' | 'desc'

export default function IndicesPage() {
  const [indices, setIndices] = useState<IndexInfo[]>([])
  const [filteredIndices, setFilteredIndices] = useState<IndexInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('index')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // 加载索引数据
  useEffect(() => {
    fetchIndices()
  }, [])

  // 搜索过滤
  useEffect(() => {
    if (searchTerm) {
      const filtered = indices.filter(index =>
        index.index.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredIndices(filtered)
    } else {
      setFilteredIndices(indices)
    }
  }, [searchTerm, indices])

  const fetchIndices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/elasticsearch/indices/details')
      const data = await response.json()

      if (data.success) {
        setIndices(data.data)
        setFilteredIndices(data.data)
      } else {
        alert('Failed to load indices: ' + data.error)
      }
    } catch (error) {
      console.error('Error loading indices:', error)
      alert('Error loading indices. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // 排序处理
  const handleSort = (field: SortField) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortOrder(newOrder)

    const sorted = [...filteredIndices].sort((a, b) => {
      let aVal = a[field]
      let bVal = b[field]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return newOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return newOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })

    setFilteredIndices(sorted)
  }

  // 获取健康状态颜色
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'green':
        return 'text-green-600 bg-green-50'
      case 'yellow':
        return 'text-yellow-600 bg-yellow-50'
      case 'red':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    return status === 'open' 
      ? 'text-blue-600 bg-blue-50' 
      : 'text-gray-600 bg-gray-50'
  }

  // 渲染排序图标
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />
    }
    return sortOrder === 'asc' 
      ? <ArrowUpIcon className="w-4 h-4 text-blue-600" />
      : <ArrowDownIcon className="w-4 h-4 text-blue-600" />
  }

  // 计算总分片数：主分片数 × 副本数
  const calculateTotalShards = () => {
    return filteredIndices.reduce((sum, idx) => {
      return sum + (idx.primaryShards * idx.replicas)
    }, 0)
  }

  return (
    <div className="flex min-h-screen">
      {/* 固定左侧 Sidebar */}
      <div className="fixed left-0 top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      
      {/* 主内容区域 */}
      <main className="flex-1 bg-gray-50 ml-[280px]">
        {/* Header */}
        <header className="bg-[#003d5c] text-white px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-semibold">Indices</h1>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Top Bar */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 min-w-[400px]">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search indices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <button
                  onClick={fetchIndices}
                  disabled={loading}
                  className="px-4 py-2 bg-[#003d5c] text-white rounded-lg text-sm font-medium hover:bg-[#004d6d] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                {filteredIndices.length} {filteredIndices.length === 1 ? 'index' : 'indices'}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003d5c] mb-4"></div>
              <p className="text-gray-600">Loading indices...</p>
            </div>
          )}

          {/* Table */}
          {!loading && filteredIndices.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('index')}
                      >
                        <div className="flex items-center gap-2">
                          Index
                          {renderSortIcon('index')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('health')}
                      >
                        <div className="flex items-center gap-2">
                          Health
                          {renderSortIcon('health')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {renderSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('docsCount')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Docs Count
                          {renderSortIcon('docsCount')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('storeSize')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Store Size
                          {renderSortIcon('storeSize')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('primaryShards')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Primary Shards
                          {renderSortIcon('primaryShards')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('replicas')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Replicas
                          {renderSortIcon('replicas')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredIndices.map((index) => (
                      <tr 
                        key={index.index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {index.index}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(index.health)}`}>
                            {index.health}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(index.status)}`}>
                            {index.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-mono">
                          {index.docsCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-mono">
                          {index.storeSize}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center font-mono">
                          {index.primaryShards}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center font-mono">
                          {index.replicas}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && filteredIndices.length === 0 && searchTerm && (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900">No indices found</p>
              <p className="text-sm text-gray-500">Try adjusting your search term</p>
            </div>
          )}

          {/* No Indices */}
          {!loading && indices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-medium text-gray-900">No indices available</p>
              <p className="text-sm text-gray-500">Create an index to get started</p>
            </div>
          )}

          {/* Summary Stats */}
          {!loading && filteredIndices.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm font-medium text-gray-600">Total Indices</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {filteredIndices.length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm font-medium text-gray-600">Total Documents</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {filteredIndices.reduce((sum, idx) => sum + idx.docsCount, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm font-medium text-gray-600">Health Status</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-green-600 bg-green-50">
                    {filteredIndices.filter(i => i.health === 'green').length} Green
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-yellow-600 bg-yellow-50">
                    {filteredIndices.filter(i => i.health === 'yellow').length} Yellow
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-red-600 bg-red-50">
                    {filteredIndices.filter(i => i.health === 'red').length} Red
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm font-medium text-gray-600">Total Shards</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {calculateTotalShards()}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}