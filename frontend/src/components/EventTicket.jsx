/**
 * EventTicket.jsx
 * - Modal view: shows only the LEFT STUB (QR + student info)
 * - Download (PNG / PDF): captures a hidden FULL TICKET off-screen
 * - QR code leads to: /ticket/:ticketId?d=<base64-encoded-JSON>
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ── Deterministic ticket ID ───────────────────────────────────────────
function generateTicketId(eventId = '', userId = '') {
  const raw = `${eventId}-${userId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `SCEE-${hex.slice(0, 4)}-${hex.slice(4)}`;
}

// ── Perforated divider ────────────────────────────────────────────────
function PerforatedDivider() {
  return (
    <div style={{ width: '22px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
      {/* top punch */}
      <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', width: '22px', height: '22px', borderRadius: '50%', background: '#080808' }} />
      {/* dashed line */}
      <div style={{
        position: 'absolute', top: '11px', bottom: '11px', left: '50%', transform: 'translateX(-50%)',
        width: '1px',
        background: 'repeating-linear-gradient(to bottom, rgba(249,115,22,0.4) 0px, rgba(249,115,22,0.4) 6px, transparent 6px, transparent 12px)',
      }} />
      {/* bottom punch */}
      <div style={{ position: 'absolute', bottom: '-11px', left: '50%', transform: 'translateX(-50%)', width: '22px', height: '22px', borderRadius: '50%', background: '#080808' }} />
    </div>
  );
}

