import { useEffect } from 'react'

export function Modal({ title, onClose, children, size = '' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="icon-btn" onClick={onClose} style={{ fontSize: 18, color: 'var(--muted)' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EditValueModal({ label, value, onSave, onClose, type = 'number' }) {
  return (
    <Modal title={`Edit ${label}`} onClose={onClose} size="modal-sm">
      <form onSubmit={(e) => { e.preventDefault(); onSave(e.target.val.value); onClose() }}>
        <div className="form-group">
          <label className="form-label">{label}</label>
          <input name="val" className="form-input" type={type} defaultValue={value} autoFocus step="any" />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  )
}
