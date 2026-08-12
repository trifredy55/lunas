import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

function AppModal({ open, title, description, size = 'lg', onClose, children }) {
  useEffect(() => {
    if (!open) {
      document.body.classList.remove('no-scroll');
      return undefined;
    }

    document.body.classList.add('no-scroll');

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`modal-card modal-card-${size}`}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">{title}</h2>
            {description ? <p className="modal-description">{description}</p> : null}
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Tutup dialog"
          >
            <FiX />
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default AppModal;
