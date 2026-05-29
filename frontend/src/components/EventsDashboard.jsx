import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const placeholderImages = [
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1533174000273-e18e8bb3310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

export default function EventsDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const container = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user, navigate]);

  useGSAP(() => {
    if (!loading && events.length > 0) {
      gsap.fromTo(
        '.event-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, [loading, events]);

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      alert('Successfully registered for the event!');
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading events...</div>;

  return (
    <div ref={container} className="min-h-screen bg-[#0a0a0a] text-white font-inter pb-20">
      
      {/* Header */}
      <header className="bg-[#111] border-b border-white/5 pt-12 pb-8 px-8 md:px-16">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold mb-2">All Events</h1>
            <p className="text-sm text-gray-400">Home / Events</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-gray-300">
              Welcome, <span className="font-semibold text-white">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 md:px-16 mt-16">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Upcoming <span className="text-orange-500">Events</span></h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm">
            Discover the best campus activities and secure your spot today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length === 0 ? (
            <p className="text-center col-span-full text-gray-500">No events available right now.</p>
          ) : (
            events.map((event, index) => {
              const isRegistered = event.registeredUsers?.some(u => (u?._id || u) === user?._id);
              const isFull = (event.registeredUsers?.length || 0) >= event.capacity;
              const dateObj = new Date(event.date);
              const day = dateObj.getDate();
              const month = dateObj.toLocaleString('default', { month: 'short' });
              const year = dateObj.getFullYear();
              
              // Assign a stable image: use event.imageUrl if present, otherwise fallback to placeholder
              const imageSrc = event.imageUrl && event.imageUrl.trim() !== ''
                ? event.imageUrl
                : placeholderImages[index % placeholderImages.length];

              return (
                <div key={event._id} className="event-card opacity-0 bg-[#151515] rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 group shadow-lg flex flex-col">
                  
                  {/* Image & Badge */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={imageSrc} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    
                    {/* Date Badge */}
                    <div className="absolute top-4 right-4 bg-white text-black text-center px-3 py-1.5 rounded-lg shadow-md font-bold">
                      <div className="text-lg leading-none">{day}</div>
                      <div className="text-[10px] uppercase tracking-wider">{month}</div>
                      <div className="text-[10px] text-gray-500">{year}</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    
                    {/* Location */}
                    <div className="flex items-center text-xs text-gray-400 mb-3">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      Main Campus
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition">{event.title}</h3>
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-1">{event.description}</p>
                    
                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                      <div className="text-sm">
                        <span className="text-gray-500">Capacity: </span>
                        <span className="font-semibold text-white">{(event.registeredUsers?.length || 0)}/{event.capacity}</span>
                      </div>
                      
                      <button
                        onClick={() => handleRegister(event._id)}
                        disabled={isRegistered || isFull}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                          isRegistered 
                            ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                            : isFull
                            ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        {isRegistered ? 'Registered' : isFull ? 'Fully Booked' : 'Register Now'}
                        {!isRegistered && !isFull && (
                          <span className="bg-white/20 rounded-lg p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></span>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

    </div>
  );
}
