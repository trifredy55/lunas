import { useMemo, useState } from 'react';

function toDateInputValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return localDate.toISOString().split('T')[0];
}

function getTomorrowDate() {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  return toDateInputValue(tomorrow);
}

function toIsoDueDate(dateValue) {
  return new Date(`${dateValue}T12:00:00`).toISOString();
}

function getLoanValidationMessage(input) {
  if (input.validity.valueMissing) {
    switch (input.name) {
      case 'member':
        return 'Anggota wajib dipilih.';
      case 'book':
        return 'Buku wajib dipilih.';
      case 'dueDate':
        return 'Tanggal jatuh tempo wajib diisi.';
      default:
        return 'Field ini wajib diisi.';
    }
  }

  if (input.name === 'dueDate' && input.validity.rangeUnderflow) {
    return 'Jatuh tempo harus setelah tanggal peminjaman.';
  }

  return '';
}

function LoanForm({
  members,
  books,
  submitting,
  loadingOptions,
  errorMessage,
  validationErrors,
  onCancel,
  onSubmit,
}) {
  const tomorrow = useMemo(() => getTomorrowDate(), []);
  const [form, setForm] = useState({
    member: '',
    book: '',
    dueDate: tomorrow,
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

    input.setCustomValidity(getLoanValidationMessage(input));
  };

  const clearCustomValidity = (event) => {
    event.currentTarget.setCustomValidity('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      member: form.member,
      book: form.book,
      dueDate: toIsoDueDate(form.dueDate),
    });
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

      {loadingOptions ? (
        <p className="page-note">Memuat pilihan anggota dan buku...</p>
      ) : null}

      <label className="field" htmlFor="loan-member">
        <span>Anggota</span>
        <select
          id="loan-member"
          name="member"
          value={form.member}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          disabled={loadingOptions || submitting}
          required
        >
          <option value="">Pilih anggota</option>
          {members.map((member) => (
            <option key={member._id || member.id} value={member._id || member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field" htmlFor="loan-book">
        <span>Buku</span>
        <select
          id="loan-book"
          name="book"
          value={form.book}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          disabled={loadingOptions || submitting}
          required
        >
          <option value="">Pilih buku</option>
          {books.map((book) => {
            const bookId = book._id || book.id;
            const availableStock = Number(book.availableStock || 0);

            return (
              <option key={bookId} value={bookId} disabled={availableStock <= 0}>
                {book.title} - Tersedia: {availableStock}
              </option>
            );
          })}
        </select>
      </label>

      <label className="field field-full" htmlFor="loan-due-date">
        <span>Tanggal Jatuh Tempo</span>
        <input
          id="loan-due-date"
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          min={tomorrow}
          disabled={submitting}
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

export default LoanForm;
