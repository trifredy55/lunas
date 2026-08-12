import { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiPlus, FiRotateCcw } from 'react-icons/fi';

import api from '../api/api';
import AppModal from '../components/AppModal';
import LoanForm from '../components/LoanForm';
import PageHeader from '../components/PageHeader';
import TablePagination from '../components/TablePagination';
import TableToolbar from '../components/TableToolbar';
import {
  confirmAction,
  showErrorDialog,
  showSuccessToast,
} from '../utils/alerts';
import { formatDateIndonesia, normalizeText } from '../utils/formatters';

function getLoanId(loan) {
  return loan?._id || loan?.id || '';
}

function getStatusLabel(status) {
  return status === 'returned' ? 'Dikembalikan' : 'Dipinjam';
}

function extractApiError(error, fallbackMessage) {
  return {
    message: error.response?.data?.message || fallbackMessage,
    details: Array.isArray(error.response?.data?.errors) ? error.response.data.errors : [],
  };
}

function filterLoans(loans, query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return loans;
  }

  return loans.filter((loan) =>
    [
      loan.member?.name,
      loan.member?.email,
      loan.member?.phone,
      loan.book?.title,
      loan.book?.author,
      loan.book?.isbn,
      loan.book?.category,
      getStatusLabel(loan.status),
    ]
      .map((value) => normalizeText(value))
      .some((value) => value.includes(normalizedQuery))
  );
}

