import { Outlet, useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <Navbar userName={user?.name || 'Pengguna'} onLogout={handleLogout} />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
