import { FiBookOpen, FiShield, FiUsers } from 'react-icons/fi';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-split-card">
        <section className="auth-visual">
          <div className="auth-visual-badge">LUNAS</div>

          <div className="auth-visual-hero">
            <div className="auth-visual-icon">
              <FiBookOpen />
            </div>

            <div className="auth-visual-copy">
              <p className="auth-visual-kicker">LIBRARY UNSIA</p>
              <h2>NETWORKED APPLICATION SYSTEM</h2>
              <p>
                Sistem perpustakaan digital untuk mengelola koleksi buku, anggota,
                dan transaksi peminjaman secara lebih teratur.
              </p>
            </div>
          </div>

          <div className="auth-visual-points">
            <div className="auth-visual-point">
              <span>
                <FiShield />
              </span>
              <div>
                <strong>Akses Aman</strong>
                <p>Masuk ke dashboard LUNAS dengan alur autentikasi yang tertata.</p>
              </div>
            </div>

            <div className="auth-visual-point">
              <span>
                <FiUsers />
              </span>
              <div>
                <strong>Kelola Data</strong>
                <p>Pantau buku, anggota, dan peminjaman dari satu tempat.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-panel-header">
            <p className="page-kicker">Selamat Datang</p>
            <h1>{title}</h1>
            <p className="auth-panel-subtitle">{subtitle}</p>
          </div>

          {children}

          {footer ? <div className="auth-panel-footer">{footer}</div> : null}
        </section>
      </div>
    </div>
  );
}

export default AuthShell;
