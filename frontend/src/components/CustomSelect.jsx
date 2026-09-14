import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Check, Search, X } from 'lucide-react'

function CustomSelect({
  label,
  icon: Icon,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  searchable = false,
  searchPlaceholder = 'Search...',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)
  const listRef = useRef(null)

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value)

  // Filter options if searchable
  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase().trim()),
      )
    : options

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Focus search input on open if searchable
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }
  }, [isOpen, searchable])

  const handleSelect = useCallback(
    (optionValue) => {
      onChange(optionValue)
      setIsOpen(false)
      setSearchTerm('')
      setFocusedIndex(-1)
    },
    [onChange],
  )

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
        setFocusedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setFocusedIndex(-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        )
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[focusedIndex].value)
        }
        break
      default:
        break
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-12 px-3.5 flex items-center justify-between gap-2.5 rounded-xl border text-left text-sm transition-all duration-150 cursor-pointer focus:outline-none ${
          isOpen
            ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10'
            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-100 hover:bg-slate-900/60'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {Icon && (
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isOpen || value ? 'text-indigo-400' : 'text-slate-500'
              }`}
            />
          )}

          <div className="flex items-center gap-2 truncate">
            {selectedOption?.dotColor && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: selectedOption.dotColor }}
              />
            )}
            <span
              className={`truncate font-medium ${
                value ? 'text-slate-100 font-semibold' : 'text-slate-400'
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && value !== '' && value !== 'ALL' && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                handleSelect('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  handleSelect('')
                }
              }}
              className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-indigo-400' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ minWidth: '220px' }}
        >
          {/* Search Input inside Dropdown (if searchable) */}
          {searchable && (
            <div className="p-2 border-b border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setFocusedIndex(0)
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-56 overflow-y-auto p-1.5 space-y-0.5"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-slate-500">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value
                const isFocused = index === focusedIndex

                return (
                  <div
                    key={opt.value || 'all'}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/20'
                        : isFocused
                          ? 'bg-slate-800/80 text-slate-100'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.dotColor && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: opt.dotColor }}
                        />
                      )}
                      {opt.icon && (
                        <opt.icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-indigo-400' : 'text-slate-400'
                          }`}
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomSelect
