import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="auth-shell">
      <section className="auth-card not-found-card">
        <p className="eyebrow">404</p>
        <h1>Halaman tidak ditemukan.</h1>
        <p className="page-note">
          Rute yang Anda buka tidak tersedia pada antarmuka LUNAS saat ini.
        </p>
        <Link to="/" className="button button-primary">
          Kembali
        </Link>
      </section>
    </div>
  );
}

export default NotFound;
