import { NavLink } from 'react-router-dom';
import {
  FiBook,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiLayers,
  FiRepeat,
  FiUsers,
  FiX,
} from 'react-icons/fi';

const sections = [
  {
    title: null,
    items: [{ to: '/dashboard', label: 'Dashboard', icon: FiGrid }],
  },
  {
    title: 'Kelola Data',
    groups: [
      {
        label: 'Data Master',
        items: [
          { to: '/books', label: 'Buku', icon: FiBookOpen },
          { to: '/members', label: 'Anggota', icon: FiUsers },
        ],
      },
      {
        label: 'Data Transaksi',
        items: [{ to: '/loans', label: 'Peminjaman', icon: FiRepeat }],
      },
    ],
  },
];

function AppSidebar({ isOpen, isCompact, onClose, onToggleCompact }) {
  return (
    <aside
      className={`app-sidebar ${isOpen ? 'is-open' : ''} ${isCompact ? 'is-compact' : ''}`}
      aria-label="Sidebar navigasi"
    >
      <div className="sidebar-head">
        <NavLink to="/dashboard" className="sidebar-brand" onClick={onClose}>
          <span className="sidebar-brand-icon">
            <FiBook />
          </span>
          <span className="sidebar-brand-text">
            <strong>LUNAS</strong>
            <small>Digital Library</small>
          </span>
        </NavLink>

        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Tutup sidebar"
        >
          <FiX />
        </button>
      </div>

      <div className="sidebar-body">
        {sections.map((section) => (
          <div key={section.title || 'utama'} className="sidebar-section">
            {section.title ? (
              <p className="sidebar-section-title">{section.title}</p>
            ) : null}

            {section.items ? (
              <nav className="sidebar-nav">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        isActive ? 'sidebar-link active' : 'sidebar-link'
                      }
                    >
                      <span className="sidebar-link-icon">
                        <Icon />
                      </span>
                      <span className="sidebar-link-label">{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            ) : null}

            {section.groups
              ? section.groups.map((group) => (
                  <div key={group.label} className="sidebar-group">
                    <div className="sidebar-group-label">
                      <FiLayers />
                      <span>{group.label}</span>
                    </div>

                    <nav className="sidebar-nav">
                      {group.items.map((item) => {
                        const Icon = item.icon;

                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end
                            onClick={onClose}
                            className={({ isActive }) =>
                              isActive ? 'sidebar-link active' : 'sidebar-link'
                            }
                          >
                            <span className="sidebar-link-icon">
                              <Icon />
                            </span>
                            <span className="sidebar-link-label">{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </nav>
                  </div>
                ))
              : null}
          </div>
        ))}
      </div>

      <div className="sidebar-foot">
        <button
          type="button"
          className="sidebar-toggle"
          aria-label={isCompact ? 'Perluas sidebar' : 'Ringkas sidebar'}
          onClick={onToggleCompact}
        >
          {isCompact ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>
    </aside>
  );
}

export default AppSidebar;
