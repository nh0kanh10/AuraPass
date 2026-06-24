import React, { useRef, useState, useEffect } from 'react';
import { Drama, Mic, Music, Palette, Headphones } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const renderStageIcon = (iconType) => {
  const props = {
    size: 16,
    strokeWidth: 1.8
  };
  
  switch (iconType) {
    case 'drama':
      return <Drama {...props} />;
    case 'mic':
      return <Mic {...props} />;
    case 'music':
      return <Music {...props} />;
    case 'palette':
      return <Palette {...props} />;
    case 'headphones':
      return <Headphones {...props} />;
    default:
      return null;
  }
};

export default function FeaturedCreators({ creators, onNavigateCreators }) {
  const [revealRef, isVisible] = useScrollReveal(0.08, '0px 0px -40px 0px');
  const multipliedCreators = [...(creators || []), ...(creators || []), ...(creators || []), ...(creators || [])];
  const sliderRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const animationFrameId = useRef(null);
  const autoScrollActive = useRef(true);
  const isDraggingState = useRef(false);

  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let lastTimeStep = performance.now();
    
    const step = (time) => {
      if (autoScrollActive.current && !isDown.current) {
        const delta = time - lastTimeStep;
        const speed = 0.04 * delta; 
        slider.scrollLeft += speed;
        
        const singleCycleWidth = 1368; 
        if (slider.scrollLeft >= singleCycleWidth) {
          slider.scrollLeft -= singleCycleWidth;
        }
      }
      lastTimeStep = time;
      animationFrameId.current = requestAnimationFrame(step);
    };

    animationFrameId.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, []);

  const handleMouseDown = (e) => {
    const slider = sliderRef.current;
    if (!slider) return;
    
    isDown.current = true;
    autoScrollActive.current = false;
    setIsGrabbing(true);
    
    startX.current = e.pageX - slider.offsetLeft;
    scrollLeftStart.current = slider.scrollLeft;
    lastX.current = e.pageX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    const slider = sliderRef.current;
    if (!slider) return;

    e.preventDefault();
    isDraggingState.current = true;
    
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    slider.scrollLeft = scrollLeftStart.current - walk;

    const singleCycleWidth = 1368;
    if (slider.scrollLeft >= singleCycleWidth * 2) {
      slider.scrollLeft -= singleCycleWidth;
      startX.current += singleCycleWidth / 1.5;
    } else if (slider.scrollLeft <= 50) {
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
    setIsGrabbing(false);
    
    const slider = sliderRef.current;
    if (!slider) return;

    setIsBouncing(true);
    setTimeout(() => {
      setIsBouncing(false);
    }, 300);

    if (isDraggingState.current && Math.abs(velocity.current) > 0.08) {
      let currentVelocity = velocity.current * 14; 
      const friction = 0.94;

      const inertiaStep = () => {
        if (isDown.current) return;
        
        slider.scrollLeft -= currentVelocity;
        currentVelocity *= friction;

        const singleCycleWidth = 1368;
        if (slider.scrollLeft >= singleCycleWidth * 2) {
          slider.scrollLeft -= singleCycleWidth;
        } else if (slider.scrollLeft <= 0) {
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
    
    isDraggingState.current = false;
  };

  const handleTouchStart = (e) => {
    const slider = sliderRef.current;
    if (!slider) return;
    
    isDown.current = true;
    autoScrollActive.current = false;
    
    const touch = e.touches[0];
    startX.current = touch.pageX - slider.offsetLeft;
    scrollLeftStart.current = slider.scrollLeft;
    lastX.current = touch.pageX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handleTouchMove = (e) => {
    if (!isDown.current) return;
    const slider = sliderRef.current;
    if (!slider) return;

    isDraggingState.current = true;
    
    const touch = e.touches[0];
    const x = touch.pageX - slider.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    slider.scrollLeft = scrollLeftStart.current - walk;

    const singleCycleWidth = 1368;
    if (slider.scrollLeft >= singleCycleWidth * 2) {
      slider.scrollLeft -= singleCycleWidth;
      startX.current += singleCycleWidth / 1.5;
    } else if (slider.scrollLeft <= 50) {
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
      className={`creators-section reveal-section${isVisible ? ' reveal-visible' : ''}`}
      style={{
        padding: '56px 0 24px 0',
        textAlign: 'left',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
      <div className="stage-smoke-overlay" />

      <div style={{
        padding: '0 24px',
        position: 'relative',
        zIndex: 2
      }}>
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
              color: 'var(--brand-pearl)',
              opacity: 0.6,
              display: 'block',
              marginBottom: '4px'
            }}>
              COLLABORATORS
            </span>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 700, 
              fontFamily: 'var(--font-display)',
              color: 'var(--brand-pearl)',
              margin: 0
            }}>
              Nghệ Sĩ & Nhà Tổ Chức Tiêu Biểu
            </h2>
          </div>
          <button
            onClick={onNavigateCreators}
            className="cep-see-more-btn"
          >
            Xem Thêm →
          </button>
        </div>
      </div>

      <div style={{ 
        position: 'relative', 
        width: '100%',
        overflow: 'hidden',
        zIndex: 2
      }}>
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '90px',
          height: '100%',
          background: 'linear-gradient(to right, var(--bg-dark), transparent)',
          zIndex: 5,
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '90px',
          height: '100%',
          background: 'linear-gradient(to left, var(--bg-dark), transparent)',
          zIndex: 5,
          pointerEvents: 'none'
        }} />

        <div 
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
          className="creators-marquee-wrapper" 
          style={{
            display: 'flex',
            gap: '28px',
            width: '100%',
            padding: '16px 0 24px 0',
            cursor: isGrabbing ? 'grabbing' : 'grab',
            userSelect: 'none',
            transform: isBouncing ? 'scale(0.975)' : 'scale(1)',
            transition: isBouncing ? 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'transform 0.4s ease'
          }}
        >
          {multipliedCreators.map((creator, index) => (
            <div 
              key={`${creator.id}-${index}`}
              className="creator-card"
              style={{
                pointerEvents: isGrabbing ? 'none' : 'auto',
                '--spotlight-rgb': creator.accentColor
              }}
            >
              <img 
                src={creator.logo} 
                alt={creator.name} 
                className="creator-image-bg"
                loading="lazy"
              />

              <div className="creator-spotlight" />

              <div className="creator-card-overlay" />

              <div className="creator-hover-info">
                <span className="creator-stage-icon">
                  {renderStageIcon(creator.icon)}
                </span>

                <span className="creator-stage-type">
                  {creator.type}
                </span>

                <h3 className="creator-stage-name">
                  {creator.name}
                </h3>

                <span className="creator-stage-stats">
                  ★ {creator.stats}
                </span>

                <p className="creator-stage-desc">
                  {creator.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
