import { useEffect, useState } from 'react';

const EMPTY_FORM = {
  title: '',
  author: '',
  category: '',
  isbn: '',
  stock: '',
};

function getBookValidationMessage(input) {
  if (input.validity.valueMissing) {
    switch (input.name) {
      case 'title':
        return 'Judul buku wajib diisi.';
      case 'author':
        return 'Penulis wajib diisi.';
      case 'category':
        return 'Kategori wajib diisi.';
      case 'isbn':
        return 'ISBN wajib diisi.';
      case 'stock':
        return 'Stok wajib diisi.';
      default:
        return 'Field ini wajib diisi.';
    }
  }

  if (input.name === 'stock' && input.validity.rangeUnderflow) {
    return 'Stok tidak boleh kurang dari 0.';
  }

  return '';
}

function BookForm({
  mode = 'create',
  initialValues,
  submitting,
  errorMessage,
  validationErrors,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm({
      title: initialValues?.title || '',
      author: initialValues?.author || '',
      category: initialValues?.category || '',
      isbn: initialValues?.isbn || '',
      stock:
        initialValues?.stock === 0 || initialValues?.stock
          ? String(initialValues.stock)
          : '',
    });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    event.currentTarget.setCustomValidity('');

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      title: form.title,
      author: form.author,
      category: form.category,
      isbn: form.isbn,
      stock: form.stock === '' ? '' : Number(form.stock),
    });
  };

  const handleInvalid = (event) => {
    const input = event.currentTarget;

    input.setCustomValidity(getBookValidationMessage(input));
  };

  const clearCustomValidity = (event) => {
    event.currentTarget.setCustomValidity('');
  };

  return (
    <form className="form-grid form-grid-two-column" onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className="alert alert-error">
          <p>{errorMessage}</p>
          {validationErrors.length > 0 ? (
            <ul className="error-list">
              {validationErrors.map((item, index) => (
                <li key={`${item.field}-${index}`}>{item.message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <label className="field field-full" htmlFor={`book-title-${mode}`}>
        <span>Judul</span>
        <input
          id={`book-title-${mode}`}
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          placeholder="Masukkan judul buku"
          required
        />
      </label>

      <label className="field" htmlFor={`book-author-${mode}`}>
        <span>Penulis</span>
        <input
          id={`book-author-${mode}`}
          type="text"
          name="author"
          value={form.author}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          placeholder="Masukkan nama penulis"
          required
        />
      </label>

      <label className="field" htmlFor={`book-category-${mode}`}>
        <span>Kategori</span>
        <input
          id={`book-category-${mode}`}
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          placeholder="Masukkan kategori buku"
          required
        />
      </label>

      <label className="field" htmlFor={`book-isbn-${mode}`}>
        <span>ISBN</span>
        <input
          id={`book-isbn-${mode}`}
          type="text"
          name="isbn"
          value={form.isbn}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          placeholder="Masukkan ISBN buku"
          required
        />
      </label>

      <label className="field" htmlFor={`book-stock-${mode}`}>
        <span>Stok</span>
        <input
          id={`book-stock-${mode}`}
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          placeholder="0"
          min="0"
          required
        />
      </label>

      <div className="form-actions field-full">
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Batal
        </button>
      </div>
    </form>
  );
}

export default BookForm;
