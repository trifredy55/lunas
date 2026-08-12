import { FiSearch } from 'react-icons/fi';

function TableToolbar({
  perPage,
  onPerPageChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Cari data',
}) {
  return (
    <div className="table-controls">
      <label className="table-per-page" htmlFor="table-per-page">
        <span>Tampilkan</span>
        <select
          id="table-per-page"
          value={perPage}
          onChange={(event) => {
            onPerPageChange(Number(event.target.value));
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>
        <span>data</span>
      </label>

      <label className="table-search" htmlFor="table-search">
        <span>Pencarian</span>
        <div className="table-search-input">
          <FiSearch />
          <input
            id="table-search"
            type="search"
            value={searchValue}
            onChange={(event) => {
              onSearchChange(event.target.value);
            }}
            placeholder={searchPlaceholder}
          />
        </div>
      </label>
    </div>
  );
}

export default TableToolbar;
