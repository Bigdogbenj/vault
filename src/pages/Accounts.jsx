import { useState, useMemo } from 'react'
import { fmt, fmtNative, toAUD, genId, resolvedAccountBalance, LIVE_ACCOUNT_NAMES } from '../utils'
import { Modal, EditValueModal } from '../components/Modal'

const ACCOUNT_TYPES = ['Savings', 'Checking', 'Super', 'Investment', 'Crypto', 'Loan', 'Other']
const CURRENCIES = ['AUD', 'USD']
const COLORS = ['#f0a500', '#5b9ef0', '#a87ef0', '#4caf7d', '#e05b5b', '#6b7280']

function AccountModal({ item, usdToAud, onClose, onSave }) {
  const [form, setForm] = useState(item || { name: '', type: 'Savings', balance: 0, currency: 'AUD', color: '#f0a500' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const audEquiv = form.currency === 'USD' ? toAUD(form.balance, 'USD', usdToAud) : null
  return (
    <Modal title={item ? 'Edit Account' : 'Add Account'} onClose={onClose}>
      <div className="form-group">
        <label className="form-label">Account Name</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="ING Savings" autoFocus />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
            {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Currency</label>
          <select className="form-select" value={form.currency || 'AUD'} onChange={e => set('currency', e.target.value)}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Balance ({form.currency || 'AUD'})</label>
        <input
          className="form-input"
          type="number"
          step="0.01"
          value={form.balance}
          onChange={e => set('balance', parseFloat(e.target.value) || 0)}
        />
        {audEquiv !== null && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
            ≈ <span style={{ color: 'var(--green)', fontWeight: 600 }}>{fmt(audEquiv)}</span> at 1 USD = A${usdToAud?.toFixed(3) ?? '—'}
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="form-label">Colour</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => set('color', c)} style={{
              width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer'
            }} />
          ))}
          <input type="color" value={form.color} onChange={e => set('color', e.target.value)} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onSave(form); onClose() }}>Save</button>
      </div>
    </Modal>
  )
}

export function Accounts({ data, updateData, prices }) {
  const [modal, setModal] = useState(null)
  const [editBal, setEditBal] = useState(null)

  const usdToAud = prices?.usdToAud ?? 1.55

  const audBalance = (acc) => resolvedAccountBalance(acc, data, prices)

  const total = useMemo(
    () => data.accounts.reduce((s, a) => s + resolvedAccountBalance(a, data, prices), 0),
    [data.accounts, data.crypto, data.stocks, data.etfs, prices] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const largest = useMemo(
    () => data.accounts.reduce((max, a) => resolvedAccountBalance(a, data, prices) > resolvedAccountBalance(max, data, prices) ? a : max, data.accounts[0] || {}),
    [data.accounts, data.crypto, data.stocks, data.etfs, prices] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const saveAccount = (form) => {
    if (modal?.item) {
      updateData('accounts', data.accounts.map(a => a.id === modal.item.id ? { ...a, ...form } : a))
    } else {
      updateData('accounts', [...data.accounts, { ...form, id: genId() }])
    }
    setModal(null)
  }

  return (
    <div className="page">
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-label">Total Balance (AUD)</div>
          <div className="stat-value text-amber">{fmt(total)}</div>
          <div className="stat-sub">{data.accounts.length} accounts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Largest Account</div>
          <div className="stat-value">{fmt(audBalance(largest ?? {}))}</div>
          <div className="stat-sub">{largest?.name}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Balance</div>
          <div className="stat-value">{data.accounts.length ? fmt(total / data.accounts.length) : '$0'}</div>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <span className="section-title">All Accounts</span>
          <button className="btn btn-primary btn-sm" onClick={() => setModal({ item: null })}>+ Add Account</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Type</th>
              <th>Balance</th>
              <th>% of Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map(acc => {
              const aud = audBalance(acc)
              const isUsd = acc.currency === 'USD'
              return (
                <tr key={acc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="color-dot" style={{ background: acc.color || '#6b7280', width: 12, height: 12 }} />
                      <span style={{ fontWeight: 600 }}>{acc.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge badge-muted">{acc.type}</span>
                      {isUsd && <span className="badge badge-blue">USD</span>}
                    </div>
                  </td>
                  <td>
                    {LIVE_ACCOUNT_NAMES.includes(acc.name) ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{fmt(aud)}</span>
                        <span className="badge badge-green" style={{ fontSize: 10, padding: '2px 6px' }}>live</span>
                      </div>
                    ) : (
                      <div>
                        <span
                          className="editable-val"
                          style={{ fontWeight: 600, fontSize: 15 }}
                          onClick={() => setEditBal(acc)}
                        >
                          {isUsd ? fmtNative(acc.balance, 'USD') : fmt(acc.balance)}
                        </span>
                        {isUsd && (
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                            ≈ {fmt(aud)}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${total > 0 ? (aud / total * 100).toFixed(0) : 0}%`, background: acc.color || '#6b7280' }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{total > 0 ? (aud / total * 100).toFixed(1) : '0'}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {!LIVE_ACCOUNT_NAMES.includes(acc.name) && (
                        <button className="icon-btn" onClick={() => setModal({ item: acc })} title="Edit">✎</button>
                      )}
                      <button className="icon-btn danger" onClick={() => updateData('accounts', data.accounts.filter(a => a.id !== acc.id))} title="Delete">✕</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <AccountModal item={modal.item} usdToAud={usdToAud} onClose={() => setModal(null)} onSave={saveAccount} />
      )}

      {editBal && (
        <EditValueModal
          label={`${editBal.name} Balance (${editBal.currency || 'AUD'})`}
          value={editBal.balance}
          onClose={() => setEditBal(null)}
          onSave={(v) => {
            updateData('accounts', data.accounts.map(a => a.id === editBal.id ? { ...a, balance: parseFloat(v) || 0 } : a))
          }}
        />
      )}
    </div>
  )
}
