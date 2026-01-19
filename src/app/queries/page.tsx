'use client'

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import QuerySearch from '../components/QuerySearch'
import ResultCard from '../components/ResultCard'
import Pagination from '../components/Pagination'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export default function QueriesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [results, setResults] = useState<any[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchTime, setSearchTime] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState('')
  const [currentQuery, setCurrentQuery] = useState('')

  // 计算实际可翻页的最大页数：总文档数 / 每页数量，但不超过 10000 / 每页数量
  const maxAllowedResults = 10000
  const effectiveTotal = Math.min(totalResults, maxAllowedResults)
  const totalPages = Math.ceil(effectiveTotal / pageSize)

  const executeSearch = async (index: string, query: string, page: number, size: number) => {
    try {
      setLoading(true)
      setCurrentIndex(index)
      setCurrentQuery(query)

      const response = await fetch('/api/elasticsearch/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          index,
          query,
          page,
          pageSize: size
        })
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.data.results)
        setTotalResults(data.data.total)
        setSearchTime(data.data.took)
        setCurrentPage(page)
      } else {
        alert('Search failed: ' + data.error)
        setResults([])
        setTotalResults(0)
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('Error executing search. Please check your connection.')
      setResults([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (index: string, query: string, page: number, size: number) => {
    executeSearch(index, query, page, size)
  }

  const handlePageChange = (page: number) => {
    if (currentIndex && currentQuery) {
      executeSearch(currentIndex, currentQuery, page, pageSize)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    if (currentIndex && currentQuery) {
      executeSearch(currentIndex, currentQuery, 1, newSize)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* 固定左侧 Sidebar */}
      <div className="fixed left-0 top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      
      {/* 主内容区域 - 添加左边距以避免被 Sidebar 遮挡 */}
      <main className="flex-1 bg-white ml-[280px]">
        {/* Header */}
        <header className="bg-[#003d5c] text-white px-8 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Queries</h1>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Search Section */}
          <div className="mb-8">
            <QuerySearch onSearch={handleSearch} />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003d5c] mb-4"></div>
              <p className="text-gray-600">Executing query...</p>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <>
              {/* Results Info */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600">
                  Found <span className="font-semibold">{totalResults.toLocaleString()}</span> results
                  {totalResults > maxAllowedResults && (
                    <span className="ml-2 text-orange-600 font-medium">
                      (showing first {maxAllowedResults.toLocaleString()})
                    </span>
                  )}
                  {searchTime !== null && (
                    <span className="ml-2 text-gray-500">
                      (took {searchTime}ms)
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Page size:</span>
                  <div className="relative">
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="space-y-4 mb-8">
                {results.map((result, index) => (
                  <ResultCard 
                    key={result._id} 
                    data={result} 
                    index={(currentPage - 1) * pageSize + index}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="py-6 border-t">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    maxResults={maxAllowedResults}
                    totalResults={totalResults}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && totalResults === 0 && currentIndex && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm">Try adjusting your query</p>
            </div>
          )}

          {/* Initial State */}
          {!loading && !currentIndex && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium">Ready to search</p>
              <p className="text-sm">Select an index and execute a query to see results</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}