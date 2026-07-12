import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Trips from './pages/Trips'
import Maintenance from './pages/Maintenance'
import FuelExpenses from './pages/FuelExpenses'
import Reports from './pages/Reports'

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<ProtectedRoute routeKey="dashboard"><Dashboard /></ProtectedRoute>} />
              <Route path="/vehicles" element={<ProtectedRoute routeKey="vehicles"><Vehicles /></ProtectedRoute>} />
              <Route path="/drivers" element={<ProtectedRoute routeKey="drivers"><Drivers /></ProtectedRoute>} />
              <Route path="/trips" element={<ProtectedRoute routeKey="trips"><Trips /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute routeKey="maintenance"><Maintenance /></ProtectedRoute>} />
              <Route path="/fuel-expenses" element={<ProtectedRoute routeKey="fuel"><FuelExpenses /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute routeKey="reports"><Reports /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
