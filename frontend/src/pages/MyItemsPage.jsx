import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAllItems } from '../api/itemApi'
import {
  FolderClock,
  PlusCircle,
  MapPin,
  Tag,
  Calendar,
  ArrowRight,
  Package,
  HelpCircle,
  CheckCircle2,
  Clock,
  Handshake,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'

function MyItemsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('ALL')

  const fetchMyItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const allItems = await getAllItems()
      const userItems = (allItems || []).filter(
        (item) =>
          user && item.userId != null && Number(item.userId) === Number(user.id),
      )
      setItems(userItems)
    } catch (err) {
      setError(err.message || 'Failed to load your reported items from the registry.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchMyItems()
    }
  }, [user, fetchMyItems])

  // Calculate dynamic counts
  const counts = useMemo(() => {
    const all = items.length
    const lost = items.filter((item) => item.type === 'LOST').length
    const found = items.filter((item) => item.type === 'FOUND').length
    const active = items.filter((item) => item.status === 'ACTIVE').length
    const claimed = items.filter((item) => item.status === 'CLAIMED').length
    const returned = items.filter((item) => item.status === 'RETURNED').length

    return { all, lost, found, active, claimed, returned }
  }, [items])

  // Filter items based on selected tab without API request
  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'LOST':
        return items.filter((item) => item.type === 'LOST')
      case 'FOUND':
        return items.filter((item) => item.type === 'FOUND')
      case 'ACTIVE':
        return items.filter((item) => item.status === 'ACTIVE')
      case 'CLAIMED':
        return items.filter((item) => item.status === 'CLAIMED')
      case 'RETURNED':
        return items.filter((item) => item.status === 'RETURNED')
      case 'ALL':
      default:
        return items
    }
  }, [items, activeTab])

  // Dynamic empty state message
  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'LOST':
        return {
          title: 'No lost items reported yet',
          description: 'Have you misplaced something on campus? Report it so fellow students and staff can help find it.',
          showReportButton: true,
        }
      case 'FOUND':
        return {
          title: 'No found items reported yet',
          description: 'Found an item on campus? Report it to help safely return it to its owner.',
          showReportButton: true,
        }
      case 'ACTIVE':
        return {
          title: 'No active items',
          description: 'You currently have no open reports awaiting claim or return.',
          showReportButton: true,
        }
      case 'CLAIMED':
        return {
          title: 'No claimed items',
          description: 'None of your reported items are currently in claimed status.',
          showReportButton: false,
        }
      case 'RETURNED':
        return {
          title: 'No returned items',
          description: 'None of your reported items have been marked as returned yet.',
          showReportButton: false,
        }
      case 'ALL':
      default:
        return {
          title: "You haven't reported any items yet",
          description: 'Have you lost something or found an item on campus? Submit a report now to connect with the community.',
          showReportButton: true,
        }
    }
  }

  const emptyContent = getEmptyStateContent()

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      <div className="glow-mesh-subtle" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 sm:pt-14">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
              <FolderClock className="w-3.5 h-3.5" />
              <span>RELINK DASHBOARD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              My Items
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage the items you&apos;ve reported on ReLink.
            </p>
          </div>

          <Link
            to="/report"
            className="self-start md:self-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New Item</span>
          </Link>
        </div>

        {/* Filter Tabs Segmented Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl mb-8 overflow-x-auto max-w-full backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>All Items</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
              activeTab === 'ALL' ? 'bg-indigo-800/80 text-indigo-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LOST')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'LOST'
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Lost</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
              activeTab === 'LOST' ? 'bg-red-800/80 text-red-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {counts.lost}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FOUND')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'FOUND'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Found</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
              activeTab === 'FOUND' ? 'bg-emerald-800/80 text-emerald-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {counts.found}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Active</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
              activeTab === 'ACTIVE' ? 'bg-indigo-800/80 text-indigo-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {counts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CLAIMED')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'CLAIMED'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Handshake className="w-3.5 h-3.5 text-amber-300" />
            <span>Claimed</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
              activeTab === 'CLAIMED' ? 'bg-amber-800/80 text-amber-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {counts.claimed}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RETURNED')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'RETURNED'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Returned</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
              activeTab === 'RETURNED' ? 'bg-slate-800 text-slate-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {counts.returned}
            </span>
          </button>
        </div>

        {/* Loading Skeleton Grid */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
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
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 shrink-0 text-red-400" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchMyItems}
              className="px-4 py-2 rounded-xl text-xs font-bold text-red-300 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-100 mb-2">{emptyContent.title}</h4>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              {emptyContent.description}
            </p>
            <div className="flex justify-center gap-3">
              {emptyContent.showReportButton && (
                <Link
                  to="/report"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
                >
                  Report an Item
                </Link>
              )}
              {activeTab !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('ALL')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  View All ({counts.all})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Item Cards Grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
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
                  <span>Manage Report</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyItemsPage
