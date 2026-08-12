import { useEffect, useState } from 'react';

import api from '../api/api';
import BookForm from '../components/BookForm';

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

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formErrors, setFormErrors] = useState([]);

  const loadBooks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/books');
      const nextBooks = Array.isArray(response.data?.data) ? response.data.data : [];

      setBooks(nextBooks);
    } catch (requestError) {
      const nextMessage =
        requestError.response?.data?.message ||
        'Data buku belum dapat dimuat. Silakan coba beberapa saat lagi.';

      setError(nextMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBooks();
  }, []);

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
    setSuccessMessage('');
    setError('');
    setEditingBook(null);
    setIsFormOpen(true);
    resetFormFeedback();
  };

  const openEditForm = (book) => {
    setSuccessMessage('');
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

        setSuccessMessage(response.data?.message || 'Data buku berhasil diperbarui.');
      } else {
        const response = await api.post('/api/books', payload);

        setSuccessMessage(response.data?.message || 'Data buku berhasil ditambahkan.');
      }

      closeForm();
      await loadBooks();
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
    const shouldDelete = window.confirm('Yakin ingin menghapus data buku ini?');

    if (!shouldDelete) {
      return;
    }

    setSuccessMessage('');
    setError('');

    try {
      const response = await api.delete(`/api/books/${getBookId(book)}`);

      setSuccessMessage(response.data?.message || 'Data buku berhasil dihapus.');

      if (getBookId(editingBook) === getBookId(book)) {
        closeForm();
      }

      await loadBooks();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Data buku belum berhasil dihapus.'
      );
    }
  };

  return (
    <section className="page-card books-page">
      <div className="books-toolbar">
        <div className="books-heading">
          <p className="eyebrow">Modul Buku</p>
          <h1>Data Buku</h1>
          <p className="page-note">Kelola data koleksi buku perpustakaan.</p>
        </div>

        <button type="button" className="button button-primary" onClick={openCreateForm}>
          Tambah Buku
        </button>
      </div>

      {successMessage ? <div className="alert alert-success">{successMessage}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      {isFormOpen ? (
        <section className="section-card">
          <div className="section-heading">
            <h2>{editingBook ? 'Edit Buku' : 'Tambah Buku'}</h2>
            <p className="page-note">
              {editingBook
                ? 'Perbarui informasi buku yang dipilih.'
                : 'Lengkapi informasi buku yang ingin ditambahkan.'}
            </p>
          </div>

          <BookForm
            mode={editingBook ? 'edit' : 'create'}
            initialValues={editingBook || EMPTY_BOOK}
            submitting={formSubmitting}
            errorMessage={formError}
            validationErrors={formErrors}
            onCancel={closeForm}
            onSubmit={handleCreateOrUpdate}
          />
        </section>
      ) : null}

      <section className="section-card">
        <div className="section-heading">
          <h2>Daftar Buku</h2>
          <p className="page-note">Daftar koleksi buku perpustakaan.</p>
        </div>

        {loading ? <p className="page-note">Memuat data buku...</p> : null}

        {!loading && books.length === 0 ? (
          <p className="empty-state">Belum ada data buku.</p>
        ) : null}

        {!loading && books.length > 0 ? (
          <div className="table-wrap" role="region" aria-label="Tabel data buku">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">No</th>
                  <th scope="col">Judul</th>
                  <th scope="col">Penulis</th>
                  <th scope="col">Kategori</th>
                  <th scope="col">ISBN</th>
                  <th scope="col">Stok</th>
                  <th scope="col">Tersedia</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, index) => {
                  const availableStock = Number(book.availableStock || 0);
                  const totalStock = Number(book.stock || 0);

                  return (
                    <tr key={getBookId(book)}>
                      <td>{index + 1}</td>
                      <td>{book.title}</td>
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
                            className="button button-secondary button-small"
                            aria-label={`Edit buku ${book.title}`}
                            onClick={() => {
                              openEditForm(book);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="button button-danger button-small"
                            aria-label={`Hapus buku ${book.title}`}
                            onClick={() => {
                              handleDelete(book);
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </section>
  );
}

export default Books;
