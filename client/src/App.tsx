import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { queryClient } from './lib/queryClient'
import { useAuthStore } from './store/authStore'
import AppLayout from './components/layout/AppLayout'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import MagicLinkPage from './pages/auth/MagicLinkPage'

// App pages
import DashboardPage from './pages/dashboard/DashboardPage'
import ActivitiesPage from './pages/activities/ActivitiesPage'
import ActivityDetailPage from './pages/activities/ActivityDetailPage'
import ActivityEditPage from './pages/activities/ActivityEditPage'
import NewActivityPage from './pages/activities/NewActivityPage'
import ManageParticipantsPage from './pages/activities/ManageParticipantsPage'
import ManageConflictsPage from './pages/activities/ManageConflictsPage'
import CalendarPage from './pages/calendar/CalendarPage'
import ConflictsPage from './pages/conflicts/ConflictsPage'
import ExportsPage from './pages/exports/ExportsPage'
import ProfilePage from './pages/profile/ProfilePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth routes — no layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/magic" element={<MagicLinkPage />} />

          {/* Protected app routes — with sidebar layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/new" element={<NewActivityPage />} />
            <Route path="/activities/:id" element={<ActivityDetailPage />} />
            <Route path="/activities/:id/edit" element={<ActivityEditPage />} />
            <Route path="/activities/:id/participants" element={<ManageParticipantsPage />} />
            <Route path="/activities/:id/conflicts" element={<ManageConflictsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/conflicts" element={<ConflictsPage />} />
            <Route path="/exports" element={<ExportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
