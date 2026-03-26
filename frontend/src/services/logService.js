import api from './api'

export const logService = {
  getAll: async (companyId, startDate, endDate) => {
    const res = await api.get('/logs', {
      params: { companyId, startDate, endDate }
    })
    return res.data
  }
}