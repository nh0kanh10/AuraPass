import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

function TicketCountdown({ dateStr, isActive }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const parseEventDate = (str) => {
      if (!str) { const fb = new Date(); fb.setDate(fb.getDate() + 3); return fb; }
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        const [year, month, day] = str.split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day, 19, 0, 0);
      }
      try {
        const cleanStr = str.replace(/Tháng\s*/i, '');
        const parts = cleanStr.split(' ');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1].replace(',', ''), 10) - 1;
        const year = parseInt(parts[2], 10);
        const parsedDate = new Date(year, month, day, 19, 0, 0);
        if (isNaN(parsedDate.getTime())) throw new Error();
        return parsedDate;
      } catch (e) {
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + 3);
        return fallback;
      }
    };

    const targetDate = parseEventDate(dateStr);

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, isUrgent: false });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const isUrgent = diff < (1000 * 60 * 60 * 24);

      setTimeLeft({ days, hours, minutes, seconds, expired: false, isUrgent });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [dateStr]);

  const formatCountdown = () => {
    if (timeLeft.expired) return 'ĐANG DIỄN RA';
    const d = String(timeLeft.days).padStart(2, '0');
    const h = String(timeLeft.hours).padStart(2, '0');
    const m = String(timeLeft.minutes).padStart(2, '0');
    const s = String(timeLeft.seconds).padStart(2, '0');
    return `${d}d:${h}h:${m}m:${s}s`;
  };

  return (
    <div className="countdown-pulse" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      color: timeLeft.isUrgent ? 'oklch(52% 0.15 20)' : 'inherit',
      backgroundColor: 'var(--countdown-bg)',
      padding: '4px 8px',
      borderRadius: '4px',
      border: '1px solid var(--countdown-border)',
      marginTop: '-6px',
      marginBottom: '6px',
      opacity: isActive ? 1 : 0,
      visibility: isActive ? 'visible' : 'hidden',
      transition: 'opacity 0.4s ease, visibility 0.4s ease, color 0.3s ease, border-color 0.3s ease',
      pointerEvents: 'none'
    }}>
      <span style={{ fontSize: '7px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        {timeLeft.isUrgent ? 'BÁN CHẠY' : 'BẮT ĐẦU SAU'}
      </span>
      <span style={{ fontWeight: 700, letterSpacing: '0.03em' }}>{formatCountdown()}</span>
    </div>
  );
}


const generateAudioWaveformPath = (seed) => {
  let d = 'M 0 60';
  const steps = 150;
  const stepWidth = 1200 / steps;

  for (let i = 1; i <= steps; i++) {
    const x = i * stepWidth;
    let y = 60;

    // Giảm biên độ ở giữa để tránh rối mắt
    const isAtCenter = x > 380 && x < 820;

    if (isAtCenter) {
      y = 60 + Math.sin(i * 0.4 + seed) * 3;
    } else {
      // Sóng nhấp nhô liên tục mô phỏng dải sóng nhạc
      const waveNoise = Math.sin(i * 0.5 + seed) * Math.cos(i * 0.12) * 12;
      const wavePulse = Math.abs(Math.sin(i * 0.28 + seed)) * 26;
      const direction = i % 2 === 0 ? 1 : -1;
      y = 60 + direction * (6 + wavePulse + waveNoise);
    }
    d += ` L ${Math.round(x)} ${Math.round(y)}`;
  }
  d += ' L 1200 60';
  return d;
};

const musicWave1D = generateAudioWaveformPath(0);    // Sóng nhạc chính
const musicWave2D = generateAudioWaveformPath(3.5);  // Sóng nhạc phụ tạo độ dày

const getShortDate = (dateStr) => {
  try {
    if (!dateStr) return 'TBA';
    if (dateStr.includes('Hằng Ngày')) return 'VÉ HÀNG NGÀY';
    const months = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
      return `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`;
    }
    const cleanStr = dateStr.replace(/Tháng\s+/i, '').replace(',', '');
    const parts = cleanStr.split(/\s+/);
    const day = parts[0];
    const monthIndex = parseInt(parts[1], 10);
    const year = parts[2] || '2026';
    const month = months[monthIndex - 1] || parts[1];
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
};

