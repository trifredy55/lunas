import { useEffect, useState } from 'react';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

function getMemberValidationMessage(input) {
  if (input.validity.valueMissing) {
    switch (input.name) {
      case 'name':
        return 'Nama anggota wajib diisi.';
      case 'email':
        return 'Email anggota wajib diisi.';
      case 'phone':
        return 'Nomor telepon wajib diisi.';
      case 'address':
        return 'Alamat anggota wajib diisi.';
      default:
        return 'Field ini wajib diisi.';
    }
  }

  if (input.name === 'name' && input.validity.tooShort) {
    return 'Nama anggota harus terdiri dari 3-100 karakter.';
  }

  if (input.name === 'email' && input.validity.typeMismatch) {
    return 'Format email anggota tidak valid.';
  }

  return '';
}

function MemberForm({
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
      name: initialValues?.name || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      address: initialValues?.address || '',
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

  const handleInvalid = (event) => {
    const input = event.currentTarget;

    input.setCustomValidity(getMemberValidationMessage(input));
  };

  const clearCustomValidity = (event) => {
    event.currentTarget.setCustomValidity('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
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

      <label className="field" htmlFor={`member-name-${mode}`}>
        <span>Nama</span>
        <input
          id={`member-name-${mode}`}
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          placeholder="Masukkan nama anggota"
          minLength="3"
          maxLength="100"
          required
        />
      </label>

      <label className="field" htmlFor={`member-email-${mode}`}>
        <span>Email</span>
        <input
          id={`member-email-${mode}`}
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          placeholder="nama@unsia.ac.id"
          maxLength="100"
          required
        />
      </label>

      <label className="field" htmlFor={`member-phone-${mode}`}>
        <span>Nomor Telepon</span>
        <input
          id={`member-phone-${mode}`}
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          placeholder="Masukkan nomor telepon"
          maxLength="20"
          required
        />
      </label>

      <label className="field field-full" htmlFor={`member-address-${mode}`}>
        <span>Alamat</span>
        <textarea
          id={`member-address-${mode}`}
          name="address"
          value={form.address}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onInput={clearCustomValidity}
          placeholder="Masukkan alamat anggota"
          rows="4"
          maxLength="255"
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

export default MemberForm;
