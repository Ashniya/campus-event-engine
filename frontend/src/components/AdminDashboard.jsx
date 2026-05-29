import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// ── Icon helper ────────────────────────────────────────────────────────
const Ic = ({ d, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const I = {
  grid:    <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
  plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  list:    <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
  ticket:  <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></>,
  users:   <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  chart:   <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  bell:    <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  logout:  <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  edit:    <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash:   <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  user:    <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  upload:  <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
};

// ── Style tokens (Matched to Student Dashboard orange color scheme) ──
const t = {
  card:   { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' },
  btnOrg: { background: '#f97316', color: '#fff', border: 'none', borderRadius: '100px', padding: '10px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Inter',sans-serif" },
  btnOtl: { background: 'transparent', color: '#f97316', border: '1px solid rgba(249,115,22,0.35)', borderRadius: '100px', padding: '8px 16px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Inter',sans-serif" },
  btnRed: { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '100px', padding: '7px 14px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: "'Inter',sans-serif" },
  input:  { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif", transition: 'border-color 0.2s' },
  label:  { display: 'block', fontSize: '12px', fontWeight: '600', color: '#999', marginBottom: '6px' },
  badge:  (c) => ({ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', background: `${c}22`, color: c, border: `1px solid ${c}33` }),
  th:     { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  td:     { padding: '14px 16px', fontSize: '13px', color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.04)' },
};

function getInitials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'; }
const EMOJIS = ['🎵','💻','🏆','🎭','📚','🤝','🎨','⚽'];
const CATEGORIES = ['Technical','Cultural','Sports','Workshop','Seminar'];

// ── Simple SVG Bar Chart ─────────────────────────────────────────────
function BarChart({ data, height = 140, color = '#f97316' }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const bw = 36; const gap = 16;
  const totalW = data.length * (bw + gap) - gap;
  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${height + 30}`} style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const bh = Math.max((d.v / max) * height, 4);
        const x = i * (bw + gap);
        const y = height - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="6" fill={color} opacity="0.85" />
            <text x={x + bw / 2} y={height + 18} textAnchor="middle" fill="#666" fontSize="11" fontFamily="Inter">{d.l}</text>
            {d.v > 0 && <text x={x + bw / 2} y={y - 6} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Inter">{d.v}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ── Initial form state ────────────────────────────────────────────────
const initForm = { title: '', description: '', date: '', time: '', venue: '', category: 'Technical', capacity: '', imageUrl: '' };

// ═════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [events, setEvents]   = useState([]);
  const [users,  setUsers]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(initForm);
  const [saving,  setSaving]  = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [msg,     setMsg]     = useState('');
  const [search,  setSearch]  = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Top-level states for sub-views
  const [msgText, setMsgText] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      const [evRes] = await Promise.all([api.get('/events')]);
      setEvents(evRes.data || []);
    } catch { setEvents([]); }
    try {
      const uRes = await api.get('/auth/users');
      setUsers(uRes.data || []);
    } catch { setUsers([]); }
    try {
      const notifRes = await api.get('/notifications');
      setNotifications(notifRes.data.notifications || []);
    } catch { setNotifications([]); }
    setLoading(false);
  };

  const handleSendAnnouncement = async () => {
    if (!msgText.trim()) return;
    try {
      await api.post('/notifications', { text: msgText });
      flash('📢 Announcement sent to all students!');
      setMsgText('');
      fetchAll();
    } catch (err) {
      flash('❌ ' + (err.response?.data?.message || 'Failed to send announcement.'));
    }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/events/${editId}`, form);
        flash('✅ Event updated successfully!');
      } else {
        await api.post('/events', form);
        flash('✅ Event created successfully!');
      }
      setForm(initForm); setEditId(null); fetchAll();
    } catch (err) {
      flash('❌ ' + (err.response?.data?.message || 'Failed to save event.'));
    } finally { setSaving(false); }
  };

  const handleEdit = (ev) => {
    setForm({ title: ev.title || '', description: ev.description || '', date: ev.date ? ev.date.slice(0,10) : '', time: ev.time || '', venue: ev.location || ev.venue || '', category: ev.category || 'Technical', capacity: ev.capacity || '', imageUrl: ev.imageUrl || '' });
    setEditId(ev._id);
    setSection('create');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await api.delete(`/events/${id}`); fetchAll(); flash('🗑️ Event deleted.'); } catch { flash('❌ Delete failed.'); }
  };

  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',         icon: I.grid    },
    { id: 'create',        label: 'Create Event',       icon: I.plus    },
    { id: 'manage',        label: 'Manage Events',      icon: I.ticket  },
    { id: 'registrations', label: 'Registrations',      icon: I.list    },
    { id: 'users',         label: 'Users',              icon: I.users   },
    { id: 'analytics',     label: 'Analytics',          icon: I.chart   },
    { id: 'notifications', label: 'Notifications',      icon: I.bell    },
    { id: 'settings',      label: 'Settings',           icon: I.settings},
  ];

  // ── Sidebar ──────────────────────────────────────────────────────────
  const renderSidebar = () => (
    <aside style={{ width: isCollapsed ? '72px' : '240px', background: '#111', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40, display: 'flex', flexDirection: 'column', overflowY: 'auto', transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div style={{ padding: isCollapsed ? '24px 0 18px' : '24px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', flexDirection: isCollapsed ? 'column' : 'row', gap: isCollapsed ? '12px' : '0' }}>
        {!isCollapsed ? (
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '0.05em', color: '#fff' }}>SCEE<span style={{ color: '#f97316' }}>.</span></div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Control Panel</div>
          </div>
        ) : (
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff', textAlign: 'center' }}>
            S<span style={{ color: '#f97316' }}>.</span>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '8px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#666'}>
          <Ic d={isCollapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>} size={16} />
        </button>
      </div>
      <nav style={{ flex: 1, padding: '10px' }}>
        {navItems.map(item => {
          const active = section === item.id;
          return (
            <button key={item.id} onClick={() => setSection(item.id)} title={isCollapsed ? item.label : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: isCollapsed ? '0' : '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', marginBottom: '2px', background: active ? 'rgba(249,115,22,0.14)' : 'transparent', color: active ? '#f97316' : '#888', fontWeight: active ? '600' : '400', fontSize: '13px', transition: 'all 0.2s', fontFamily: "'Inter',sans-serif", position: 'relative' }}>
              <Ic d={item.icon} />
              {!isCollapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={handleLogout} title={isCollapsed ? 'Logout' : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: isCollapsed ? '0' : '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontWeight: '600', fontSize: '13px', fontFamily: "'Inter',sans-serif" }}>
          <Ic d={I.logout} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  // ── Top Bar ──────────────────────────────────────────────────────────
  const renderTopBar = () => (
    <header style={{ position: 'fixed', top: 0, left: isCollapsed ? '72px' : '240px', right: 0, height: '62px', background: 'rgba(14,14,14,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', zIndex: 30, transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
          {navItems.find(n => n.id === section)?.label || 'Admin Dashboard'}
        </span>
      </div>
      <div style={{ position: 'relative', width: '260px' }}>
        <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px' }} fill="none" stroke="#555" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); if (e.target.value && section !== 'manage') setSection('manage'); }} style={{ ...t.input, paddingLeft: '32px', borderRadius: '100px', height: '36px' }} onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
      </div>
      <button style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#aaa' }}>
        <Ic d={I.bell} size={15} />
        <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', background: '#f97316', borderRadius: '50%', border: '2px solid #0e0e0e' }} />
      </button>
      <button onClick={() => setSection('settings')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '5px 12px 5px 5px', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#f97316,#c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '11px' }}>
          {getInitials(user?.name)}
        </div>
        {!isCollapsed && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff', lineHeight: 1 }}>{user?.name?.split(' ')[0] || 'Admin'}</div>
            <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Administrator</div>
          </div>
        )}
      </button>
    </header>
  );

  // ── Flash Message ────────────────────────────────────────────────────
  const renderFlashMsg = () => msg ? (
    <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 100, background: '#141414', border: `1px solid ${msg.startsWith('✅') ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, borderRadius: '12px', padding: '12px 20px', color: msg.startsWith('✅') ? '#86efac' : '#fca5a5', fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
      {msg}
    </div>
  ) : null;

  // ── Section: Admin Dashboard ─────────────────────────────────────────
  const renderDashboardSection = () => {
    const activeEvents = events.filter(e => new Date(e.date) > new Date());
    const totalRegistrations = events.reduce((sum, e) => sum + (e.registeredUsers?.length || 0), 0);
    const stats = [
      { label: 'Total Events',        value: events.length,        icon: I.ticket, color: '#f97316' },
      { label: 'Active Events',        value: activeEvents.length,  icon: I.chart,  color: '#22c55e' },
      { label: 'Total Registrations',  value: totalRegistrations,   icon: I.list,   color: '#3b82f6' },
      { label: 'Total Users',          value: users.length || '—',  icon: I.users,  color: '#a855f7' },
    ];
    return (
      <div>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', margin: '0 0 6px' }}>Admin Overview</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Manage events, users and monitor platform activity.</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ ...t.card, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                <Ic d={s.icon} size={20} />
              </div>
              <div>
                <div style={{ fontSize: '30px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Events table + quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
          <div style={t.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>Recent Events</h3>
              <button onClick={() => setSection('manage')} style={t.btnOtl}>View All</button>
            </div>
            {loading ? <div style={{ textAlign: 'center', color: '#555', padding: '30px' }}>Loading...</div> :
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Event', 'Date', 'Category', 'Status', 'Actions'].map(h => <th key={h} style={t.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 5).map((ev, i) => (
                    <tr key={ev._id || i}>
                      <td style={t.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: '600', color: '#fff' }}>{ev.title}</span>
                        </div>
                      </td>
                      <td style={t.td}>{ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</td>
                      <td style={t.td}><span style={t.badge('#f97316')}>{ev.category || 'General'}</span></td>
                      <td style={t.td}><span style={t.badge(new Date(ev.date) > new Date() ? '#22c55e' : '#888')}>{new Date(ev.date) > new Date() ? 'Upcoming' : 'Ended'}</span></td>
                      <td style={t.td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleEdit(ev)} style={t.btnOtl}><Ic d={I.edit} size={12} /></button>
                          <button onClick={() => handleDelete(ev._id)} style={t.btnRed}><Ic d={I.trash} size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Create New Event', section: 'create', color: '#f97316', bg: 'rgba(249,115,22,0.12)', emoji: '➕' },
              { label: 'Manage Events',    section: 'manage', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', emoji: '📋' },
              { label: 'View Users',       section: 'users',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  emoji: '👥' },
              { label: 'Analytics',        section: 'analytics', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', emoji: '📊' },
            ].map((a, i) => (
              <button key={i} onClick={() => setSection(a.section)} style={{ background: a.bg, border: `1px solid ${a.color}25`, borderRadius: '14px', padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${a.color}60`}
                onMouseLeave={e => e.currentTarget.style.borderColor = `${a.color}25`}>
                <span style={{ fontSize: '24px' }}>{a.emoji}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: a.color }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Section: Create / Edit Event ─────────────────────────────────────
  const renderCreateSection = () => (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ ...t.card }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
            <Ic d={editId ? I.edit : I.plus} size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>{editId ? 'Edit Event' : 'Create New Event'}</h2>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{editId ? 'Modify existing event details' : 'Fill in the details to publish a new campus event'}</p>
          </div>
          {editId && <button onClick={() => { setForm(initForm); setEditId(null); }} style={{ ...t.btnRed, marginLeft: 'auto' }}>Cancel Edit</button>}
        </div>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={t.label}>Event Title *</label>
            <input required placeholder="e.g. Annual Tech Hackathon 2026" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={t.input} onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div>
            <label style={t.label}>Description</label>
            <textarea placeholder="Describe the event..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...t.input, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={t.label}>Date *</label>
              <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ ...t.input, colorScheme: 'dark' }} onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div>
              <label style={t.label}>Time</label>
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={{ ...t.input, colorScheme: 'dark' }} onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={t.label}>Venue / Location *</label>
              <input required placeholder="e.g. Main Auditorium" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} style={t.input} onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div>
              <label style={t.label}>Max Registrations</label>
              <input type="number" placeholder="e.g. 200" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} style={t.input} onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>
          <div>
            <label style={t.label}>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...t.input, cursor: 'pointer' }}>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={t.label}>Image URL (optional)</label>
            <input placeholder="https://example.com/banner.jpg" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} style={t.input} onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <button type="submit" disabled={saving} style={{ ...t.btnOrg, padding: '14px', fontSize: '14px', justifyContent: 'center', borderRadius: '12px', opacity: saving ? 0.7 : 1 }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#fb923c'; }}
            onMouseLeave={e => e.currentTarget.style.background = '#f97316'}>
            {saving ? 'Saving...' : (editId ? 'Update Event' : '+ Publish Event')}
          </button>
        </form>
      </div>
    </div>
  );

  // ── Section: Manage Events ───────────────────────────────────────────
  const renderManageSection = () => {
    const filtered = events.filter(ev => !search || ev.title?.toLowerCase().includes(search.toLowerCase()));
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div />
          <button onClick={() => setSection('create')} style={{ ...t.btnOrg }}>+ Create Event</button>
        </div>
        <div style={t.card}>
          {loading ? <div style={{ textAlign: 'center', color: '#555', padding: '40px' }}>Loading...</div> :
            filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <div style={{ color: '#888', fontSize: '15px', fontWeight: '600' }}>No events yet</div>
                <button onClick={() => setSection('create')} style={{ ...t.btnOrg, marginTop: '20px' }}>Create First Event</button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['#','Event','Category','Date','Venue','Status','Actions'].map(h => <th key={h} style={t.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map((ev, i) => (
                    <tr key={ev._id || i} style={{ transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={t.td}><span style={{ color: '#666', fontWeight: '600' }}>{i + 1}</span></td>
                      <td style={t.td}><span style={{ fontWeight: '600', color: '#fff' }}>{ev.title}</span></td>
                      <td style={t.td}><span style={t.badge('#f97316')}>{ev.category || 'General'}</span></td>
                      <td style={t.td}>{ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</td>
                      <td style={t.td}>{ev.location || ev.venue || '—'}</td>
                      <td style={t.td}><span style={t.badge(new Date(ev.date) > new Date() ? '#22c55e' : '#888')}>{new Date(ev.date) > new Date() ? 'Upcoming' : 'Ended'}</span></td>
                      <td style={t.td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleEdit(ev)} style={t.btnOtl}><Ic d={I.edit} size={12} /> Edit</button>
                          <button onClick={() => handleDelete(ev._id)} style={t.btnRed}><Ic d={I.trash} size={12} /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>
    );
  };

  // ── Section: Registrations ───────────────────────────────────────────
  const renderRegistrationsSection = () => (
    <div style={{ ...t.card, textAlign: 'center', padding: '70px' }}>
      <div style={{ fontSize: '56px', marginBottom: '14px' }}>📝</div>
      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Registrations Management</h3>
      <p style={{ color: '#666', fontSize: '14px', maxWidth: '380px', margin: '0 auto 20px' }}>Student registrations will appear here once students start registering for events.</p>
      <button onClick={() => setSection('manage')} style={{ ...t.btnOrg, padding: '12px 28px' }}>View Events</button>
    </div>
  );

  // ── Section: Users ───────────────────────────────────────────────────
  const renderUsersSection = () => {
    const selectedEvent = events.find(e => e._id === selectedEventId);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={t.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>Event Registrations Inspector</h3>
            <button 
              onClick={fetchAll} 
              disabled={loading}
              style={{ ...t.btnOtl, padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              🔄 {loading ? 'Refreshing...' : 'Refresh List'}
            </button>
          </div>
          
          {/* Custom Event Dropdown Selector */}
          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <label style={t.label}>Select Event</label>
            
            {/* Dropdown Trigger */}
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                ...t.input,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: dropdownOpen ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: dropdownOpen ? '0 0 10px rgba(249,115,22,0.15)' : 'none',
                minHeight: '50px'
              }}
            >
              {selectedEvent ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>{selectedEvent.title}</span>
                  <span style={{ fontSize: '11px', color: '#f97316', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📅 {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                    <span style={{ color: '#555', margin: '0 4px' }}>•</span>
                    🎟️ {selectedEvent.registeredUsers?.length || 0} registered
                  </span>
                </div>
              ) : (
                <span style={{ color: '#777', fontSize: '13px' }}>-- Choose an Event --</span>
              )}
              
              <span style={{ color: dropdownOpen ? '#f97316' : '#666', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none', fontSize: '12px' }}>
                ▼
              </span>
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                {/* Backdrop to close dropdown when clicking outside */}
                <div 
                  onClick={() => { setDropdownOpen(false); setDropdownSearch(''); }}
                  style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                />
                
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '8px',
                  background: '#161616',
                  border: '1px solid rgba(249,115,22,0.25)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                  zIndex: 50,
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {/* Search Bar inside Dropdown */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '10px', color: '#555', fontSize: '12px' }}>🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search events..." 
                      value={dropdownSearch}
                      onChange={e => setDropdownSearch(e.target.value)}
                      onClick={e => e.stopPropagation()} // Prevent closing dropdown
                      style={{
                        ...t.input,
                        paddingLeft: '30px',
                        background: '#0d0d0d',
                        height: '34px',
                        fontSize: '12px',
                        borderRadius: '8px'
                      }}
                      onFocus={e => e.target.style.borderColor = '#f97316'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    {dropdownSearch && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDropdownSearch(''); }}
                        style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', color: '#777', cursor: 'pointer', fontSize: '11px' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {/* Clear Selection Option */}
                    <div 
                      onClick={() => { setSelectedEventId(''); setDropdownOpen(false); setDropdownSearch(''); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: selectedEventId === '' ? 'rgba(255,255,255,0.04)' : 'transparent',
                        color: selectedEventId === '' ? '#fff' : '#888',
                        fontSize: '13px',
                        fontWeight: selectedEventId === '' ? '600' : '400',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = selectedEventId === '' ? 'rgba(255,255,255,0.04)' : 'transparent'}
                    >
                      -- Choose an Event --
                    </div>

                    {/* Filtered Events List */}
                    {events.filter(ev => !dropdownSearch || ev.title?.toLowerCase().includes(dropdownSearch.toLowerCase())).length === 0 ? (
                      <div style={{ padding: '12px', textAlign: 'center', color: '#555', fontSize: '12px' }}>
                        No matching events found
                      </div>
                    ) : (
                      events.filter(ev => !dropdownSearch || ev.title?.toLowerCase().includes(dropdownSearch.toLowerCase())).map(ev => {
                        const isSelected = ev._id === selectedEventId;
                        const eventDateStr = ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';
                        return (
                          <div 
                            key={ev._id}
                            onClick={() => { 
                              setSelectedEventId(ev._id); 
                              setDropdownOpen(false); 
                              setDropdownSearch(''); 
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(249,115,22,0.15)' : 'transparent',
                              border: isSelected ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                              transition: 'all 0.2s',
                              gap: '12px'
                            }}
                            onMouseEnter={e => {
                              if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            }}
                            onMouseLeave={e => {
                              if (!isSelected) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                              <span style={{ 
                                fontWeight: '700', 
                                color: isSelected ? '#f97316' : '#fff', 
                                fontSize: '13px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {ev.title}
                              </span>
                              <span style={{ fontSize: '11px', color: '#666', fontWeight: '500' }}>
                                📅 {eventDateStr}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              <span style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '3px 8px',
                                borderRadius: '100px',
                                fontSize: '10px',
                                fontWeight: '700',
                                background: isSelected ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)',
                                color: isSelected ? '#f97316' : '#aaa',
                                border: isSelected ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.08)'
                              }}>
                                {ev.registeredUsers?.length || 0} reg.
                              </span>
                              {isSelected && <span style={{ color: '#f97316', fontWeight: 'bold', fontSize: '12px' }}>✓</span>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {selectedEvent ? (
            <div>
              {/* Event Summary stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{selectedEvent.capacity}</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>TOTAL CAPACITY</div>
                </div>
                <div style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#f97316' }}>{selectedEvent.registeredUsers?.length || 0}</div>
                  <div style={{ fontSize: '11px', color: '#f97316', opacity: 0.8, marginTop: '4px' }}>SEATS FILLED</div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#22c55e' }}>{Math.max(0, selectedEvent.capacity - (selectedEvent.registeredUsers?.length || 0))}</div>
                  <div style={{ fontSize: '11px', color: '#22c55e', opacity: 0.8, marginTop: '4px' }}>SEATS LEFT</div>
                </div>
              </div>

              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Registered Student Details</h4>
              
              {!selectedEvent.registeredUsers || selectedEvent.registeredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎟️</div>
                  <div style={{ fontSize: '13px' }}>No registrations for this event yet.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Student Name', 'Email Address', 'College UID / Roll No'].map(h => <th key={h} style={t.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {selectedEvent.registeredUsers.map((u, i) => (
                      <tr key={u._id || i}>
                        <td style={t.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#f97316' }}>
                              {getInitials(u.name)}
                            </div>
                            <span style={{ fontWeight: '600', color: '#fff' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={t.td}>{u.email}</td>
                        <td style={t.td}>{u.collegeUid || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>
              Please select an event from the list above to view its registered students.
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Section: Analytics ───────────────────────────────────────────────
  const renderAnalyticsSection = () => {
    const catCounts = CATEGORIES.map(c => ({ l: c.slice(0, 4), v: events.filter(e => e.category === c).length }));
    
    // Dynamic Monthly Registrations
    const currentMonthIdx = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonthIdx - i);
      last6Months.push({
        l: d.toLocaleString('default', { month: 'short' }),
        monthNum: d.getMonth(),
        year: d.getFullYear(),
        v: 0
      });
    }
    
    events.forEach(ev => {
      if (!ev.date) return;
      const dateObj = new Date(ev.date);
      const m = dateObj.getMonth();
      const y = dateObj.getFullYear();
      const matching = last6Months.find(lm => lm.monthNum === m && lm.year === y);
      if (matching) {
        matching.v += (ev.registeredUsers?.length || 0);
      }
    });

    const topEvents = [...events]
      .sort((a, b) => (b.registeredUsers?.length || 0) - (a.registeredUsers?.length || 0))
      .slice(0, 4);

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={t.card}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 6px' }}>Events by Category</h3>
          <p style={{ fontSize: '12px', color: '#666', margin: '0 0 20px' }}>Distribution of events across categories</p>
          <BarChart data={catCounts} color="#f97316" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            {CATEGORIES.map((c, i) => (
              <span key={c} style={t.badge(['#f97316','#3b82f6','#22c55e','#a855f7','#ec4899'][i % 5])}>{c}: {events.filter(e => e.category === c).length}</span>
            ))}
          </div>
        </div>
        <div style={t.card}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 6px' }}>Monthly Registrations</h3>
          <p style={{ fontSize: '12px', color: '#666', margin: '0 0 20px' }}>Registration trend over 6 months</p>
          <BarChart data={last6Months} color="#f97316" />
        </div>
        <div style={t.card}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 20px' }}>Platform Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[
              { label: 'Total Events',   value: events.length,                              color: '#f97316' },
              { label: 'Active Events',  value: events.filter(e => new Date(e.date) > new Date()).length, color: '#22c55e' },
              { label: 'Total Users',    value: users.length || 0,                          color: '#3b82f6' },
              { label: 'Completion Rate',value: events.length ? Math.round((events.filter(e => new Date(e.date) <= new Date()).length / events.length) * 100) + '%' : '0%', color: '#a855f7' },
            ].map((s, i) => (
              <div key={i} style={{ background: `${s.color}0f`, border: `1px solid ${s.color}25`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={t.card}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 20px' }}>Top Events</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topEvents.map((ev, i) => (
              <div key={ev._id || i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#f97316', minWidth: '20px' }}>{i + 1}.</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>{ev.category || 'General'}</div>
                </div>
                <div style={{ background: 'rgba(249,115,22,0.15)', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: '700', color: '#f97316' }}>{ev.registeredUsers?.length || 0} reg.</div>
              </div>
            ))}
            {events.length === 0 && <div style={{ textAlign: 'center', color: '#555', padding: '20px' }}>No events data yet.</div>}
          </div>
        </div>
      </div>
    );
  };

  // ── Section: Notifications / Announcements ───────────────────────────
  const renderNotificationsSection = () => {
    return (
      <div style={{ maxWidth: '600px' }}>
        <div style={{ ...t.card, marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 18px' }}>Send Announcement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={t.label}>Message</label>
              <textarea 
                rows={3} 
                placeholder="Type your announcement here..." 
                value={msgText} 
                onChange={e => setMsgText(e.target.value)} 
                style={{ ...t.input, resize: 'vertical' }} 
                onFocus={e => e.target.style.borderColor = '#f97316'} 
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} 
              />
            </div>
            <button 
              onClick={handleSendAnnouncement} 
              style={{ ...t.btnOrg, padding: '12px', justifyContent: 'center', borderRadius: '10px' }}
            >
              Send to All Students
            </button>
          </div>
        </div>
        <div style={t.card}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 16px' }}>Recent Announcements</h3>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#555', padding: '20px 0' }}>No announcements sent yet.</div>
          ) : (
            notifications.map((n, i) => (
              <div 
                key={n.id || i} 
                style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  padding: '14px 0', 
                  borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' 
                }}
              >
                <span style={{ fontSize: '20px' }}>{n.emoji || '📢'}</span>
                <div>
                  <div style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.4 }}>{n.text}</div>
                  <div style={{ fontSize: '11px', color: '#555', marginTop: '5px' }}>{n.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ── Section: Settings ────────────────────────────────────────────────
  const renderSettingsSection = () => (
    <div style={{ maxWidth: '580px' }}>
      <div style={t.card}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg,#f97316,#c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '22px' }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: '0 0 3px' }}>{user?.name}</h2>
            <div style={{ fontSize: '13px', color: '#888' }}>{user?.email}</div>
            <span style={{ ...t.badge('#f97316'), marginTop: '8px', display: 'inline-flex' }}>⚙️ Administrator</span>
          </div>
        </div>
        {[
          { label: 'Platform Name',      value: 'SCEE — Smart Campus Event Engine' },
          { label: 'Admin Email',        value: user?.email || 'admin@campus.edu' },
          { label: 'Default Event Capacity', value: '200 students' },
          { label: 'Registration Open',  value: 'Yes — Students can register' },
          { label: 'Notifications',      value: 'Enabled' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <span style={{ fontSize: '13px', color: '#888' }}>{f.label}</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#ddd' }}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────
  const renderSection = () => {
    switch (section) {
      case 'dashboard':     return renderDashboardSection();
      case 'create':        return renderCreateSection();
      case 'manage':        return renderManageSection();
      case 'registrations': return renderRegistrationsSection();
      case 'users':         return renderUsersSection();
      case 'analytics':     return renderAnalyticsSection();
      case 'notifications': return renderNotificationsSection();
      case 'settings':      return renderSettingsSection();
      default:              return renderDashboardSection();
    }
  };

  return (
    <div style={{ display: 'flex', background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: "'Inter',sans-serif" }}>
      {renderSidebar()}
      <div style={{ flex: 1, marginLeft: isCollapsed ? '72px' : '240px', transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)', minWidth: 0 }}>
        {renderTopBar()}
        {renderFlashMsg()}
        <main style={{ marginTop: '62px', padding: '28px', minHeight: 'calc(100vh - 62px)', background: '#0a0a0a' }}>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
