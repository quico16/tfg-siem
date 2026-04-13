import api from './api'

export const alertService = {
  async getAll(companyId) {
    const response = await api.get(`/alerts/company/${companyId}`)
    return response.data
  },

  async getCrossCompany(companyIds, minAffectedCompanies) {
    const response = await api.get('/alerts/cross-company', {
      params: {
        companyIds: companyIds.join(','),
        minAffectedCompanies
      }
    })
    return response.data
  },

  async closeAlert(alertId) {
    const response = await api.patch(`/alerts/${alertId}/close`)
    return response.data
  }
}
