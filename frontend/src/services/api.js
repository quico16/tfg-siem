import axios from 'axios'

// Local-first setup:
// Vite dev server proxies /api to the backend in localhost.
// This keeps frontend code independent from deployed URLs.
const normalizedBaseUrl = '/api'

const api = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 60000
})

export default api
