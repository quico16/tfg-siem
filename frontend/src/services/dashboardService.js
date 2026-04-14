import api from './api'

export const dashboardService = {
  getSummary: async (companyId) => {
    const res = await api.get(`/dashboard/company/${companyId}/summary`)
    return res.data
  },

  getLevels: async (companyId) => {
    const res = await api.get(`/dashboard/company/${companyId}/levels`)
    return res.data
  }
}