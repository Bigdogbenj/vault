import { useState, useMemo } from 'react'
import { fmt, genId } from '../utils'
import { Modal } from '../components/Modal'

function ProjectModal({ item, onClose, onSave }) {
  const [name, setName] = useState(item?.name ?? '')
  return (
    <Modal title={item ? 'Edit Project' : 'New Project'} onClose={onClose} size="modal-sm">
      <div className="form-group">
        <label className="form-label">Project Name</label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Home Office Setup" autoFocus />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (name.trim()) { onSave(name.trim()); onClose() } }}>Save</button>
      </div>
    </Modal>
  )
}

function ItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { name: '', brand: '', cost: 0, imageUrl: '', checked: false })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal title={item ? 'Edit Item' : 'Add Item'} onClose={onClose}>
      <div className="form-group">
        <label className="form-label">Item Name</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Custom PC Build" autoFocus />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Brand</label>
          <input className="form-input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Apple" />
        </div>
        <div className="form-group">
          <label className="form-label">Cost (AUD)</label>
          <input className="form-input" type="number" step="0.01" min="0" value={form.cost} onChange={e => set('cost', parseFloat(e.target.value) || 0)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Image URL (optional)</label>
        <input className="form-input" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." />
        {form.imageUrl && (
          <img src={form.imageUrl} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, marginTop: 8, border: '1px solid var(--border)' }} onError={e => e.target.style.display = 'none'} />
        )}
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onSave(form); onClose() }}>Save</button>
      </div>
    </Modal>
  )
}

export function Projects({ data, updateData }) {
  const [projectId, setProjectId] = useState(data.projects[0]?.id ?? '')
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('all')

  const project = data.projects.find(p => p.id === projectId) ?? data.projects[0]

  const stats = useMemo(() => {
    if (!project) return {}
    const total = project.items.reduce((s, i) => s + i.cost, 0)
    const purchased = project.items.filter(i => i.checked).reduce((s, i) => s + i.cost, 0)
    const doneCount = project.items.filter(i => i.checked).length
    return {
      total,
      purchased,
      remaining: total - purchased,
      doneCount,
      totalCount: project.items.length,
      pct: project.items.length > 0 ? Math.round(doneCount / project.items.length * 100) : 0,
    }
  }, [project])

  const filteredItems = useMemo(() => {
    if (!project) return []
    if (filter === 'done') return project.items.filter(i => i.checked)
    if (filter === 'todo') return project.items.filter(i => !i.checked)
    return project.items
  }, [project, filter])

  const updateProject = (proj) => {
    updateData('projects', data.projects.map(p => p.id === proj.id ? proj : p))
  }

  const toggleItem = (itemId) => {
    const updated = { ...project, items: project.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) }
    updateProject(updated)
  }

  const saveItem = (form) => {
    if (modal?.item) {
      updateProject({ ...project, items: project.items.map(i => i.id === modal.item.id ? { ...i, ...form } : i) })
    } else {
      updateProject({ ...project, items: [...project.items, { ...form, id: genId() }] })
    }
  }

  const deleteItem = (itemId) => {
    updateProject({ ...project, items: project.items.filter(i => i.id !== itemId) })
  }

  if (data.projects.length === 0) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div className="section-title" style={{ marginBottom: 8 }}>No projects yet</div>
          <div className="text-muted text-sm" style={{ marginBottom: 20 }}>Create your first project to start tracking purchases</div>
          <button className="btn btn-primary" onClick={() => setModal({ type: 'project', item: null })}>+ Create Project</button>
        </div>
        {modal?.type === 'project' && (
          <ProjectModal onClose={() => setModal(null)} onSave={name => {
            const newProject = { id: genId(), name, items: [] }
            updateData('projects', [...data.projects, newProject])
            setProjectId(newProject.id)
          }} />
        )}
      </div>
    )
  }

  return (
    <div className="page">
      {/* Project selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
          {data.projects.map(p => (
            <button
              key={p.id}
              onClick={() => setProjectId(p.id)}
              className={`btn ${projectId === p.id ? 'btn-primary' : 'btn-ghost'}`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {project && (
            <button className="icon-btn" onClick={() => setModal({ type: 'project-edit', item: project })} title="Rename project">✎</button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'project', item: null })}>+ New Project</button>
        </div>
      </div>

      {/* Stats */}
      {project && (
        <>
          <div className="grid-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <div className="stat-card">
              <div className="stat-label">Total Cost</div>
              <div className="stat-value text-amber">{fmt(stats.total)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Purchased</div>
              <div className="stat-value text-green">{fmt(stats.purchased)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Remaining</div>
              <div className="stat-value text-red">{fmt(stats.remaining)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Items Done</div>
              <div className="stat-value">{stats.doneCount} / {stats.totalCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">% Complete</div>
              <div className="stat-value text-purple">{stats.pct}%</div>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${stats.pct}%`, background: 'var(--purple)' }} />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {['all', 'todo', 'done'].map(f => (
                  <button key={f} className={`tab ${filter === f ? 'active' : ''}`} style={{ marginBottom: 0 }} onClick={() => setFilter(f)}>
                    {f === 'all' ? `All (${project.items.length})` : f === 'todo' ? `To Buy (${project.items.filter(i => !i.checked).length})` : `Bought (${project.items.filter(i => i.checked).length})`}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'item', item: null })}>+ Add Item</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredItems.length === 0 && (
                <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 24, fontSize: 13 }}>No items here yet.</div>
              )}
              {filteredItems.map(item => (
                <div key={item.id} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItem(item.id)}
                  />
                  <div className="img-placeholder">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} onError={e => { e.target.style.display = 'none'; e.target.parentNode.textContent = '📦' }} />
                      : '📦'
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'var(--muted)' : 'var(--text)' }}>{item.name}</div>
                    {item.brand && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.brand}</div>}
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: item.checked ? 'var(--green)' : 'var(--text)' }}>
                    {fmt(item.cost)}
                  </div>
                  {item.checked && <span className="badge badge-green">Bought</span>}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="icon-btn" onClick={() => setModal({ type: 'item', item })}>✎</button>
                    <button className="icon-btn danger" onClick={() => deleteItem(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {modal?.type === 'project' && (
        <ProjectModal onClose={() => setModal(null)} onSave={name => {
          const newProject = { id: genId(), name, items: [] }
          updateData('projects', [...data.projects, newProject])
          setProjectId(newProject.id)
        }} />
      )}

      {modal?.type === 'project-edit' && (
        <ProjectModal item={modal.item} onClose={() => setModal(null)} onSave={name => {
          updateData('projects', data.projects.map(p => p.id === modal.item.id ? { ...p, name } : p))
        }} />
      )}

      {modal?.type === 'item' && (
        <ItemModal item={modal.item} onClose={() => setModal(null)} onSave={saveItem} />
      )}
    </div>
  )
}
