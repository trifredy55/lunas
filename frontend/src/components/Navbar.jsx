import { NavLink } from 'react-router-dom';

function Navbar({ userName, onLogout }) {
  return (
    <header className="navbar">
      <div className="brand-block">
        <NavLink to="/dashboard" className="brand-link">
          <span className="brand-mark">LUNAS</span>
          <span className="brand-subtitle">
            Library UNSIA Networked Application System
          </span>
        </NavLink>
      </div>

      <nav className="nav-links" aria-label="Navigasi utama">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/books"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Buku
        </NavLink>
        <NavLink
          to="/members"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Anggota
        </NavLink>
        <NavLink
          to="/loans"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Peminjaman
        </NavLink>
      </nav>

      <div className="nav-actions">
        <span className="nav-user">Masuk sebagai {userName}</span>
        <button type="button" className="button button-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
