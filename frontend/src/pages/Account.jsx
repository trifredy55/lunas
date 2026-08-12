import { useState } from 'react';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import api from '../api/api';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { showSuccessToast } from '../utils/alerts';
import { formatUserRole, formatUserStatus } from '../utils/formatters';

function extractApiError(error, fallbackMessage) {
  return {
    message: error.response?.data?.message || fallbackMessage,
    details: Array.isArray(error.response?.data?.errors) ? error.response.data.errors : [],
  };
}

function getPasswordValidationMessage(input, form) {
  if (input.validity.valueMissing) {
    if (input.name === 'currentPassword') {
      return 'Password saat ini wajib diisi.';
    }

    if (input.name === 'newPassword') {
      return 'Password baru wajib diisi.';
    }

    if (input.name === 'confirmPassword') {
      return 'Konfirmasi password wajib diisi.';
    }
  }

  if (input.name === 'confirmPassword' && input.value && input.value !== form.newPassword) {
    return 'Konfirmasi password tidak sama dengan password baru.';
  }

  return '';
}

function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
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
    event.currentTarget.setCustomValidity(
      getPasswordValidationMessage(event.currentTarget, form)
    );
  };

  const clearCustomValidity = (event) => {
    event.currentTarget.setCustomValidity('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorState({ message: '', details: [] });

    try {
      const response = await api.put('/api/auth/change-password', form);

      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      await showSuccessToast(
        response.data?.message || 'Password berhasil diubah. Silakan login kembali.'
      );

      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      setErrorState(
        extractApiError(
          error,
          'Password belum berhasil diubah. Silakan coba beberapa saat lagi.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        kicker="Akun"
        title="Pengaturan Akun"
        description="Lihat informasi akun Anda dan ubah password dengan aman."
      />

      <section className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Informasi Akun</h2>
            <p className="panel-description">
              Data berikut digunakan untuk mengakses aplikasi LUNAS.
            </p>
          </div>
        </div>

        <div className="account-info-grid">
          <div className="account-info-card">
            <span className="account-info-label">Nama</span>
            <strong className="account-info-value">{user?.name || '-'}</strong>
          </div>
          <div className="account-info-card">
            <span className="account-info-label">Email</span>
            <strong className="account-info-value">{user?.email || '-'}</strong>
          </div>
          <div className="account-info-card">
            <span className="account-info-label">Peran</span>
            <strong className="account-info-value">
              {formatUserRole(user?.role)}
            </strong>
          </div>
          <div className="account-info-card">
            <span className="account-info-label">Status</span>
            <strong className="account-info-value">
              {formatUserStatus(user?.status)}
            </strong>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Ubah Password</h2>
            <p className="panel-description">
              Gunakan password baru yang kuat dan mudah Anda ingat.
            </p>
          </div>
        </div>

        <div className="account-form-wrap">
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

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Password Saat Ini</span>
              <div className="password-wrapper">
                <input
                  type={showPassword.currentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  onInvalid={handleInvalid}
                  onInput={clearCustomValidity}
                  placeholder="Masukkan password saat ini"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showPassword.currentPassword
                      ? 'Sembunyikan password saat ini'
                      : 'Tampilkan password saat ini'
                  }
                  title={
                    showPassword.currentPassword
                      ? 'Sembunyikan password saat ini'
                      : 'Tampilkan password saat ini'
                  }
                  onClick={() => {
                    togglePasswordVisibility('currentPassword');
                  }}
                >
                  {showPassword.currentPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <label className="field">
              <span>Password Baru</span>
              <div className="password-wrapper">
                <input
                  type={showPassword.newPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={form.newPassword}
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
                  aria-label={
                    showPassword.newPassword
                      ? 'Sembunyikan password baru'
                      : 'Tampilkan password baru'
                  }
                  title={
                    showPassword.newPassword
                      ? 'Sembunyikan password baru'
                      : 'Tampilkan password baru'
                  }
                  onClick={() => {
                    togglePasswordVisibility('newPassword');
                  }}
                >
                  {showPassword.newPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <label className="field">
              <span>Konfirmasi Password Baru</span>
              <div className="password-wrapper">
                <input
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onInvalid={handleInvalid}
                  onInput={clearCustomValidity}
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showPassword.confirmPassword
                      ? 'Sembunyikan konfirmasi password'
                      : 'Tampilkan konfirmasi password'
                  }
                  title={
                    showPassword.confirmPassword
                      ? 'Sembunyikan konfirmasi password'
                      : 'Tampilkan konfirmasi password'
                  }
                  onClick={() => {
                    togglePasswordVisibility('confirmPassword');
                  }}
                >
                  {showPassword.confirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <div className="account-password-note">
              <FiLock />
              <span>
                Password baru minimal 8 karakter dan harus memiliki huruf kecil,
                huruf besar, serta angka.
              </span>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={submitting}
              >
                {submitting ? 'Memproses...' : 'Simpan Password Baru'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Account;
