import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function extractError(error) {
  const message =
    error.response?.data?.message ||
    'Registrasi gagal. Silakan periksa kembali data yang Anda kirim.';
  const details = Array.isArray(error.response?.data?.errors)
    ? error.response.data.errors
    : [];

  return { message, details };
}

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({
    message: '',
    details: [],
  });

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
      await register(form.name, form.email, form.password);
      navigate('/login', {
        replace: true,
        state: { message: 'Registrasi berhasil. Silakan login.' },
      });
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
          <h1>Buat Akun</h1>
          <p className="auth-subtitle">Library UNSIA Networked Application System</p>
        </div>

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
            <span>Nama</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama lengkap"
              autoComplete="name"
              required
            />
          </label>

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
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
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
            {submitting ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="auth-footer">
          Sudah memiliki akun? <Link to="/login">Login</Link>
        </p>
      </section>
    </div>
  );
}

export default Register;
