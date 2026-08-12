import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import AppFooter from '../components/AppFooter';
import AppSidebar from '../components/AppSidebar';
import AppTopbar from '../components/AppTopbar';
import { useAuth } from '../context/AuthContext';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCompact, setIsSidebarCompact] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`admin-shell ${isSidebarCompact ? 'sidebar-compact' : ''}`}>
      <AppSidebar
        isOpen={isSidebarOpen}
        isCompact={isSidebarCompact}
        onClose={() => {
          setIsSidebarOpen(false);
        }}
        onToggleCompact={() => {
          setIsSidebarCompact((current) => !current);
        }}
      />

      <button
        type="button"
        className={`sidebar-backdrop ${isSidebarOpen ? 'is-visible' : ''}`}
        aria-label="Tutup sidebar"
        onClick={() => {
          setIsSidebarOpen(false);
        }}
      />

      <div className="admin-main">
        <AppTopbar
          userName={user?.name || 'Pengguna'}
          onLogout={handleLogout}
          onToggleSidebar={() => {
            setIsSidebarOpen((current) => !current);
          }}
        />

        <main className="admin-content">
          <div className="content-container">
            <Outlet />
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}

export default AppLayout;
