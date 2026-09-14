import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getItemById,
  claimItem,
  returnItem,
  deleteItem,
  updateItem,
} from '../api/itemApi'
import {
  ArrowLeft,
  MapPin,
  Tag,
  Calendar,
  User,
  ShieldCheck,
  RotateCcw,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Handshake,
  Sparkles,
} from 'lucide-react'

function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false)
  const [editFieldErrors, setEditFieldErrors] = useState({})
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    type: 'LOST',
  })

  const fetchItem = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getItemById(id)
      setItem(data)
      setEditFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        location: data.location || '',
        date: data.date ? data.date.toString() : '',
        type: data.type || 'LOST',
      })
    } catch (err) {
      if (err.status === 401) {
        setError('Please log in to continue.')
      } else if (err.status === 403) {
        setError('You are not authorized to view this record.')
      } else if (err.status === 404) {
        setError('This item could not be found in the registry.')
      } else {
        setError(err.message || 'Failed to load item details. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchItem()
    }
  }, [id, fetchItem])

  const getErrorMessage = (err, defaultMsg) => {
    if (err.status === 401) return 'Please log in to continue.'
    if (err.status === 403) return 'You do not have permission to perform this action.'
    if (err.status === 404) return 'Item not found.'
    return err.message || defaultMsg || 'Something went wrong. Please try again.'
  }

  const handleClaim = async () => {
    if (actionLoading) return
    setActionError('')
    setActionSuccess('')
    setActionLoading(true)

    try {
      await claimItem(id)
      await fetchItem()
      setActionSuccess('Item successfully claimed! Coordinate handoff with the campus community.')
    } catch (err) {
      setActionError(
        getErrorMessage(
          err,
          'Failed to claim item. It may have already been claimed by another user.',
        ),
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleReturn = async () => {
    if (actionLoading) return
    const confirmed = window.confirm(
      'Have you successfully returned this item to its rightful owner?',
    )
    if (!confirmed) return

    setActionError('')
    setActionSuccess('')
    setActionLoading(true)

    try {
      await returnItem(id)
      await fetchItem()
      setActionSuccess('Item successfully marked as returned! Thank you for helping the campus community.')
    } catch (err) {
      setActionError(
        getErrorMessage(
          err,
          'Failed to mark item as returned. Please try again.',
        ),
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (actionLoading || deleteLoading) return
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this report? This action cannot be undone.',
    )
    if (!confirmed) return

    setActionError('')
    setActionSuccess('')
    setDeleteLoading(true)

    try {
      await deleteItem(id)
      navigate('/my-items')
    } catch (err) {
      setActionError(
        getErrorMessage(
          err,
          'Failed to delete item. You may not have permission.',
        ),
      )
      setDeleteLoading(false)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (editFieldErrors[name]) {
      setEditFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleCancelEdit = () => {
    if (item) {
      setEditFormData({
        title: item.title || '',
        description: item.description || '',
        category: item.category || '',
        location: item.location || '',
        date: item.date ? item.date.toString() : '',
        type: item.type || 'LOST',
      })
    }
    setEditFieldErrors({})
    setIsEditing(false)
    setActionError('')
  }

  const validateEditForm = () => {
    const errors = {}
    const title = editFormData.title.trim()
    const description = editFormData.description.trim()
    const category = editFormData.category.trim()
    const location = editFormData.location.trim()
    const date = editFormData.date.trim()
    const type = editFormData.type

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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')

    const errors = validateEditForm()
    if (Object.keys(errors).length > 0) {
      setEditFieldErrors(errors)
      setActionError('Please fix the errors before saving.')
      return
    }

    setEditFieldErrors({})
    setActionLoading(true)

    const title = editFormData.title.trim()
    const description = editFormData.description.trim()
    const category = editFormData.category.trim()
    const location = editFormData.location.trim()
    const date = editFormData.date.trim()
    const type = editFormData.type

    try {
      await updateItem(id, {
        title,
        description,
        category,
        location,
        date,
        type,
      })
      await fetchItem()
      setIsEditing(false)
      setActionSuccess('Item report updated successfully!')
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to update item details.'))
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Authorization checks
  const isOwner =
    user && item && item.userId != null && Number(user.id) === Number(item.userId)
  const isClaimer =
    user &&
    item &&
    item.claimedByUserId != null &&
    Number(user.id) === Number(item.claimedByUserId)

  const reporterDisplay = isOwner
    ? 'You (Owner)'
    : item?.reporterName || item?.userName || `Campus User #${item?.userId || '—'}`

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass-panel p-8 space-y-6 animate-shimmer">
          <div className="w-32 h-4 rounded bg-slate-800" />
          <div className="w-3/4 h-8 rounded bg-slate-800" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-16 rounded-xl bg-slate-900" />
            ))}
          </div>
          <div className="h-32 rounded-xl bg-slate-900" />
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="glass-panel p-8">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 mb-2">Item Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">{error || 'This report does not exist or has been removed.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Registry</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      <div className="glow-mesh-subtle" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 sm:pt-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Items</span>
          </Link>

          <span className="text-xs font-medium text-slate-500 font-mono">
            ID #{item.id}
          </span>
        </div>

        {/* Action Alerts */}
        {actionError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {isEditing ? (
          /* ================================================== */
          /* EDIT FORM MODE                                     */
          /* ================================================== */
          <div className="glass-panel p-6 sm:p-8">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <span>Edit Item Report</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Make corrections or provide updated location information.
              </p>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-type" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Report Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="edit-type"
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                    disabled={actionLoading}
                  >
                    <option value="LOST">Lost Item (I lost something)</option>
                    <option value="FOUND">Found Item (I found something)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-date" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="edit-date"
                    name="date"
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={handleEditChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                    disabled={actionLoading}
                  />
                  {editFieldErrors.date && (
                    <span className="text-[11px] text-red-400 mt-1 block">{editFieldErrors.date}</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="edit-title" className="block text-xs font-semibold text-slate-300">
                    Item Title <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {editFormData.title.length} / 100
                  </span>
                </div>
                <input
                  id="edit-title"
                  name="title"
                  type="text"
                  required
                  maxLength={100}
                  value={editFormData.title}
                  onChange={handleEditChange}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  disabled={actionLoading}
                />
                {editFieldErrors.title && (
                  <span className="text-[11px] text-red-400 mt-1 block">{editFieldErrors.title}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-category" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="edit-category"
                    name="category"
                    type="text"
                    required
                    maxLength={50}
                    value={editFormData.category}
                    onChange={handleEditChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                    disabled={actionLoading}
                  />
                  {editFieldErrors.category && (
                    <span className="text-[11px] text-red-400 mt-1 block">{editFieldErrors.category}</span>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-location" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Campus Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="edit-location"
                    name="location"
                    type="text"
                    required
                    maxLength={100}
                    value={editFormData.location}
                    onChange={handleEditChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                    disabled={actionLoading}
                  />
                  {editFieldErrors.location && (
                    <span className="text-[11px] text-red-400 mt-1 block">{editFieldErrors.location}</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="edit-description" className="block text-xs font-semibold text-slate-300">
                    Detailed Description <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {editFormData.description.length} / 1000
                  </span>
                </div>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={4}
                  required
                  maxLength={1000}
                  value={editFormData.description}
                  onChange={handleEditChange}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                  disabled={actionLoading}
                />
                {editFieldErrors.description && (
                  <span className="text-[11px] text-red-400 mt-1 block">{editFieldErrors.description}</span>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
                >
                  {actionLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ================================================== */
          /* TWO-COLUMN DETAIL VIEW                             */
          /* ================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2 cols): Core Item Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-6 sm:p-8 space-y-6">
                {/* Badges & Title */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
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
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
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

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                    {item.title}
                  </h1>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="space-y-1">
                    <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      Category
                    </span>
                    <span className="text-sm font-semibold text-slate-200 block">
                      {item.category || 'General'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      Location
                    </span>
                    <span className="text-sm font-semibold text-slate-200 block">
                      {item.location || 'Campus'}
                    </span>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-900">
                    <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Reported Date
                    </span>
                    <span className="text-sm font-semibold text-slate-200 block">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-900">
                    <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Reporter
                    </span>
                    <span className="text-sm font-semibold text-slate-200 block">
                      {reporterDisplay}
                    </span>
                  </div>
                </div>

                {/* Detailed Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Full Description
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                    {item.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (1 col): Status & Workflow Action Panel */}
            <div className="space-y-6">
              <div className="glass-panel p-6 space-y-5">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Resolution Workflow</span>
                  </h3>
                </div>

                {/* Status: ACTIVE */}
                {item.status === 'ACTIVE' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This item is active in the registry. If you recognize or have retrieved this item, click below to claim it.
                    </p>

                    {!isOwner ? (
                      <button
                        type="button"
                        onClick={handleClaim}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        <Handshake className="w-4 h-4" />
                        <span>{actionLoading ? 'Claiming Item...' : 'Claim This Item'}</span>
                      </button>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs">
                        You reported this item. Reporters cannot claim their own reports.
                      </div>
                    )}
                  </div>
                )}

                {/* Status: CLAIMED */}
                {item.status === 'CLAIMED' && (
                  <div className="space-y-4">
                    {isClaimer ? (
                      <>
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs space-y-1">
                          <strong className="block font-bold">Claimed by: You</strong>
                          <p className="text-slate-300">
                            Once you have handed over the item to its owner, please confirm the return.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleReturn}
                          disabled={actionLoading}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{actionLoading ? 'Confirming...' : 'Mark as Returned'}</span>
                        </button>
                      </>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                        <strong className="block font-bold mb-1">🔒 Claimed by another user</strong>
                        <p className="text-slate-400">
                          {isOwner && item.claimedByUserId
                            ? `Claimed by User #${item.claimedByUserId}. Awaiting handoff confirmation.`
                            : 'This item is currently pending return confirmation.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Status: RETURNED */}
                {item.status === 'RETURNED' && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Case Resolved</span>
                    </div>
                    <p className="text-slate-300">
                      This item has been successfully returned to its verified owner.
                    </p>
                  </div>
                )}

                {/* Owner Controls */}
                {isOwner && (
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Owner Actions
                    </span>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        disabled={actionLoading || deleteLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={actionLoading || deleteLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deleteLoading ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemDetailPage
