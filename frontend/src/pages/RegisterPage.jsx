import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/authApi'
import {
  Link2,
  User,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    const trimmedName = formData.name.trim()
    const trimmedEmail = formData.email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!trimmedName) {
      errors.name = 'Full name is required.'
    } else if (trimmedName.length > 50) {
      errors.name = 'Name cannot exceed 50 characters.'
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required.'
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid campus email address.'
    } else if (trimmedEmail.length > 100) {
      errors.email = 'Email cannot exceed 100 characters.'
    }

    if (!formData.password) {
      errors.password = 'Password is required.'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')
    setSuccess('')

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setGeneralError('Please fill out all registration fields correctly.')
      return
    }

    setFieldErrors({})
    setLoading(true)

    const trimmedName = formData.name.trim()
    const trimmedEmail = formData.email.trim()

    try {
      const response = await register(trimmedName, trimmedEmail, formData.password)
      setSuccess(
        (response && response.message) ||
          'Account created successfully! Redirecting to sign in...',
      )
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      setGeneralError(
        err.message || 'Registration failed. Please verify your email and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="glow-mesh-subtle" />

      <div className="max-w-md w-full relative z-10">
        <div className="glass-panel p-8 sm:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mx-auto mb-3">
              <Link2 className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase mb-1">
              ReLink • CAMPUS COMMUNITY
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Join ReLink
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Help reconnect lost belongings with the people they belong to.
            </p>
          </div>

          {/* General Error Alert */}
          {generalError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={50}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Johnson"
                  autoComplete="name"
                  disabled={loading || Boolean(success)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.name
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <span className="text-[11px] text-red-400 mt-1 block">{fieldErrors.name}</span>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Campus Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={100}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. alex@campus.edu"
                  autoComplete="email"
                  disabled={loading || Boolean(success)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <span className="text-[11px] text-red-400 mt-1 block">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  disabled={loading || Boolean(success)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.password ? (
                <span className="text-[11px] text-red-400 mt-1 block">{fieldErrors.password}</span>
              ) : (
                <span className="text-[11px] text-slate-500 mt-1 block">Minimum 8 characters</span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  disabled={loading || Boolean(success)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <span className="text-[11px] text-red-400 mt-1 block">{fieldErrors.confirmPassword}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || Boolean(success)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 ml-1"
              >
                <span>Sign in here</span>
                <Sparkles className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
