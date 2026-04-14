import api from './api'

export const logService = {
  getAll: async (companyId, start, end) => {
    const res = await api.get(`/logs/company/${companyId}`, {
      params: { start, end }
    })
    return res.data
  }
}