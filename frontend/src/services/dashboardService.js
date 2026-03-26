import api from './api'

export const dashboardService = {
  getSummary: async (companyId, startDate, endDate) => {
    const res = await api.get('/dashboard/summary', {
      params: { companyId, startDate, endDate }
    })
    return res.data
  },

  getLevels: async (companyId, startDate, endDate) => {
    const res = await api.get('/dashboard/levels', {
      params: { companyId, startDate, endDate }
    })
    return res.data
  }
}