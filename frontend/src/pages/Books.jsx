import { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';

import api from '../api/api';
import AppModal from '../components/AppModal';
import BookForm from '../components/BookForm';
import PageHeader from '../components/PageHeader';
import TablePagination from '../components/TablePagination';
import TableToolbar from '../components/TableToolbar';
import {
  confirmAction,
  showErrorDialog,
  showSuccessToast,
} from '../utils/alerts';
import { normalizeText } from '../utils/formatters';

const EMPTY_BOOK = {
  title: '',
  author: '',
  category: '',
  isbn: '',
  stock: '',
};

function getBookId(book) {
  return book?._id || book?.id || '';
}

function extractApiError(error, fallbackMessage) {
  return {
    message: error.response?.data?.message || fallbackMessage,
    details: Array.isArray(error.response?.data?.errors) ? error.response.data.errors : [],
  };
}

function filterBooks(books, query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return books;
  }

  return books.filter((book) =>
    [book.title, book.author, book.category, book.isbn]
      .map((value) => normalizeText(value))
      .some((value) => value.includes(normalizedQuery))
  );
}

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formErrors, setFormErrors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadBooks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/books');
      const nextBooks = Array.isArray(response.data?.data) ? response.data.data : [];

      setBooks(nextBooks);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Data buku belum dapat dimuat. Silakan coba beberapa saat lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBooks();
  }, []);

  const filteredBooks = useMemo(
    () => filterBooks(books, searchQuery),
    [books, searchQuery]
  );

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedBooks = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;

    return filteredBooks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBooks, itemsPerPage, safePage]);

  const resetFormFeedback = () => {
    setFormError('');
    setFormErrors([]);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBook(null);
    resetFormFeedback();
  };

  const openCreateForm = () => {
    setError('');
    setEditingBook(null);
    setIsFormOpen(true);
    resetFormFeedback();
  };

  const openEditForm = (book) => {
    setError('');
    setEditingBook(book);
    setIsFormOpen(true);
    resetFormFeedback();
  };

  const handleCreateOrUpdate = async (values) => {
    setFormSubmitting(true);
    resetFormFeedback();

    const payload = {
      title: values.title,
      author: values.author,
      category: values.category,
      isbn: values.isbn,
      stock: values.stock,
    };

    try {
      if (editingBook) {
        const response = await api.put(`/api/books/${getBookId(editingBook)}`, payload);

        closeForm();
        await loadBooks();
        await showSuccessToast(
          response.data?.message || 'Data buku berhasil diperbarui.'
        );
      } else {
        const response = await api.post('/api/books', payload);

        closeForm();
        await loadBooks();
        await showSuccessToast(
          response.data?.message || 'Data buku berhasil ditambahkan.'
        );
      }
    } catch (requestError) {
      const nextFeedback = extractApiError(
        requestError,
        editingBook
          ? 'Data buku belum berhasil diperbarui.'
          : 'Data buku belum berhasil ditambahkan.'
      );

      setFormError(nextFeedback.message);
      setFormErrors(nextFeedback.details);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (book) => {
    const shouldDelete = await confirmAction({
      title: 'Apakah Anda yakin?',
      text: 'Data yang dihapus tidak dapat dikembalikan.',
      confirmButtonText: 'Ya, hapus',
      confirmButtonClass: 'swal-button swal-button-danger',
    });

    if (!shouldDelete) {
      return;
    }

    setError('');

    try {
      const response = await api.delete(`/api/books/${getBookId(book)}`);

      if (getBookId(editingBook) === getBookId(book)) {
        closeForm();
      }

      await loadBooks();
      await showSuccessToast(response.data?.message || 'Data buku berhasil dihapus.');
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || 'Data buku belum berhasil dihapus.';

      setError(message);
      await showErrorDialog(message);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        kicker="Data Master"
        title="Data Buku"
        description="Kelola data koleksi buku perpustakaan."
        action={
          <button
            type="button"
            className="button button-primary"
            onClick={openCreateForm}
          >
            <FiPlus />
            <span>Tambah Data</span>
          </button>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Daftar Buku</h2>
            <p className="panel-description">Kelola data buku yang tersedia di perpustakaan.</p>
          </div>
        </div>

        <TableToolbar
          perPage={itemsPerPage}
          onPerPageChange={setItemsPerPage}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari judul, penulis, kategori, atau ISBN"
        />

        {loading ? (
          <div className="table-state">
            <div className="spinner" />
            <p>Memuat data buku...</p>
          </div>
        ) : null}

        {!loading && filteredBooks.length === 0 ? (
          <div className="table-state empty">
            <p>
              {books.length === 0
                ? 'Belum ada data buku.'
                : 'Data buku yang dicari tidak ditemukan.'}
            </p>
          </div>
        ) : null}

        {!loading && filteredBooks.length > 0 ? (
          <>
            <div className="table-wrap" role="region" aria-label="Tabel data buku">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">No</th>
                    <th scope="col">Judul Buku</th>
                    <th scope="col">Penulis</th>
                    <th scope="col">Kategori</th>
                    <th scope="col">ISBN</th>
                    <th scope="col">Stok</th>
                    <th scope="col">Tersedia</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBooks.map((book, index) => {
                    const availableStock = Number(book.availableStock || 0);
                    const totalStock = Number(book.stock || 0);

                    return (
                      <tr key={getBookId(book)}>
                        <td>{(safePage - 1) * itemsPerPage + index + 1}</td>
                        <td>
                          <div className="table-primary-cell">
                            <strong>{book.title}</strong>
                            <small>{book.author}</small>
                          </div>
                        </td>
                        <td>{book.author}</td>
                        <td>{book.category}</td>
                        <td>{book.isbn}</td>
                        <td>
                          <span className="stock-badge stock-badge-neutral">{totalStock}</span>
                        </td>
                        <td>
                          <span
                            className={
                              availableStock > 0
                                ? 'stock-badge stock-badge-success'
                                : 'stock-badge stock-badge-danger'
                            }
                          >
                            {availableStock}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="button button-success button-small"
                              aria-label={`Edit buku ${book.title}`}
                              onClick={() => {
                                openEditForm(book);
                              }}
                            >
                              <FiEdit2 />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="button button-danger button-small"
                              aria-label={`Hapus buku ${book.title}`}
                              onClick={() => {
                                void handleDelete(book);
                              }}
                            >
                              <FiTrash2 />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <TablePagination
              totalItems={filteredBooks.length}
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
        title={editingBook ? 'Edit Data Buku' : 'Tambah Data Buku'}
        description={
          editingBook
            ? 'Perbarui informasi buku yang dipilih.'
            : 'Lengkapi informasi buku yang ingin ditambahkan.'
        }
        size="lg"
      >
        <BookForm
          mode={editingBook ? 'edit' : 'create'}
          initialValues={editingBook || EMPTY_BOOK}
          submitting={formSubmitting}
          errorMessage={formError}
          validationErrors={formErrors}
          onCancel={closeForm}
          onSubmit={handleCreateOrUpdate}
        />
      </AppModal>
    </div>
  );
}

export default Books;
