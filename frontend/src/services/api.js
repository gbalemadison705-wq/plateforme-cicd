import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

// Instance axios avec configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Authentification
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
}

// Repositories
export const repositoryService = {
  getAll: () => api.get('/repositories'),
  create: (data) => api.post('/repositories', data),
  getById: (id) => api.get(`/repositories/${id}`),
  delete: (id) => api.delete(`/repositories/${id}`)
}

// Builds
export const buildService = {
  getAll: () => api.get('/builds'),
  getById: (id) => api.get(`/builds/${id}`),
  getStats: () => api.get('/builds/stats')
}

export default api