const getShortVenue = (locationStr) => {
  if (!locationStr) return 'TBA';
  const primaryLoc = locationStr.split(',')[0];
  return primaryLoc
    .replace(/Sân vận động/i, 'SVĐ')
    .replace(/Nhà hát Lớn Hà Nội/i, 'NH HÁT LỚN HN')
    .replace(/Nhà hát lớn Thành Phố/i, 'NH HÁT LỚN TP')
    .replace(/Nhà hát Bến Thành/i, 'NH BẾN THÀNH')
    .replace(/Nhà thi đấu/i, 'NTĐ')
    .replace(/Rừng thông/i, 'RỪNG THÔNG')
    .replace(/Bưu điện Trung tâm/i, 'BƯU ĐIỆN TT')
    .replace(/The Myst Đồng Khởi/i, 'THE MYST')
    .toUpperCase();
};

const getSerialNumber = (eventId, idx) => {
  const serialMap = {
    'rap-viet-2026': '#AURA-01924',
    'ha-anh-tuan-dalat': '#AURA-05712',
    'vu-bao-tang-liveshow': '#AURA-03829',
    'les-miserables-musical': '#AURA-02681',
    'dao-hoa-hau-kich': '#AURA-08492',
    'workshop-art-coffee': '#AURA-09123',
    'studio-pass-2026': '#AURA-04721',
    'con-rong-chau-tien': '#AURA-06830',
    'huyen-su-mien-di-san': '#AURA-07521',
    'ai-chong-ai-vo': '#AURA-05391',
    'city-sightseeing-saigon': '#AURA-02104'
  };
  return serialMap[eventId] || `#AURA-2026-${String(idx + 1).padStart(3, '0')}`;
};

