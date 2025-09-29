import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

export function RoleBasedRedirect() {
  const { user } = useAuthStore();
  
  // All users go to their tickets page for a more user-friendly experience
  return <Navigate to="/tickets" replace />;
}
