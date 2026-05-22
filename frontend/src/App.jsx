import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Map from './pages/Map'
import Login from './pages/Login'
import Register from './pages/Register'
import MyPage from './pages/MyPage'
import Admin from './pages/Admin'
import PropertyDetail from './pages/PropertyDetail'
import VerifyEmail from './pages/VerifyEmail'
import Chart from './pages/Chart'
import JeonseCalc from './pages/JeonseCalc'

const PrivateRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  return user?.role === 'admin' ? children : <Navigate to="/" />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<Map />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/property/:id" element={<PropertyDetail />} />
      <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="/chart" element={<Chart />} />
      <Route path="/jeonse" element={<JeonseCalc />} />
    </Routes>
  )
}

export default App