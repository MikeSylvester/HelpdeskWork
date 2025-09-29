import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/auth';
import { useAppStore } from './stores/app';
import { LoginForm } from './components/auth/LoginForm';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { MyTickets } from './pages/MyTickets';
import { SubmitTicket } from './pages/SubmitTicket';
import { AllTickets } from './pages/AllTickets';
import { AllOpenTickets } from './pages/AllOpenTickets';
import { AllUnassignedTickets } from './pages/AllUnassignedTickets';
import { MyResolvedTickets } from './pages/MyResolvedTickets';
import { AllClosedTickets } from './pages/AllClosedTickets';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';
import { GeneralReports } from './pages/GeneralReports';
import { ReportBuilder } from './pages/ReportBuilder';
import { Settings } from './pages/Settings';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { TicketDetailsWrapper } from './components/TicketDetailsWrapper';
import { RoleBasedRedirect } from './components/RoleBasedRedirect';

function App() {
  const { isAuthenticated } = useAuthStore();
  const { isDarkMode, setDarkMode } = useAppStore();

  // Initialize dark mode globally
  useEffect(() => {
    // Check if user has a saved preference
    const savedDarkMode = localStorage.getItem('app-storage');
    if (savedDarkMode) {
      try {
        const parsed = JSON.parse(savedDarkMode);
        if (parsed.state?.isDarkMode !== undefined) {
          setDarkMode(parsed.state.isDarkMode);
        }
      } catch (e) {
        // If parsing fails, use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
      }
    } else {
      // No saved preference, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, [setDarkMode]);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RoleBasedRedirect />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['agent', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route 
            path="/tickets" 
            element={
              <ProtectedRoute roles={['user', 'agent', 'admin']}>
                <MyTickets />
              </ProtectedRoute>
            } 
          />
          
          {/* Test route without ProtectedRoute */}
          <Route 
            path="/test" 
            element={
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h2 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                  🧪 TEST ROUTE WORKS!
                </h2>
                <p className="text-yellow-600 dark:text-yellow-400">
                  You are on /test route
                </p>
              </div>
            } 
          />
          
          <Route 
            path="/tickets/:id" 
            element={
              <ProtectedRoute roles={['user', 'agent', 'admin']}>
                <TicketDetailsWrapper />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/submit-ticket" 
            element={
              <ProtectedRoute roles={['user', 'agent', 'admin']}>
                <SubmitTicket />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/all-open" 
            element={
              <ProtectedRoute roles={['agent', 'admin']}>
                <AllOpenTickets />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/all-unassigned" 
            element={
              <ProtectedRoute roles={['agent', 'admin']}>
                <AllUnassignedTickets />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/my-resolved" 
            element={
              <ProtectedRoute roles={['user', 'agent', 'admin']}>
                <MyResolvedTickets />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/all-closed" 
            element={
              <ProtectedRoute roles={['agent', 'admin']}>
                <AllClosedTickets />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/all-tickets" 
            element={
              <ProtectedRoute roles={['agent', 'admin']}>
                <AllTickets />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/knowledge-base" 
            element={
              <ProtectedRoute roles={['user', 'agent', 'admin']}>
                <KnowledgeBase />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Users />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute roles={['agent', 'admin']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reports/general" 
            element={
              <ProtectedRoute roles={['agent', 'admin']}>
                <GeneralReports />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reports/builder" 
            element={
              <ProtectedRoute roles={['agent', 'admin']}>
                <ReportBuilder />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Settings />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;