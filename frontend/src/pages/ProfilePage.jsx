import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAllItems } from '../api/itemApi'
import {
  User as UserIcon,
  Mail,
  Shield,
  LogOut,
  Package,
  HelpCircle,
  CheckCircle2,
  Clock,
  Handshake,
  PlusCircle,
  FolderClock,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUserItems = useCallback(async () => {
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
      setError(
        err.message ||
          'Failed to load your account statistics. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchUserItems()
    }
  }, [user, fetchUserItems])

  const stats = useMemo(() => {
    const totalReported = items.length
    const lostItems = items.filter((i) => i.type === 'LOST').length
    const foundItems = items.filter((i) => i.type === 'FOUND').length
    const activeItems = items.filter((i) => i.status === 'ACTIVE').length
    const claimedItems = items.filter((i) => i.status === 'CLAIMED').length
    const returnedItems = items.filter((i) => i.status === 'RETURNED').length

    return {
      totalReported,
      lostItems,
      foundItems,
      activeItems,
      claimedItems,
      returnedItems,
    }
  }, [items])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      <div className="glow-mesh-subtle" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 sm:pt-14">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <UserIcon className="w-3.5 h-3.5" />
            <span>Account Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Profile &amp; Contributions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your campus credentials and review your activity summary
          </p>
        </div>

        {/* Profile Card */}
        <div className="glass-panel p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-xl font-extrabold text-white shadow-xl shadow-indigo-600/30 shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-100">
                    {user?.name || 'Campus Member'}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 uppercase tracking-wider">
                    <Shield className="w-3 h-3" />
                    Verified Member
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{user?.email || 'No email provided'}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Member ID: #{user?.id || '—'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchUserItems}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-300 bg-red-500/20 hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Activity Statistics Grid */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Contribution Metrics
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-24 rounded-2xl bg-slate-900/60 animate-shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Total Reported */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100">{stats.totalReported}</div>
                  <div className="text-[11px] font-medium text-slate-400">Total Reported</div>
                </div>
              </div>

              {/* Lost Items */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100">{stats.lostItems}</div>
                  <div className="text-[11px] font-medium text-slate-400">Lost Items</div>
                </div>
              </div>

              {/* Found Items */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100">{stats.foundItems}</div>
                  <div className="text-[11px] font-medium text-slate-400">Found Items</div>
                </div>
              </div>

              {/* Active Cases */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100">{stats.activeItems}</div>
                  <div className="text-[11px] font-medium text-slate-400">Active Cases</div>
                </div>
              </div>

              {/* Claimed Items */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100">{stats.claimedItems}</div>
                  <div className="text-[11px] font-medium text-slate-400">Claimed</div>
                </div>
              </div>

              {/* Returned Items */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100">{stats.returnedItems}</div>
                  <div className="text-[11px] font-medium text-slate-400">Returned</div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Quick Navigation
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/report"
              className="glass-card p-5 flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                  <span>Report New Item</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit a new lost or found report to ReLink
                </p>
              </div>
            </Link>

            <Link
              to="/my-items"
              className="glass-card p-5 flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                <FolderClock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                  <span>Manage My Items</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  View, edit, or track status of items you have submitted
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProfilePage
