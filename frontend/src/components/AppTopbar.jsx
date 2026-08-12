import { useEffect, useMemo, useRef, useState } from 'react';
import { FiChevronDown, FiLogOut, FiMenu, FiUser } from 'react-icons/fi';

import { getInitials } from '../utils/formatters';

function AppTopbar({ userName, onLogout, onToggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const initials = useMemo(() => getInitials(userName), [userName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu"
          onClick={onToggleSidebar}
          aria-label="Buka sidebar"
        >
          <FiMenu />
        </button>

        <div className="topbar-welcome">
          <span className="topbar-welcome-label">LUNAS</span>
          <strong className="topbar-welcome-name">Halo, {userName || 'Pengguna'}.</strong>
        </div>
      </div>

      <div className="topbar-right">
        <div ref={menuRef} className={`topbar-user ${isMenuOpen ? 'is-open' : ''}`}>
          <button
            type="button"
            className="topbar-user-button"
            onClick={() => {
              setIsMenuOpen((current) => !current);
            }}
            aria-expanded={isMenuOpen}
            aria-label="Buka menu pengguna"
          >
            <span className="topbar-avatar">{initials}</span>

            <span className="topbar-user-meta">
              <strong>{userName || 'Pengguna'}</strong>
              <small>Pengguna aktif</small>
            </span>

            <FiChevronDown className="topbar-user-chevron" />
          </button>

          {isMenuOpen ? (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-info">
                <span className="topbar-dropdown-icon">
                  <FiUser />
                </span>
                <div>
                  <strong>{userName || 'Pengguna'}</strong>
                  <small>Akun yang sedang digunakan</small>
                </div>
              </div>

              <button
                type="button"
                className="topbar-dropdown-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default AppTopbar;
