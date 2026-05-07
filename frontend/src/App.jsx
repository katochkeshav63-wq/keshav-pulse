import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'

const Home         = lazy(() => import('./pages/Home'))
const Reels        = lazy(() => import('./pages/Reels'))
const Profile      = lazy(() => import('./pages/Profile'))
const PostDetail   = lazy(() => import('./pages/PostDetail'))
const Messages     = lazy(() => import('./pages/Messages'))
const Notifications= lazy(() => import('./pages/Notifications'))
const Login        = lazy(() => import('./pages/Login'))
const Register     = lazy(() => import('./pages/Register'))
const EditProfile  = lazy(() => import('./pages/EditProfile'))
const NotFound     = lazy(() => import('./pages/NotFound'))

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (!user) return <Navigate to="/login" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (user) return <Navigate to="/" replace />
  return children
}

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    <Routes>
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index                    element={<Home />} />
        <Route path="reels"             element={<Reels />} />
        <Route path="notifications"     element={<Notifications />} />
        <Route path="messages"          element={<Messages />} />
        <Route path="messages/:userId"  element={<Messages />} />
        <Route path="profile/edit"      element={<EditProfile />} />
        <Route path=":username"         element={<Profile />} />
        <Route path="p/:postId"         element={<PostDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
)

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
)

export default App
