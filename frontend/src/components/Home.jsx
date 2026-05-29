import { useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Link } from 'react-router-dom'
import BorderGlow from './BorderGlow'
import api from '../api'
import '../App.css'

gsap.registerPlugin(ScrollTrigger)

const carouselData = [
  {
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    title: "Music Festival 2026",
    date: "25 December, 2026",
    location: "Main Campus"
  },
  {
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    title: "Tech Innovators Hackathon",
    date: "15 November, 2026",
    location: "Innovation Hub"
  },
  {
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    title: "Annual Sports Meet",
    date: "20 October, 2026",
    location: "University Stadium"
  }
];

const placeholderImages = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1533174000273-e18e8bb3310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const mockEvents = [
  {
    _id: "mock1",
    title: "Music Festival 2026",
    description: "Experience the biggest campus musical explosion of the year with guest artists, live bands, and electrifying performances.",
    date: "2026-12-25",
    venue: "Main Campus Grounds",
    capacity: 500,
    registeredUsers: Array(342),
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    _id: "mock2",
    title: "Tech Hackathon 2026",
    description: "A 48-hour challenge to design, build, and pitch groundbreaking software or hardware solutions to real-world problems.",
    date: "2026-11-15",
    venue: "Innovation Lab Hub",
    capacity: 150,
    registeredUsers: Array(98),
    imageUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    _id: "mock3",
    title: "Annual Sports Meet",
    description: "Represent your department in track, basketball, football, and other thrilling competitive sports events on campus.",
    date: "2026-10-20",
    venue: "University Stadium",
    capacity: 300,
    registeredUsers: Array(210),
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

// ── Typing Effect Hook ──
function useTypingEffect(words, speed = 80, pause = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setWordIdx(w => (w + 1) % words.length);
    }
    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return displayed;
}

// ── Category Tag Component ──
function CategoryTag({ label, color = 'orange' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
      letterSpacing: '0.04em', textTransform: 'uppercase',
      background: color === 'orange' ? 'rgba(249,115,22,0.15)' : 'rgba(99,102,241,0.15)',
      color: color === 'orange' ? '#fb923c' : '#818cf8',
      border: color === 'orange' ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(99,102,241,0.3)',
    }}>
      {label}
    </span>
  );
}

