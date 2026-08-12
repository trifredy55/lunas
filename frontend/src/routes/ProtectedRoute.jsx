import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div className="screen-message">Memeriksa autentikasi...</div>;
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
