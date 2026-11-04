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

// Public
import Landing from '@/pages/Landing';
import About from '@/pages/About';
import Pricing from '@/pages/Pricing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import VerifyEmail from '@/pages/VerifyEmail';
import SharedScore from '@/pages/SharedScore';
import InviteAcceptance from '@/pages/InviteAcceptance';
import Terms from '@/pages/legal/Terms';
import Privacy from '@/pages/legal/Privacy';
import AcceptableUse from '@/pages/legal/AcceptableUse';
import Copyright from '@/pages/legal/Copyright';

// App (in shell)
import Library from '@/pages/Library';
import ScoreDetail from '@/pages/ScoreDetail';
import AddScore from '@/pages/AddScore';
import Imports from '@/pages/Imports';
import ImportDetail from '@/pages/ImportDetail';
import PracticeHub from '@/pages/PracticeHub';
import PracticeHistory from '@/pages/PracticeHistory';
import PracticeProgress from '@/pages/PracticeProgress';
import Performances from '@/pages/Performances';
import Notifications from '@/pages/Notifications';
import Help from '@/pages/Help';
import HelpArticle from '@/pages/HelpArticle';
import Settings from '@/pages/Settings';
import AccountSettings from '@/pages/settings/AccountSettings';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import PreferencesSettings from '@/pages/settings/PreferencesSettings';
import NotificationSettings from '@/pages/settings/NotificationSettings';
import PlanSettings from '@/pages/settings/PlanSettings';
import PrivacySettings from '@/pages/settings/PrivacySettings';

// Workspaces (full screen)
import PracticeSetup from '@/pages/PracticeSetup';
import Editor from '@/pages/Editor';
import PracticeSession from '@/pages/PracticeSession';
import PracticeSummary from '@/pages/PracticeSummary';
import RecognitionReview from '@/pages/RecognitionReview';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/help" element={<Help />} />
      <Route path="/help/:slug" element={<HelpArticle />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/s/:shareToken" element={<SharedScore />} />
      <Route path="/invite/:inviteToken" element={<InviteAcceptance />} />
      <Route path="/legal/terms" element={<Terms />} />
      <Route path="/legal/privacy" element={<Privacy />} />
      <Route path="/legal/acceptable-use" element={<AcceptableUse />} />
      <Route path="/legal/copyright" element={<Copyright />} />

      {/* Authenticated */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        {/* App shell pages */}
        <Route element={<AppShell />}>
          <Route path="/library" element={<Library />} />
          <Route path="/score/:scoreId" element={<ScoreDetail />} />
          <Route path="/score/:scoreId/setup" element={<PracticeSetup />} />
          <Route path="/add-score" element={<AddScore />} />
          <Route path="/imports" element={<Imports />} />
          <Route path="/imports/:importId" element={<ImportDetail />} />
          <Route path="/practice" element={<PracticeHub />} />
          <Route path="/practice/history" element={<PracticeHistory />} />
          <Route path="/practice/progress" element={<PracticeProgress />} />
          <Route path="/performances" element={<Performances />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />}>
            <Route index element={<Navigate to="/settings/account" replace />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="preferences" element={<PreferencesSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="plan" element={<PlanSettings />} />
            <Route path="privacy" element={<PrivacySettings />} />
          </Route>
        </Route>
        {/* Full-screen workspaces */}
        <Route path="/score/:scoreId/edit" element={<Editor />} />
        <Route path="/score/:scoreId/practice" element={<PracticeSession />} />
        <Route path="/review/:importId" element={<RecognitionReview />} />
        <Route path="/practice/:sessionId/summary" element={<PracticeSummary />} />
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