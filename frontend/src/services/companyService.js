import api from './api'

export const companyService = {
  getAll: async () => {
    const res = await api.get('/companies')
    return res.data
  }
}