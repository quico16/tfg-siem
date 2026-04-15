import axios from 'axios'

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const normalizedBaseUrl = envBaseUrl
  ? envBaseUrl.replace(/\/+$/, '')
  : '/api'

const api = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 10000
})

export default api