function Loans() {
  const [loans, setLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formErrors, setFormErrors] = useState([]);
  const [returningLoanId, setReturningLoanId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const availableBookCount = useMemo(
    () => books.filter((book) => Number(book.availableStock || 0) > 0).length,
    [books]
  );

  const activeLoanCount = useMemo(
    () => loans.filter((loan) => loan.status === 'borrowed').length,
    [loans]
  );

  const returnedLoanCount = useMemo(
    () => loans.filter((loan) => loan.status === 'returned').length,
    [loans]
  );

  const loadLoans = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/loans');
      const nextLoans = Array.isArray(response.data?.data) ? response.data.data : [];

      setLoans(nextLoans);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Data peminjaman belum dapat dimuat. Silakan coba beberapa saat lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadLoanDependencies = async () => {
    setLoadingOptions(true);

    try {
      const [membersResponse, booksResponse] = await Promise.all([
        api.get('/api/members'),
        api.get('/api/books'),
      ]);

      setMembers(Array.isArray(membersResponse.data?.data) ? membersResponse.data.data : []);
      setBooks(Array.isArray(booksResponse.data?.data) ? booksResponse.data.data : []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Pilihan anggota atau buku belum dapat dimuat. Silakan coba beberapa saat lagi.'
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadLoans(), loadLoanDependencies()]);
  }, []);

  const filteredLoans = useMemo(
    () => filterLoans(loans, searchQuery),
    [loans, searchQuery]
  );

  const totalPages = Math.max(1, Math.ceil(filteredLoans.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedLoans = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;

    return filteredLoans.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLoans, itemsPerPage, safePage]);

  const resetFormFeedback = () => {
    setFormError('');
    setFormErrors([]);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetFormFeedback();
  };

  const openCreateForm = async () => {
    setError('');
    resetFormFeedback();
    setIsFormOpen(true);
    await loadLoanDependencies();
  };

  const handleCreateLoan = async (values) => {
    setFormSubmitting(true);
    resetFormFeedback();

    try {
      const response = await api.post('/api/loans', {
        member: values.member,
        book: values.book,
        dueDate: values.dueDate,
      });

      closeForm();
      await Promise.all([loadLoans(), loadLoanDependencies()]);
      await showSuccessToast(
        response.data?.message || 'Transaksi peminjaman berhasil dicatat.'
      );
    } catch (requestError) {
      const nextFeedback = extractApiError(
        requestError,
        'Transaksi peminjaman belum berhasil dicatat.'
      );

      setFormError(nextFeedback.message);
      setFormErrors(nextFeedback.details);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleReturnLoan = async (loan) => {
    const shouldReturn = await confirmAction({
      title: 'Yakin ingin mengembalikan buku ini?',
      text: 'Status peminjaman akan diperbarui menjadi dikembalikan.',
      confirmButtonText: 'Ya, kembalikan',
      confirmButtonClass: 'swal-button swal-button-info',
    });

    if (!shouldReturn) {
      return;
    }

    setReturningLoanId(getLoanId(loan));
    setError('');

    try {
      const response = await api.put(`/api/loans/${getLoanId(loan)}/return`);

      await Promise.all([loadLoans(), loadLoanDependencies()]);
      await showSuccessToast(response.data?.message || 'Buku berhasil dikembalikan.');
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Buku belum berhasil dikembalikan.';

      setError(message);
      await showErrorDialog(message);
    } finally {
      setReturningLoanId('');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        kicker="Data Transaksi"
        title="Data Peminjaman"
        description="Kelola transaksi peminjaman dan pengembalian buku."
        action={
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              void openCreateForm();
            }}
          >
            <FiPlus />
            <span>Pinjam Buku</span>
          </button>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="stats-inline-grid">
        <article className="mini-stat-card mini-stat-card-primary">
          <div>
            <p className="mini-stat-label">Total Peminjaman</p>
            <strong className="mini-stat-value">{loans.length}</strong>
          </div>
          <span className="mini-stat-icon">
            <FiPlus />
          </span>
        </article>

        <article className="mini-stat-card mini-stat-card-info">
          <div>
            <p className="mini-stat-label">Masih Dipinjam</p>
            <strong className="mini-stat-value">{activeLoanCount}</strong>
          </div>
          <span className="mini-stat-icon">
            <FiRotateCcw />
          </span>
        </article>

        <article className="mini-stat-card mini-stat-card-success">
          <div>
            <p className="mini-stat-label">Sudah Kembali</p>
            <strong className="mini-stat-value">{returnedLoanCount}</strong>
          </div>
          <span className="mini-stat-icon">
            <FiCheckCircle />
          </span>
        </article>

        <article className="mini-stat-card mini-stat-card-warning">
          <div>
            <p className="mini-stat-label">Buku Tersedia</p>
            <strong className="mini-stat-value">{availableBookCount}</strong>
          </div>
          <span className="mini-stat-icon">
            <FiPlus />
          </span>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Daftar Peminjaman</h2>
            <p className="panel-description">
              Pantau status peminjaman dan pengembalian buku perpustakaan.
            </p>
          </div>
        </div>

        <TableToolbar
          perPage={itemsPerPage}
          onPerPageChange={setItemsPerPage}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari anggota, buku, ISBN, atau status"
        />

        {loading ? (
          <div className="table-state">
            <div className="spinner" />
            <p>Memuat data peminjaman...</p>
          </div>
        ) : null}

        {!loading && filteredLoans.length === 0 ? (
          <div className="table-state empty">
            <p>
              {loans.length === 0
                ? 'Belum ada data peminjaman.'
                : 'Data peminjaman yang dicari tidak ditemukan.'}
            </p>
          </div>
        ) : null}

        {!loading && filteredLoans.length > 0 ? (
          <>
            <div className="table-wrap" role="region" aria-label="Tabel data peminjaman">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">No</th>
                    <th scope="col">Anggota</th>
                    <th scope="col">Buku</th>
                    <th scope="col">Tgl Pinjam</th>
                    <th scope="col">Jatuh Tempo</th>
                    <th scope="col">Tgl Kembali</th>
                    <th scope="col">Status</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLoans.map((loan, index) => {
                    const loanStatus = getStatusLabel(loan.status);
                    const isReturned = loan.status === 'returned';
                    const isReturning = returningLoanId === getLoanId(loan);

                    return (
                      <tr key={getLoanId(loan)}>
                        <td>{(safePage - 1) * itemsPerPage + index + 1}</td>
                        <td>
                          <div className="table-primary-cell">
                            <strong>{loan.member?.name || '-'}</strong>
                            <small>{loan.member?.email || '-'}</small>
                          </div>
                        </td>
                        <td>
                          <div className="table-primary-cell">
                            <strong>{loan.book?.title || '-'}</strong>
                            <small>{loan.book?.isbn || '-'}</small>
                          </div>
                        </td>
                        <td>{formatDateIndonesia(loan.loanDate)}</td>
                        <td>{formatDateIndonesia(loan.dueDate)}</td>
                        <td>{formatDateIndonesia(loan.returnDate)}</td>
                        <td>
                          <span
                            className={
                              isReturned
                                ? 'status-badge status-badge-returned'
                                : 'status-badge status-badge-borrowed'
                            }
                          >
                            {loanStatus}
                          </span>
                        </td>
                        <td>
                          {isReturned ? (
                            <span className="status-badge status-badge-muted">Selesai</span>
                          ) : (
                            <button
                              type="button"
                              className="button button-info button-small"
                              onClick={() => {
                                void handleReturnLoan(loan);
                              }}
                              disabled={isReturning}
                            >
                              <FiRotateCcw />
                              <span>{isReturning ? 'Memproses...' : 'Kembalikan'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <TablePagination
              totalItems={filteredLoans.length}
              currentPage={safePage}
              perPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        ) : null}
      </section>

      <AppModal
        open={isFormOpen}
        onClose={closeForm}
        title="Tambah Peminjaman"
        description="Pilih anggota, buku, dan tanggal jatuh tempo untuk mencatat transaksi peminjaman."
        size="lg"
      >
        <LoanForm
          members={members}
          books={books}
          submitting={formSubmitting}
          loadingOptions={loadingOptions}
          errorMessage={formError}
          validationErrors={formErrors}
          onCancel={closeForm}
          onSubmit={handleCreateLoan}
        />
      </AppModal>
    </div>
  );
}

export default Loans;
