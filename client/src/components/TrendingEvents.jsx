import React, { useRef, useState, useEffect } from 'react';
import { Ticket, TrendingUp } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function TrendingEvents({ events, onBookClick }) {
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
  const isLightTheme = document.documentElement.dataset.theme === 'light';

  const trendingEvents = (events || []).filter(e => e.isTrending);
  const multipliedEvents = [...trendingEvents, ...trendingEvents, ...trendingEvents];

  useEffect(() => {
    if (trendingEvents.length > 0) {
      setActiveId(`${trendingEvents[0].id}-0`);
    }
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 1360;
    }
  }, [events]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || trendingEvents.length === 0) return;

    let lastTimeStep = performance.now();
    const singleCycleWidth = 1360;

    const step = (time) => {
      if (autoScrollActive.current && !isDown.current) {
        const delta = time - lastTimeStep;
        const speed = 0.04 * delta;
        container.scrollLeft += speed;

        if (container.scrollLeft >= singleCycleWidth * 2) {
          container.scrollLeft -= singleCycleWidth;
        }
      }
      lastTimeStep = time;
      animationFrameId.current = requestAnimationFrame(step);
    };

    animationFrameId.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [trendingEvents.length]);

  const handleMouseDown = (e) => {
    const slider = scrollRef.current;
    if (!slider) return;
    
    isDown.current = true;
    autoScrollActive.current = false;
    setIsDragging(true);
    
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
    
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    slider.scrollLeft = scrollLeftStart.current - walk;

    const singleCycleWidth = 1360;
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

        const singleCycleWidth = 1360;
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
    setIsDragging(true);
    
    const touch = e.touches[0];
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
    const x = touch.pageX - slider.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    slider.scrollLeft = scrollLeftStart.current - walk;

    const singleCycleWidth = 1360;
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

  return (
    <section
      ref={revealRef}
      className={`trending-events-section reveal-section${isVisible ? ' reveal-visible' : ''}`}
      style={{ padding: '48px 0 64px 0', overflow: 'hidden', position: 'relative' }}
    >
      <div style={{ padding: '0 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '32px',
          borderBottom: '1px solid rgba(229, 223, 217, 0.08)',
          paddingBottom: '12px',
          userSelect: 'none'
        }}>
          <div>
            <span style={{
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontFamily: 'var(--font-mono)',
              color: isLightTheme ? 'oklch(38% 0.06 160)' : 'oklch(68% 0.18 155)',
              display: 'block',
              marginBottom: '4px'
            }}>
              POPULAR SHOWS
            </span>
            <h2 className="trending-section-title" style={{ fontSize: '22px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)' }}>
              Sự Kiện Xu Hướng
            </h2>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={() => {
          isDown.current = false;
          setIsDragging(false);
          autoScrollActive.current = true;
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        className="trending-events-scroll"
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          padding: '24px 0 40px 0',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        <div className="trending-scroll-inner" style={{ display: 'flex', gap: '56px', padding: '0 calc(50% - 150px)' }}>
          {multipliedEvents.map((event, index) => {
            const uniqueKey = `${event.id}-${index}`;
            const isActive = uniqueKey === activeId;
            const rankNumber = (index % trendingEvents.length) + 1;
            
            const getNeonColor = (rank) => {
              if (isLightTheme) {
                if (rank === 1) return 'oklch(44% 0.24 295)';
                if (rank === 2) return 'oklch(42% 0.18 220)';
                if (rank === 3) return 'oklch(40% 0.18 155)';
                return 'oklch(46% 0.14 75)';
              }
              if (rank === 1) return 'oklch(62% 0.22 300)';
              if (rank === 2) return 'oklch(72% 0.16 200)';
              if (rank === 3) return 'oklch(68% 0.18 155)';
              return 'oklch(76% 0.15 85)';
            };

            const neonRGB = getNeonColor(rankNumber);

            return (
              <div
                key={uniqueKey}
                className="trending-card-wrapper"
                style={{
                  flexShrink: 0,
                  position: 'relative',
                  width: '320px',
                  height: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: isDragging ? 'none' : 'auto'
                }}
                onMouseEnter={() => {
                  if (!isDragging) {
                    setActiveId(uniqueKey);
                    autoScrollActive.current = false;
                  }
                }}
                onMouseLeave={() => {
                  setActiveId('');
                  autoScrollActive.current = true;
                }}
              >
                {/* Rank number — z-index 0: nằm sau card */}
                <div
                  className="trending-rank-number"
                  style={{
                    position: 'absolute',
                    left: '-20px',
                    fontSize: '110px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: 'transparent',
                    WebkitTextStroke: `2px ${neonRGB}`,
                    zIndex: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    lineHeight: 1,
                    textShadow: isLightTheme ? 'none' : (isActive ? `0 0 30px ${neonRGB}` : `0 0 10px ${neonRGB}`),
                    opacity: isLightTheme ? (isActive ? 0.38 : 0.14) : (isActive ? 0.95 : 0.45),
                    transition: 'all 0.4s ease',
                    transform: isActive ? 'scale(1.1) rotate(-5deg)' : 'scale(1)'
                  }}
                >
                  {rankNumber}
                </div>

                {/* Card — z-index 2: nằm trên rank number */}
                <div
                  className="trending-card"
                  onClick={() => {
                    if (isActive) {
                      onBookClick(event);
                    } else {
                      setActiveId(uniqueKey);
                    }
                  }}
                  style={{
                    width: '260px',
                    height: '160px',
                    marginLeft: '40px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 2,
                    background: 'var(--bg-overlay-light)',
                    border: isActive
                      ? (isLightTheme ? `1.5px solid ${neonRGB}` : `1.5px solid ${neonRGB}`)
                      : (isLightTheme ? '1px solid rgba(15,23,42,0.12)' : '1px solid rgba(255, 255, 255, 0.08)'),
                    boxShadow: isActive
                      ? (isLightTheme ? `0 12px 32px rgba(0,0,0,0.22), 0 0 18px ${neonRGB}28` : `0 0 20px ${neonRGB}1a, 0 16px 40px rgba(0, 0, 0, 0.5)`)
                      : (isLightTheme ? '0 6px 18px rgba(0,0,0,0.12)' : '0 12px 32px rgba(0, 0, 0, 0.35)'),
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    transform: isActive ? 'translateY(-8px) scale(1.03)' : 'none'
                  }}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: isActive ? 0.9 : 0.78,
                      transition: 'all 0.5s ease',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)'
                    }}
                  />

                  {/* Netflix-style dark gradient overlay */}
                  <div
                    className="trending-card-overlay"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '70%',
                      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%)',
                      zIndex: 1
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      padding: '14px 16px',
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      textAlign: 'left'
                    }}
                  >
                    {/* Trending label với icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={9} color={neonRGB} strokeWidth={2.5} />
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'rgba(255, 255, 255, 0.88)', fontWeight: 700, letterSpacing: '0.08em' }}>
                        #{rankNumber} TRENDING
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        margin: 0,
                        color: '#ffffff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textShadow: '0 1px 4px rgba(0,0,0,0.6)'
                      }}
                    >
                      {event.title}
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.72)', fontFamily: 'var(--font-mono)' }}>
                        {event.priceRange.split(' ')[0]}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookClick(event);
                        }}
                        style={{
                          background: neonRGB,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: `0 2px 10px ${neonRGB}55`,
                          opacity: isActive ? 1 : 0,
                          pointerEvents: isActive ? 'auto' : 'none',
                          transform: isActive ? 'translateY(0)' : 'translateY(3px)',
                          transition: 'opacity 0.25s ease, transform 0.25s ease'
                        }}
                      >
                        <Ticket size={10} />
                        Đặt Vé
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
