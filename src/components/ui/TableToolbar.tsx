import { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Dropdown from './DropDown';

interface FilterOption {
  value: string;
  label: string;
}

interface TableToolbarProps {
  title?: React.ReactNode;
  searchTerm?: string;
  setSearchTerm?: (val: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  activeFilter?: string;
  setActiveFilter?: (val: string) => void;
  page: number;
  setPage: (val: number | ((prev: number) => number)) => void;
  pageSize: string;
  setPageSize: (val: string) => void;
  hasNextPage: boolean;
}

const pageSizeOptions = [
  { value: '5', label: '5 rows' },
  { value: '10', label: '10 rows' },
  { value: '20', label: '20 rows' },
  { value: '50', label: '50 rows' }
];

export default function TableToolbar({
  title, searchTerm, setSearchTerm, searchPlaceholder = "Search...",
  filterOptions, activeFilter, setActiveFilter,
  page, setPage, pageSize, setPageSize, hasNextPage
}: TableToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-6 border-b border-gray-50 grid grid-cols-1 lg:grid-cols-2 items-center gap-4 bg-white/50 rounded-t-[2rem] relative z-20">
      
      {/* LEFT: Title, Search, and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-start gap-3 w-full">
        {title && (
          <div className="mr-auto w-full sm:w-auto">
            {title}
          </div>
        )}

        {setSearchTerm !== undefined && (
          <div className="relative w-full sm:w-64 z-10 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
              <Search size={14} strokeWidth={3} />
            </div>
            <input 
              type="text" 
              placeholder={searchPlaceholder} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-brand-dark outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark hover:bg-gray-100 p-1 rounded-full transition-colors flex items-center justify-center"
                title="Clear search"
              >
                <X size={14} strokeWidth={3} />
              </button>
            )}
          </div>
        )}

        {filterOptions && setActiveFilter && (
          <div className="relative w-full sm:w-44 z-20" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-full pl-10 pr-4 py-2.5 flex items-center justify-between bg-white border rounded-xl text-sm font-bold outline-none transition-all ${
                isFilterOpen ? 'border-brand-green ring-2 ring-brand-green/10' : 'border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <span className="text-brand-dark">
                {filterOptions.find(opt => opt.value === activeFilter)?.label || 'Filter'}
              </span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 animate-fade-in">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setActiveFilter(opt.value);
                      setIsFilterOpen(false);
                      setPage(1); // Reset page on filter change
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center justify-between transition-colors hover:bg-brand-green/5 hover:text-brand-green"
                  >
                    <span className={activeFilter === opt.value ? 'text-brand-green' : 'text-gray-600'}>
                      {opt.label}
                    </span>
                    {activeFilter === opt.value && <Check size={16} className="text-brand-green" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Pagination Controls */}
      <div className="flex items-center justify-start lg:justify-end gap-4 w-full bg-white/50 p-1.5 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Show:</span>
          <div className="w-28">
            <Dropdown 
              value={pageSize}
              onChange={(val) => { setPageSize(val); setPage(1); }}
              options={pageSizeOptions}
              placeholder="10 rows"
              size="sm"
            />
          </div>
        </div>

        <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Page {page}</span>
          <div className="flex gap-1.5">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ChevronLeft size={14} strokeWidth={3} className="text-gray-600" />
            </button>
            <button 
              disabled={!hasNextPage}
              onClick={() => setPage(p => p + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ChevronRight size={14} strokeWidth={3} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}