import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import BorderGlow from './BorderGlow';
import EventTicket from './EventTicket';

// ── Inline SVG Icon helper ───────────────────────────────────────────
const Ic = ({ d, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const I = {
  grid:    <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
  search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  list:    <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
  cal:     <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  bell:    <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  user:    <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  logout:  <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  ticket:  <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></>,
  check:   <><polyline points="20 6 9 17 4 12"/></>,
  clock:   <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  star:    <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
};

// ── Style tokens ─────────────────────────────────────────────────────
const t = {
  card:    { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' },
  btnOrg:  { background: '#f97316', color: '#fff', border: 'none', borderRadius: '100px', padding: '10px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnOtl:  { background: 'transparent', color: '#f97316', border: '1px solid rgba(249,115,22,0.35)', borderRadius: '100px', padding: '8px 16px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  input:   { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" },
  badge:   (c) => ({ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', background: `${c}22`, color: c, border: `1px solid ${c}33` }),
};

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar'];
const EMOJIS = ['🎵','💻','🏆','🎭','📚','🤝','🎨','⚽'];

function getInitials(name) {
  if (!name) return 'ST';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ── Main Component ────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTicketEvent, setShowTicketEvent] = useState(null); // event to show ticket for

  // View mode toggles
  const [browseView, setBrowseView] = useState('grid');
  const [registrationsView, setRegistrationsView] = useState('list');
  const [upcomingView, setUpcomingView] = useState('list');

  // Custom registration modal states
  const [registrationTarget, setRegistrationTarget] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState('confirm'); // 'confirm' | 'loading' | 'success' | 'error'
  const [registrationError, setRegistrationError] = useState('');

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await api.put('/notifications/read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/events')
      .then(r => setEvents(r.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));

    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (section === 'notifications') {
      markNotificationsAsRead();
    }
  }, [section]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const handleRegister = (eventId) => {
    const target = events.find(e => e._id === eventId);
    if (!target) return;
    setRegistrationTarget(target);
    setRegistrationStatus('confirm');
    setRegistrationError('');
  };

  const executeRegistration = async (eventId) => {
    setRegistrationStatus('loading');
    try {
      await api.post(`/events/${eventId}/register`);
      setRegistrationStatus('success');
      const res = await api.get('/events');
      setEvents(res.data || []);
      // Update modal selected event if it's currently open
      if (selectedEvent && selectedEvent._id === eventId) {
        const updated = res.data.find(e => e._id === eventId);
        setSelectedEvent(updated);
      }
    } catch (err) {
      setRegistrationStatus('error');
      setRegistrationError(err.response?.data?.message || 'Error registering');
    }
  };

  const upcoming  = events.filter(e => new Date(e.date) > new Date());
  const completed = events.filter(e => new Date(e.date) <= new Date());
  const myRegistrations = events.filter(e => e.registeredUsers?.some(u => (u?._id || u) === user?._id));

  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',       icon: I.grid },
    { id: 'browse',        label: 'Browse Events',   icon: I.search },
    { id: 'registrations', label: 'My Registrations',icon: I.list },
    { id: 'upcoming',      label: 'Upcoming Events', icon: I.cal },
    { id: 'notifications', label: 'Notifications',   icon: I.bell },
    { id: 'profile',       label: 'Profile',         icon: I.user },
  ];

  // ── Sidebar ─────────────────────────────────────────────────────────
  const renderSidebar = () => (
    <aside style={{ width: isCollapsed ? '72px' : '240px', background: '#111', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40, display: 'flex', flexDirection: 'column', overflowY: 'auto', transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div style={{ padding: isCollapsed ? '24px 0 18px' : '24px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', flexDirection: isCollapsed ? 'column' : 'row', gap: isCollapsed ? '12px' : '0' }}>
        {!isCollapsed ? (
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '0.05em', color: '#fff' }}>
              SCEE<span style={{ color: '#f97316' }}>.</span>
            </div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Student Portal</div>
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
              {item.id === 'notifications' && unreadCount > 0 && (
                isCollapsed ? (
                  <span style={{ position: 'absolute', top: '8px', right: '12px', background: '#f97316', borderRadius: '50%', width: '8px', height: '8px', border: '2px solid #111' }} />
                ) : (
                  <span style={{ background: '#f97316', color: '#fff', borderRadius: '100px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>{unreadCount}</span>
                )
              )}
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
          {navItems.find(n => n.id === section)?.label || 'Dashboard'}
        </span>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', width: '260px' }}>
        <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px' }} fill="none" stroke="#555" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Search events..." value={search}
          onChange={e => { setSearch(e.target.value); if (e.target.value && section !== 'browse') setSection('browse'); }}
          style={{ ...t.input, paddingLeft: '32px', borderRadius: '100px', height: '36px' }}
          onFocus={e => e.target.style.borderColor = '#f97316'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>

      {/* Bell */}
      <button onClick={() => setSection('notifications')} style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#aaa' }}>
        <Ic d={I.bell} size={15} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', background: '#f97316', borderRadius: '50%', border: '2px solid #0e0e0e' }} />
        )}
      </button>

      {/* Profile button */}
      <button onClick={() => setSection('profile')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '5px 12px 5px 5px', cursor: 'pointer', transition: 'border-color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#f97316,#c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '11px', boxShadow: '0 0 10px rgba(249,115,22,0.3)' }}>
          {getInitials(user?.name)}
        </div>
        {!isCollapsed && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff', lineHeight: 1 }}>{user?.name?.split(' ')[0] || 'Student'}</div>
            <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{user?.collegeUid || 'No UID'}</div>
          </div>
        )}
      </button>
    </header>
  );

  // ── Section: Dashboard ───────────────────────────────────────────────
  const renderDashboardSection = () => {
    const stats = [
      { label: 'Total Events',    value: events.length,    icon: I.ticket, color: '#f97316' },
      { label: 'Registered',      value: myRegistrations.length, icon: I.check,  color: '#22c55e' },
      { label: 'Upcoming',        value: upcoming.length,  icon: I.clock,  color: '#3b82f6' },
      { label: 'Completed',       value: completed.length, icon: I.star,   color: '#a855f7' },
    ];
    return (
      <div>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', margin: '0 0 6px' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Here's what's happening with campus events today.</p>
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

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
          {/* Featured Events */}
          <div style={t.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>Featured Events</h3>
              <button onClick={() => setSection('browse')} style={t.btnOtl}>View All</button>
            </div>
            {loading ? <div style={{ textAlign: 'center', color: '#555', padding: '40px' }}>Loading...</div> :
              events.length === 0 ? <div style={{ textAlign: 'center', color: '#555', padding: '40px' }}>No events yet. Check back soon!</div> :
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {events.slice(0, 5).map((ev, i) => (
                    <div key={ev._id || i} onClick={() => setSelectedEvent(ev)} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg,rgba(249,115,22,0.25),rgba(12,74,110,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                        {EMOJIS[i % EMOJIS.length]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                        <div style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>
                          {ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'} · {ev.venue || ev.location || 'Campus'}
                        </div>
                      </div>
                      <span style={t.badge(new Date(ev.date) > new Date() ? '#22c55e' : '#888')}>
                        {new Date(ev.date) > new Date() ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* Notifications */}
          <div style={t.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>Notifications</h3>
              <button onClick={() => setSection('notifications')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', fontSize: '12px', fontWeight: '600' }}>See all →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#555', padding: '20px 0', fontSize: '13px' }}>No notifications yet.</div>
              ) : (
                notifications.slice(0, 3).map(n => (
                  <div key={n.id} style={{ display: 'flex', gap: '10px', padding: '10px', background: n.read ? 'transparent' : 'rgba(249,115,22,0.06)', borderRadius: '10px', border: `1px solid ${n.read ? 'rgba(255,255,255,0.04)' : 'rgba(249,115,22,0.15)'}` }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{n.emoji}</span>
                    <div>
                      <div style={{ fontSize: '12px', color: '#ccc', lineHeight: 1.4, fontWeight: n.read ? '400' : '600' }}>{n.text}</div>
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Event Categories */}
        <div style={{ ...t.card, marginTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 16px' }}>Event Categories</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[['Technical','💻','#3b82f6'],['Cultural','🎭','#ec4899'],['Sports','🏆','#22c55e'],['Workshop','📚','#f97316'],['Seminar','🎤','#a855f7']].map(([cat, emoji, color]) => (
              <button key={cat} onClick={() => { setCategory(cat); setSection('browse'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: `1px solid ${color}30`, background: `${color}10`, cursor: 'pointer', color: color, fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = `${color}22`}
                onMouseLeave={e => e.currentTarget.style.background = `${color}10`}>
                <span style={{ fontSize: '18px' }}>{emoji}</span>{cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Section: Browse Events ───────────────────────────────────────────
  const renderBrowseSection = () => {
    const filtered = events.filter(ev => {
      const q = search.toLowerCase();
      const matchQ = !q || ev.title?.toLowerCase().includes(q) || ev.description?.toLowerCase().includes(q) || (ev.location || ev.venue || '').toLowerCase().includes(q);
      const matchC = category === 'All' || ev.category === category;
      return matchQ && matchC;
    });
    return (
      <div>
        {/* Filters and View Toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px' }} fill="none" stroke="#555" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search by name, venue, category..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...t.input, paddingLeft: '34px', borderRadius: '100px', height: '40px' }}
              onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...t.input, width: 'auto', minWidth: '130px', borderRadius: '100px', height: '40px', cursor: 'pointer' }}>
            {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
          </select>
          
          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', height: '40px', boxSizing: 'border-box', alignItems: 'center' }}>
            <button onClick={() => setBrowseView('grid')} title="Grid View" style={{ background: browseView === 'grid' ? 'rgba(249,115,22,0.15)' : 'transparent', border: 'none', borderRadius: '8px', color: browseView === 'grid' ? '#f97316' : '#888', cursor: 'pointer', padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
              <Ic d={I.grid} size={16} />
            </button>
            <button onClick={() => setBrowseView('list')} title="List View" style={{ background: browseView === 'list' ? 'rgba(249,115,22,0.15)' : 'transparent', border: 'none', borderRadius: '8px', color: browseView === 'list' ? '#f97316' : '#888', cursor: 'pointer', padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
              <Ic d={I.list} size={16} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: '7px 16px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: category === c ? '#f97316' : 'rgba(255,255,255,0.07)', color: category === c ? '#fff' : '#999', fontFamily: "'Inter',sans-serif" }}>
              {c}
            </button>
          ))}
        </div>
        {loading ? <div style={{ textAlign: 'center', color: '#555', padding: '80px', fontSize: '15px' }}>Loading events...</div> :
          filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <div style={{ fontSize: '52px', marginBottom: '14px' }}>🔍</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#888' }}>No events found</div>
              <div style={{ fontSize: '13px', color: '#555', marginTop: '6px' }}>Try adjusting your search or filters</div>
            </div>
          ) : browseView === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
              {filtered.map((ev, i) => {
                const isRegistered = ev.registeredUsers?.some(u => (u?._id || u) === user?._id);
                const isFull = (ev.registeredUsers?.length || 0) >= ev.capacity;
                const showImage = ev.imageUrl && ev.imageUrl.trim() !== '';

                return (
                  <div key={ev._id || i} onClick={() => setSelectedEvent(ev)} style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ height: '150px', background: showImage ? 'transparent' : `linear-gradient(135deg,rgba(249,115,22,0.25) 0%,rgba(12,74,110,0.35) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', position: 'relative', overflow: 'hidden' }}>
                      {showImage ? (
                        <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        EMOJIS[i % EMOJIS.length]
                      )}
                      <span style={{ ...t.badge(new Date(ev.date) > new Date() ? '#22c55e' : '#888'), position: 'absolute', top: '12px', right: '12px', zIndex: 5 }}>
                        {new Date(ev.date) > new Date() ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '10px', lineHeight: 1.3 }}>{ev.title}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px', flex: 1 }}>
                        <span style={{ fontSize: '12px', color: '#777' }}>📅 {ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                        <span style={{ fontSize: '12px', color: '#777' }}>📍 {ev.venue || ev.location || 'Main Campus'}</span>
                        <span style={{ fontSize: '12px', color: '#777' }}>🏷️ {ev.category || 'General'}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isRegistered && !isFull) handleRegister(ev._id);
                        }}
                        disabled={isRegistered || isFull}
                        style={{ 
                          ...t.btnOrg, 
                          width: '100%', 
                          justifyContent: 'center', 
                          padding: '11px',
                          background: isRegistered ? 'rgba(255,255,255,0.08)' : isFull ? 'rgba(239,68,68,0.1)' : '#f97316',
                          color: isRegistered ? '#666' : isFull ? '#f87171' : '#fff',
                          border: isRegistered ? '1px solid rgba(255,255,255,0.05)' : isFull ? '1px solid rgba(239,68,68,0.2)' : 'none',
                          cursor: (isRegistered || isFull) ? 'not-allowed' : 'pointer'
                        }}
                        onMouseEnter={e => { if (!isRegistered && !isFull) e.currentTarget.style.background = '#fb923c'; }}
                        onMouseLeave={e => { if (!isRegistered && !isFull) e.currentTarget.style.background = '#f97316'; }}>
                        {isRegistered ? 'Registered' : isFull ? 'Sold Out' : 'Register Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filtered.map((ev, i) => {
                const isRegistered = ev.registeredUsers?.some(u => (u?._id || u) === user?._id);
                const isFull = (ev.registeredUsers?.length || 0) >= ev.capacity;
                const showImage = ev.imageUrl && ev.imageUrl.trim() !== '';
                return (
                  <div key={ev._id || i} onClick={() => setSelectedEvent(ev)} style={{ ...t.card, display: 'flex', gap: '18px', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: showImage ? 'transparent' : 'linear-gradient(135deg,rgba(249,115,22,0.3),rgba(12,74,110,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0, overflow: 'hidden' }}>
                      {showImage ? (
                        <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        EMOJIS[i % EMOJIS.length]
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</h3>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#777' }}>📅 {ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                        <span style={{ fontSize: '12px', color: '#777' }}>📍 {ev.venue || ev.location || 'Campus'}</span>
                        <span style={t.badge(new Date(ev.date) > new Date() ? '#22c55e' : '#888')}>{new Date(ev.date) > new Date() ? 'Upcoming' : 'Past'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isRegistered && !isFull) handleRegister(ev._id);
                      }}
                      disabled={isRegistered || isFull}
                      style={{ 
                        ...t.btnOrg, 
                        flexShrink: 0,
                        background: isRegistered ? 'rgba(255,255,255,0.08)' : isFull ? 'rgba(239,68,68,0.1)' : '#f97316',
                        color: isRegistered ? '#666' : isFull ? '#f87171' : '#fff',
                        border: isRegistered ? '1px solid rgba(255,255,255,0.05)' : isFull ? '1px solid rgba(239,68,68,0.2)' : 'none',
                        cursor: (isRegistered || isFull) ? 'not-allowed' : 'pointer'
                      }}
                      onMouseEnter={e => { if (!isRegistered && !isFull) e.currentTarget.style.background = '#fb923c'; }}
                      onMouseLeave={e => { if (!isRegistered && !isFull) e.currentTarget.style.background = '#f97316'; }}>
                      {isRegistered ? 'Registered' : isFull ? 'Sold Out' : 'Register'}
                    </button>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>
    );
  };

  // ── Section: My Registrations ────────────────────────────────────────
  const renderRegistrationsSection = () => (
    <div>
      {/* Header and Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>Registered Events</h2>
        {myRegistrations.length > 0 && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', height: '40px', boxSizing: 'border-box', alignItems: 'center' }}>
            <button onClick={() => setRegistrationsView('grid')} title="Grid View" style={{ background: registrationsView === 'grid' ? 'rgba(249,115,22,0.15)' : 'transparent', border: 'none', borderRadius: '8px', color: registrationsView === 'grid' ? '#f97316' : '#888', cursor: 'pointer', padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
              <Ic d={I.grid} size={16} />
            </button>
            <button onClick={() => setRegistrationsView('list')} title="List View" style={{ background: registrationsView === 'list' ? 'rgba(249,115,22,0.15)' : 'transparent', border: 'none', borderRadius: '8px', color: registrationsView === 'list' ? '#f97316' : '#888', cursor: 'pointer', padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
              <Ic d={I.list} size={16} />
            </button>
          </div>
        )}
      </div>

      {myRegistrations.length === 0 ? (
        <div style={{ ...t.card, textAlign: 'center', padding: '70px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>No Registrations Yet</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>You haven't registered for any events. Start exploring!</p>
          <button onClick={() => setSection('browse')} style={{ ...t.btnOrg, padding: '13px 30px', fontSize: '14px' }}>Browse Events</button>
        </div>
      ) : registrationsView === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
          {myRegistrations.map((ev, i) => {
            const showImage = ev.imageUrl && ev.imageUrl.trim() !== '';
            return (
              <div key={ev._id || i} onClick={() => setSelectedEvent(ev)} style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ height: '150px', background: showImage ? 'transparent' : `linear-gradient(135deg,rgba(249,115,22,0.25) 0%,rgba(12,74,110,0.35) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', position: 'relative', overflow: 'hidden' }}>
                  {showImage ? (
                    <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    EMOJIS[i % EMOJIS.length]
                  )}
                  <span style={{ ...t.badge('#22c55e'), position: 'absolute', top: '12px', right: '12px', zIndex: 5 }}>
                    Registered
                  </span>
                </div>
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '10px', lineHeight: 1.3 }}>{ev.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px', flex: 1 }}>
                    <span style={{ fontSize: '12px', color: '#777' }}>📅 {ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                    <span style={{ fontSize: '12px', color: '#777' }}>📍 {ev.venue || ev.location || 'Main Campus'}</span>
                    <span style={{ fontSize: '12px', color: '#777' }}>🏷️ {ev.category || 'General'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }} style={{ ...t.btnOtl, flex: 1, justifyContent: 'center' }}>
                      View Details
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowTicketEvent(ev); }}
                      style={{ ...t.btnOrg, flex: 1, justifyContent: 'center', gap: '5px', fontSize: '12px', padding: '9px 14px' }}
                    >
                      🎫 Pass
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {myRegistrations.map((ev, i) => {
            const showImage = ev.imageUrl && ev.imageUrl.trim() !== '';
            return (
              <div key={ev._id || i} onClick={() => setSelectedEvent(ev)} style={{ ...t.card, display: 'flex', gap: '18px', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: showImage ? 'transparent' : 'linear-gradient(135deg,rgba(249,115,22,0.3),rgba(12,74,110,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0, overflow: 'hidden' }}>
                  {showImage ? (
                    <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    EMOJIS[i % EMOJIS.length]
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>{ev.title}</h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#777' }}>📅 {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ fontSize: '12px', color: '#777' }}>📍 {ev.venue || ev.location || 'Campus'}</span>
                    <span style={{ ...t.badge('#22c55e'), fontSize: '11px' }}>Registered</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }} style={t.btnOtl}>
                    View Details
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowTicketEvent(ev); }}
                    style={{ ...t.btnOrg, fontSize: '12px', padding: '9px 16px', gap: '5px' }}
                  >
                    🎫 Pass
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Section: Upcoming ────────────────────────────────────────────────
  const renderUpcomingSection = () => (
    <div>
      {/* Header and Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>Upcoming Events</h2>
        {upcoming.length > 0 && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', height: '40px', boxSizing: 'border-box', alignItems: 'center' }}>
            <button onClick={() => setUpcomingView('grid')} title="Grid View" style={{ background: upcomingView === 'grid' ? 'rgba(249,115,22,0.15)' : 'transparent', border: 'none', borderRadius: '8px', color: upcomingView === 'grid' ? '#f97316' : '#888', cursor: 'pointer', padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
              <Ic d={I.grid} size={16} />
            </button>
            <button onClick={() => setUpcomingView('list')} title="List View" style={{ background: upcomingView === 'list' ? 'rgba(249,115,22,0.15)' : 'transparent', border: 'none', borderRadius: '8px', color: upcomingView === 'list' ? '#f97316' : '#888', cursor: 'pointer', padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
              <Ic d={I.list} size={16} />
            </button>
          </div>
        )}
      </div>

      {upcoming.length === 0 ? (
        <div style={{ ...t.card, textAlign: 'center', padding: '70px' }}>
          <div style={{ fontSize: '56px', marginBottom: '14px' }}>📅</div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>No Upcoming Events</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>New events will appear here when scheduled.</p>
        </div>
      ) : upcomingView === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
          {upcoming.map((ev, i) => {
            const daysLeft = Math.ceil((new Date(ev.date) - new Date()) / 86400000);
            const isRegistered = ev.registeredUsers?.some(u => (u?._id || u) === user?._id);
            const isFull = (ev.registeredUsers?.length || 0) >= ev.capacity;
            const showImage = ev.imageUrl && ev.imageUrl.trim() !== '';

            return (
              <div key={ev._id || i} onClick={() => setSelectedEvent(ev)} style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ height: '150px', background: showImage ? 'transparent' : `linear-gradient(135deg,rgba(249,115,22,0.25) 0%,rgba(12,74,110,0.35) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', position: 'relative', overflow: 'hidden' }}>
                  {showImage ? (
                    <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    EMOJIS[i % EMOJIS.length]
                  )}
                  <span style={{ ...t.badge('#f97316'), position: 'absolute', top: '12px', right: '12px', zIndex: 5 }}>
                    {daysLeft} {daysLeft === 1 ? 'day left' : 'days left'}
                  </span>
                </div>
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '10px', lineHeight: 1.3 }}>{ev.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px', flex: 1 }}>
                    <span style={{ fontSize: '12px', color: '#777' }}>📅 {ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                    <span style={{ fontSize: '12px', color: '#777' }}>📍 {ev.venue || ev.location || 'Main Campus'}</span>
                    <span style={{ fontSize: '12px', color: '#777' }}>🏷️ {ev.category || 'General'}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isRegistered && !isFull) handleRegister(ev._id);
                    }}
                    disabled={isRegistered || isFull}
                    style={{ 
                      ...t.btnOrg, 
                      width: '100%', 
                      justifyContent: 'center', 
                      padding: '11px',
                      background: isRegistered ? 'rgba(255,255,255,0.08)' : isFull ? 'rgba(239,68,68,0.1)' : '#f97316',
                      color: isRegistered ? '#666' : isFull ? '#f87171' : '#fff',
                      border: isRegistered ? '1px solid rgba(255,255,255,0.05)' : isFull ? '1px solid rgba(239,68,68,0.2)' : 'none',
                      cursor: (isRegistered || isFull) ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={e => { if (!isRegistered && !isFull) e.currentTarget.style.background = '#fb923c'; }}
                    onMouseLeave={e => { if (!isRegistered && !isFull) e.currentTarget.style.background = '#f97316'; }}>
                    {isRegistered ? 'Registered' : isFull ? 'Sold Out' : 'Register Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {upcoming.map((ev, i) => {
            const daysLeft = Math.ceil((new Date(ev.date) - new Date()) / 86400000);
            const isRegistered = ev.registeredUsers?.some(u => (u?._id || u) === user?._id);
            const isFull = (ev.registeredUsers?.length || 0) >= ev.capacity;
            const showImage = ev.imageUrl && ev.imageUrl.trim() !== '';

            return (
              <div key={ev._id || i} onClick={() => setSelectedEvent(ev)} style={{ ...t.card, display: 'flex', gap: '18px', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: showImage ? 'transparent' : 'linear-gradient(135deg,rgba(249,115,22,0.3),rgba(12,74,110,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0, overflow: 'hidden' }}>
                  {showImage ? (
                    <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    EMOJIS[i % EMOJIS.length]
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>{ev.title}</h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#777' }}>📅 {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ fontSize: '12px', color: '#777' }}>📍 {ev.venue || ev.location || 'Campus'}</span>
                    <span style={{ ...t.badge('#f97316'), fontSize: '11px' }}>{ev.category || 'General'}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#f97316', lineHeight: 1 }}>{daysLeft}</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>days left</div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isRegistered && !isFull) handleRegister(ev._id);
                  }}
                  disabled={isRegistered || isFull}
                  style={{ 
                    ...t.btnOrg, 
                    flexShrink: 0,
                    background: isRegistered ? 'rgba(255,255,255,0.08)' : isFull ? 'rgba(239,68,68,0.1)' : '#f97316',
                    color: isRegistered ? '#666' : isFull ? '#f87171' : '#fff',
                    border: isRegistered ? '1px solid rgba(255,255,255,0.05)' : isFull ? '1px solid rgba(239,68,68,0.2)' : 'none',
                    cursor: (isRegistered || isFull) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={e => { if (!isRegistered && !isFull) e.currentTarget.style.background = '#fb923c'; }}
                  onMouseLeave={e => { if (!isRegistered && !isFull) e.currentTarget.style.background = '#f97316'; }}>
                  {isRegistered ? 'Registered' : isFull ? 'Sold Out' : 'Register'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Section: Notifications ───────────────────────────────────────────
  const renderNotificationsSection = () => (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.length === 0 ? (
          <div style={{ ...t.card, textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔔</div>
            <div style={{ fontSize: '14px' }}>No notifications yet.</div>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} style={{ ...t.card, display: 'flex', gap: '14px', padding: '16px 20px', borderColor: n.read ? 'rgba(255,255,255,0.08)' : 'rgba(249,115,22,0.22)', background: n.read ? '#141414' : 'rgba(249,115,22,0.04)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: n.read ? 'rgba(255,255,255,0.05)' : 'rgba(249,115,22,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {n.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: '#ddd', lineHeight: 1.5, fontWeight: n.read ? '400' : '600' }}>{n.text}</div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>{n.time}</div>
              </div>
              {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', flexShrink: 0, marginTop: '5px' }} />}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ── Section: Profile ─────────────────────────────────────────────────
  const renderProfileSection = () => (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ ...t.card, marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg,#f97316,#c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '28px', flexShrink: 0, boxShadow: '0 0 30px rgba(249,115,22,0.35)' }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: '0 0 4px' }}>{user?.name || 'Student'}</h2>
            <div style={{ fontSize: '13px', color: '#888' }}>{user?.email}</div>
            <span style={{ ...t.badge('#f97316'), marginTop: '10px', display: 'inline-flex' }}>🎓 Student</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {[
            { label: 'College UID / Roll No.', value: user?.collegeUid || 'Not set', emoji: '🆔' },
            { label: 'Email Address',           value: user?.email || 'N/A',         emoji: '✉️' },
            { label: 'Registered Events',       value: `${myRegistrations.length} events`, emoji: '📋' },
            { label: 'Account Status',          value: 'Active',                     emoji: '✅' },
          ].map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{f.emoji} {f.label}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#ddd' }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[
          { label: 'Events Attended', value: completed.length, color: '#22c55e' },
          { label: 'Upcoming',        value: upcoming.length,  color: '#3b82f6' },
          { label: 'Total Events',    value: events.length,    color: '#f97316' },
        ].map((s, i) => (
          <div key={i} style={{ ...t.card, textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '30px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────
  const renderSection = () => {
    switch (section) {
      case 'dashboard':     return renderDashboardSection();
      case 'browse':        return renderBrowseSection();
      case 'registrations': return renderRegistrationsSection();
      case 'upcoming':      return renderUpcomingSection();
      case 'notifications': return renderNotificationsSection();
      case 'profile':       return renderProfileSection();
      default:              return renderDashboardSection();
    }
  };

  const renderEventDetailsModal = () => {
    if (!selectedEvent) return null;
    const ev = selectedEvent;
    const isRegistered = ev.registeredUsers?.some(u => (u?._id || u) === user?._id);
    const isFull = (ev.registeredUsers?.length || 0) >= ev.capacity;
    const showImage = ev.imageUrl && ev.imageUrl.trim() !== '';

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }} onClick={() => setSelectedEvent(null)}>
        
        {/* Modal Content Card */}
        <div style={{
          width: '100%',
          maxWidth: '720px',
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }} onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>Event Details</h2>
            <button onClick={() => setSelectedEvent(null)} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#999',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'all 0.2s',
              border: 'none'
            }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
               onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#999'; }}>
              &times;
            </button>
          </div>

          {/* Body (scrollable) */}
          <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Banner Image */}
            <div style={{ width: '100%', height: '240px', borderRadius: '16px', background: showImage ? 'transparent' : 'linear-gradient(135deg,rgba(249,115,22,0.3),rgba(12,74,110,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
              {showImage ? (
                <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                '🎫'
              )}
            </div>

            {/* Info */}
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <span style={t.badge('#f97316')}>{ev.category || 'General'}</span>
                <span style={t.badge(new Date(ev.date) > new Date() ? '#22c55e' : '#888')}>{new Date(ev.date) > new Date() ? 'Upcoming' : 'Past'}</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 16px', lineHeight: 1.25 }}>{ev.title}</h1>
            </div>

            {/* Layout block */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '24px' }}>
              
              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Description</h3>
                <p style={{ fontSize: '14px', color: '#bbb', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{ev.description || 'No description provided.'}</p>
              </div>

              {/* Sidebar Info */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Date', val: ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD', emoji: '📅' },
                  { label: 'Time', val: ev.time || 'Not specified', emoji: '🕒' },
                  { label: 'Venue', val: ev.venue || ev.location || 'Main Campus', emoji: '📍' },
                  { label: 'Capacity', val: `${ev.registeredUsers?.length || 0} / ${ev.capacity}`, emoji: '👥' },
                  { label: 'Organizer', val: ev.organizer?.name || 'Administrator', emoji: '👤' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{item.emoji}</span>
                    <div>
                      <div style={{ fontSize: '11px', color: '#555', fontWeight: '600', textTransform: 'uppercase' }}>{item.label}</div>
                      <div style={{ fontSize: '13px', color: '#ddd', fontWeight: '600', marginTop: '2px' }}>{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Footer Action buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '18px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: '#111'
          }}>
            <button onClick={() => setSelectedEvent(null)} style={{ ...t.btnOtl, color: '#aaa', border: '1px solid rgba(255,255,255,0.1)' }}>
              Close
            </button>
            <button 
              onClick={() => handleRegister(ev._id)} 
              disabled={isRegistered || isFull}
              style={{
                ...t.btnOrg,
                background: isRegistered ? 'rgba(255,255,255,0.08)' : isFull ? 'rgba(239,68,68,0.1)' : '#f97316',
                color: isRegistered ? '#666' : isFull ? '#f87171' : '#fff',
                border: isRegistered ? '1px solid rgba(255,255,255,0.05)' : isFull ? '1px solid rgba(239,68,68,0.2)' : 'none',
                cursor: (isRegistered || isFull) ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={e => { if (!isRegistered && !isFull) e.currentTarget.style.background = '#fb923c'; }}
              onMouseLeave={e => { if (!isRegistered && !isFull) e.currentTarget.style.background = '#f97316'; }}>
              {isRegistered ? 'Registered' : isFull ? 'Sold Out' : 'Register for Event'}
            </button>
          </div>

        </div>
      </div>
    );
  };

  const renderRegistrationModal = () => {
    if (!registrationTarget) return null;
    const ev = registrationTarget;

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }} onClick={() => { if (registrationStatus !== 'loading') setRegistrationTarget(null); }}>
        
        <BorderGlow animated={true} glowColor="25 95 53" borderRadius={24} className="shadow-[0_0_50px_rgba(249,115,22,0.3)]">
          <div style={{
            width: '100%',
            maxWidth: '420px',
            background: '#141414',
            padding: '30px',
            borderRadius: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            {registrationStatus !== 'loading' && (
              <button onClick={() => setRegistrationTarget(null)} style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                color: '#888',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                 onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#888'; }}>
                &times;
              </button>
            )}

            {/* Icon / Emoji based on status */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: registrationStatus === 'success' ? 'rgba(34,197,94,0.1)' : registrationStatus === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              margin: '10px auto 0',
              color: registrationStatus === 'success' ? '#22c55e' : registrationStatus === 'error' ? '#ef4444' : '#f97316',
            }}>
              {registrationStatus === 'confirm' && '🎟️'}
              {registrationStatus === 'loading' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid rgba(249,115,22,0.2)',
                  borderTop: '3px solid #f97316',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
              )}
              {registrationStatus === 'success' && '🎉'}
              {registrationStatus === 'error' && '❌'}
            </div>

            {/* Text details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>
                {registrationStatus === 'confirm' && 'Confirm Registration'}
                {registrationStatus === 'loading' && 'Reserving Spot...'}
                {registrationStatus === 'success' && 'You\'re In!'}
                {registrationStatus === 'error' && 'Registration Failed'}
              </h3>
              <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.5 }}>
                {registrationStatus === 'confirm' && `Are you sure you want to register for ${ev.title}? This will reserve a spot under your name.`}
                {registrationStatus === 'loading' && `Securing your spot for ${ev.title}. Please hold on.`}
                {registrationStatus === 'success' && `Successfully registered for ${ev.title}! We look forward to seeing you at the venue.`}
                {registrationStatus === 'error' && (registrationError || 'Could not complete registration. Please try again.')}
              </p>
            </div>

            {/* Event Summary Details in confirm/success status */}
            {(registrationStatus === 'confirm' || registrationStatus === 'success') && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.title}
                </div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#666' }}>
                  <span>📅 {ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                  <span>📍 {ev.venue || ev.location || 'Campus'}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              {registrationStatus === 'confirm' && (
                <>
                  <button onClick={() => setRegistrationTarget(null)} style={{ ...t.btnOtl, flex: 1, justifyContent: 'center', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Cancel
                  </button>
                  <button onClick={() => executeRegistration(ev._id)} style={{ ...t.btnOrg, flex: 1, justifyContent: 'center' }}>
                    Confirm & Register
                  </button>
                </>
              )}
              {registrationStatus === 'success' && (
                <>
                  <button
                    onClick={() => {
                      setShowTicketEvent(registrationTarget);
                      setRegistrationTarget(null);
                    }}
                    style={{ ...t.btnOrg, flex: 1, justifyContent: 'center', gap: '6px' }}
                  >
                    🎫 View & Download Pass
                  </button>
                  <button onClick={() => setRegistrationTarget(null)} style={{ ...t.btnOtl, flex: 1, justifyContent: 'center', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Close
                  </button>
                </>
              )}
              {registrationStatus === 'error' && (
                <button onClick={() => setRegistrationTarget(null)} style={{ ...t.btnOrg, flex: 1, justifyContent: 'center', background: '#ef4444' }}>
                  Close
                </button>
              )}
            </div>

          </div>
        </BorderGlow>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: "'Inter',sans-serif" }}>
      {renderSidebar()}
      <div style={{ flex: 1, marginLeft: isCollapsed ? '72px' : '240px', transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)', minWidth: 0 }}>
        {renderTopBar()}
        <main style={{ marginTop: '62px', padding: '28px', minHeight: 'calc(100vh - 62px)', background: '#0a0a0a' }}>
          {renderSection()}
        </main>
      </div>
      {selectedEvent && renderEventDetailsModal()}
      {registrationTarget && renderRegistrationModal()}
      {showTicketEvent && (
        <EventTicket
          event={showTicketEvent}
          user={user}
          onClose={() => setShowTicketEvent(null)}
        />
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
