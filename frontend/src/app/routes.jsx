import { createBrowserRouter } from 'react-router-dom'
import DashboardView from '../views/DashboardView'
import AlertsView from '../views/AlertsView'

export const router = createBrowserRouter([
  { path: '/', element: <DashboardView /> },
  { path: '/alerts', element: <AlertsView /> },
])