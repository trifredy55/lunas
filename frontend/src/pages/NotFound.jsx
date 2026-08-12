import { FiCompass } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="auth-page">
      <section className="not-found-card">
        <div className="not-found-icon">
          <FiCompass />
        </div>
        <p className="page-kicker">404</p>
        <h1>Halaman tidak ditemukan.</h1>
        <p className="page-description">
          Halaman yang Anda cari tidak tersedia atau mungkin sudah dipindahkan.
        </p>
        <Link to="/" className="button button-primary">
          Kembali ke Beranda
        </Link>
      </section>
    </div>
  );
}

export default NotFound;
