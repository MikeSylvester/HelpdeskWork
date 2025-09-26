import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import { LoginForm } from './components/auth/LoginForm';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { MyTickets } from './pages/MyTickets';
import { SubmitTicket } from './pages/SubmitTicket';
import { AllTickets } from './pages/AllTickets';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { TicketDetails } from './features/tickets/TicketDetails';

function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          
          <Route 
            path="/tickets" 
            element={
              <ProtectedRoute roles={['user', 'agent', 'admin']}>
                <MyTickets />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tickets/:id" 
            element={
              <ProtectedRoute roles={['user', 'agent', 'admin']}>
                <TicketDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/submit-ticket" 
            element={
              <ProtectedRoute roles={['user']}>
                <SubmitTicket />
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