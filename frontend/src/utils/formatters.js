function getInitials(name = 'Pengguna') {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return 'LU';
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

function formatDateIndonesia(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

export { formatDateIndonesia, getInitials, normalizeText };
