import { useMemo, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';

function extractError(error) {
  const message =
    error.response?.data?.message || 'Login gagal. Silakan periksa kembali data Anda.';
  const details = Array.isArray(error.response?.data?.errors)
    ? error.response.data.errors
    : [];

  return { message, details };
}

function getLoginValidationMessage(input) {
  if (input.validity.valueMissing) {
    if (input.name === 'email') {
      return 'Email wajib diisi.';
    }

    if (input.name === 'password') {
      return 'Password wajib diisi.';
    }
  }

  if (input.name === 'email' && input.validity.typeMismatch) {
    return 'Format email tidak valid.';
  }

  return '';
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

    event.currentTarget.setCustomValidity('');

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleInvalid = (event) => {
    const input = event.currentTarget;

    input.setCustomValidity(getLoginValidationMessage(input));
  };

  const clearCustomValidity = (event) => {
    event.currentTarget.setCustomValidity('');
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
    <AuthShell
      title="Masuk ke Sistem"
      subtitle="Silakan masuk untuk melanjutkan pengelolaan perpustakaan digital LUNAS."
      footer={
        <p className="auth-link-row">
          Belum memiliki akun? <Link to="/register">Daftar</Link>
        </p>
      }
    >
      {successMessage ? <div className="alert alert-success">{successMessage}</div> : null}

      {errorState.message ? (
        <div className="alert alert-error">
          <p>{errorState.message}</p>
          {errorState.details.length > 0 ? (
            <ul className="error-list">
              {errorState.details.map((item, index) => (
                <li key={`${item.field}-${index}`}>{item.message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <form className="form-grid auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onInvalid={handleInvalid}
            onInput={clearCustomValidity}
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
              onInvalid={handleInvalid}
              onInput={clearCustomValidity}
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

        <button
          type="submit"
          className="button button-primary button-block"
          disabled={submitting}
        >
          {submitting ? 'Memproses...' : 'Login'}
        </button>
      </form>
    </AuthShell>
  );
}

export default Login;
