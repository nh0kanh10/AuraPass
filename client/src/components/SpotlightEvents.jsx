import React, { useRef, useState, useEffect } from 'react';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import spotlightBg from '../assets/spotlight-bg.png';

const isLightTheme = () => document.documentElement.dataset.theme === 'light';

const translateBadge = (badge) => {
  if (!badge) return '';
  const mapping = {
    'hot show': 'SHOW CỰC HOT',
    'holographic ticket': 'VÉ HOLOGRAM',
    'classic play': 'KỊCH KINH ĐIỂN',
    'art walk': 'TRIỂN LÃM NGHỆ THUẬT',
    'selling fast': 'BÁN CHẠY',
    'free access': 'MIỄN PHÍ VÀO CỬA',
    'hot': 'HOT',
    'limited': 'GIỚI HẠN',
    'exclusive': 'ĐỘC QUYỀN',
    'new': 'MỚI'
  };
  return mapping[badge.toLowerCase()] || badge.toUpperCase();
};

export default function SpotlightEvents({ events, onBookClick }) {
  const [revealRef, isVisible] = useScrollReveal(0.06, '0px 0px -40px 0px');
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const animationFrameId = useRef(null);
  const autoScrollActive = useRef(true);
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [tiltStyles, setTiltStyles] = useState({});
  const dragStartPageX = useRef(0);
  const dragOccurred = useRef(false);

  const spotlightEvents = (events || []).filter(e => e.isFeatured);
  const isStatic = spotlightEvents.length < 2;
  const singleCycleWidth = spotlightEvents.length * 312;
  const multipliedEvents = isStatic ? spotlightEvents : [...spotlightEvents, ...spotlightEvents, ...spotlightEvents];

  useEffect(() => {
    if (spotlightEvents.length > 0) {
      if (isStatic) {
        setActiveId(`${spotlightEvents[0].id}-0`);
      } else {
        const initialIndex = spotlightEvents.length + Math.floor(spotlightEvents.length / 2);
        setActiveId(`${spotlightEvents[Math.floor(spotlightEvents.length / 2)].id}-${initialIndex}`);
      }
    }
    if (scrollRef.current && !isStatic) {
      scrollRef.current.scrollLeft = singleCycleWidth;
    }
  }, [events, isStatic, singleCycleWidth]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || spotlightEvents.length === 0 || isStatic) return;

    let lastTimeStep = performance.now();

    const step = (time) => {
      if (autoScrollActive.current && !isDown.current) {
        const delta = time - lastTimeStep;
        const speed = 0.04 * delta;
        container.scrollLeft -= speed;

        if (container.scrollLeft <= 500) {
          container.scrollLeft += singleCycleWidth;
        }
      }
      lastTimeStep = time;
      animationFrameId.current = requestAnimationFrame(step);
    };

    animationFrameId.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [spotlightEvents.length, isStatic, singleCycleWidth]);

  const handleScroll = () => {
  };

  const handleMouseDown = (e) => {
    const slider = scrollRef.current;
    if (!slider) return;

    isDown.current = true;
    autoScrollActive.current = false;
    dragStartPageX.current = e.pageX;
    dragOccurred.current = false;

    startX.current = e.pageX - slider.offsetLeft;
    scrollLeftStart.current = slider.scrollLeft;
    lastX.current = e.pageX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    const slider = scrollRef.current;
    if (!slider) return;

    e.preventDefault();

    if (Math.abs(e.pageX - dragStartPageX.current) > 5) {
      if (!isDragging) {
        setIsDragging(true);
      }
      dragOccurred.current = true;
    }

    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    slider.scrollLeft = scrollLeftStart.current - walk;

    if (slider.scrollLeft >= singleCycleWidth * 2) {
      slider.scrollLeft -= singleCycleWidth;
      startX.current += singleCycleWidth / 1.5;
    } else if (slider.scrollLeft <= 500) {
      slider.scrollLeft += singleCycleWidth;
      startX.current -= singleCycleWidth / 1.5;
    }

    const now = performance.now();
    const dt = now - lastTime.current;
    const dx = e.pageX - lastX.current;

    if (dt > 0) {
      velocity.current = dx / dt;
    }

    lastX.current = e.pageX;
    lastTime.current = now;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDown.current) return;
    isDown.current = false;

    const slider = scrollRef.current;
    if (!slider) return;

    if (Math.abs(velocity.current) > 0.08) {
      let currentVelocity = velocity.current * 14;
      const friction = 0.94;

      const inertiaStep = () => {
        if (isDown.current) return;

        slider.scrollLeft -= currentVelocity;
        currentVelocity *= friction;

        if (slider.scrollLeft >= singleCycleWidth * 2) {
          slider.scrollLeft -= singleCycleWidth;
        } else if (slider.scrollLeft <= 500) {
          slider.scrollLeft += singleCycleWidth;
        }

        if (Math.abs(currentVelocity) > 0.08) {
          requestAnimationFrame(inertiaStep);
        }
      };

      requestAnimationFrame(inertiaStep);
    }

    setTimeout(() => {
      if (!isDown.current) {
        autoScrollActive.current = true;
      }
    }, 1000);

    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const slider = scrollRef.current;
    if (!slider) return;

    isDown.current = true;
    autoScrollActive.current = false;

    const touch = e.touches[0];
    dragStartPageX.current = touch.pageX;
    dragOccurred.current = false;

    startX.current = touch.pageX - slider.offsetLeft;
    scrollLeftStart.current = slider.scrollLeft;
    lastX.current = touch.pageX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handleTouchMove = (e) => {
    if (!isDown.current) return;
    const slider = scrollRef.current;
    if (!slider) return;

    const touch = e.touches[0];

    if (Math.abs(touch.pageX - dragStartPageX.current) > 5) {
      if (!isDragging) {
        setIsDragging(true);
      }
      dragOccurred.current = true;
    }

    const x = touch.pageX - slider.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    slider.scrollLeft = scrollLeftStart.current - walk;

    if (slider.scrollLeft >= singleCycleWidth * 2) {
      slider.scrollLeft -= singleCycleWidth;
      startX.current += singleCycleWidth / 1.5;
    } else if (slider.scrollLeft <= 500) {
      slider.scrollLeft += singleCycleWidth;
      startX.current -= singleCycleWidth / 1.5;
    }

    const now = performance.now();
    const dt = now - lastTime.current;
    const dx = touch.pageX - lastX.current;

    if (dt > 0) {
      velocity.current = dx / dt;
    }

    lastX.current = touch.pageX;
    lastTime.current = now;
  };

  const handleCardMouseMove = (e, eventId, isActive) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (!isActive) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = x - xc;
    const dy = y - yc;

    const rotateX = -(dy / yc) * 10;
    const rotateY = (dx / xc) * 10;

    setTiltStyles(prev => ({
      ...prev,
      [eventId]: {
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.06)`,
        boxShadow: `${-(dx / xc) * 16}px ${-(dy / yc) * 16}px 32px rgba(0,0,0,0.6)`,
        '--mouse-x': `${(x / rect.width) * 100}%`,
        '--mouse-y': `${(y / rect.height) * 100}%`
      }
    }));
  };

  const handleCardMouseLeave = (eventId) => {
    setTiltStyles(prev => ({
      ...prev,
      [eventId]: {
        transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
        '--mouse-x': '50%',
        '--mouse-y': '50%'
      }
    }));
  };



  return (
    <section
      ref={revealRef}
      className={`spotlight-events-section reveal-section${isVisible ? ' reveal-visible' : ''}`}
    >
      <div className="stage-smoke-overlay" />
      <div className="spotlight-light-sweep" />

      <div style={{
        width: '100%',
        backgroundImage: `url(${spotlightBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        marginBottom: '32px',
        userSelect: 'none'
      }}>
        <div className="spotlight-banner-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '70%',
          height: '100%',
          background: 'linear-gradient(to right, rgba(11, 8, 19, 0.95) 0%, rgba(11, 8, 19, 0.5) 70%, rgba(11, 8, 19, 0) 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        <div style={{
          padding: '20px 24px',
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span className="spotlight-banner-label" style={{
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontFamily: 'var(--font-mono)',
              color: 'var(--brand-cyan)',
              display: 'block',
              marginBottom: '4px'
            }}>
              SỰ KIỆN ĐỀ XUẤT
            </span>
            <h2 className="spotlight-section-title">
              Sự Kiện Nổi Bật
            </h2>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={isStatic ? null : handleMouseDown}
        onMouseMove={isStatic ? null : handleMouseMove}
        onMouseUp={isStatic ? null : handleMouseUpOrLeave}
        onTouchStart={isStatic ? null : handleTouchStart}
        onTouchMove={isStatic ? null : handleTouchMove}
        onTouchEnd={isStatic ? null : handleMouseUpOrLeave}
        onScroll={isStatic ? null : handleScroll}
        onMouseEnter={isStatic ? null : () => { autoScrollActive.current = false; }}
        onMouseLeave={isStatic ? null : () => {
          isDown.current = false;
          setIsDragging(false);
          autoScrollActive.current = true;
          setActiveId('');
        }}
        className={`spotlight-events-scroll ${isStatic ? 'spotlight-static' : ''}`}
        style={isStatic ? { cursor: 'default' } : {}}
      >
        <div className={`spotlight-scroll-inner ${isStatic ? 'spotlight-static-inner' : ''}`}>
          {multipliedEvents.map((event, index) => {
            const uniqueKey = `${event.id}-${index}`;
            const isActive = uniqueKey === activeId;
            const style = tiltStyles[uniqueKey] || {};

            return (
              <div
                key={uniqueKey}
                data-id={event.id}
                className={`spotlight-card-wrapper ${isActive ? 'active-wrapper' : ''}`}
                style={{
                  animationDelay: `${(index % spotlightEvents.length) * 0.08}s`,
                  pointerEvents: isDragging ? 'none' : 'auto'
                }}
              >
                <div
                  className={`spotlight-card ${isActive ? 'spotlight-card-active' : ''}`}
                  data-unique-id={uniqueKey}
                  onMouseMove={(e) => handleCardMouseMove(e, uniqueKey, isActive)}
                  onMouseLeave={() => {
                    handleCardMouseLeave(uniqueKey);
                    setActiveId('');
                  }}
                  onMouseEnter={() => {
                    if (!isDragging) {
                      setActiveId(uniqueKey);
                    }
                  }}
                  onClick={(e) => {
                    if (dragOccurred.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (isActive) {
                      onBookClick(event);
                    } else {
                      setActiveId(uniqueKey);
                    }
                  }}
                  style={style}
                >
                  {isActive && (
                    <div className="spotlight-particles">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`particle p-${i}`} />
                      ))}
                    </div>
                  )}

                  <div className="spotlight-card-spotlight" />
                  <div className="spotlight-volumetric-ray" />
                  <div className="spotlight-holographic-sheen" />

                  <div className="spotlight-badge">
                    {translateBadge(event.badge || 'Hot')}
                  </div>

                  <div className="spotlight-image-container">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="spotlight-poster-image"
                      loading="lazy"
                    />
                  </div>

                  <div className="spotlight-card-overlay" />

                  <div className="spotlight-card-content">
                    <div>
                      <div className="spotlight-card-meta">
                        <span className="spotlight-meta-item">
                          <Calendar size={12} />
                          {event.date}
                        </span>
                      </div>

                      <h3 className="spotlight-card-title">
                        {event.title}
                      </h3>

                      <div className="spotlight-card-location">
                        <MapPin size={12} />
                        <span>{event.eventType === 'online' ? 'Trực tuyến' : event.location.split(',')[0]}</span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      width: '100%'
                    }}>
                      <div className="spotlight-card-price-text" style={{
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--brand-pearl)',
                        opacity: 0.85
                      }}>
                        Giá từ: <span className="spotlight-price-amount" style={{ color: 'var(--brand-cyan)', fontWeight: 600 }}>{event.priceRange.split(' ')[0]}</span>
                      </div>

                      <button
                        className="spotlight-btn-buy"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dragOccurred.current) return;
                          onBookClick(event);
                        }}
                      >
                        <Ticket size={14} />
                        Đặt Vé Ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