// ── Section Header Component ──
function SectionHeader({ badge, title, highlight, subtitle, centered = true }) {
  return (
    <div style={{ textAlign: centered ? 'center' : 'left', marginBottom: '80px' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '6px 16px', borderRadius: '10px', marginBottom: '20px',
        background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)',
        color: '#fb923c', fontSize: '12px', fontWeight: '700',
        letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
        {badge}
      </div>
      <h2 style={{
        fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '800',
        color: '#fff', lineHeight: '1.15', letterSpacing: '-0.02em',
        marginBottom: '20px', margin: '0 0 20px 0',
      }}>
        {title}{' '}
        <span style={{
          color: '#f97316',
          textShadow: '0 0 30px rgba(249,115,22,0.35)',
        }}>{highlight}</span>
      </h2>
      {subtitle && (
        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem',
          maxWidth: '560px', lineHeight: '1.7',
          margin: centered ? '0 auto' : '0',
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const container = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [subscribeMsg, setSubscribeMsg] = useState('');

  const typedText = useTypingEffect(
    ['Music Festivals', 'Tech Hackathons', 'Sports Meets', 'Cultural Fests', 'Alumni Nights'],
    75, 2000
  );

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribeMsg('✓ You\'re subscribed!');
    setEmailInput('');
    setTimeout(() => setSubscribeMsg(''), 4000);
  };

  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data || []))
      .catch(err => console.error(err));
  }, []);

  const displaySlides = events.length > 0
    ? events.map((ev, index) => {
        const dateObj = new Date(ev.date);
        const formattedDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        const image = ev.imageUrl || placeholderImages[index % placeholderImages.length];
        return { image, title: ev.title, date: formattedDate, location: ev.venue || ev.location || 'Main Campus' };
      })
    : carouselData;

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % displaySlides.length), 4000);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % displaySlides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? displaySlides.length - 1 : prev - 1));

  useGSAP(() => {
    gsap.fromTo('.hero-anim', { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.9, stagger: 0.18, ease: 'power3.out', delay: 0.2,
    });
    gsap.fromTo('.hero-image', { opacity: 0, scale: 0.93, x: 30 }, {
      opacity: 1, scale: 1, x: 0, duration: 1.1, ease: 'power3.out', delay: 0.5,
    });
    gsap.fromTo('.feature-card', { opacity: 0, y: 60, scale: 0.94 }, {
      opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12, ease: 'back.out(1.2)',
      scrollTrigger: { trigger: '.features-section', start: 'top 78%' }
    });
    gsap.fromTo('.event-showcase-card', { opacity: 0, y: 50, scale: 0.96 }, {
      opacity: 1, y: 0, scale: 1, duration: 0.75, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '#events-showcase', start: 'top 78%' }
    });
    gsap.fromTo('.step-card', { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.8, stagger: 0.22, ease: 'power3.out',
      scrollTrigger: { trigger: '#how-it-works', start: 'top 80%' }
    });
    gsap.fromTo('.footer-col', { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: 'footer', start: 'top 90%' }
    });
  }, { scope: container });

  const showcaseEvents = events.length > 0 ? events.slice(0, 3) : mockEvents;

  return (
    <div ref={container} style={{ minHeight: '100vh', background: '#080808', color: '#fff', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>

      {/* ── INLINE STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUpOverlay {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(249,115,22,0); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .cursor-blink { animation: blink 0.85s step-end infinite; }
        .card-hover { transition: transform 0.35s ease, box-shadow 0.35s ease; }
        .card-hover:hover { transform: translateY(-10px); box-shadow: 0 28px 60px rgba(249,115,22,0.12) !important; }
        .img-zoom img { transition: transform 0.7s ease; }
        .img-zoom:hover img { transform: scale(1.07); }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 32px; border-radius: 12px; font-size: 15px; font-weight: 700;
          background: #f97316; color: #fff; border: none; cursor: pointer;
          box-shadow: 0 6px 22px rgba(249,115,22,0.38);
          transition: all 0.25s ease;
        }
        .btn-primary:hover { background: #fb923c; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(249,115,22,0.5); }
        .btn-primary:active { transform: translateY(0); }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 32px; border-radius: 12px; font-size: 15px; font-weight: 700;
          background: rgba(255,255,255,0.05); color: #fff;
          border: 1px solid rgba(255,255,255,0.12); cursor: pointer;
          transition: all 0.25s ease;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(249,115,22,0.45); transform: translateY(-2px); }
        .nav-link { position: relative; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.2s; padding-bottom: 4px; }
        .nav-link:hover { color: #fff; }
        .nav-link.active { color: #fff; }
        .nav-link.active::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:#f97316; border-radius:2px; }
        .section-divider { width: 60px; height: 3px; background: linear-gradient(90deg, #f97316, #fb923c); border-radius: 4px; margin: 20px auto 0; }
        .progress-bar-fill { transition: width 0.6s ease; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: #f97316; }
      `}</style>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%', height: '72px',
        background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ fontSize: '21px', fontWeight: '800', letterSpacing: '0.04em', color: '#fff', flexShrink: 0 }}>
          SCEE<span style={{ color: '#f97316' }}>.</span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {[
            { label: 'Home', href: '/', active: true },
            { label: 'Events', href: '#events-showcase' },
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
          ].map(link => (
            <a key={link.label} href={link.href} className={`nav-link${link.active ? ' active' : ''}`}>
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Link to="/login" style={{
            fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)',
            padding: '9px 18px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            Sign In
          </Link>
          <Link to="/register" style={{
            fontSize: '13px', fontWeight: '700', color: '#fff',
            padding: '9px 22px', borderRadius: '10px',
            background: '#f97316', boxShadow: '0 0 18px rgba(249,115,22,0.35)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fb923c'; e.currentTarget.style.boxShadow = '0 0 28px rgba(249,115,22,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.boxShadow = '0 0 18px rgba(249,115,22,0.35)'; }}
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', paddingTop: '110px', paddingBottom: '80px',
        padding: '110px 5% 80px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
        gap: '60px', position: 'relative',
        background: 'linear-gradient(160deg, #080808 0%, #0e0c0a 50%, #080808 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Background Glow */}
        <div style={{ position: 'absolute', top: '30%', left: '15%', width: '550px', height: '550px', background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Left Content */}
        <div className="hero-anim" style={{ flex: '1 1 440px', maxWidth: '580px', zIndex: 1 }}>
          <div className="hero-anim" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '7px 16px', borderRadius: '100px', marginBottom: '28px',
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.28)',
            color: '#fb923c', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f97316', animation: 'pulseGlow 1.8s infinite' }} />
            Campus Event Platform
          </div>

          <h1 className="hero-anim" style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)', fontWeight: '900',
            lineHeight: '1.12', letterSpacing: '-0.03em',
            marginBottom: '20px', color: '#fff',
          }}>
            Discover &<br />
            <span style={{ color: '#f97316', textShadow: '0 0 40px rgba(249,115,22,0.3)' }}>Register</span>{' '}for<br />
            Campus Events
          </h1>

          {/* Typing Effect */}
          <div className="hero-anim" style={{
            fontSize: '1rem', color: 'rgba(255,255,255,0.45)', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Browse</span>
            <span style={{ color: '#f97316', fontWeight: '600', minWidth: '200px' }}>
              {typedText}<span className="cursor-blink" style={{ color: '#f97316' }}>|</span>
            </span>
          </div>

          <p className="hero-anim" style={{
            fontSize: '1.05rem', color: 'rgba(255,255,255,0.52)', lineHeight: '1.8',
            marginBottom: '40px', maxWidth: '460px',
          }}>
            A reliable, high-performance platform to manage campus events — no queues, no crashes. Just seamless experiences from start to finish.
          </p>

          <div className="hero-anim" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            <Link to="/register" className="btn-primary">
              Get Started
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="#events-showcase" className="btn-secondary">
              Explore Events
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="hero-anim" style={{ display: 'flex', gap: '32px', marginTop: '52px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {[['500+', 'Events Hosted'], ['12K+', 'Students'], ['50+', 'Active Clubs']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f97316', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '5px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Carousel */}
        <div className="hero-image" style={{ flex: '1 1 420px', maxWidth: '560px', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}
            onMouseEnter={e => {
              e.currentTarget.querySelector('.slide-prev').style.opacity = '1';
              e.currentTarget.querySelector('.slide-next').style.opacity = '1';
            }}
            onMouseLeave={e => {
              e.currentTarget.querySelector('.slide-prev').style.opacity = '0';
              e.currentTarget.querySelector('.slide-next').style.opacity = '0';
            }}
          >
            <img
              key={currentSlide}
              src={displaySlides[currentSlide]?.image}
              alt={displaySlides[currentSlide]?.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'fadeSlideIn 0.5s ease' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.2) 40%, transparent 70%)' }} />

            {/* Arrow Buttons */}
            <button className="slide-prev" onClick={prevSlide} style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              width: '42px', height: '42px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#fff',
              fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'all 0.25s ease', zIndex: 10,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.borderColor = '#f97316'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >‹</button>
            <button className="slide-next" onClick={nextSlide} style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              width: '42px', height: '42px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#fff',
              fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'all 0.25s ease', zIndex: 10,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.borderColor = '#f97316'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >›</button>

            {/* Overlay Card */}
            <div style={{
              position: 'absolute', bottom: '20px', left: '20px', right: '20px',
              padding: '20px 24px', borderRadius: '16px',
              background: 'rgba(8,8,8,0.55)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              animation: 'slideUpOverlay 0.5s ease',
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
                  {displaySlides[currentSlide]?.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#f97316' }}>📅</span> {displaySlides[currentSlide]?.date}
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                  <span style={{ color: '#f97316' }}>📍</span> {displaySlides[currentSlide]?.location}
                </p>
              </div>
              <Link to="/login" style={{
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
                background: '#f97316', color: '#fff', flexShrink: 0, transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(249,115,22,0.4)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fb923c'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Register Now
              </Link>
            </div>

            {/* Slide Dots */}
            <div style={{ position: 'absolute', bottom: '110px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
              {displaySlides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} style={{
                  width: i === currentSlide ? '24px' : '7px', height: '7px',
                  borderRadius: '4px', border: 'none', cursor: 'pointer',
                  background: i === currentSlide ? '#f97316' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease', padding: 0,
                }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          EVENTS SHOWCASE SECTION
      ══════════════════════════════════════ */}
      <section id="events-showcase" style={{
        padding: '120px 5%',
        background: '#0a0a0a',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: '20%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <SectionHeader
            badge="Featured Events"
            title="Live &amp; Upcoming"
            highlight="Showcases"
            subtitle="Explore active registrations and save your spot in our most anticipated student-led events."
          />
          <div style={{ textAlign: 'center', marginTop: '-50px', marginBottom: '64px' }}>
            <div className="section-divider" />
          </div>

          {/* Event Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '28px' }}>
            {showcaseEvents.map((ev, i) => {
              const dateObj = new Date(ev.date);
              const day = dateObj.getDate();
              const month = dateObj.toLocaleString('en-US', { month: 'short' });
              const year = dateObj.getFullYear();
              const registeredCount = ev.registeredUsers?.length || 0;
              const percent = Math.round((registeredCount / (ev.capacity || 200)) * 100);
              const tags = [['⚡', 'Live'], ['🎟️', 'Open']];

              return (
                <div
                  key={ev._id || i}
                  className="event-showcase-card card-hover img-zoom"
                  style={{
                    background: 'linear-gradient(160deg, #141414 0%, #0f0f0f 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '20px', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                    transition: 'all 0.35s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >
                  {/* Card Image */}
                  <div style={{ position: 'relative', height: '210px', overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={ev.imageUrl || placeholderImages[i % placeholderImages.length]}
                      alt={ev.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,14,14,0.9) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />

                    {/* Date Badge */}
                    <div style={{
                      position: 'absolute', top: '14px', left: '14px',
                      background: 'rgba(8,8,8,0.75)', backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(249,115,22,0.3)',
                      borderRadius: '12px', padding: '8px 12px', textAlign: 'center', minWidth: '52px',
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#f97316', lineHeight: 1 }}>{day}</div>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{month}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>{year}</div>
                    </div>

                    {/* Tags */}
                    <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '6px' }}>
                      {tags.map(([icon, label]) => (
                        <span key={label} style={{
                          padding: '4px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: '700',
                          background: 'rgba(249,115,22,0.18)', color: '#fb923c',
                          border: '1px solid rgba(249,115,22,0.3)', backdropFilter: 'blur(8px)',
                        }}>
                          {icon} {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '26px 28px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Venue */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <svg width="13" height="13" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>{ev.venue || 'Main Campus'}</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '12px', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                      {ev.title}
                    </h3>

                    <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, marginBottom: '24px', flex: 1 }}>
                      {ev.description || 'Join this exciting campus activity, meet new peers, and expand your skills.'}
                    </p>

                    {/* Capacity Progress */}
                    <div style={{ marginBottom: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
                          Seats Filled
                        </span>
                        <span style={{ fontSize: '12px', color: '#f97316', fontWeight: '700' }}>
                          {registeredCount} / {ev.capacity || 200}
                        </span>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div className="progress-bar-fill" style={{
                          height: '100%', borderRadius: '4px',
                          width: `${Math.min(percent, 100)}%`,
                          background: percent > 80 ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'linear-gradient(90deg,#f97316,#fb923c)',
                        }} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                        {100 - percent}% spots remaining
                      </span>
                      <Link
                        to="/login"
                        style={{
                          padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
                          background: 'linear-gradient(135deg, #f97316, #ea6e10)', color: '#fff',
                          boxShadow: '0 4px 14px rgba(249,115,22,0.32)', transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.32)'; }}
                      >
                        Register Now →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Link */}
          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <Link to="/events" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '14px 36px', borderRadius: '12px', fontWeight: '700', fontSize: '14px',
              color: '#f97316', border: '1px solid rgba(249,115,22,0.3)',
              background: 'rgba(249,115,22,0.06)', transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.14)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.06)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; }}
            >
              View All Events
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════ */}
      <section id="features" className="features-section" style={{
        padding: '120px 5%',
        background: 'linear-gradient(180deg, #080808 0%, #0b0b0b 100%)',
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ position: 'absolute', bottom: 0, left: '30%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <SectionHeader
            badge="Why Choose Us"
            title="Our Core"
            highlight="Features"
            subtitle="Everything you need to host, manage, and attend campus events — built for students, by students."
          />
          <div style={{ textAlign: 'center', marginTop: '-50px', marginBottom: '64px' }}>
            <div className="section-divider" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              { icon: '⚡', title: 'Seamless Registration', desc: 'Register for events in seconds with our streamlined, one-click process. No confusing steps or forms.', accent: '#f97316' },
              { icon: '📨', title: 'Instant Passes', desc: 'Get your digital registration passes instantly via email or directly from your personal dashboard.', accent: '#fb923c' },
              { icon: '🔒', title: 'Secure Access', desc: 'Built-in student authentication ensures only verified university members can sign up for events.', accent: '#f97316' },
              { icon: '📊', title: 'Complete Dashboard', desc: 'Track all registrations and manage hosted events from one clean, centralized control panel.', accent: '#fb923c' },
              { icon: '🎫', title: 'Tickipass QR Entry', desc: 'Scan your personalized digital QR code at the venue entrance for instant, hassle-free access.', accent: '#f97316' },
              { icon: '🎧', title: '24/7 Support', desc: 'Our dedicated campus team is always available to help resolve any issues at any time.', accent: '#fb923c' },
            ].map((feature, i) => (
              <div
                key={i}
                className="feature-card card-hover"
                style={{
                  background: 'linear-gradient(145deg, #141414, #0f0f0f)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '18px', padding: '36px 32px',
                  display: 'flex', flexDirection: 'column', gap: '0',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.35s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)'; e.currentTarget.querySelector('.feature-glow').style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.querySelector('.feature-glow').style.opacity = '0'; }}
              >
                <div className="feature-glow" style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', opacity: 0, transition: 'opacity 0.4s ease' }} />

                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', marginBottom: '24px', flexShrink: 0,
                  transition: 'all 0.3s ease',
                }}>
                  {feature.icon}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', marginBottom: '14px', letterSpacing: '-0.01em' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.75 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS SECTION
      ══════════════════════════════════════ */}
      <section id="how-it-works" style={{
        padding: '120px 5%',
        background: '#0a0a0a',
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <SectionHeader
            badge="Process Flow"
            title="How It"
            highlight="Works"
            subtitle="Start engaging in your university's social & academic scene in just 3 incredibly simple steps."
          />
          <div style={{ textAlign: 'center', marginTop: '-50px', marginBottom: '72px' }}>
            <div className="section-divider" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', position: 'relative' }}>
            {[
              { step: '01', icon: '🔍', title: 'Browse Events', desc: 'Explore the curated events feed — hackathons, cultural fests, club meetups, sports, and more listed live.' },
              { step: '02', icon: '⚡', title: 'Register Instantly', desc: 'Log in with your student ID and claim your spot in one click. No fees, no waiting — pure simplicity.' },
              { step: '03', icon: '🎫', title: 'Scan & Attend', desc: 'Show your digital QR pass at the entrance. Your ticket lives on your dashboard and your email — always accessible.' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="step-card card-hover"
                style={{
                  background: 'linear-gradient(145deg, #141414, #101010)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px', padding: '44px 36px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                  transition: 'all 0.35s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                {/* Big background step number */}
                <div style={{
                  position: 'absolute', top: '12px', right: '20px',
                  fontSize: '6rem', fontWeight: '900', lineHeight: 1,
                  color: 'rgba(249,115,22,0.06)', letterSpacing: '-0.05em',
                  pointerEvents: 'none', userSelect: 'none',
                }}>{step.step}</div>

                {/* Step Icon */}
                <div style={{
                  width: '76px', height: '76px', borderRadius: '20px',
                  background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', marginBottom: '28px',
                  animation: 'floatY 3s ease-in-out infinite',
                  animationDelay: `${idx * 0.4}s`,
                }}>
                  {step.icon}
                </div>

                {/* Step Number Pill */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px', borderRadius: '100px', marginBottom: '16px',
                  background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
                  fontSize: '11px', fontWeight: '800', color: '#f97316', letterSpacing: '0.1em',
                }}>
                  STEP {step.step}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '16px', letterSpacing: '-0.01em' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.75 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer style={{
        background: '#060606', paddingTop: '90px', paddingBottom: '40px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ position: 'absolute', bottom: 0, right: '10%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 5%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '52px', marginBottom: '64px' }}>

            {/* Brand */}
            <div className="footer-col">
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '18px', letterSpacing: '0.03em' }}>
                SCEE<span style={{ color: '#f97316' }}>.</span>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.8, marginBottom: '28px', maxWidth: '260px' }}>
                The official platform to discover and register for all campus events — secure, fast, and built for students.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { label: 'Twitter/X', svg: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" /> },
                  { label: 'Instagram', svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="2" fill="none" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" /></> },
                  { label: 'LinkedIn', svg: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.063 2.063 0 110-4.126 2.063 2.063 0 010 4.126zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor" /> },
                ].map(social => (
                  <a key={social.label} href="#" aria-label={social.label} style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">{social.svg}</svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '22px', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '12px', borderBottom: '1px solid rgba(249,115,22,0.35)' }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[['Features', '#features'], ['All Events', '/events'], ['Register', '/login'], ['Announcements', '#']].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f97316'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                    >
                      <span style={{ color: 'rgba(249,115,22,0.4)', fontSize: '10px' }}>▶</span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="footer-col">
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '22px', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '12px', borderBottom: '1px solid rgba(249,115,22,0.35)' }}>
                Support & Help
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[['FAQs & Guidelines', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#'], ['Contact Admin', '#']].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f97316'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                    >
                      <span style={{ color: 'rgba(249,115,22,0.4)', fontSize: '10px' }}>▶</span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="footer-col">
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '22px', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '12px', borderBottom: '1px solid rgba(249,115,22,0.35)' }}>
                Stay Updated
              </h4>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, marginBottom: '20px' }}>
                Get notified instantly when new events are published on campus.
              </p>
              <form onSubmit={handleSubscribe}>
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <input
                    type="email" required
                    placeholder="your@college.edu"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    style={{
                      width: '100%', padding: '13px 50px 13px 16px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px', color: '#fff', fontSize: '13px',
                      outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(249,115,22,0.45)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                  <button type="submit" style={{
                    position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: '#f97316', border: 'none', color: '#fff',
                    fontSize: '16px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fb923c'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f97316'; }}
                  >
                    →
                  </button>
                </div>
                {subscribeMsg && (
                  <p style={{ fontSize: '12px', color: '#4ade80', fontWeight: '600', animation: 'fadeSlideIn 0.3s ease' }}>
                    ✓ {subscribeMsg}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
            alignItems: 'center', gap: '16px',
          }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
              © {new Date().getFullYear()} Campus Event Engine. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '28px' }}>
              {['Privacy Policy', 'Terms of Service', 'Sitemap'].map(item => (
                <a key={item} href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
