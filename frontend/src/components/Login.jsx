import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const QUOTES = [
  {
    text: "The campus event system made registering for workshops so seamless. I never miss an event anymore — it's like having a personal campus guide!",
    name: "Priya Sharma",
    role: "Computer Science, 3rd Year",
    avatar: "PS"
  }
];

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      // Role-based redirect
      if (result?.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = activeTab === 'admin';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d0d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'700px',height:'700px',background:'radial-gradient(circle,rgba(249,115,22,0.07) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>

      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '960px',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        minHeight: '620px',
        position: 'relative',
        zIndex: 1
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: '45%',
          background: '#141414',
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0
        }}>

          {/* Logo */}
          <Link to="/" style={{fontSize:'22px',fontWeight:'800',letterSpacing:'0.05em',color:'#fff',marginBottom:'32px',display:'block',textDecoration:'none'}}>
            SCEE<span style={{color:'#f97316'}}>.</span>
          </Link>

          <h1 style={{fontSize:'32px',fontWeight:'800',color:'#fff',marginBottom:'6px',fontFamily:'Georgia, serif'}}>Sign In</h1>
          <p style={{fontSize:'13px',color:'#888',marginBottom:'28px'}}>Welcome back! Please enter your details to continue.</p>

          {/* Student / Admin Toggle */}
          <div style={{display:'flex',gap:'24px',marginBottom:'28px',paddingBottom:'24px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
            {['student','admin'].map(tab => (
              <button key={tab} type="button" onClick={() => { setActiveTab(tab); setError(''); }}
                style={{display:'flex',alignItems:'center',gap:'8px',background:'none',border:'none',cursor:'pointer',padding:'0'}}>
                <div style={{
                  width:'18px',height:'18px',borderRadius:'50%',
                  border: activeTab === tab ? '2px solid #f97316' : '2px solid #555',
                  background: activeTab === tab ? '#f97316' : 'transparent',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  transition:'all 0.2s',flexShrink:0
                }}>
                  {activeTab === tab && <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#fff'}}/>}
                </div>
                <span style={{fontSize:'13px',fontWeight:'600',color: activeTab === tab ? '#fff' : '#666',transition:'color 0.2s'}}>
                  As a {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </button>
            ))}
          </div>

          {/* Admin warning */}
          {isAdmin && (
            <div style={{background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'12px',padding:'10px 14px',fontSize:'12px',color:'#fb923c',marginBottom:'18px',display:'flex',gap:'8px',alignItems:'center'}}>
              🔐 Admin credentials only. Unauthorized access is logged.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px',flex:1}}>
            {error && (
              <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'12px',padding:'10px 14px',fontSize:'12px',color:'#f87171'}}>
                ⚠️ {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#999',marginBottom:'6px'}}>
                Email <span style={{color:'#f97316'}}>*</span>
              </label>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'16px',height:'16px',color:'#666'}} fill="none" stroke="#666" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input
                  type="email" required
                  placeholder={isAdmin ? 'admin@campus.edu' : 'student@campus.edu'}
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'13px 14px 13px 38px',color:'#fff',fontSize:'13px',outline:'none',boxSizing:'border-box',transition:'border-color 0.2s'}}
                  onFocus={e => e.target.style.borderColor='#f97316'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                <label style={{fontSize:'12px',fontWeight:'600',color:'#999'}}>
                  Password <span style={{color:'#f97316'}}>*</span>
                </label>
                <a href="#" style={{fontSize:'12px',color:'#f97316',textDecoration:'none'}}>Forgot password?</a>
              </div>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'16px',height:'16px'}} fill="none" stroke="#666" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'} required
                  placeholder="Enter password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'13px 40px 13px 38px',color:'#fff',fontSize:'13px',outline:'none',boxSizing:'border-box',transition:'border-color 0.2s'}}
                  onFocus={e => e.target.style.borderColor='#f97316'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',padding:'0',color:'#666',display:'flex'}}>
                  <svg style={{width:'16px',height:'16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'15px',background:'#f97316',color:'#fff',fontWeight:'700',fontSize:'15px',borderRadius:'12px',border:'none',cursor:'pointer',boxShadow:'0 6px 20px rgba(249,115,22,0.4)',marginTop:'8px',transition:'all 0.2s',opacity: loading ? 0.6 : 1}}
              onMouseEnter={e => { e.target.style.background='#fb923c'; e.target.style.transform='translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.background='#f97316'; e.target.style.transform='translateY(0)'; }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <p style={{textAlign:'center',fontSize:'13px',color:'#666',marginTop:'4px'}}>
              Don't have an account?{' '}
              <Link to="/register" style={{color:'#f97316',fontWeight:'600',textDecoration:'none'}}>Sign Up</Link>
            </p>
          </form>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: 1,
          background: '#0a0a0a',
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Grid pattern */}
          <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'linear-gradient(rgba(249,115,22,1) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,1) 1px,transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none'}}/>
          {/* Glow blobs */}
          <div style={{position:'absolute',top:'-80px',right:'-80px',width:'320px',height:'320px',background:'radial-gradient(circle,rgba(249,115,22,0.12) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:'-60px',left:'-40px',width:'250px',height:'250px',background:'radial-gradient(circle,rgba(234,88,12,0.1) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>

          {/* Quote */}
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:'60px',fontFamily:'Georgia,serif',color:'#f97316',lineHeight:1,marginBottom:'16px',opacity:0.9}}>"</div>
            <p style={{fontSize:'18px',color:'rgba(255,255,255,0.9)',lineHeight:1.7,fontFamily:'Georgia,serif',marginBottom:'12px',maxWidth:'380px'}}>
              {QUOTES[0].text}
            </p>
            <div style={{fontSize:'60px',fontFamily:'Georgia,serif',color:'#f97316',lineHeight:0.5,textAlign:'right',marginBottom:'28px',opacity:0.9}}>"</div>

            {/* Person */}
            <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
              <div style={{width:'46px',height:'46px',borderRadius:'50%',background:'linear-gradient(135deg,#f97316,#c2410c)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'700',fontSize:'13px',flexShrink:0,boxShadow:'0 0 15px rgba(249,115,22,0.4)'}}>
                {QUOTES[0].avatar}
              </div>
              <div>
                <div style={{color:'#fff',fontWeight:'600',fontSize:'14px'}}>{QUOTES[0].name}</div>
                <div style={{color:'#888',fontSize:'12px',marginTop:'2px'}}>{QUOTES[0].role}</div>
              </div>
            </div>
          </div>

          {/* Campus SVG Illustration */}
          <div style={{position:'relative',zIndex:1}}>
            <svg viewBox="0 0 480 230" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',opacity:0.65}}>
              <line x1="0" y1="222" x2="480" y2="222" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.4"/>
              <rect x="185" y="50" width="65" height="172" rx="2" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.65" fill="none"/>
              <rect x="194" y="28" width="47" height="30" rx="2" stroke="#f97316" strokeWidth="1" strokeOpacity="0.4" fill="none"/>
              {[68,88,108,128,148,168,188,205].map(y => [194,209,223,232].map(x => <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1" stroke="#fb923c" strokeWidth="0.8" strokeOpacity="0.55" fill="#f97316" fillOpacity="0.15"/>))}
              <rect x="70" y="90" width="52" height="132" rx="2" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.5" fill="none"/>
              {[102,122,142,162,182,200].map(y => [78,95,108].map(x => <rect key={`${x}-${y}`} x={x} y={y} width="7" height="7" rx="1" stroke="#fb923c" strokeWidth="0.8" strokeOpacity="0.4" fill="#f97316" fillOpacity="0.1"/>))}
              <rect x="295" y="110" width="58" height="112" rx="2" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.5" fill="none"/>
              {[122,140,158,176,194].map(y => [303,318,334,345].map(x => <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1" stroke="#fb923c" strokeWidth="0.8" strokeOpacity="0.4" fill="#f97316" fillOpacity="0.12"/>))}
              <rect x="385" y="140" width="44" height="82" rx="2" stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" fill="none"/>
              <rect x="18" y="148" width="38" height="74" rx="2" stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" fill="none"/>
              <circle cx="133" cy="208" r="16" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.5" fill="#f97316" fillOpacity="0.05"/>
              <line x1="133" y1="221" x2="133" y2="222" stroke="#f97316" strokeWidth="2" strokeOpacity="0.4"/>
              <circle cx="360" cy="208" r="16" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.5" fill="#f97316" fillOpacity="0.05"/>
              <line x1="360" y1="221" x2="360" y2="222" stroke="#f97316" strokeWidth="2" strokeOpacity="0.4"/>
              <circle cx="452" cy="213" r="11" stroke="#f97316" strokeWidth="1" strokeOpacity="0.35" fill="none"/>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
