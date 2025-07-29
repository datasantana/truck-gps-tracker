/**
 * Date utility functions for GPS tracking application
 */

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time', 'datetime')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }
  
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
    datetime: { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    }
  }
  
  return d.toLocaleDateString('en-US', options[format] || options.short)
}

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date} Parsed Date object
 */
export function parseDate(dateString) {
  if (!dateString) return null
  
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Get date range between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Array} Array of date strings
 */
export function getDateRange(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates = []
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return dates
  }
  
  const currentDate = new Date(start)
  while (currentDate <= end) {
    dates.push(formatDateISO(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} ISO date string
 */
export function formatDateISO(date) {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

/**
 * Get today's date as ISO string
 * @returns {string} Today's date in ISO format
 */
export function getToday() {
  return formatDateISO(new Date())
}

/**
 * Get yesterday's date as ISO string
 * @returns {string} Yesterday's date in ISO format
 */
export function getYesterday() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDateISO(yesterday)
}

/**
 * Get date N days ago as ISO string
 * @param {number} days - Number of days ago
 * @returns {string} Date N days ago in ISO format
 */
export function getDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDateISO(date)
}

/**
 * Get start of current week as ISO string
 * @returns {string} Start of week in ISO format
 */
export function getStartOfWeek() {
  const date = new Date()
  const day = date.getDay()
  const diff = date.getDate() - day
  date.setDate(diff)
  return formatDateISO(date)
}

/**
 * Get end of current week as ISO string
 * @returns {string} End of week in ISO format
 */
export function getEndOfWeek() {
  const date = new Date()
  const day = date.getDay()
  const diff = date.getDate() - day + 6
  date.setDate(diff)
  return formatDateISO(date)
}

/**
 * Get start of current month as ISO string
 * @returns {string} Start of month in ISO format
 */
export function getStartOfMonth() {
  const date = new Date()
  date.setDate(1)
  return formatDateISO(date)
}

/**
 * Get end of current month as ISO string
 * @returns {string} End of month in ISO format
 */
export function getEndOfMonth() {
  const date = new Date()
  date.setMonth(date.getMonth() + 1, 0)
  return formatDateISO(date)
}

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  const d = new Date(date)
  const today = new Date()
  
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate()
}

/**
 * Check if date is within range
 * @param {Date|string} date - Date to check
 * @param {Date|string} startDate - Start of range
 * @param {Date|string} endDate - End of range
 * @returns {boolean} True if date is within range
 */
export function isDateInRange(date, startDate, endDate) {
  const d = new Date(date)
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return d >= start && d <= end
}

/**
 * Calculate difference between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @param {string} unit - Unit of difference ('days', 'hours', 'minutes', 'seconds')
 * @returns {number} Difference in specified unit
 */
export function dateDifference(date1, date2, unit = 'days') {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffMs = Math.abs(d2 - d1)
  
  const units = {
    seconds: diffMs / 1000,
    minutes: diffMs / (1000 * 60),
    hours: diffMs / (1000 * 60 * 60),
    days: diffMs / (1000 * 60 * 60 * 24)
  }
  
  return units[unit] || 0
}

/**
 * Add days to a date
 * @param {Date|string} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date with days added
 */
export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Add hours to a date
 * @param {Date|string} date - Base date
 * @param {number} hours - Number of hours to add
 * @returns {Date} New date with hours added
 */
export function addHours(date, hours) {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

/**
 * Format duration from seconds
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }
  
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string} date - Date to compare
 * @param {Date|string} baseDate - Base date for comparison (default: now)
 * @returns {string} Relative time string
 */
export function getRelativeTime(date, baseDate = new Date()) {
  const d = new Date(date)
  const base = new Date(baseDate)
  const diffMs = d - base
  const diffSeconds = Math.abs(diffMs) / 1000
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  
  if (diffSeconds < 60) {
    return rtf.format(Math.sign(diffMs) * Math.round(diffSeconds), 'second')
  } else if (diffSeconds < 3600) {
    return rtf.format(Math.sign(diffMs) * Math.round(diffSeconds / 60), 'minute')
  } else if (diffSeconds < 86400) {
    return rtf.format(Math.sign(diffMs) * Math.round(diffSeconds / 3600), 'hour')
  } else {
    return rtf.format(Math.sign(diffMs) * Math.round(diffSeconds / 86400), 'day')
  }
}

/**
 * Validate date string
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date string
 */
export function isValidDate(dateString) {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Get timezone offset string
 * @returns {string} Timezone offset (e.g., "+02:00")
 */
export function getTimezoneOffset() {
  const offset = new Date().getTimezoneOffset()
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const sign = offset <= 0 ? '+' : '-'
  
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}