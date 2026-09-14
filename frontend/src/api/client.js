const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

/**
 * Centralized fetch-based API client for communicating with the Spring Boot backend.
 * Automatically attaches JWT from localStorage and handles authentication failures.
 *
 * @param {string} endpoint - API path (e.g., '/api/items')
 * @param {Object} options - Request options (method, body, headers, etc.)
 * @returns {Promise<any>} Parsed response data
 */
export async function apiClient(endpoint, { method = 'GET', body, headers = {}, ...customOptions } = {}) {
  // 1. Read JWT from localStorage
  const token = localStorage.getItem('token')

  // 2. Build request headers
  const defaultHeaders = {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }

  const config = {
    method,
    headers: defaultHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...customOptions,
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  let response
  try {
    response = await fetch(url, config)
  } catch {
    const error = new Error('Cannot connect to the server. Please check your network connection or verify that the backend is running.')
    error.status = 0
    throw error
  }

  // 3. Handle 204 No Content
  if (response.status === 204) {
    return null
  }

  // 4. Parse response body
  let data = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else {
    try {
      data = await response.text()
    } catch {
      data = null
    }
  }

  // 5. Handle error responses (including 401 unauthorized cleanup)
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }

    const rawMsg =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      (typeof data === 'string' && data) ||
      ''

    // Detect internal server stack traces or leaks
    const isUnsafe =
      !rawMsg ||
      rawMsg.includes('Exception') ||
      rawMsg.includes('org.springframework') ||
      rawMsg.includes('java.') ||
      rawMsg.includes('SQL') ||
      rawMsg.includes('Hibernate') ||
      rawMsg.includes('trace') ||
      rawMsg.includes('<!DOCTYPE') ||
      rawMsg.length > 200

    let errorMessage = rawMsg
    if (isUnsafe) {
      if (response.status === 401) {
        errorMessage = 'Please log in to continue.'
      } else if (response.status === 403) {
        errorMessage = 'You are not allowed to perform this action.'
      } else if (response.status === 404) {
        errorMessage = 'Item not found.'
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
      } else {
        errorMessage = 'Something went wrong. Please try again.'
      }
    }

    const error = new Error(errorMessage)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
