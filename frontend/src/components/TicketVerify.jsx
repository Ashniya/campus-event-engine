/**
 * TicketVerify.jsx
 * Route: /ticket/:ticketId?d=<base64-encoded-JSON>
 *
 * When a QR code is scanned, it opens this page showing a full beautiful
 * ticket verification screen with all event + holder details.
 */

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';

// ── Decode base64 data from URL ───────────────────────────────────────
function decodeTicketData(b64) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch {
    return null;
  }
}

// ── Info Row ──────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, highlight = false }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      gap: '16px', padding: '13px 18px', borderRadius: '12px',
      background: highlight ? 'rgba(249,115,22,0.07)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${highlight ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', fontWeight: '500', letterSpacing: '0.03em' }}>
          {label}
        </span>
      </div>
      <span style={{
        fontSize: '13px', fontWeight: '700',
        color: highlight ? '#fb923c' : '#e5e5e5',
        textAlign: 'right', wordBreak: 'break-word', lineHeight: 1.4,
      }}>
        {value}
      </span>
    </div>
  );
}

// ── Fake barcode ──────────────────────────────────────────────────────
function Barcode({ id }) {
  return (
    <div style={{ display: 'flex', gap: '1.5px', alignItems: 'center', height: '36px', justifyContent: 'center' }}>
      {Array.from({ length: 80 }).map((_, i) => (
        <div key={i} style={{
          width: i % 5 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
          height: i % 7 === 0 ? '100%' : i % 4 === 0 ? '76%' : '52%',
          background: `rgba(249,115,22,${i % 2 === 0 ? '0.65' : '0.18'})`,
          borderRadius: '1px', flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

export default function TicketVerify() {
  const { ticketId }           = useParams();
  const [searchParams]         = useSearchParams();
  const [ticket, setTicket]    = useState(null);
  const [status, setStatus]    = useState('loading'); // 'loading' | 'valid' | 'invalid'
  const [timeStr, setTimeStr]  = useState('');

  useEffect(() => {
    const raw = searchParams.get('d');
    if (!raw) { setStatus('invalid'); return; }
    const shortData = decodeTicketData(raw);
    if (!shortData || shortData.t !== ticketId) { setStatus('invalid'); return; }
    
    // Map short keys back to full data
    const data = {
      ticketId: shortData.t,
      event: shortData.e,
      date: shortData.d,
      time: shortData.m,
      venue: shortData.v,
      category: shortData.c,
      organizer: shortData.o,
      description: shortData.x,
      holder: shortData.h,
      uid: shortData.u,
      email: shortData.em,
      issuedAt: shortData.i,
    };

    setTicket(data);
    setStatus('valid');
    // Format the issued time
    const issued = new Date(data.issuedAt);
    setTimeStr(issued.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
  }, [ticketId, searchParams]);

  /* ── LOADING ── */
  if (status === 'loading') {
    return (
      <div style={pageStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#fff' }}>
          <div style={{ width: '44px', height: '44px', border: '3px solid rgba(249,115,22,0.2)', borderTop: '3px solid #f97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Verifying ticket…</div>
        </div>
        <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── INVALID ── */
  if (status === 'invalid') {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '64px' }}>❌</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}>Invalid Ticket</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
            This QR code could not be verified. The ticket may be invalid, expired, or tampered with.
          </p>
          <Link to="/" style={{
            padding: '12px 28px', borderRadius: '10px', fontWeight: '700', fontSize: '14px',
            background: '#f97316', color: '#fff', boxShadow: '0 6px 20px rgba(249,115,22,0.35)',
          }}>
            Go to SCEE Home
          </Link>
        </div>
      </div>
    );
  }

  /* ── VALID ── */
  return (
    <div style={pageStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.7); } }
        @keyframes shimmer  { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
      `}</style>

      <div style={{
        maxWidth: '500px', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '0',
        animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1)',
        borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(249,115,22,0.12)',
      }}>

        {/* ══ TOP HEADER BAND ══ */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0a00 0%, #0f0700 50%, #120800 100%)',
          padding: '28px 28px 24px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: '-40px', left: '-20px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '-20px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {/* Texture */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '18px 18px', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Brand */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '0.04em', color: '#fff' }}>
                SCEE<span style={{ color: '#f97316' }}>.</span>
              </div>
              {/* Verified badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '100px',
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                fontSize: '11px', fontWeight: '800', color: '#4ade80', letterSpacing: '0.08em',
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulseDot 1.5s ease-in-out infinite' }} />
                ✓ VERIFIED
              </div>
            </div>

            {/* ADMIT ONE badge + category */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 14px', borderRadius: '8px',
                background: 'rgba(249,115,22,0.18)', border: '1px solid rgba(249,115,22,0.4)',
                color: '#f97316', fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', display: 'inline-block', animation: 'pulseDot 1.6s ease-in-out infinite' }} />
                ADMIT ONE
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {ticket.category}
              </div>
            </div>

            {/* Event Name */}
            <h1 style={{
              fontSize: 'clamp(1.4rem, 5vw, 1.9rem)', fontWeight: '900', color: '#fff',
              lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 6px',
            }}>
              {ticket.event}
            </h1>

            {/* Quick date + venue */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
              {[
                { icon: '📅', text: ticket.date },
                { icon: '📍', text: ticket.venue },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500',
                }}>
                  <span>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ PERFORATED DIVIDER ══ */}
        <div style={{
          background: 'linear-gradient(to right, #0f0700, #0a0a0a)',
          display: 'flex', alignItems: 'center', height: '22px', position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Left punch */}
          <div style={{ position: 'absolute', left: '-11px', top: '50%', transform: 'translateY(-50%)', width: '22px', height: '22px', borderRadius: '50%', background: '#080808', zIndex: 2 }} />
          {/* Dashed line */}
          <div style={{ flex: 1, height: '1px', margin: '0 11px', background: 'repeating-linear-gradient(to right, rgba(249,115,22,0.3) 0px, rgba(249,115,22,0.3) 8px, transparent 8px, transparent 16px)' }} />
          {/* Right punch */}
          <div style={{ position: 'absolute', right: '-11px', top: '50%', transform: 'translateY(-50%)', width: '22px', height: '22px', borderRadius: '50%', background: '#080808', zIndex: 2 }} />
        </div>

        {/* ══ TICKET BODY ══ */}
        <div style={{
          background: 'linear-gradient(160deg, #0f0f0f 0%, #0a0a0a 100%)',
          padding: '24px 28px 28px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>

          {/* Ticket ID header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ticket Reference</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#f97316', letterSpacing: '0.06em', fontFamily: 'monospace' }}>
              {ticket.ticketId}
            </div>
          </div>

          {/* Holder section */}
          <div style={{
            padding: '14px 16px', borderRadius: '14px',
            background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.14)',
            marginBottom: '6px',
          }}>
            <div style={{ fontSize: '10px', color: 'rgba(249,115,22,0.6)', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
              👤 Registered Holder
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Full Name', value: ticket.holder },
                { label: 'College UID', value: ticket.uid },
                { label: 'Email', value: ticket.email },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#e5e5e5', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Event Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <InfoRow icon="📅" label="Date"       value={ticket.date} />
            <InfoRow icon="⏰" label="Time"       value={ticket.time} />
            <InfoRow icon="📍" label="Venue"      value={ticket.venue} />
            <InfoRow icon="🎭" label="Category"   value={ticket.category} highlight />
            <InfoRow icon="🏛️" label="Organizer"  value={ticket.organizer} />
            <InfoRow icon="🕐" label="Issued At"  value={timeStr} />
          </div>

          {/* Description */}
          {ticket.description && (
            <div style={{
              fontSize: '12.5px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.65,
              padding: '12px 14px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
              marginTop: '4px',
            }}>
              {ticket.description}
            </div>
          )}

          {/* Barcode strip */}
          <div style={{
            marginTop: '8px', padding: '14px 0 4px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <Barcode id={ticket.ticketId} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.06em' }}>CAMPUS EVENT ENGINE</span>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.06em' }}>{ticket.ticketId}</span>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
              *Non-transferable. Valid only for the registered holder.<br />
              Powered by SCEE · Campus Event Engine
            </p>
          </div>
        </div>
      </div>

      {/* Back link */}
      <Link to="/" style={{
        marginTop: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.35)',
        display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
      >
        ← Back to Campus Event Engine
      </Link>
    </div>
  );
}

// ── Full-page wrapper style ───────────────────────────────────────────
const pageStyle = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at 20% 20%, rgba(249,115,22,0.06) 0%, transparent 50%), #080808',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  padding: '40px 20px',
  fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif",
  color: '#fff',
};
