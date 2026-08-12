import { useMemo, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function extractError(error) {
  const message =
    error.response?.data?.message || 'Login gagal. Silakan periksa kembali data Anda.';
  const details = Array.isArray(error.response?.data?.errors)
    ? error.response.data.errors
    : [];

  return { message, details };
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({
    message: '',
    details: [],
  });

  const successMessage = useMemo(() => location.state?.message || '', [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorState({ message: '', details: [] });

    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorState(extractError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">LUNAS</p>
          <h1>Masuk ke Sistem</h1>
          <p className="auth-subtitle">Secure Digital Library Dashboard</p>
        </div>

        {successMessage ? <div className="alert alert-success">{successMessage}</div> : null}

        {errorState.message ? (
          <div className="alert alert-error">
            <p>{errorState.message}</p>
            {errorState.details.length > 0 ? (
              <ul className="error-list">
                {errorState.details.map((item, index) => (
                  <li key={`${item.field}-${index}`}>
                    {item.field}: {item.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nama@unsia.ac.id"
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-pressed={showPassword}
                onClick={() => {
                  setShowPassword((previous) => !previous);
                }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Belum memiliki akun? <Link to="/register">Daftar</Link>
        </p>
      </section>
    </div>
  );
}

export default Login;
