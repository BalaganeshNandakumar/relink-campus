import { apiClient } from './client'

/**
 * Fetch all items.
 * @returns {Promise<Array>} List of ItemResponse objects
 */
export async function getAllItems() {
  return apiClient('/api/items')
}

/**
 * Search and filter items with dynamic query parameters.
 * @param {Object} filters - { type, category, location, status }
 * @returns {Promise<Array>} List of filtered ItemResponse objects
 */
export async function searchItems(filters = {}) {
  const params = new URLSearchParams()

  if (filters.type && filters.type !== 'ALL') {
    params.append('type', filters.type)
  }
  if (filters.category && filters.category.trim()) {
    params.append('category', filters.category.trim())
  }
  if (filters.location && filters.location.trim()) {
    params.append('location', filters.location.trim())
  }
  if (filters.status && filters.status !== 'ALL') {
    params.append('status', filters.status)
  }

  const queryString = params.toString()
  const endpoint = queryString ? `/api/items/search?${queryString}` : '/api/items'
  return apiClient(endpoint)
}

/**
 * Report/create a new Lost or Found item.
 * @param {Object} itemData - { title, description, category, location, date, type }
 * @returns {Promise<Object>} ItemResponse from Spring Boot backend
 */
export async function createItem(itemData) {
  return apiClient('/api/items', {
    method: 'POST',
    body: itemData,
  })
}

/**
 * Get an item by its ID.
 * @param {string|number} id - Item ID
 * @returns {Promise<Object>} ItemResponse from Spring Boot backend
 */
export async function getItemById(id) {
  return apiClient(`/api/items/${id}`)
}

/**
 * Claim an item.
 * @param {string|number} id - Item ID
 * @returns {Promise<Object>} Updated ItemResponse
 */
export async function claimItem(id) {
  return apiClient(`/api/items/${id}/claim`, {
    method: 'PUT',
  })
}

/**
 * Mark a claimed item as returned.
 * @param {string|number} id - Item ID
 * @returns {Promise<Object>} Updated ItemResponse
 */
export async function returnItem(id) {
  return apiClient(`/api/items/${id}/return`, {
    method: 'PUT',
  })
}

/**
 * Update an existing item.
 * @param {string|number} id - Item ID
 * @param {Object} itemData - Updated item fields
 * @returns {Promise<Object>} Updated ItemResponse
 */
export async function updateItem(id, itemData) {
  return apiClient(`/api/items/${id}`, {
    method: 'PUT',
    body: itemData,
  })
}

/**
 * Delete an item by its ID.
 * @param {string|number} id - Item ID
 * @returns {Promise<null>}
 */
export async function deleteItem(id) {
  return apiClient(`/api/items/${id}`, {
    method: 'DELETE',
  })
}
