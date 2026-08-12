function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis-start', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages];
}

function TablePagination({
  totalItems,
  currentPage,
  perPage,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * perPage + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(safePage * perPage, totalItems);
  const pageItems = buildPageItems(safePage, totalPages);

  return (
    <div className="table-footer">
      <p className="table-summary">
        Menampilkan {startItem}-{endItem} dari {totalItems} data
      </p>

      <div className="pagination" aria-label="Navigasi halaman tabel">
        <button
          type="button"
          className="pagination-button"
          disabled={safePage === 1}
          onClick={() => {
            onPageChange(Math.max(1, safePage - 1));
          }}
        >
          Sebelumnya
        </button>

        {pageItems.map((item) =>
          String(item).startsWith('ellipsis') ? (
            <span key={item} className="pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`pagination-button ${safePage === item ? 'is-active' : ''}`}
              onClick={() => {
                onPageChange(item);
              }}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          className="pagination-button"
          disabled={safePage === totalPages}
          onClick={() => {
            onPageChange(Math.min(totalPages, safePage + 1));
          }}
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

export default TablePagination;
