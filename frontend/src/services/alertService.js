import api from './api'

export const alertService = {
  getAll: async (companyId, startDate, endDate, onlyOpen = true) => {
    const res = await api.get('/alerts', {
      params: { companyId, startDate, endDate, onlyOpen }
    })
    return res.data
  },

  closeAlert: async (alertId) => {
    const res = await api.patch(`/alerts/${alertId}/close`)
    return res.data
  }
}