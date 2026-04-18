import React from 'react';
import './styles/AdminCrudModal.css';

export default function AdminCrudModal({
  open,
  title,
  children,
  onClose,
  size = 'md',
}) {
  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`admin-modal admin-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            x
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}
