import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ContractPagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 8,
  onPageChange,
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 text-xs text-slate-500 dark:text-slate-400">
      <div>
        Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startItem}–{endItem}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</span> contracts
      </div>

      <div className="flex items-center gap-1.5 self-start sm:self-auto">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {pageNumbers.slice(0, 5).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              currentPage === page
                ? 'bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {page}
          </button>
        ))}

        {totalPages > 5 && (
          <>
            <span className="px-1 text-slate-400">...</span>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentPage === totalPages
                  ? 'bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
