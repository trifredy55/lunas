import { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';

import api from '../api/api';
import AppModal from '../components/AppModal';
import MemberForm from '../components/MemberForm';
import PageHeader from '../components/PageHeader';
import TablePagination from '../components/TablePagination';
import TableToolbar from '../components/TableToolbar';
import {
  confirmAction,
  showErrorDialog,
  showSuccessToast,
} from '../utils/alerts';
import { normalizeText } from '../utils/formatters';

const EMPTY_MEMBER = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

function getMemberId(member) {
  return member?._id || member?.id || '';
}

function extractApiError(error, fallbackMessage) {
  return {
    message: error.response?.data?.message || fallbackMessage,
    details: Array.isArray(error.response?.data?.errors) ? error.response.data.errors : [],
  };
}

function filterMembers(members, query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return members;
  }

  return members.filter((member) =>
    [member.name, member.email, member.phone, member.address]
      .map((value) => normalizeText(value))
      .some((value) => value.includes(normalizedQuery))
  );
}

function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formErrors, setFormErrors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadMembers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/members');
      const nextMembers = Array.isArray(response.data?.data) ? response.data.data : [];

      setMembers(nextMembers);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Data anggota belum dapat dimuat. Silakan coba beberapa saat lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  const filteredMembers = useMemo(
    () => filterMembers(members, searchQuery),
    [members, searchQuery]
  );

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedMembers = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;

    return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMembers, itemsPerPage, safePage]);

  const resetFormFeedback = () => {
    setFormError('');
    setFormErrors([]);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingMember(null);
    resetFormFeedback();
  };

  const openCreateForm = () => {
    setError('');
    setEditingMember(null);
    setIsFormOpen(true);
    resetFormFeedback();
  };

  const openEditForm = (member) => {
    setError('');
    setEditingMember(member);
    setIsFormOpen(true);
    resetFormFeedback();
  };

  const handleCreateOrUpdate = async (values) => {
    setFormSubmitting(true);
    resetFormFeedback();

    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
    };

    try {
      if (editingMember) {
        const response = await api.put(`/api/members/${getMemberId(editingMember)}`, payload);

        closeForm();
        await loadMembers();
        await showSuccessToast(
          response.data?.message || 'Data anggota berhasil diperbarui.'
        );
      } else {
        const response = await api.post('/api/members', payload);

        closeForm();
        await loadMembers();
        await showSuccessToast(
          response.data?.message || 'Data anggota berhasil ditambahkan.'
        );
      }
    } catch (requestError) {
      const nextFeedback = extractApiError(
        requestError,
        editingMember
          ? 'Data anggota belum berhasil diperbarui.'
          : 'Data anggota belum berhasil ditambahkan.'
      );

      setFormError(nextFeedback.message);
      setFormErrors(nextFeedback.details);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (member) => {
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
      const response = await api.delete(`/api/members/${getMemberId(member)}`);

      if (getMemberId(editingMember) === getMemberId(member)) {
        closeForm();
      }

      await loadMembers();
      await showSuccessToast(
        response.data?.message || 'Data anggota berhasil dihapus.'
      );
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Data anggota belum berhasil dihapus.';

      setError(message);
      await showErrorDialog(message);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        kicker="Data Master"
        title="Data Anggota"
        description="Kelola data anggota perpustakaan."
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
            <h2 className="panel-title">Daftar Anggota</h2>
            <p className="panel-description">Kelola data anggota yang terdaftar di perpustakaan.</p>
          </div>
        </div>

        <TableToolbar
          perPage={itemsPerPage}
          onPerPageChange={setItemsPerPage}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nama, email, telepon, atau alamat"
        />

        {loading ? (
          <div className="table-state">
            <div className="spinner" />
            <p>Memuat data anggota...</p>
          </div>
        ) : null}

        {!loading && filteredMembers.length === 0 ? (
          <div className="table-state empty">
            <p>
              {members.length === 0
                ? 'Belum ada data anggota.'
                : 'Data anggota yang dicari tidak ditemukan.'}
            </p>
          </div>
        ) : null}

        {!loading && filteredMembers.length > 0 ? (
          <>
            <div className="table-wrap" role="region" aria-label="Tabel data anggota">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">No</th>
                    <th scope="col">Nama Lengkap</th>
                    <th scope="col">Email</th>
                    <th scope="col">No. Telepon</th>
                    <th scope="col">Alamat</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((member, index) => (
                    <tr key={getMemberId(member)}>
                      <td>{(safePage - 1) * itemsPerPage + index + 1}</td>
                      <td>
                        <div className="table-primary-cell">
                          <strong>{member.name}</strong>
                          <small>{member.email}</small>
                        </div>
                      </td>
                      <td>{member.email}</td>
                      <td>{member.phone}</td>
                      <td>{member.address}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="button button-success button-small"
                            aria-label={`Edit anggota ${member.name}`}
                            onClick={() => {
                              openEditForm(member);
                            }}
                          >
                            <FiEdit2 />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="button button-danger button-small"
                            aria-label={`Hapus anggota ${member.name}`}
                            onClick={() => {
                              void handleDelete(member);
                            }}
                          >
                            <FiTrash2 />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              totalItems={filteredMembers.length}
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
        title={editingMember ? 'Edit Data Anggota' : 'Tambah Data Anggota'}
        description={
          editingMember
            ? 'Perbarui informasi anggota yang dipilih.'
            : 'Lengkapi data anggota yang ingin ditambahkan.'
        }
        size="lg"
      >
        <MemberForm
          mode={editingMember ? 'edit' : 'create'}
          initialValues={editingMember || EMPTY_MEMBER}
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

export default Members;
