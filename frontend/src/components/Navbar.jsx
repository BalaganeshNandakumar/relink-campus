import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Link2,
  Compass,
  PlusCircle,
  FolderClock,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
  LogIn,
} from 'lucide-react'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMobileMenuOpen(false)
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <header className="glass-nav sticky top-0 z-50 w-full transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <Link2 className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-slate-100 tracking-tight flex items-center gap-1.5">
              ReLink
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-0.5">
              CAMPUS COMMUNITY
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 rounded-full px-2 py-1.5 backdrop-blur-md shadow-inner">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 ${
              isActive('/')
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover</span>
          </Link>

          <Link
            to="/report"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 ${
              isActive('/report')
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Item</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/my-items"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 ${
                  isActive('/my-items')
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                <FolderClock className="w-3.5 h-3.5" />
                <span>My Items</span>
              </Link>

              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 ${
                  isActive('/profile')
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Profile</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Section: Auth User vs Guest Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <Link
                to="/profile"
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-800/60 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {getInitials(user?.name)}
                </div>
                <div className="flex flex-col text-left pr-1">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors leading-tight">
                    {user?.name || 'Account'}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    ID #{user?.id || '—'}
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join Now</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none border border-slate-800"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Discover Items</span>
          </Link>

          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive('/report')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Lost or Found</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-items"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/my-items')
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <FolderClock className="w-4 h-4" />
                <span>My Reported Items</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>My Profile ({user?.name})</span>
              </Link>

              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 border border-slate-800"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600"
              >
                <Sparkles className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
