import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import AuthShell from '../components/AuthShell';
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

function getRegisterValidationMessage(input) {
  if (input.validity.valueMissing) {
    if (input.name === 'name') {
      return 'Nama wajib diisi.';
    }

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

    event.currentTarget.setCustomValidity('');

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleInvalid = (event) => {
    const input = event.currentTarget;

    input.setCustomValidity(getRegisterValidationMessage(input));
  };

  const clearCustomValidity = (event) => {
    event.currentTarget.setCustomValidity('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorState({ message: '', details: [] });

    try {
      await register(form.name, form.email, form.password);
      navigate('/login', {
        replace: true,
        state: {
          message: 'Registrasi berhasil. Akun Anda menunggu persetujuan Super User.',
        },
      });
    } catch (error) {
      setErrorState(extractError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Buat Akun"
      subtitle="Daftarkan akun baru untuk mengakses sistem perpustakaan digital LUNAS."
      footer={
        <p className="auth-link-row">
          Sudah memiliki akun? <Link to="/login">Login</Link>
        </p>
      }
    >
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
          <span>Nama</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            onInvalid={handleInvalid}
            onInput={clearCustomValidity}
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

        <button
          type="submit"
          className="button button-primary button-block"
          disabled={submitting}
        >
          {submitting ? 'Memproses...' : 'Daftar'}
        </button>
      </form>
    </AuthShell>
  );
}

export default Register;
