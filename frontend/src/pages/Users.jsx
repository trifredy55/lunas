import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiPower, FiShield } from 'react-icons/fi';

import api from '../api/api';
import PageHeader from '../components/PageHeader';
import TablePagination from '../components/TablePagination';
import TableToolbar from '../components/TableToolbar';
import { useAuth } from '../context/AuthContext';
import {
  confirmAction,
  showErrorDialog,
  showSuccessToast,
} from '../utils/alerts';
import {
  formatDateIndonesia,
  formatUserRole,
  formatUserStatus,
  normalizeText,
} from '../utils/formatters';

function getUserId(user) {
  return user?._id || user?.id || '';
}

function extractApiError(error, fallbackMessage) {
  return {
    message: error.response?.data?.message || fallbackMessage,
    details: Array.isArray(error.response?.data?.errors) ? error.response.data.errors : [],
  };
}

function filterUsers(users, query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return users;
  }

  return users.filter((user) =>
    [
      user.name,
      user.email,
      formatUserRole(user.role),
      formatUserStatus(user.status),
    ]
      .map((value) => normalizeText(value))
      .some((value) => value.includes(normalizedQuery))
  );
}

function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [processingUserId, setProcessingUserId] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/users');
      setUsers(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Data pengguna belum dapat dimuat. Silakan coba beberapa saat lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(
    () => filterUsers(users, searchQuery),
    [users, searchQuery]
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;

    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, itemsPerPage, safePage]);

  const handleApprove = async (selectedUser) => {
    const shouldApprove = await confirmAction({
      title: 'Setujui akun pengguna ini?',
      text: 'Akun yang disetujui akan dapat login ke aplikasi.',
      confirmButtonText: 'Ya, setujui',
      confirmButtonClass: 'swal-button swal-button-primary',
    });

    if (!shouldApprove) {
      return;
    }

    const userId = getUserId(selectedUser);
    setProcessingUserId(userId);
    setError('');

    try {
      const response = await api.put(`/api/users/${userId}/approve`);
      await loadUsers();
      await showSuccessToast(
        response.data?.message || 'Akun pengguna berhasil disetujui.'
      );
    } catch (requestError) {
      const nextError = extractApiError(
        requestError,
        'Akun pengguna belum berhasil disetujui.'
      );

      setError(nextError.message);
      await showErrorDialog(nextError.message);
    } finally {
      setProcessingUserId('');
    }
  };

  const handleChangeStatus = async (selectedUser, nextStatus) => {
    const isActivating = nextStatus === 'active';
    const shouldContinue = await confirmAction({
      title: isActivating
        ? 'Aktifkan akun pengguna ini?'
        : 'Nonaktifkan akun pengguna ini?',
      text: isActivating
        ? 'Pengguna akan dapat kembali login ke aplikasi.'
        : 'Pengguna yang dinonaktifkan tidak dapat menggunakan aplikasi.',
      confirmButtonText: isActivating ? 'Ya, aktifkan' : 'Ya, nonaktifkan',
      confirmButtonClass: isActivating
        ? 'swal-button swal-button-success'
        : 'swal-button swal-button-danger',
    });

    if (!shouldContinue) {
      return;
    }

    const userId = getUserId(selectedUser);
    setProcessingUserId(userId);
    setError('');

    try {
      const response = await api.put(`/api/users/${userId}/status`, {
        status: nextStatus,
      });

      await loadUsers();
      await showSuccessToast(
        response.data?.message || 'Status pengguna berhasil diperbarui.'
      );
    } catch (requestError) {
      const nextError = extractApiError(
        requestError,
        'Status pengguna belum berhasil diperbarui.'
      );

      setError(nextError.message);
      await showErrorDialog(nextError.message);
    } finally {
      setProcessingUserId('');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        kicker="Manajemen"
        title="Manajemen Pengguna"
        description="Kelola persetujuan akun dan status akses pengguna aplikasi."
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Daftar Pengguna</h2>
            <p className="panel-description">
              Tinjau akun yang menunggu persetujuan dan kelola status aksesnya.
            </p>
          </div>
        </div>

        <TableToolbar
          perPage={itemsPerPage}
          onPerPageChange={setItemsPerPage}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nama, email, peran, atau status"
        />

        {loading ? (
          <div className="table-state">
            <div className="spinner" />
            <p>Memuat data pengguna...</p>
          </div>
        ) : null}

        {!loading && filteredUsers.length === 0 ? (
          <div className="table-state empty">
            <p>
              {users.length === 0
                ? 'Belum ada data pengguna.'
                : 'Data pengguna yang dicari tidak ditemukan.'}
            </p>
          </div>
        ) : null}

        {!loading && filteredUsers.length > 0 ? (
          <>
            <div className="table-wrap" role="region" aria-label="Tabel manajemen pengguna">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">No</th>
                    <th scope="col">Nama</th>
                    <th scope="col">Email</th>
                    <th scope="col">Peran</th>
                    <th scope="col">Status</th>
                    <th scope="col">Tanggal Daftar</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((managedUser, index) => {
                    const userId = getUserId(managedUser);
                    const isProcessing = processingUserId === userId;
                    const isCurrentUser = currentUser?.id === userId;

                    return (
                      <tr key={userId}>
                        <td>{(safePage - 1) * itemsPerPage + index + 1}</td>
                        <td>
                          <div className="table-primary-cell">
                            <strong>{managedUser.name}</strong>
                            <small>{managedUser.email}</small>
                          </div>
                        </td>
                        <td>{managedUser.email}</td>
                        <td>
                          <span className="status-badge status-badge-muted">
                            {formatUserRole(managedUser.role)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              managedUser.status === 'active'
                                ? 'status-badge status-badge-returned'
                                : managedUser.status === 'inactive'
                                  ? 'status-badge status-badge-inactive'
                                  : 'status-badge status-badge-pending'
                            }
                          >
                            {formatUserStatus(managedUser.status)}
                          </span>
                        </td>
                        <td>{formatDateIndonesia(managedUser.createdAt)}</td>
                        <td>
                          <div className="table-actions">
                            {managedUser.status === 'pending' ? (
                              <button
                                type="button"
                                className="button button-primary button-small"
                                onClick={() => {
                                  void handleApprove(managedUser);
                                }}
                                disabled={isProcessing}
                              >
                                <FiCheck />
                                <span>{isProcessing ? 'Memproses...' : 'Setujui'}</span>
                              </button>
                            ) : null}

                            {managedUser.status === 'active' && !isCurrentUser ? (
                              <button
                                type="button"
                                className="button button-danger button-small"
                                onClick={() => {
                                  void handleChangeStatus(managedUser, 'inactive');
                                }}
                                disabled={isProcessing}
                              >
                                <FiPower />
                                <span>{isProcessing ? 'Memproses...' : 'Nonaktifkan'}</span>
                              </button>
                            ) : null}

                            {managedUser.status === 'inactive' ? (
                              <button
                                type="button"
                                className="button button-success button-small"
                                onClick={() => {
                                  void handleChangeStatus(managedUser, 'active');
                                }}
                                disabled={isProcessing}
                              >
                                <FiShield />
                                <span>{isProcessing ? 'Memproses...' : 'Aktifkan'}</span>
                              </button>
                            ) : null}

                            {managedUser.status === 'active' && isCurrentUser ? (
                              <span className="status-badge status-badge-muted">
                                Akun Anda
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <TablePagination
              totalItems={filteredUsers.length}
              currentPage={safePage}
              perPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        ) : null}
      </section>
    </div>
  );
}

export default Users;
