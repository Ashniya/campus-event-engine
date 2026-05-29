import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const HIGHLIGHTS = [
  { icon: "🎭", title: "Cultural Fests", desc: "Vibrant annual campus cultural events" },
  { icon: "💡", title: "Tech Hackathons", desc: "48-hour coding marathons & prizes" },
  { icon: "🏆", title: "Sports Meets", desc: "Cheer for your department team" },
  { icon: "🤝", title: "Alumni Nights", desc: "Network with top industry leaders" },
];

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [collegeUid, setCollegeUid] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register(name, email, password, 'student', collegeUid);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '13px 14px 13px 38px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

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
        minHeight: '680px',
        position: 'relative',
        zIndex: 1
      }}>

        {/* ── LEFT PANEL – Form ── */}
        <div style={{
          width: '45%',
          background: '#141414',
          padding: '40px 44px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          overflowY: 'auto'
        }}>
          <Link to="/" style={{fontSize:'22px',fontWeight:'800',letterSpacing:'0.05em',color:'#fff',marginBottom:'24px',display:'block',textDecoration:'none'}}>
            SCEE<span style={{color:'#f97316'}}>.</span>
          </Link>
          <h1 style={{fontSize:'30px',fontWeight:'800',color:'#fff',marginBottom:'4px',fontFamily:'Georgia,serif'}}>Sign Up</h1>
          <p style={{fontSize:'13px',color:'#888',marginBottom:'24px'}}>Create your student account to explore campus events.</p>

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            {error && (
              <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'12px',padding:'10px 14px',fontSize:'12px',color:'#f87171'}}>
                ⚠️ {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#999',marginBottom:'5px'}}>Full Name <span style={{color:'#f97316'}}>*</span></label>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'15px',height:'15px'}} fill="none" stroke="#666" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <input type="text" required placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
              </div>
            </div>

            {/* College UID */}
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#999',marginBottom:'5px'}}>College UID / Roll Number <span style={{color:'#f97316'}}>*</span></label>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'15px',height:'15px'}} fill="none" stroke="#666" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/></svg>
                <input type="text" required placeholder="e.g. CS21B0042" value={collegeUid} onChange={e => setCollegeUid(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#999',marginBottom:'5px'}}>Email Address <span style={{color:'#f97316'}}>*</span></label>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'15px',height:'15px'}} fill="none" stroke="#666" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <input type="email" required placeholder="student@campus.edu" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#999',marginBottom:'5px'}}>Password <span style={{color:'#f97316'}}>*</span></label>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'15px',height:'15px'}} fill="none" stroke="#666" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input type={showPassword ? 'text' : 'password'} required placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} style={{...inputStyle, paddingRight:'40px'}}
                  onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',padding:0,color:'#666',display:'flex'}}>
                  <svg style={{width:'15px',height:'15px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#999',marginBottom:'5px'}}>Confirm Password <span style={{color:'#f97316'}}>*</span></label>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'15px',height:'15px'}} fill="none" stroke="#666" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input type={showPassword ? 'text' : 'password'} required placeholder="Repeat your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  style={{...inputStyle, borderColor: confirmPassword && password !== confirmPassword ? '#ef4444' : 'rgba(255,255,255,0.1)'}}
                  onFocus={e => e.target.style.borderColor = password !== confirmPassword ? '#ef4444' : '#f97316'}
                  onBlur={e => e.target.style.borderColor = confirmPassword && password !== confirmPassword ? '#ef4444' : 'rgba(255,255,255,0.1)'}/>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p style={{color:'#f87171',fontSize:'11px',marginTop:'4px'}}>Passwords don't match</p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'14px',background:'#f97316',color:'#fff',fontWeight:'700',fontSize:'15px',borderRadius:'12px',border:'none',cursor:'pointer',boxShadow:'0 6px 20px rgba(249,115,22,0.4)',marginTop:'4px',transition:'all 0.2s',opacity:loading?0.6:1}}
              onMouseEnter={e => { if(!loading){e.target.style.background='#fb923c'; e.target.style.transform='translateY(-1px)';} }}
              onMouseLeave={e => { e.target.style.background='#f97316'; e.target.style.transform='translateY(0)'; }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p style={{textAlign:'center',fontSize:'13px',color:'#666',marginTop:'2px'}}>
              Already have an account?{' '}
              <Link to="/login" style={{color:'#f97316',fontWeight:'600',textDecoration:'none'}}>Sign In</Link>
            </p>
          </form>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: 1,
          background: '#0a0a0a',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'linear-gradient(rgba(249,115,22,1) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,1) 1px,transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none'}}/>
          <div style={{position:'absolute',top:'-80px',right:'-80px',width:'300px',height:'300px',background:'radial-gradient(circle,rgba(249,115,22,0.12) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>

          {/* Highlights + Stats */}
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:'50px',fontFamily:'Georgia,serif',color:'#f97316',lineHeight:1,marginBottom:'12px',opacity:0.9}}>"</div>
            <p style={{fontSize:'16px',color:'rgba(255,255,255,0.85)',fontFamily:'Georgia,serif',lineHeight:1.6,marginBottom:'24px'}}>
              Join thousands of students already discovering and experiencing unforgettable campus events.
            </p>

            {/* Grid */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'24px'}}>
              {HIGHLIGHTS.map((item, i) => (
                <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',transition:'border-color 0.3s',cursor:'default'}}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(249,115,22,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
                  <div style={{fontSize:'24px',marginBottom:'8px'}}>{item.icon}</div>
                  <div style={{color:'#fff',fontSize:'13px',fontWeight:'600',marginBottom:'4px'}}>{item.title}</div>
                  <div style={{color:'#777',fontSize:'11px',lineHeight:1.4}}>{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{display:'flex',gap:'32px',borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'20px'}}>
              {[['500+','Events / Year'],['12k+','Students'],['50+','Clubs']].map(([num,label]) => (
                <div key={label}>
                  <div style={{fontSize:'22px',fontWeight:'800',color:'#f97316'}}>{num}</div>
                  <div style={{fontSize:'11px',color:'#666',textTransform:'uppercase',letterSpacing:'0.05em',marginTop:'2px'}}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Campus SVG */}
          <div style={{position:'relative',zIndex:1,marginTop:'auto'}}>
            <svg viewBox="0 0 480 190" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',opacity:0.6}}>
              <line x1="0" y1="183" x2="480" y2="183" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.4"/>
              <rect x="185" y="35" width="65" height="148" rx="2" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.65" fill="none"/>
              <rect x="194" y="16" width="47" height="26" rx="2" stroke="#f97316" strokeWidth="1" strokeOpacity="0.4" fill="none"/>
              {[52,70,88,106,124,142,160,174].map(y => [194,209,223,232].map(x => <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1" stroke="#fb923c" strokeWidth="0.8" strokeOpacity="0.55" fill="#f97316" fillOpacity="0.15"/>))}
              <rect x="70" y="75" width="52" height="108" rx="2" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.5" fill="none"/>
              {[85,103,121,139,157,171].map(y => [78,95,108].map(x => <rect key={`${x}-${y}`} x={x} y={y} width="7" height="7" rx="1" stroke="#fb923c" strokeWidth="0.8" strokeOpacity="0.4" fill="#f97316" fillOpacity="0.1"/>))}
              <rect x="295" y="95" width="58" height="88" rx="2" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.5" fill="none"/>
              {[107,124,141,158,170].map(y => [303,318,334,345].map(x => <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1" stroke="#fb923c" strokeWidth="0.8" strokeOpacity="0.4" fill="#f97316" fillOpacity="0.12"/>))}
              <rect x="390" y="122" width="44" height="61" rx="2" stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" fill="none"/>
              <rect x="18" y="130" width="38" height="53" rx="2" stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" fill="none"/>
              <circle cx="133" cy="170" r="14" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.5" fill="#f97316" fillOpacity="0.05"/>
              <line x1="133" y1="182" x2="133" y2="183" stroke="#f97316" strokeWidth="2" strokeOpacity="0.4"/>
              <circle cx="360" cy="170" r="14" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.5" fill="#f97316" fillOpacity="0.05"/>
              <line x1="360" y1="182" x2="360" y2="183" stroke="#f97316" strokeWidth="2" strokeOpacity="0.4"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
