import { apiClient } from './client'

/**
 * Log in a user using email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} LoginResponse from Spring Boot backend
 */
export async function login(email, password) {
  return apiClient('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

/**
 * Register a new user with name, email, and password.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} UserResponse from Spring Boot backend
 */
export async function register(name, email, password) {
  return apiClient('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  })
}
