'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState } from 'react'

interface PaginationProps {
  current: number
  pages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  itemName?: string
}

export function Pagination({ current, pages, total, limit, onPageChange, itemName = 'items' }: PaginationProps) {
  const [goToPage, setGoToPage] = useState('')

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(goToPage, 10)
    if (page >= 1 && page <= pages) {
      onPageChange(page)
      setGoToPage('')
    }
  }

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = []
    
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) pageNumbers.push(i)
    } else {
      pageNumbers.push(1)
      if (current > 3) pageNumbers.push('...')
      
      const start = Math.max(2, current - 1)
      const end = Math.min(pages - 1, current + 1)
      
      for (let i = start; i <= end; i++) pageNumbers.push(i)
      
      if (current < pages - 2) pageNumbers.push('...')
      pageNumbers.push(pages)
    }
    return pageNumbers
  }

  if (pages <= 1) return null

  const startItem = ((current - 1) * limit) + 1
  const endItem = Math.min(current * limit, total)

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {total} {itemName}
      </div>
      
      <div className="flex items-center gap-2">
        {/* First Page */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(1)} 
          disabled={current === 1}
          className="hidden sm:flex"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        
        {/* Previous */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(current - 1)} 
          disabled={current === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>
        
        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
            ) : (
              <Button
                key={page}
                variant={current === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`min-w-[36px] ${current === page ? 'bg-blue-600 text-white' : ''}`}
              >
                {page}
              </Button>
            )
          ))}
        </div>
        
        {/* Next */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(current + 1)} 
          disabled={current === pages}
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        {/* Last Page */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(pages)} 
          disabled={current === pages}
          className="hidden sm:flex"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
        
        {/* Go to Page - only show when more than 10 pages */}
        {pages > 10 && (
          <form onSubmit={handleGoToPage} className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
            <input
              type="number"
              min="1"
              max={pages}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              placeholder="#"
              className="w-14 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
            <Button type="submit" variant="outline" size="sm" disabled={!goToPage}>
              Go
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
