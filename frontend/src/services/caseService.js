import api from './api'

export const caseService = {
  async getAll() {
    const response = await api.get('/cases')
    return response.data
  },

  async create(payload) {
    const response = await api.post('/cases', payload)
    return response.data
  },

  async updateStatus(caseId, status) {
    const response = await api.patch(`/cases/${caseId}/status`, { status })
    return response.data
  }
}
