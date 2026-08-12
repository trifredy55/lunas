import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import Account from './pages/Account';
import Books from './pages/Books';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import Login from './pages/Login';
import Members from './pages/Members';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import ProtectedRoute from './routes/ProtectedRoute';
import SuperUserRoute from './routes/SuperUserRoute';
import Users from './pages/Users';

function LoadingScreen() {
  return (
    <div className="screen-message">
      <div className="screen-message-card">
        <div className="spinner" />
        <p>Memeriksa autentikasi...</p>
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account" element={<Account />} />
          <Route path="/books" element={<Books />} />
          <Route path="/members" element={<Members />} />
          <Route path="/loans" element={<Loans />} />
          <Route element={<SuperUserRoute />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
