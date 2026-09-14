import { useState, useRef, useEffect, useCallback } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'

function DatePicker({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  placeholder = 'Select date...',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Parse initial date from "YYYY-MM-DD"
  const parseDateString = (dateStr) => {
    if (!dateStr) return new Date()
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const d = new Date(year, month, day)
      if (!isNaN(d.getTime())) return d
    }
    return new Date()
  }

  const currentDateObj = parseDateString(value)
  const [viewYear, setViewYear] = useState(currentDateObj.getFullYear())
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth())

  // Synchronize view month/year if value changes externally
  useEffect(() => {
    if (value) {
      const d = parseDateString(value)
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [value])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handlePrevMonth = (e) => {
    e.stopPropagation()
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const year = parts[0]
        const monthIdx = parseInt(parts[1], 10) - 1
        const day = parseInt(parts[2], 10)
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        ]
        return `${day} ${monthNames[monthIdx]} ${year}`
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  const handleDaySelect = (day, isCurrentMonth, e) => {
    e.stopPropagation()
    if (!isCurrentMonth) return

    const formattedMonth = String(viewMonth + 1).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`

    onChange(dateStr)
    setIsOpen(false)
  }

  const handleSelectToday = (e) => {
    e.stopPropagation()
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    setViewYear(year)
    setViewMonth(today.getMonth())
    onChange(dateStr)
    setIsOpen(false)
  }

  // Generate calendar grid matrix
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay() // 0 = Sun
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()

  const calendarDays = []
  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
    })
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
    })
  }
  // Next month padding (to fill 35 or 42 grid cells)
  const remainingCells = 42 - calendarDays.length
  if (remainingCells < 7) {
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push({
        day: i,
        isCurrentMonth: false,
      })
    }
  } else {
    const fillCount = 35 - calendarDays.length
    for (let i = 1; i <= fillCount; i++) {
      calendarDays.push({
        day: i,
        isCurrentMonth: false,
      })
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const weekDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  // Check if a day is today
  const today = new Date()
  const isToday = (day, isCurrentMonth) =>
    isCurrentMonth &&
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear()

  // Check if a day is selected
  const isSelected = (day, isCurrentMonth) => {
    if (!value || !isCurrentMonth) return false
    const parts = value.split('-')
    if (parts.length === 3) {
      return (
        parseInt(parts[0], 10) === viewYear &&
        parseInt(parts[1], 10) === viewMonth + 1 &&
        parseInt(parts[2], 10) === day
      )
    }
    return false
  }

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {label && (
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-400 font-normal">*</span>}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full h-12 px-3.5 flex items-center justify-between gap-2.5 rounded-xl border text-left text-sm transition-all duration-150 cursor-pointer focus:outline-none ${
          error
            ? 'border-red-500 bg-slate-950/80 focus:ring-1 focus:ring-red-500'
            : isOpen
              ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10'
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-100 hover:bg-slate-900/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isOpen || value ? 'text-indigo-400' : 'text-slate-500'
            }`}
          />
          <span
            className={`truncate font-medium ${
              value ? 'text-slate-100 font-semibold' : 'text-slate-500'
            }`}
          >
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>

        {value && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                onChange('')
              }
            }}
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {error && (
        <span className="text-[11px] text-red-400 mt-1 block font-medium">
          {error}
        </span>
      )}

      {/* Custom Dark Calendar Popup */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 z-50 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 select-none"
        >
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-xs font-bold text-slate-100 tracking-tight">
              {monthNames[viewMonth]} {viewYear}
            </h4>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDayNames.map((d) => (
              <span key={d} className="text-[11px] font-bold text-slate-500 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              const selected = isSelected(item.day, item.isCurrentMonth)
              const todayDate = isToday(item.day, item.isCurrentMonth)

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDaySelect(item.day, item.isCurrentMonth, e)}
                  disabled={!item.isCurrentMonth}
                  className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all mx-auto ${
                    !item.isCurrentMonth
                      ? 'text-slate-700 opacity-40 cursor-default'
                      : selected
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : todayDate
                          ? 'border border-indigo-500/50 text-indigo-300 hover:bg-slate-800'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white cursor-pointer'
                  }`}
                >
                  {item.day}
                </button>
              )
            })}
          </div>

          {/* Today Button Footer */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              Today: {today.getDate()} {monthNames[today.getMonth()].slice(0, 3)}
            </span>
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-md hover:bg-indigo-500/10 transition-colors"
            >
              Select Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
