import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/app-shell/AppShell';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Landing from '@/pages/Landing';
import Library from '@/pages/Library';
import PracticeHub from '@/pages/PracticeHub';
import ScoreDetail from '@/pages/ScoreDetail';
import AddScore from '@/pages/AddScore';
import PracticeSession from '@/pages/PracticeSession';
import PracticeSummary from '@/pages/PracticeSummary';
import Imports from '@/pages/Imports';
import Editor from '@/pages/Editor';
import SharedScore from '@/pages/SharedScore';
import InviteAcceptance from '@/pages/InviteAcceptance';
import Settings from '@/pages/Settings';
import AccountSettings from '@/pages/settings/AccountSettings';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import PreferencesSettings from '@/pages/settings/PreferencesSettings';
import PlanSettings from '@/pages/settings/PlanSettings';
import PrivacySettings from '@/pages/settings/PrivacySettings';
import Notifications from '@/pages/Notifications';
import Help from '@/pages/Help';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/s/:shareToken" element={<SharedScore />} />
      <Route path="/invite/:inviteToken" element={<InviteAcceptance />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppShell />}>
          <Route path="/library" element={<Library />} />
          <Route path="/practice" element={<PracticeHub />} />
          <Route path="/score/:scoreId" element={<ScoreDetail />} />
          <Route path="/add-score" element={<AddScore />} />
          <Route path="/score/:scoreId/practice" element={<PracticeSession />} />
          <Route path="/practice/:sessionId/summary" element={<PracticeSummary />} />
          <Route path="/imports" element={<Imports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<Help />} />
          <Route path="/score/:scoreId/edit" element={<Editor />} />
          <Route path="/settings" element={<Settings />}>
            <Route index element={<Navigate to="/settings/account" replace />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="preferences" element={<PreferencesSettings />} />
            <Route path="plan" element={<PlanSettings />} />
            <Route path="privacy" element={<PrivacySettings />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App