export default function Hero({ events, onBookClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextActiveIndex, setNextActiveIndex] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swappingIndex, setSwappingIndex] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [swapDirection, setSwapDirection] = useState('left');

  const [isMounted, setIsMounted] = useState(false);
  const [isEntranceFinished, setIsEntranceFinished] = useState(false);

  // Tương tác chuột cho vòng tròn plasma
  const [ringOffset, setRingOffset] = useState({ x: 0, y: 0 });

  const handleHeroMouseMove = (e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setRingOffset({ x: x * 12, y: y * 12 });
  };

  const handleHeroMouseLeaveInner = () => {
    setRingOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 80);
    const finishTimer = setTimeout(() => setIsEntranceFinished(true), 1500);
    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, []);

  const [peelingEventId, setPeelingEventId] = useState(null);

  const handleBookingStart = (e, event) => {
    e.stopPropagation();
    setPeelingEventId(event.id);

    setTimeout(() => {
      onBookClick(event);
    }, 450);
  };

  const [tiltStyle, setTiltStyle] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    const checkDevice = () => {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isCoarse || isSmallScreen);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleMouseMove = (e, posClass) => {
    if (posClass !== 'pos-0' || isSwapping || isMobile) return;

    if (!tickingRef.current) {
      tickingRef.current = true;
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      requestAnimationFrame(() => {
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const dx = x - xc;
        const dy = y - yc;

        const maxRotateX = 7;
        const maxRotateY = 7;
        const rotateX = -(dy / yc) * maxRotateX;
        const rotateY = (dx / xc) * maxRotateY;

        const shadowX = -(dx / xc) * 12;
        const shadowY = -(dy / yc) * 12;

        const mousePX = (x / rect.width) * 100;
        const mousePY = (y / rect.height) * 100;

        setTiltStyle({
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.025)`,
          boxShadow: `${shadowX}px ${shadowY}px 32px rgba(0, 0, 0, 0.45)`,
          transition: 'none',
          '--mouse-x': `${mousePX}%`,
          '--mouse-y': `${mousePY}%`
        });
        tickingRef.current = false;
      });
    }
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      boxShadow: '0 20px 48px rgba(11, 37, 58, 0.15)',
      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      '--mouse-x': '50%',
      '--mouse-y': '50%'
    });
  };

  const triggerSwap = (nextIndex, direction = 'left') => {
    if (isSwapping) return;
    setTiltStyle({});
    setSwapDirection(direction);
    setSwappingIndex(activeIndex);
    setNextActiveIndex(nextIndex);
    setIsSwapping(true);

    setTimeout(() => {
      setActiveIndex(nextIndex);
      setIsSwapping(false);
      setSwappingIndex(null);
    }, 380);
  };

  useEffect(() => {
    if (isHovered || !events || events.length <= 1 || isSwapping) return;
    const interval = setInterval(() => {
  triggerSwap((activeIndex + 1) % events.length, 'right');
    }, 7000);
    return () => clearInterval(interval);
  }, [isHovered, events, activeIndex, isSwapping]);

  if (!events || events.length === 0) return null;

  const getPositionInfo = (idx) => {
    let diff = idx - activeIndex;
    const half = Math.floor(events.length / 2);
    
    // Xoay vòng tròn vô tận: đưa diff về khoảng [-half, half]
    if (diff < -half) diff += events.length;
    if (diff > half) diff -= events.length;
    
    let posClass = 'pos-0';
    if (diff < 0) {
      posClass = `pos-left-${Math.abs(diff)}`;
    } else if (diff > 0) {
      posClass = `pos-right-${diff}`;
    }
    
    return { posClass, diff };
  };

  return (
    <section
      className={`hero-section ${!isMounted ? 'hero-entrance-prepare' : isEntranceFinished ? 'hero-entrance-done' : 'hero-entrance-active'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleHeroMouseLeaveInner();
      }}
      onMouseMove={handleHeroMouseMove}
      style={{
        margin: '0',
        padding: '36px 24px 96px 24px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        minHeight: '480px',
        overflow: 'visible'
      }}
    >
      <div className="stage-spotlight-ray"></div>

      {/* Hiệu ứng vòng tròn plasma nền */}
      <div
        className="hero-plasma-ring-wrapper"
        aria-hidden="true"
        style={{
          transform: `translate(calc(-50% + ${ringOffset.x}px), calc(-50% + ${ringOffset.y}px)) scale(1.25)`
        }}
      >
        <div className="hero-plasma-ring-carrier">
          <div className="hero-plasma-ring ring-layer-1"></div>
          <div className="hero-plasma-ring ring-layer-2"></div>
          <div className="hero-plasma-ring ring-noise"></div>
          <div className="hero-plasma-ring ring-glow"></div>
        </div>
      </div>

      {/* Dải sóng nhạc chạy ngang */}
      <div className="hero-music-waveform" aria-hidden="true">
        {[...Array(180)].map((_, i) => {
          const isAtCenter = i >= 58 && i <= 122;
          let baseHeight = 6;

          if (isAtCenter) {
            baseHeight = 6 + Math.abs(Math.sin(i * 0.4)) * 6;
          } else if (i < 58) {
            const distToBass = Math.abs(i - 26);
            const envelopeBass = Math.max(0, 1 - distToBass / 20);
            const peakBass = envelopeBass * envelopeBass * 145;

            const distToSub = Math.abs(i - 48);
            const envelopeSub = Math.max(0, 1 - distToSub / 10);
            const peakSub = envelopeSub * 40;

            const baseNoise = 10 + Math.sin(i * 0.8) * 6 + Math.abs(Math.cos(i * 0.25)) * 12;
            baseHeight = baseNoise + peakBass + peakSub;
          } else {
            const distToPeak = Math.abs(i - 152);
            const envelopePeak = Math.max(0, 1 - distToPeak / 16);
            const peakMain = envelopePeak * envelopePeak * 105;

            const distToSub = Math.abs(i - 134);
            const envelopeSub = Math.max(0, 1 - distToSub / 8);
            const peakSub = envelopeSub * 35;

            const baseNoise = 10 + Math.sin(i * 0.8) * 6 + Math.abs(Math.cos(i * 0.25)) * 12;
            baseHeight = baseNoise + peakMain + peakSub;
          }

          baseHeight = Math.max(6, Math.min(160, baseHeight));

          // Chuyển màu nhẹ nhàng từ xanh ngọc sang xanh slate
          const hue = 190 + (i / 180) * 22;

          return (
            <div
              key={i}
              className="waveform-bar"
              style={{
                height: `${baseHeight}px`,
                background: `linear-gradient(to bottom, oklch(78% 0.22 ${hue}), oklch(62% 0.22 ${hue + 12}))`,
                boxShadow: `0 0 8px oklch(78% 0.22 ${hue} / 0.22)`,
                animationDelay: `${i * 0.01}s`,
                animationDuration: `${0.85 + Math.sin(i * 0.12) * 0.25}s`
              }}
            />
          );
        })}
      </div>

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, var(--hero-radial-glow, rgba(229, 223, 217, 0.2)), transparent 70%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        top: '55%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(6rem, 14vw, 11rem)',
        fontWeight: 900,
        fontFamily: 'var(--font-display)',
        color: 'var(--brand-pearl)',
        opacity: 0.02,
        letterSpacing: '0.32em',
        paddingLeft: '0.32em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 1,
        userSelect: 'none'
      }}>
        AURAPASS
      </div>

      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        zIndex: 2,
        position: 'relative'
      }}>
        <span style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          fontFamily: 'var(--font-mono)',
          color: 'var(--brand-pearl)',
          opacity: 0.6,
          display: 'block',
          marginBottom: '8px'
        }}>
          — CURATED SELECTION N°01 —
        </span>
        <h1 style={{
          fontSize: 'clamp(1.1rem, 2.8vw, 1.6rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          fontFamily: "'Playfair Display', 'Lora', var(--font-display)",
          color: 'var(--brand-pearl)',
          opacity: 0.85,
          margin: 0
        }}>
          Where classical staging meets contemporary curation
        </h1>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        width: '100%',
        maxWidth: '1020px',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vw',
          height: '1px',
          background: 'linear-gradient(to right, transparent, var(--hero-center-line, rgba(229, 223, 217, 0.12)) 15%, var(--hero-center-line, rgba(229, 223, 217, 0.12)) 85%, transparent)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        <button
          className="nav-arrow-btn"
          onClick={() => {
            if (!isSwapping) {
              triggerSwap((activeIndex - 1 + events.length) % events.length, 'left');
            }
          }}
          aria-label="Previous event"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="ticket-wrapper" style={{ zIndex: 2, flexGrow: 1 }}>
          {events.map((event, idx) => {
            const { posClass, diff } = getPositionInfo(idx);

            const themeClass = event.theme === 'slate'
              ? 'ticket-card-slate'
              : event.theme === 'pearl'
                ? 'ticket-card-pearl'
                : 'ticket-card-dark';

            const showActiveElements = idx === activeIndex;

            return (
              <div
                key={event.id}
                className={`ticket-card ${posClass} ${themeClass} ${Math.abs(diff) >= 2 ? 'no-transition' : ''} ${peelingEventId === event.id ? 'peeling-active' : ''}`}
                onClick={() => {
                  if (diff !== 0 && !isSwapping) {
                    const dir = diff > 0 ? 'right' : 'left';
                    triggerSwap(idx, dir);
                  }
                }}
                onMouseMove={(e) => handleMouseMove(e, posClass)}
                onMouseLeave={handleMouseLeave}
                style={{
                  ...(posClass === 'pos-0' ? tiltStyle : {})
                }}
              >
                <div className="ticket-inner-container">
                  <div className="holographic-sheen"></div>

                  <div className="ticket-reflection"></div>

                  <div className="ticket-body">
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      justifyContent: 'space-between',
                      paddingRight: '24px',
                      flex: '1',
                      textAlign: 'left'
                    }}>
                      <div>
                        <div style={{
                          display: 'flex',
                          gap: '6px',
                          marginBottom: '12px',
                          pointerEvents: 'none',
                          opacity: showActiveElements ? 1 : 0,
                          visibility: showActiveElements ? 'visible' : 'hidden',
                          transition: 'opacity 0.4s ease, visibility 0.4s ease'
                        }}>
                          <span className="pulse-badge" style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            backgroundColor: 'oklch(52% 0.15 20)',
                            color: '#fff',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em'
                          }}>
                            Bán Chạy
                          </span>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            backgroundColor: 'var(--badge-bg)',
                            color: 'var(--badge-text)',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            border: '1px solid var(--badge-border)',
                            backdropFilter: 'blur(4px)'
                          }}>
                            Ra Mắt 2026
                          </span>
                        </div>

                        <span style={{
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          fontFamily: 'var(--font-mono)',
                          opacity: 0.8,
                          borderBottom: '1px solid currentColor',
                          paddingBottom: '2px',
                          display: 'inline-block'
                        }}>
                          {event.category === 'music' ? 'ĐẠI NHẠC HỘI' : event.category === 'theater' ? 'KỊCH NGHỆ' : 'WORKSHOP NGHỆ THUẬT'}
                        </span>

                        <h2 style={{
                          fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
                          fontWeight: 600,
                          marginTop: '12px',
                          marginBottom: '8px',
                          fontFamily: "'Playfair Display', 'Lora', var(--font-display)",
                          letterSpacing: '0.01em',
                          lineHeight: '1.2',
                          color: 'inherit'
                        }}>
                          {event.title}
                        </h2>

                        <p style={{
                          fontSize: '13px',
                          lineHeight: '1.5',
                          opacity: 0.85,
                          color: 'inherit',
                          margin: '0 0 12px 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontFamily: 'var(--font-body)'
                        }}>
                          {event.description}
                        </p>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'inherit' }}>
                            <Calendar size={14} />
                            <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{event.date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'inherit' }}>
                            <MapPin size={14} />
                            <span style={{ fontWeight: 500 }}>{event.eventType === 'online' ? 'Trực tuyến' : event.location.split(',')[0]}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleBookingStart(e, event)}
                          className="btn-primary ticket-cta"
                          style={{
                            opacity: showActiveElements ? 1 : 0,
                            pointerEvents: showActiveElements ? 'auto' : 'none',
                            visibility: showActiveElements ? 'visible' : 'hidden',
                            transition: 'opacity 0.4s ease, visibility 0.4s ease, transform 0.25s ease, box-shadow 0.25s ease'
                          }}
                        >
                          Đặt Vé Ngay
                          <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                        </button>
                      </div>
                    </div>

                    <div style={{
                      width: '40%',
                      height: '100%',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(11,37,58,0.1)'
                    }}>
                      <img
                        src={event.image}
                        alt={event.title}
                        className="ticket-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>

                  <div className="ticket-stub">
                    {/* Góc vé lấp lánh nhẹ */}
                    <div className="ticket-stub-sparkle" aria-hidden="true">✦</div>

                    {/* Loại vé */}
                    <div className="ticket-stub-badge">
                      {event.theme === 'slate' ? 'VÉ TIÊU CHUẨN' : event.theme === 'pearl' ? 'VÉ GIỚI HẠN' : 'VÉ VIP'}
                    </div>

                    {/* Thông tin sự kiện */}
                    <div className="ticket-stub-info">
                      <h3 className="ticket-stub-title">
                        {event.title.replace(/^[^:]+:\s*/, '').toUpperCase()}
                      </h3>
                      <div className="ticket-stub-date">
                        {getShortDate(event.date)}
                      </div>
                      <div className="ticket-stub-seat">
                        {event.theme === 'slate' ? 'KHU A • A-24' : event.theme === 'pearl' ? 'KHU B • B-08' : 'VIP • V-12'}
                      </div>
                    </div>

                    {/* Mã vạch và số serial */}
                    <div className="ticket-stub-barcode-section">
                      <div className="ticket-stub-barcode-container">
                        <div className="ticket-stub-barcode-hologram" />
                        {[2, 4, 3, 5, 2, 4, 2, 3, 5, 2, 3, 4, 2, 3, 5, 3].map((w, i) => (
                          <div
                            key={i}
                            style={{
                              width: `${w * 0.9}px`,
                              height: '100%',
                              backgroundColor: 'currentColor'
                            }}
                          />
                        ))}
                      </div>
                      <span className="ticket-stub-serial">
                        {getSerialNumber(event.id, idx)}
                      </span>
                    </div>

                    {/* Countdown và giá tiền */}
                    <div className="ticket-stub-footer">
                      <TicketCountdown dateStr={event.date} isActive={showActiveElements} />
                      <span className="ticket-stub-price">
                        {event.priceRange.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="nav-arrow-btn"
          onClick={() => {
            if (!isSwapping) {
              triggerSwap((activeIndex + 1) % events.length, 'right');
            }
          }}
          aria-label="Next event"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="dots-container" style={{ zIndex: 3 }}>
        {events.map((_, idx) => (
          <button
            key={idx}
            className={`dot-btn ${activeIndex === idx ? 'active' : ''}`}
            onClick={() => {
              if (idx !== activeIndex && !isSwapping) {
                const dir = idx > activeIndex ? 'right' : 'left';
                triggerSwap(idx, dir);
              }
            }}
            aria-label={`Go to event ${idx + 1}`}
          />
        ))}
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '240px',
        background: 'var(--hero-bottom-fade, linear-gradient(to bottom, transparent 0%, var(--bg-overlay-light) 20%, var(--bg-overlay-heavy) 65%, var(--bg-dark) 100%))',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '5%',
        right: '5%',
        height: '160px',
        background: 'radial-gradient(ellipse at 50% 100%, rgba(229, 223, 217, 0.05), transparent 75%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
    </section>
  );
}
