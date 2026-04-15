import api from './api'

export const alertService = {
  async getAll(companyId) {
    const response = await api.get(`/alerts/company/${companyId}`)
    return response.data
  },

  async closeAlert(alertId, payload) {
    const response = await api.patch(`/alerts/${alertId}/close`, payload || {})
    return response.data
  },

  async updateWorkflow(alertId, payload) {
    const response = await api.patch(`/alerts/${alertId}/workflow`, payload)
    return response.data
  }
}
