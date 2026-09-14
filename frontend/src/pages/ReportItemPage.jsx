import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createItem } from '../api/itemApi'
import DatePicker from '../components/DatePicker'
import {
  Sparkles,
  MapPin,
  Tag,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Check,
  ArrowRight,
  Circle,
} from 'lucide-react'

function ReportItemPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    type: 'LOST',
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

  const handleDateChange = (dateString) => {
    setFormData((prev) => ({
      ...prev,
      date: dateString,
    }))
    if (fieldErrors.date) {
      setFieldErrors((prev) => ({
        ...prev,
        date: '',
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    const title = formData.title.trim()
    const description = formData.description.trim()
    const category = formData.category.trim()
    const location = formData.location.trim()
    const date = formData.date.trim()
    const type = formData.type

    if (!title) {
      errors.title = 'Title is required and cannot be empty.'
    } else if (title.length > 100) {
      errors.title = 'Title cannot exceed 100 characters.'
    }

    if (!category) {
      errors.category = 'Category is required and cannot be empty.'
    } else if (category.length > 50) {
      errors.category = 'Category cannot exceed 50 characters.'
    }

    if (!location) {
      errors.location = 'Location is required and cannot be empty.'
    } else if (location.length > 100) {
      errors.location = 'Location cannot exceed 100 characters.'
    }

    if (!date) {
      errors.date = 'Date is required.'
    } else if (isNaN(new Date(date).getTime())) {
      errors.date = 'Please enter a valid date.'
    }

    if (!type || (type !== 'LOST' && type !== 'FOUND')) {
      errors.type = 'Please select either LOST or FOUND.'
    }

    if (!description) {
      errors.description = 'Description is required and cannot be empty.'
    } else if (description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters.'
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
      setGeneralError('Please fill in all required fields accurately.')
      return
    }

    setFieldErrors({})
    setLoading(true)

    const title = formData.title.trim()
    const description = formData.description.trim()
    const category = formData.category.trim()
    const location = formData.location.trim()
    const date = formData.date.trim()
    const type = formData.type

    try {
      const response = await createItem({
        title,
        description,
        category,
        location,
        date,
        type,
      })

      setSuccess('Item reported successfully! Redirecting to report details...')
      setTimeout(() => {
        if (response && response.id) {
          navigate(`/items/${response.id}`)
        } else {
          navigate('/')
        }
      }, 1200)
    } catch (err) {
      setGeneralError(
        err.message || 'Failed to submit report. Please check your network and try again.',
      )
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen pb-24 overflow-x-clip">
      {/* Subtle Ambient Glow Radial */}
      <div className="glow-mesh-subtle" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 pt-10 sm:pt-14">
        {/* Form Container */}
        <div className="glass-panel p-6 sm:p-10 md:p-12 shadow-2xl border border-slate-800/90 rounded-3xl relative overflow-visible">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RELINK COMMUNITY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
              Report an Item
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Help someone reconnect with something they&apos;ve lost — or report something you&apos;ve found on campus.
            </p>
          </div>

          {/* General Error Alert */}
          {generalError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-3 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-3 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7" noValidate>
            {/* 1. REPORT TYPE */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Report Type <span className="text-red-400 font-normal">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Lost Item Card */}
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'LOST' } })}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    formData.type === 'LOST'
                      ? 'bg-red-500/10 border-red-500/60 shadow-lg shadow-red-500/10 ring-1 ring-red-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      formData.type === 'LOST' ? 'bg-red-500/20 text-red-400' : 'bg-slate-900 text-slate-500'
                    }`}>
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100">
                        Lost Item
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-normal">I misplaced an item</div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                    formData.type === 'LOST'
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-slate-700 text-transparent'
                  }`}>
                    {formData.type === 'LOST' ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Circle className="w-2.5 h-2.5 text-slate-700" />
                    )}
                  </div>
                </button>

                {/* Found Item Card */}
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'FOUND' } })}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    formData.type === 'FOUND'
                      ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      formData.type === 'FOUND' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100">
                        Found Item
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-normal">I found an item</div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                    formData.type === 'FOUND'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-700 text-transparent'
                  }`}>
                    {formData.type === 'FOUND' ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Circle className="w-2.5 h-2.5 text-slate-700" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* 2. ITEM TITLE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="title" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Item Title <span className="text-red-400 font-normal">*</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {formData.title.length} / 100
                </span>
              </div>
              <input
                id="title"
                name="title"
                type="text"
                maxLength={100}
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Navy Blue HydroFlask 32oz with stickers"
                required
                disabled={loading || Boolean(success)}
                className={`w-full h-12 px-4 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.title
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              {fieldErrors.title && (
                <span className="text-[11px] text-red-400 mt-1 block font-medium">{fieldErrors.title}</span>
              )}
            </div>

            {/* 3. CATEGORY & DATE ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Category <span className="text-red-400 font-normal">*</span>
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="category"
                    name="category"
                    type="text"
                    maxLength={50}
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Electronics, Bags"
                    required
                    disabled={loading || Boolean(success)}
                    className={`w-full h-12 pl-10 pr-3.5 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.category
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
                {fieldErrors.category && (
                  <span className="text-[11px] text-red-400 mt-1 block font-medium">{fieldErrors.category}</span>
                )}
              </div>

              {/* Custom Dark DatePicker */}
              <div>
                <DatePicker
                  label={`Date ${formData.type === 'LOST' ? 'Lost' : 'Found'}`}
                  value={formData.date}
                  onChange={handleDateChange}
                  error={fieldErrors.date}
                  required={true}
                  disabled={loading || Boolean(success)}
                />
              </div>
            </div>

            {/* 4. CAMPUS LOCATION */}
            <div>
              <label htmlFor="location" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Campus Location <span className="text-red-400 font-normal">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  maxLength={100}
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Science Complex 3rd Floor, Room 302"
                  required
                  disabled={loading || Boolean(success)}
                  className={`w-full h-12 pl-10 pr-3.5 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.location
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {fieldErrors.location && (
                <span className="text-[11px] text-red-400 mt-1 block font-medium">{fieldErrors.location}</span>
              )}
            </div>

            {/* 5. DETAILED DESCRIPTION */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="description" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Detailed Description <span className="text-red-400 font-normal">*</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {formData.description.length} / 1000
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                rows={4}
                maxLength={1000}
                value={formData.description}
                onChange={handleChange}
                placeholder="Mention distinctive features, brand, color, condition, stickers, contents, or serial numbers..."
                required
                disabled={loading || Boolean(success)}
                className={`w-full min-h-[120px] p-3.5 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all resize-y ${
                  fieldErrors.description
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              {fieldErrors.description && (
                <span className="text-[11px] text-red-400 mt-1 block font-medium">{fieldErrors.description}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-slate-800/80">
              <Link
                to="/"
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading || Boolean(success)}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReportItemPage
