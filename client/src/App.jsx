import React, { useState, useEffect, useRef, useCallback } from 'react';
const isLight = () => document.documentElement.dataset.theme === 'light';

const isEventExpired = (dateStr, timeStr) => {
  if (!dateStr) return false;
  const now = new Date();

  try {
    let year, month, day;

    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
      year = y;
      month = m - 1;
      day = d;
    } else {
      const cleanStr = dateStr.replace(/Tháng\s*/i, '').replace(',', '');
      const parts = cleanStr.split(/\s+/);
      if (parts.length >= 3) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      } else {
        return false;
      }
    }

    let hours = 0;
    let minutes = 0;

    if (timeStr && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]/.test(timeStr)) {
      const [h, m] = timeStr.split(':').map(Number);
      hours = h;
      minutes = m;
    }

    const eventStartDateTime = new Date(year, month, day, hours, minutes, 0);
    // Ngưng bán trước giờ bắt đầu 1 tiếng
    const salesCloseDateTime = new Date(eventStartDateTime.getTime() - 60 * 60 * 1000);
    return now > salesCloseDateTime;
  } catch (e) {
    console.error('Error in isEventExpired (sales close validation):', e);
  }
  return false;
};
import { useScrollReveal } from './hooks/useScrollReveal';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedCreators from './components/FeaturedCreators';
import SpotlightEvents from './components/SpotlightEvents';
import TrendingEvents from './components/TrendingEvents';
import EventCard from './components/EventCard';
import SeatMap from './components/SeatMap';
import Checkout from './components/Checkout';
import ResaleMarket from './components/ResaleMarket';
import Footer from './components/Footer';
import { Grid, Calendar, MapPin, Sparkles, Filter, ChevronUp } from 'lucide-react';
import CreatorsExplorePage from './components/CreatorsExplorePage';
import MusicPlayer from './components/MusicPlayer';
import AccountPage from './components/AccountPage';
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = sessionStorage.getItem('aura_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse saved user', e);
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('aura_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('aura_user');
    }
  }, [currentUser]);

  const [openLoginTrigger, setOpenLoginTrigger] = useState(0);
  const [openWalletTrigger, setOpenWalletTrigger] = useState(0);
  const [initialAccountTab, setInitialAccountTab] = useState('profile');

  const navigateToAccount = (tab = 'profile') => {
    setInitialAccountTab(tab);
    setCurrentView('account');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  const [userTickets, setUserTickets] = useState([]);
  const [popup, setPopup] = useState(null);

  const showAlert = (message, title = 'Thông báo') => {
    return new Promise((resolve) => {
      setPopup({
        title,
        message,
        type: 'alert',
        onConfirm: () => {
          setPopup(null);
          resolve(true);
        },
        onDismiss: () => {
          setPopup(null);
          resolve(false);
        }
      });
    });
  };

  const showConfirm = (message, title = 'Xác nhận') => {
    return new Promise((resolve) => {
      setPopup({
        title,
        message,
        type: 'confirm',
        onConfirm: () => {
          setPopup(null);
          resolve(true);
        },
        onCancel: () => {
          setPopup(null);
          resolve(false);
        }
      });
    });
  };

  const [currentView, setCurrentView] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [events, setEvents] = useState([]);
  const [creators, setCreators] = useState([]);
  
  const [resaleTickets, setResaleTickets] = useState([]);
  const [selectedResaleTicket, setSelectedResaleTicket] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  
  const [showBackToTop, setShowBackToTop] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events');
      if (res.ok) {
        const data = await res.json();
        const activeEvents = data.filter(event => !isEventExpired(event.date, event.time));
        setEvents(activeEvents);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCreators = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/creators');
      if (res.ok) {
        const data = await res.json();
        setCreators(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchResaleTickets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/resale');
      if (res.ok) {
        const data = await res.json();
        setResaleTickets(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserTickets = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/wallet?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserTickets(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchCreators();
    fetchResaleTickets();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserTickets(currentUser.id);
    } else {
      setUserTickets([]);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [activeSection, setActiveSection] = useState(null);

  const eventsSectionRef  = useRef(null);
  const resaleSectionRef  = useRef(null);
  const artistsSectionRef = useRef(null);

  useEffect(() => {
    if (currentView === 'creators') {
      setActiveSection('artists');
      return;
    }

    if (currentView !== 'home') {
      setActiveSection(null);
      return;
    }

    const sectionMap = [
      { ref: eventsSectionRef,  id: 'events'  },
      { ref: resaleSectionRef,  id: 'resale'  },
      { ref: artistsSectionRef, id: 'artists' },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        let best = null;
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.intersectionRatio) {
              best = entry;
            }
          }
        });
        if (best) {
          setActiveSection(best.target.dataset.section);
        }
      },
      { threshold: [0.15, 0.35, 0.55], rootMargin: '-60px 0px -20% 0px' }
    );

    sectionMap.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [currentView]);

  const SECTION_REFS = {
    events:  eventsSectionRef,
    resale:  resaleSectionRef,
    artists: artistsSectionRef,
  };

  const scrollToSection = useCallback((sectionId) => {
    if (sectionId === 'artists') {
      setCurrentView('creators');
      setSearchTerm('');
      setSelectedCategory('all');
      setActiveSection('artists');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView('home');
    setSearchTerm('');
    setSelectedCategory('all');
    setActiveSection(sectionId);

    setTimeout(() => {
      const ref = SECTION_REFS[sectionId];
      if (!ref?.current) return;

      const headerHeight = 80;
      const top = ref.current.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });

      ref.current.classList.add('stage-light-flash');
      setTimeout(() => {
        ref.current?.classList.remove('stage-light-flash');
      }, 1700);
    }, 80);
  }, []);

  const [eventsRevealRef, eventsVisible] = useScrollReveal(0.05, '0px 0px -40px 0px');
  const [resaleRevealRef, resaleVisible] = useScrollReveal(0.05, '0px 0px -40px 0px');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.lineup?.some(artist => artist.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTime = true;
    if (selectedTimeFilter === 'weekend') {
      matchesTime = event.date.includes('25') || event.date.includes('27') || event.date.includes('28');
    } else if (selectedTimeFilter === 'month') {
      matchesTime = event.date.includes('Tháng 06') || event.date.includes('Tháng 07') || event.date.includes('10') || event.date.includes('11');
    }

    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory && matchesTime;
  });

  const featuredEvent = events.find(e => e.id === 'rap-viet-2026') || events[0];

  const handleBookClick = async (event) => {
    if (!currentUser) {
      const confirmed = await showAlert("Vui lòng đăng nhập để tiến hành đặt vé sự kiện.");
      if (confirmed) setOpenLoginTrigger(prev => prev + 1);
      return;
    }
    setSelectedEvent(event);
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleProceedCheckout = (details) => {
    setBookingDetails(details);
    setCartCount(details.count);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleBuyResale = (ticket) => {
    const event = events.find(e => e.id === ticket.eventId);
    if (event?.eventType === 'online') {
      const hasOwned = userTickets?.some(
        t => t.eventId === event.id && (t.status === 'active' || t.status === 'reselling')
      );
      if (hasOwned) {
        showAlert('Bạn đã sở hữu vé cho sự kiện trực tuyến này. Mỗi tài khoản chỉ được sở hữu tối đa 1 vé.');
        return;
      }
    }

    setSelectedResaleTicket(ticket);
    setBookingDetails({
      event,
      zone: { id: ticket.ticketId, name: ticket.zoneName, price: ticket.resalePrice, isStanding: false },
      count: 1,
      seats: [ticket.seatInfo.split(' - ')[1] || ticket.seatInfo],
      totalPrice: ticket.resalePrice
    });
    setCartCount(1);
    setCurrentView('resaleCheckout');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleListResale = (newTicket) => {
    setResaleTickets([newTicket, ...resaleTickets]);
  };

  const handleConfirmBooking = async (formDetails) => {
    if (bookingDetails) {
      const { event, zone, count, seats, totalPrice, perSeatZoneIds } = bookingDetails;
      const { fullName, email, phone } = formDetails;
      
      if (currentView === 'resaleCheckout' && selectedResaleTicket) {
        try {
          const res = await fetch('http://localhost:5000/api/resale/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resaleId: selectedResaleTicket.id,
              buyerId: currentUser ? currentUser.id : 'user-1',
              fullName,
              email,
              phone
            })
          });
          if (!res.ok) {
            const err = await res.json();
            await showAlert(err.error || 'Mua vé resale thất bại');
            return null;
          }
          const data = await res.json();
          if (currentUser) {
            await fetchUserTickets(currentUser.id);
          }
          await fetchEvents();
          await fetchResaleTickets();
          return data;
        } catch (e) {
          console.error(e);
          await showAlert('Lỗi kết nối API mua vé resale');
          return null;
        }
      } else {
        try {
          const res = await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser ? currentUser.id : 'user-1',
              eventId: event.id,
              zoneId: zone.id,
              count,
              seats,
              perSeatZoneIds: perSeatZoneIds || null,
              totalPrice,
              fullName,
              email,
              phone,
              paymentStatus: 'Paid'
            })
          });
          if (!res.ok) {
            const err = await res.json();
            await showAlert(err.error || 'Đặt vé thất bại');
            return null;
          }
          const data = await res.json();
          if (currentUser) {
            await fetchUserTickets(currentUser.id);
          }
          await fetchEvents();
          await fetchResaleTickets();
          return data;
        } catch (e) {
          console.error(e);
          await showAlert('Lỗi kết nối API đặt vé');
          return null;
        }
      }
    }
    return null;
  };

  const handleFooterNavigate = (target) => {
    if (target === 'creators') {
      setCurrentView('creators');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'create-event') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const idMap = { events: 'events-section', resale: 'resale-section', artists: 'artists-section' };
      const id = idMap[target];
      if (currentView !== 'home') {
        setCurrentView('home');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleCheckoutComplete = () => {
    if (currentView === 'resaleCheckout' && selectedResaleTicket) {
      setSelectedResaleTicket(null);
    }
    setCartCount(0);
    setBookingDetails(null);
    setSelectedEvent(null);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
      <div className="film-grain-overlay"></div>

      <div className="stage-glow-bg">
        <div className="glow-bubble glow-purple"></div>
        <div className="glow-bubble glow-cyan"></div>
        <div className="glow-bubble glow-gold"></div>
        <div className="glow-bubble glow-rose"></div>
      </div>

      {showBackToTop && (
        <button 
          className="back-to-top-btn" 
          onClick={scrollToTop}
          aria-label="Quay lại đầu trang"
        >
          <ChevronUp size={16} className="back-to-top-icon" />
          <span className="back-to-top-label">TOP</span>
        </button>
      )}
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        
        <Header 
          theme={theme}
          setTheme={setTheme}
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onHomeClick={() => { setCurrentView('home'); setSearchTerm(''); setSelectedCategory('all'); }} 
          cartCount={cartCount}
          activeSection={(currentView === 'home' || currentView === 'creators') ? activeSection : null}
          onSectionClick={scrollToSection}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          userTickets={userTickets}
          setUserTickets={setUserTickets}
          resaleTickets={resaleTickets}
          setResaleTickets={setResaleTickets}
          fetchUserTickets={fetchUserTickets}
          fetchResaleTickets={fetchResaleTickets}
          openLoginTrigger={openLoginTrigger}
          openWalletTrigger={openWalletTrigger}
          showAlert={showAlert}
          showConfirm={showConfirm}
          onNavigateAccount={navigateToAccount}
        />

        <main style={{ flexGrow: 1 }}>
          
          {currentView === 'home' && !searchTerm && selectedCategory === 'all' && events.length > 0 && (
            <Hero events={events.slice(0, 5)} onBookClick={handleBookClick} />
          )}

          {currentView === 'creators' && <CreatorsExplorePage creators={creators} onBack={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'auto' }); }} />}

          {currentView === 'account' && currentUser && (
            <AccountPage
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              userTickets={userTickets}
              fetchUserTickets={fetchUserTickets}
              showAlert={showAlert}
              showConfirm={showConfirm}
              onBack={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'auto' }); }}
              fetchResaleTickets={fetchResaleTickets}
              initialTab={initialAccountTab}
            />)}

          <div style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {currentView === 'home' && (
              <>
                {!searchTerm && selectedCategory === 'all' && (
                  <div
                    ref={artistsSectionRef}
                    data-section="artists"
                    id="artists-section"
                  >
                    <FeaturedCreators creators={creators} onNavigateCreators={() => { setCurrentView('creators'); window.scrollTo({ top: 0, behavior: 'auto' }); }} />
                  </div>
                )}

                {!searchTerm && selectedCategory === 'all' && events.length > 0 && (
                  <SpotlightEvents events={events} onBookClick={handleBookClick} />
                )}

                {!searchTerm && selectedCategory === 'all' && events.length > 0 && (
                  <TrendingEvents events={events} onBookClick={handleBookClick} />
                )}

                <div
                  ref={(el) => { eventsRevealRef.current = el; eventsSectionRef.current = el; }}
                  data-section="events"
                  id="events-section"
                  className={`reveal-section reveal-delay-1${eventsVisible ? ' reveal-visible' : ''}`}
                  style={{ padding: '0 24px 40px 24px', textAlign: 'left' }}
                >
                  <div style={{
                    display: 'flex',
                    borderBottom: isLight() ? '1px solid rgba(15, 23, 42, 0.12)' : '1px solid rgba(229, 223, 217, 0.08)',
                    marginBottom: '28px',
                    paddingBottom: '2px'
                  }}>
                    <div className="events-time-filter-tabs" style={{
                      display: 'flex',
                      gap: '28px',
                      alignItems: 'center',
                    }}>
                      {[
                        { id: 'all', name: 'Tất cả' },
                        { id: 'weekend', name: 'Cuối tuần này' },
                        { id: 'month', name: 'Tháng này' }
                      ].map(t => {
                        const isActive = selectedTimeFilter === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTimeFilter(t.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              borderBottom: 'none',
                              outline: 'none',
                              padding: '4px 0 10px',
                              position: 'relative',
                              color: isActive
                                ? (isLight() ? 'oklch(18% 0.02 250)' : '#ffffff')
                                : (isLight() ? 'oklch(48% 0.015 250)' : 'oklch(44% 0.02 250)'),
                              fontSize: '13px',
                              fontWeight: isActive ? 600 : 400,
                              fontFamily: 'var(--font-body)',
                              cursor: 'pointer',
                              letterSpacing: '0.02em',
                              textShadow: (isActive && !isLight())
                                ? '0 0 18px oklch(72% 0.18 200 / 0.7)'
                                : 'none',
                              transition: 'all 0.25s ease',
                            }}
                            onMouseEnter={e => {
                              if (!isActive) e.currentTarget.style.color = isLight() ? 'oklch(25% 0.02 250)' : 'oklch(72% 0.02 250)';
                            }}
                            onMouseLeave={e => {
                              if (!isActive) e.currentTarget.style.color = isLight() ? 'oklch(48% 0.015 250)' : 'oklch(44% 0.02 250)';
                            }}
                          >
                            {t.name}
                            {isActive && (
                              <span style={{
                                position: 'absolute',
                                bottom: '2px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                background: isLight() ? 'oklch(26% 0.03 250)' : 'oklch(70% 0.18 200)',
                                boxShadow: isLight() ? 'none' : '0 0 8px 2px oklch(65% 0.22 280 / 0.8)',
                                display: 'block',
                              }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {filteredEvents.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '64px 32px', textAlign: 'center' }}>
                      <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
                        Không tìm thấy sự kiện nào khớp với tìm kiếm của bạn. Hãy thử đổi từ khoá khác!
                      </p>
                    </div>
                  ) : (
                    <div className={`bento-grid reveal-stagger${eventsVisible ? ' reveal-visible' : ''}`}>
                      {filteredEvents.map((event, idx) => {
                        const isFeaturedFirst = idx === 0 && filteredEvents.length > 1;
                        return (
                          <div 
                            key={event.id}
                            className={`event-card-col ${isFeaturedFirst ? 'featured' : ''}`}
                          >
                            <EventCard event={event} isFeatured={isFeaturedFirst} onClick={() => handleBookClick(event)} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div
                  ref={(el) => { resaleRevealRef.current = el; resaleSectionRef.current = el; }}
                  data-section="resale"
                  id="resale-section"
                  className={`reveal-section reveal-delay-2${resaleVisible ? ' reveal-visible' : ''}`}
                  style={{ padding: '0 24px' }}
                >
                  <ResaleMarket 
                    tickets={resaleTickets} 
                    userTickets={userTickets}
                    onBuyResale={handleBuyResale}
                    onListResale={handleListResale}
                    events={events}
                    currentUser={currentUser}
                    onNeedLogin={() => setOpenLoginTrigger(prev => prev + 1)}
                    onOpenWallet={() => setOpenWalletTrigger(prev => prev + 1)}
                    onRefreshUserTickets={() => currentUser && fetchUserTickets(currentUser.id)}
                    onRefreshResaleTickets={fetchResaleTickets}
                    showAlert={showAlert}
                    showConfirm={showConfirm}
                  />
                </div>
              </>
            )}

            {currentView === 'booking' && selectedEvent && (
              <div style={{ padding: '0 24px' }}>
                <SeatMap 
                  event={selectedEvent} 
                  onBack={() => setCurrentView('home')} 
                  onProceedCheckout={handleProceedCheckout}
                  showAlert={showAlert}
                  userTickets={userTickets}
                />
              </div>
            )}

            {(currentView === 'checkout' || currentView === 'resaleCheckout') && bookingDetails && (
              <div style={{ padding: '0 24px' }}>
                <Checkout 
                  bookingData={bookingDetails} 
                  onBack={() => {
                    setCartCount(0);
                    if (currentView === 'checkout') {
                      setCurrentView('booking');
                    } else {
                      setSelectedResaleTicket(null);
                      setBookingDetails(null);
                      setCurrentView('home');
                    }
                  }}
                  onComplete={handleCheckoutComplete}
                  showAlert={showAlert}
                  currentUser={currentUser}
                  onConfirmBooking={handleConfirmBooking}
                />
              </div>
            )}
          </div>
        </main>

        <Footer onNavigate={handleFooterNavigate} />
        <MusicPlayer />
      </div>
      {popup && (
        <div
          className="custom-popup-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (popup.type === 'confirm') popup.onCancel();
              else if (popup.onDismiss) popup.onDismiss();
              else popup.onConfirm();
            }
          }}
        >
          <div className="custom-popup-card">
            <button
              className="custom-popup-close"
              onClick={() => {
                if (popup.type === 'confirm') popup.onCancel();
                else if (popup.onDismiss) popup.onDismiss();
                else popup.onConfirm();
              }}
              aria-label="Đóng"
            >
              ✕
            </button>
            <h4 className="custom-popup-title">{popup.title}</h4>
            <p className="custom-popup-message">{popup.message}</p>
            <div className="custom-popup-actions">
              {popup.type === 'confirm' && (
                <button className="custom-popup-btn-cancel" onClick={popup.onCancel}>
                  Hủy
                </button>
              )}
              <button className="custom-popup-btn-confirm" onClick={popup.onConfirm}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
