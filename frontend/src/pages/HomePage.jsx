import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { searchItems } from '../api/itemApi'
import CustomSelect from '../components/CustomSelect'
import {
  Search,
  PlusCircle,
  MapPin,
  Tag,
  Calendar,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Package,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Filter,
  X,
} from 'lucide-react'

function HomePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search & Filter Form state (in-flight inputs)
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    type: '',
    status: '',
  })

  // Applied query params (used for active search requests)
  const [appliedFilters, setAppliedFilters] = useState({
    category: '',
    location: '',
    type: '',
    status: '',
  })

  const fetchItems = useCallback(async (searchParams = {}) => {
    setLoading(true)
    setError('')
    try {
      const data = await searchItems(searchParams)
      setItems(data || [])
    } catch (err) {
      setError(err.message || 'Unable to connect to the campus registry. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems(appliedFilters)
  }, [appliedFilters, fetchItems])

  // Statistics calculated from current items array
  const stats = useMemo(() => {
    const total = items.length
    const lost = items.filter((i) => i.type === 'LOST').length
    const found = items.filter((i) => i.type === 'FOUND').length
    const active = items.filter((i) => i.status === 'ACTIVE').length
    return { total, lost, found, active }
  }, [items])

  // Dynamically extract unique categories from items or fall back to default campus categories
  const categoryOptions = useMemo(() => {
    const uniqueFromItems = Array.from(
      new Set(
        items
          .map((i) => i.category)
          .filter((c) => c && typeof c === 'string' && c.trim().length > 0)
          .map((c) => c.trim()),
      ),
    )

    // Predefined common categories if registry is empty
    const defaults = [
      'Electronics',
      'Bags & Backpacks',
      'Keys & Cards',
      'Clothing & Accessories',
      'Books & Stationery',
      'Personal Belongings',
    ]

    const allCategories = Array.from(new Set([...uniqueFromItems, ...defaults]))

    return [
      { value: '', label: 'All Categories' },
      ...allCategories.map((cat) => ({
        value: cat,
        label: cat,
      })),
    ]
  }, [items])

  // Item Type Options
  const typeOptions = [
    { value: '', label: 'All Items', icon: Package },
    { value: 'LOST', label: 'Lost Items', dotColor: '#f87171' },
    { value: 'FOUND', label: 'Found Items', dotColor: '#4ade80' },
  ]

  // Status Options
  const statusOptions = [
    { value: '', label: 'All Statuses', icon: Clock },
    { value: 'ACTIVE', label: 'Active', dotColor: '#818cf8' },
    { value: 'CLAIMED', label: 'Claimed', dotColor: '#fbbf24' },
    { value: 'RETURNED', label: 'Returned', dotColor: '#34d399' },
  ]

  const handleLocationChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      location: e.target.value,
    }))
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setAppliedFilters({ ...filters })
  }

  const handleClearFilters = () => {
    const emptyFilters = {
      category: '',
      location: '',
      type: '',
      status: '',
    }
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  // Remove individual active filter chip and update search immediately
  const handleRemoveFilter = (filterKey) => {
    const updated = {
      ...appliedFilters,
      [filterKey]: '',
    }
    setFilters((prev) => ({
      ...prev,
      [filterKey]: '',
    }))
    setAppliedFilters(updated)
  }

  const hasActiveFilters =
    Boolean(appliedFilters.category) ||
    Boolean(appliedFilters.location) ||
    Boolean(appliedFilters.type) ||
    Boolean(appliedFilters.status)

  const scrollToSearch = () => {
    const el = document.getElementById('search-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="relative min-h-screen pb-24 overflow-x-clip">
      {/* Subtle Background Glow Radial */}
      <div className="glow-mesh" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 sm:pt-16">
        {/* ================================================== */}
        {/* 1. HERO SECTION                                    */}
        {/* ================================================== */}
        <section className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>CAMPUS COMMUNITY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-extrabold text-slate-100 tracking-tight leading-[1.12] mb-6">
            Lost something?{' '}
            <span className="block mt-1 bg-gradient-to-r from-indigo-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              Let&apos;s ReLink it.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
            A smarter way for your campus community to report, discover, and return lost belongings.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report an Item</span>
            </Link>

            <button
              type="button"
              onClick={scrollToSearch}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Browse Items</span>
            </button>
          </div>
        </section>

        {/* ================================================== */}
        {/* 2. STATISTICS SECTION                               */}
        {/* ================================================== */}
        <section className="mb-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-md">
            {/* Total Items */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-900/70 border border-slate-800/50 flex items-center gap-4 transition-all duration-200 hover:bg-slate-800/60 hover:border-slate-700">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-none tracking-tight">
                  {stats.total}
                </div>
                <div className="text-xs font-medium text-slate-400 mt-1">Total Reported</div>
              </div>
            </div>

            {/* Lost Items */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-900/70 border border-slate-800/50 flex items-center gap-4 transition-all duration-200 hover:bg-slate-800/60 hover:border-slate-700">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-none tracking-tight">
                  {stats.lost}
                </div>
                <div className="text-xs font-medium text-slate-400 mt-1">Lost Items</div>
              </div>
            </div>

            {/* Found Items */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-900/70 border border-slate-800/50 flex items-center gap-4 transition-all duration-200 hover:bg-slate-800/60 hover:border-slate-700">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-none tracking-tight">
                  {stats.found}
                </div>
                <div className="text-xs font-medium text-slate-400 mt-1">Found Items</div>
              </div>
            </div>

            {/* Active Cases */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-900/70 border border-slate-800/50 flex items-center gap-4 transition-all duration-200 hover:bg-slate-800/60 hover:border-slate-700">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-none tracking-tight">
                  {stats.active}
                </div>
                <div className="text-xs font-medium text-slate-400 mt-1">Active Cases</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 3. REDESIGNED SEARCH & FILTER PANEL                 */}
        {/* ================================================== */}
        <section id="search-section" className="mb-12 relative z-30">
          <div className="glass-panel p-6 sm:p-8 shadow-2xl border border-slate-800/90 rounded-2xl relative overflow-visible">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 border-b border-slate-800/70 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Registry Search</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                  Find an Item
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Search the campus registry by category, location, type, or status.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            {/* Filter Controls Grid */}
            <form onSubmit={handleSearchSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Category Dropdown */}
                <CustomSelect
                  label="Category"
                  icon={Tag}
                  value={filters.category}
                  onChange={(val) => setFilters((prev) => ({ ...prev, category: val }))}
                  options={categoryOptions}
                  placeholder="All categories"
                  searchable={true}
                  searchPlaceholder="Search categories..."
                />

                {/* 2. Campus Location Input */}
                <div>
                  <label htmlFor="location-search" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Campus Location
                  </label>
                  <div className="relative">
                    <MapPin className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                      filters.location ? 'text-indigo-400' : 'text-slate-500'
                    }`} />
                    <input
                      id="location-search"
                      name="location"
                      type="text"
                      value={filters.location}
                      onChange={handleLocationChange}
                      placeholder="Search location..."
                      className="w-full h-12 pl-10 pr-9 bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                    />
                    {filters.location && (
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, location: '' }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                        title="Clear location"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Item Type Dropdown */}
                <CustomSelect
                  label="Item Type"
                  icon={Package}
                  value={filters.type}
                  onChange={(val) => setFilters((prev) => ({ ...prev, type: val }))}
                  options={typeOptions}
                  placeholder="All Items"
                />

                {/* 4. Status Dropdown */}
                <CustomSelect
                  label="Status"
                  icon={Clock}
                  value={filters.status}
                  onChange={(val) => setFilters((prev) => ({ ...prev, status: val }))}
                  options={statusOptions}
                  placeholder="All Statuses"
                />
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/70">
                {/* Active Filter Chips */}
                <div className="w-full sm:w-auto flex items-center gap-2 flex-wrap">
                  {hasActiveFilters ? (
                    <>
                      <span className="text-xs font-semibold text-slate-500 mr-1">
                        Active filters:
                      </span>
                      {appliedFilters.category && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <span>Category: {appliedFilters.category}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFilter('category')}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {appliedFilters.location && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <span>Location: &quot;{appliedFilters.location}&quot;</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFilter('location')}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {appliedFilters.type && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <span>Type: {appliedFilters.type === 'LOST' ? 'Lost Items' : 'Found Items'}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFilter('type')}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {appliedFilters.status && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <span>Status: {appliedFilters.status}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFilter('status')}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">
                      Showing all reports in the registry
                    </span>
                  )}
                </div>

                {/* Search CTA Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Items</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ================================================== */}
        {/* 4. RESULTS SECTION & ITEM CARDS GRID               */}
        {/* ================================================== */}
        <section className="relative z-10">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>Reported Items</span>
              {!loading && (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-indigo-400 text-xs font-bold border border-slate-700/60">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </h3>
          </div>

          {/* Loading Skeleton Grid */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 animate-shimmer"
                >
                  <div className="flex justify-between">
                    <div className="w-16 h-6 rounded-full bg-slate-800" />
                    <div className="w-16 h-6 rounded-full bg-slate-800" />
                  </div>
                  <div className="w-3/4 h-5 rounded-md bg-slate-800" />
                  <div className="space-y-2">
                    <div className="w-full h-3.5 rounded bg-slate-800" />
                    <div className="w-2/3 h-3.5 rounded bg-slate-800" />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 space-y-2">
                    <div className="w-1/2 h-3 rounded bg-slate-800" />
                    <div className="w-2/3 h-3 rounded bg-slate-800" />
                  </div>
                  <div className="w-24 h-4 rounded bg-slate-800 ml-auto" />
                </div>
              ))}
            </div>
          )}

          {/* Error Alert State */}
          {error && !loading && (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 shrink-0 text-red-400" />
                <span className="text-sm font-medium">{error}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchItems(appliedFilters)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-red-300 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && items.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 max-w-xl mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-100 mb-2">No matching items found</h4>
              <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                {hasActiveFilters
                  ? 'Try adjusting your search criteria or reset your filters to view all campus reports.'
                  : 'There are currently no items reported in the registry. Be the first to report something!'}
              </p>
              <div className="flex justify-center gap-3">
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <Link
                    to="/report"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
                  >
                    Report an Item
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Item Cards Grid */}
          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={`/items/${item.id}`}
                  className="glass-card p-5 flex flex-col group text-left cursor-pointer"
                >
                  {/* Badges Row */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                        item.type === 'LOST' ? 'badge-lost' : 'badge-found'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.type === 'LOST' ? 'bg-red-400' : 'bg-emerald-400'
                        }`}
                      />
                      {item.type}
                    </span>

                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                        item.status === 'ACTIVE'
                          ? 'badge-active'
                          : item.status === 'CLAIMED'
                            ? 'badge-claimed'
                            : 'badge-returned'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
                    {item.title}
                  </h4>

                  {/* Description Preview */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {item.description || 'No additional details provided.'}
                  </p>

                  {/* Metadata Container */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 mb-4 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        Category
                      </span>
                      <span className="font-semibold text-slate-200">{item.category}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Location
                      </span>
                      <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                        {item.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Date
                      </span>
                      <span className="font-semibold text-slate-200">{item.date}</span>
                    </div>
                  </div>

                  {/* Card Action Link */}
                  <div className="flex items-center justify-end gap-1 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors pt-1">
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default HomePage