// ── Fake barcode strip ─────────────────────────────────────────────────
function Barcode({ ticketId }) {
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', marginTop: '14px' }}>
      <div style={{ display: 'flex', gap: '1.5px', alignItems: 'center', height: '32px' }}>
        {Array.from({ length: 70 }).map((_, i) => (
          <div key={i} style={{
            width: i % 5 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
            height: i % 7 === 0 ? '100%' : i % 4 === 0 ? '78%' : '55%',
            background: `rgba(249,115,22,${i % 2 === 0 ? '0.6' : '0.18'})`,
            borderRadius: '1px', flexShrink: 0,
          }} />
        ))}
        <span style={{ marginLeft: '8px', fontSize: '8px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: '0.04em', flexShrink: 0 }}>
          {ticketId}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.06em' }}>CAMPUS EVENT ENGINE</span>
        <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.06em' }}>
          ISSUED {new Date().toLocaleDateString('en-IN').replace(/\//g, '.')}
        </span>
      </div>
    </div>
  );
}

// ── Left Stub (QR + student info) — used both in modal and in full ticket ──
function LeftStub({ ticketId, qrUrl, event, user, compact = false }) {
  const category = event.category || 'General';
  return (
    <div style={{
      width: compact ? '100%' : '38%', flexShrink: 0,
      background: 'linear-gradient(160deg, #1a0a00 0%, #0f0700 40%, #130800 100%)',
      padding: compact ? '28px 24px' : '32px 28px',
      display: 'flex', flexDirection: 'column', gap: '16px',
      position: 'relative', overflow: 'hidden',
      borderRadius: compact ? '20px' : '0',
    }}>
      {/* texture dots */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '18px 18px', pointerEvents: 'none' }} />
      {/* glow */}
      <div style={{ position: 'absolute', top: '-50px', left: '-30px', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {/* bottom glow */}
      <div style={{ position: 'absolute', bottom: '-40px', right: '-20px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ADMIT ONE + Category row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
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
          {category}
        </div>
      </div>

      {/* QR Code */}
      <div style={{
        display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2,
        padding: '14px', borderRadius: '16px', background: '#fff',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 0 4px rgba(249,115,22,0.1)',
      }}>
        <QRCodeCanvas
          value={qrUrl}
          size={compact ? 170 : 155}
          bgColor="#ffffff"
          fgColor="#0a0a0a"
          level="H"
          includeMargin={false}
          imageSettings={{
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f97316'%3E%3Cpath d='M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z'/%3E%3C/svg%3E",
            x: undefined, y: undefined, height: 28, width: 28, excavate: true,
          }}
        />
      </div>

      {/* Ticket ID */}
      <div style={{
        textAlign: 'center', position: 'relative', zIndex: 2,
        padding: '10px 14px', borderRadius: '10px',
        background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(249,115,22,0.15)',
      }}>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Ticket ID
        </div>
        <div style={{ fontSize: '15px', fontWeight: '800', color: '#f97316', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
          {ticketId}
        </div>
      </div>

      {/* Registered To */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
          Registered To
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Name',  value: user?.name  || 'Student' },
            { label: 'UID',   value: user?.collegeUid || 'N/A' },
            { label: 'Email', value: user?.email || 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#e5e5e5', textAlign: 'right', wordBreak: 'break-all', lineHeight: 1.4 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', lineHeight: 1.5, position: 'relative', zIndex: 2 }}>
        *Non-transferable. Valid only for the registered holder.
      </div>
    </div>
  );
}

// ── Right Body (Event Details) — only used in the hidden full-ticket div ──
function RightBody({ event, ticketId }) {
  const dateObj  = new Date(event.date);
  const dateStr  = dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr  = event.time || dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      flex: 1,
      background: 'linear-gradient(160deg, #0f0f0f 0%, #0a0a0a 60%, #100800 100%)',
      padding: '32px 32px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* decorative glows */}
      <div style={{ position: 'absolute', bottom: '-70px', right: '-70px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-30px', right: '12%', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.04em', color: '#fff' }}>
          SCEE<span style={{ color: '#f97316' }}>.</span>
        </div>
        <div style={{
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          fontSize: '11px', fontWeight: '700', color: '#4ade80',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          VALID PASS
        </div>
      </div>

      {/* Event Category + Title */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '10px', color: 'rgba(249,115,22,0.7)', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
          {event.category || 'Campus Event'}
        </div>
        <h2 style={{
          fontSize: 'clamp(1.3rem, 2.8vw, 1.9rem)', fontWeight: '900', color: '#fff',
          lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 22px',
        }}>
          {event.title}
        </h2>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px', marginBottom: '20px' }}>
          {[
            { icon: '📅', label: 'Date',      value: dateStr },
            { icon: '⏰', label: 'Time',      value: timeStr },
            { icon: '📍', label: 'Venue',     value: event.venue || 'Main Campus' },
            { icon: '👤', label: 'Organizer', value: event.organizer?.name || 'SCEE Admin' },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              padding: '11px 13px', borderRadius: '11px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                {icon} {label}
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#e5e5e5', lineHeight: 1.3 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        {event.description && (
          <div style={{
            fontSize: '11.5px', color: 'rgba(255,255,255,0.33)', lineHeight: 1.6,
            padding: '11px 13px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {event.description}
          </div>
        )}
      </div>

      {/* Barcode */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Barcode ticketId={ticketId} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  MAIN EXPORTED COMPONENT
// ══════════════════════════════════════════════════════
export default function EventTicket({ event, user, onClose }) {
  const fullTicketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [dlFormat, setDlFormat]       = useState('png');
  const [qrExpanded, setQrExpanded]   = useState(false); // <--- State for enlarging QR

  const ticketId = generateTicketId(event._id || 'evt', user?._id || 'usr');

  // Offline text payload — works instantly on ANY phone without needing network/localhost!
  const dateStr = new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = event.time || new Date(event.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  
  const qrPayload = `🎟️ SCEE EVENT PASS
━━━━━━━━━━━━━━━━━
🔖 ID: ${ticketId}
✅ STATUS: CONFIRMED

📌 EVENT DETAILS
🎯 ${event.title}
📅 ${dateStr} • ⏰ ${timeStr}
📍 ${event.venue || 'Main Campus'}

👤 HOLDER INFO
🧑 ${user?.name || 'Student'}
✉️ ${user?.email || 'N/A'}`;

  // ── Download ──────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (!fullTicketRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(fullTicketRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#080808',
        logging: false,
      });
      if (dlFormat === 'png') {
        const link = document.createElement('a');
        link.download = `SCEE_Pass_${ticketId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 3, canvas.height / 3] });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
        pdf.save(`SCEE_Pass_${ticketId}.pdf`);
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [fullTicketRef, dlFormat, downloading, ticketId]);

  return (
    <>
      <style>{`
        @keyframes ticketIn   { from { opacity:0; transform:translateY(28px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes pulseDot   { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.45; transform:scale(0.75); } }
        @keyframes spinLoader { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes shimmerSlide {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .ticket-backdrop { animation: ticketIn 0.35s cubic-bezier(0.16,1,0.3,1); }
        .dl-btn:hover { filter:brightness(1.1); transform:translateY(-2px); box-shadow:0 12px 28px rgba(249,115,22,0.45) !important; }
        .dl-btn:active { transform:translateY(0); }
      `}</style>

      {/* ── BACKDROP ── */}
      <div
        className="ticket-backdrop"
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', overflowY: 'auto',
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '420px' }}>

          {/* Header */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                SCEE<span style={{ color: '#f97316' }}>.</span> Event Pass
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                Scan QR to verify · {ticketId}
              </div>
            </div>
            <button onClick={onClose} style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#aaa', fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#aaa'; }}
            >×</button>
          </div>

          {/* ── MODAL SHOWS ONLY LEFT STUB ── */}
          <div style={{
            width: '100%', borderRadius: '20px', overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(249,115,22,0.15)',
          }}>
            <LeftStub
              ticketId={ticketId}
              qrUrl={qrPayload}
              event={event}
              user={user}
              compact={true}
            />
          </div>

          {/* Format selector + Download button */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            {/* Format toggle */}
            <div style={{
              display: 'flex', borderRadius: '10px', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
            }}>
              {['png', 'pdf'].map(fmt => (
                <button key={fmt} onClick={() => setDlFormat(fmt)} style={{
                  padding: '9px 20px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase',
                  background: dlFormat === fmt ? '#f97316' : 'transparent',
                  color: dlFormat === fmt ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.2s', fontFamily: "'Inter',sans-serif",
                }}>
                  {fmt === 'png' ? '🖼 PNG' : '📄 PDF'}
                </button>
              ))}
            </div>

            {/* Download */}
            <button className="dl-btn" onClick={handleDownload} disabled={downloading} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '11px 24px', borderRadius: '10px', border: 'none',
              background: downloading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #f97316, #ea6e10)',
              color: '#fff', fontSize: '13px', fontWeight: '700',
              cursor: downloading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(249,115,22,0.32)',
              transition: 'all 0.25s ease', fontFamily: "'Inter',sans-serif",
            }}>
              {downloading ? (
                <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spinLoader 0.7s linear infinite' }} /> Generating…</>
              ) : (
                <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Download Full Pass</>
              )}
            </button>
            {/* Enlarge QR Button */}
            <button onClick={() => setQrExpanded(true)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '11px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#ccc', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Inter',sans-serif",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.color = '#f97316'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#ccc'; }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
              Enlarge QR
            </button>
          </div>

          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
            Full ticket (both sides) downloads as {dlFormat.toUpperCase()} · QR contains offline pass details
          </p>
        </div>
      </div>

      {/* ── ENLARGED QR OVERLAY ── */}
      {qrExpanded && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: 'ticketIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        }} onClick={() => setQrExpanded(false)}>
          
          <div style={{
            background: '#fff', padding: '30px', borderRadius: '24px',
            boxShadow: '0 0 0 8px rgba(249,115,22,0.15), 0 30px 80px rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'
          }}>
            <QRCodeCanvas value={qrPayload} size={280} bgColor="#ffffff" fgColor="#0a0a0a" level="M" includeMargin={false} />
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111', fontFamily: "'Inter',sans-serif", textAlign: 'center' }}>
              Scan with your phone
            </div>
          </div>
          
          <div style={{ marginTop: '30px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
            Click anywhere to close
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
           HIDDEN FULL TICKET — captured for download
           Positioned off-screen so it's never visible
      ══════════════════════════════════════════════ */}
      <div
        ref={fullTicketRef}
        style={{
          position: 'fixed', top: '-9999px', left: '-9999px',
          width: '940px', height: '520px',
          display: 'flex', borderRadius: '24px', overflow: 'hidden',
          fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif",
          zIndex: -1,
        }}
      >
        <LeftStub ticketId={ticketId} qrUrl={qrPayload} event={event} user={user} compact={false} />
        <PerforatedDivider />
        <RightBody event={event} ticketId={ticketId} />
      </div>
    </>
  );
}
