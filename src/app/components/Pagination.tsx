'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  maxResults: number
  totalResults: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  maxResults,
  totalResults,
  pageSize,
  onPageChange 
}: PaginationProps) {
  // 最大可翻页数 = 10000 / 每页数量
  const maxPages = Math.min(totalPages, Math.floor(maxResults / pageSize))
  
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (maxPages <= maxVisible) {
      for (let i = 1; i <= maxPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(maxPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      
      if (currentPage < maxPages - 2) pages.push('...')
      pages.push(maxPages)
    }
    
    return pages
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          &lt; Prev
        </button>

        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`
                w-10 h-10 text-sm font-medium rounded-lg transition-colors
                ${currentPage === page
                  ? 'bg-[#003d5c] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-2 text-gray-400">
              {page}
            </span>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === maxPages}
          className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next &gt;
        </button>
      </div>

      {/* 分页信息提示 */}
      <div className="text-xs text-gray-500 flex items-center gap-4">
        <span>
          Page {currentPage} of {maxPages}
        </span>
        {totalResults > maxResults && (
          <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded">
            ⚠ Limited to first {maxResults.toLocaleString()} results (max {maxPages} pages at {pageSize} per page)
          </span>
        )}
      </div>
    </div>
  )
}