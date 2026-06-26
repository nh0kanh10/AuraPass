import React from 'react';
import { Monitor, Users } from 'lucide-react';

export default function EventCard({ event, isFeatured, onClick }) {
  const getCategoryConfig = (cat) => {
    switch (cat) {
      case 'music': return {
        border: 'rgba(139, 92, 246, 0.22)',
        borderHover: 'rgba(139, 92, 246, 0.75)',
        text: 'var(--brand-violet)',
        bg: 'rgba(139, 92, 246, 0.12)',
        glow: 'rgba(139, 92, 246, 0.2)',
        label: 'ĐẠI NHẠC HỘI'
      };
      case 'theater': return {
        border: 'rgba(6, 182, 212, 0.22)',
        borderHover: 'rgba(6, 182, 212, 0.75)',
        text: 'var(--brand-cyan)',
        bg: 'rgba(6, 182, 212, 0.12)',
        glow: 'rgba(6, 182, 212, 0.2)',
        label: 'KỊCH NGHỆ'
      };
      case 'workshop': return {
        border: 'rgba(16, 185, 129, 0.22)',
        borderHover: 'rgba(16, 185, 129, 0.75)',
        text: 'var(--brand-emerald)',
        bg: 'rgba(16, 185, 129, 0.12)',
        glow: 'rgba(16, 185, 129, 0.2)',
        label: 'WORKSHOP NGHỆ THUẬT'
      };
      default: return {
        border: 'rgba(255, 255, 255, 0.12)',
        borderHover: 'rgba(255, 255, 255, 0.5)',
        text: 'var(--brand-pearl)',
        bg: 'rgba(255, 255, 255, 0.08)',
        glow: 'rgba(255, 255, 255, 0.1)',
        label: 'SỰ KIỆN ĐẶC BIỆT'
      };
    }
  };

  const config = getCategoryConfig(event.category);

  // Định dạng ngày ngắn (ví dụ: 28/08/2026 -> 28 Thg 8 2026)
  const getShortDate = (str) => {
    try {
      if (!str) return 'TBA';
      if (str.includes('Hằng Ngày')) return 'VÉ HÀNG NGÀY';
      
      const months = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
      
      // Hỗ trợ định dạng YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        const [year, month, day] = str.split('T')[0].split('-').map(Number);
        return `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`;
      }
      
      const cleanStr = str.replace(/Tháng\s+/i, '').replace(',', '');
      const parts = cleanStr.split(/\s+/);
      const day = parts[0];
      const monthIndex = parseInt(parts[1], 10);
      const year = parts[2] || '2026';
      const month = months[monthIndex - 1] || parts[1];
      return `${day} ${month} ${year}`;
    } catch (e) {
      return str.toUpperCase();
    }
  };

  // Định dạng địa điểm viết tắt
  const getShortVenue = (str) => {
    if (!str) return 'TBA';
    const primary = str.split(',')[0];
    return primary
      .replace(/Sân vận động/i, 'SVĐ')
      .replace(/Nhà hát Lớn Hà Nội/i, 'NH HÁT LỚN HN')
      .replace(/Nhà hát lớn Thành Phố/i, 'NH HÁT LỚN TP')
      .replace(/Nhà hát Bến Thành/i, 'NH BẾN THÀNH')
      .replace(/Nhà thi đấu/i, 'NTĐ')
      .replace(/The Myst Đồng Khởi/i, 'THE MYST')
      .toUpperCase();
  };

  const formatPriceNum = (priceRange) => {
    const primaryPrice = priceRange.split(' ')[0];
    return primaryPrice.toUpperCase();
  };

  if (isFeatured) {
    return (
      <div
        className="premium-featured-banner"
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.borderColor = config.borderHover;
          e.currentTarget.style.boxShadow = `0 16px 40px rgba(0, 0, 0, 0.6), 0 0 25px ${config.glow}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.borderColor = config.border;
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
        }}
        style={{
          borderColor: config.border
        }}
      >
        <style>{`
          .premium-featured-banner {
            position: relative;
            width: 100%;
            height: 100%; /* Banner tự động cao bằng các card bên cạnh */
            min-height: 440px; /* Chiều cao tối thiểu */
            border-radius: 24px;
            border: 1px solid;
            overflow: hidden;
            cursor: pointer;
            display: flex;
            align-items: stretch; /* Kéo căng chiều cao thẻ con */
            background: #090710;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
            transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease, box-shadow 0.45s ease;
          }
          
          .premium-featured-banner::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E");
            pointer-events: none;
            z-index: 2;
          }
          
          .banner-bg-image {
            position: absolute;
            top: 0;
            right: 0;
            width: 55%;
            height: 100%;
            object-fit: cover;
            opacity: 0.82; /* Độ sáng ảnh nền */
            z-index: 1;
            transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
            mask-image: linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%);
            -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%);
          }
          
          .premium-featured-banner:hover .banner-bg-image {
            transform: scale(1.04);
            opacity: 0.92; /* Sáng hơn khi hover */
          }
          
          .banner-overlay-gradient {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
              #090710 0%, 
              #090710 30%, 
              rgba(9, 7, 16, 0.95) 45%, 
              rgba(9, 7, 16, 0.3) 65%, 
              transparent 85%
            );
            z-index: 2;
            pointer-events: none;
          }
          
          .banner-content-deck {
            position: relative;
            z-index: 3;
            width: 60%;
            padding: 36px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: space-between;
          }
          
          .banner-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-family: var(--font-mono);
            font-size: 9px;
            font-weight: 700;
            color: oklch(76% 0.15 85);
            background: rgba(229, 223, 217, 0.05);
            border: 1px solid rgba(229, 223, 217, 0.12);
            padding: 4px 10px;
            border-radius: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
          }
          
          .banner-title {
            font-family: var(--font-display);
            font-size: 26px;
            font-weight: 800;
            line-height: 1.25;
            color: var(--text-white);
            margin: 16px 0 12px 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .banner-description {
            font-size: 13.5px;
            line-height: 1.6;
            color: var(--text-muted);
            margin: 0 0 24px 0;
            max-width: 95%;
            display: -webkit-box;
            -webkit-line-clamp: 3; /* Tối đa 3 dòng */
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          /* Dải thông số kiểu vé máy bay */
          .banner-info-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
            flex-wrap: wrap;
          }
          
          .banner-ticket-pill {
            font-family: var(--font-mono);
            font-size: 9px;
            font-weight: 500;
            color: var(--text-muted);
            border: 1px dashed rgba(229, 223, 217, 0.18);
            background: rgba(229, 223, 217, 0.02);
            padding: 4px 8px;
            border-radius: 4px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          
          .banner-ticket-pill strong {
            color: var(--brand-pearl);
            font-weight: 600;
          }
          
          .banner-btn-action {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: var(--text-white);
            font-family: var(--font-mono);
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          
          .premium-featured-banner:hover .banner-btn-action {
            background: rgba(167, 139, 250, 0.12);
            border-color: rgba(167, 139, 250, 0.4);
            box-shadow: 0 0 12px rgba(167, 139, 250, 0.15);
          }
          
          @media (max-width: 900px) {
            .banner-content-deck {
              width: 80%;
            }
          }
          
          @media (max-width: 768px) {
            .premium-featured-banner {
              height: auto;
              flex-direction: column;
              min-height: auto;
            }
            .banner-bg-image {
              position: relative;
              width: 100%;
              height: 180px;
              opacity: 0.65;
              mask-image: none;
              -webkit-mask-image: none;
            }
            .banner-overlay-gradient {
              background: linear-gradient(to top, #090710 0%, rgba(9, 7, 16, 0.95) 70%, transparent 100%);
              height: 220px;
              top: 100px;
            }
            .banner-content-deck {
              width: 100%;
              padding: 24px;
              margin-top: -60px;
            }
            .banner-title {
              font-size: 20px;
            }
          }
        `}</style>

        {/* Banner Background Image */}
        <img
          src={event.image}
          alt={event.title}
          className="banner-bg-image"
        />

        <div className="banner-overlay-gradient" />

        {/* Content Box */}
        <div className="banner-content-deck">
          <div>
            <div className="banner-badge">
              ✦ Sự Kiện Nổi Bật
            </div>

            <h2 className="banner-title">
              {event.title}
            </h2>

            <p className="banner-description">
              {event.description}
            </p>
          </div>

          <div>
            {/* Dải thông số Monospace */}
            <div className="banner-info-bar">
              <span className="banner-ticket-pill">
                NGÀY • <strong>{getShortDate(event.date)}</strong>
              </span>
              <span className="banner-ticket-pill">
                ĐỊA ĐIỂM • <strong>{getShortVenue(event.location)}</strong>
              </span>
              <span className="banner-ticket-pill" style={{ borderColor: config.border, background: 'rgba(255,255,255,0.01)' }}>
                GIÁ VÉ • <strong style={{ color: config.text }}>{formatPriceNum(event.priceRange)}</strong>
              </span>
            </div>

            <button className="banner-btn-action" onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
              Mua Vé & Chọn Ghế &nbsp;⟶
            </button>
          </div>
        </div>

        <div className="event-cat-badge" style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 4,
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          color: config.text,
          fontSize: '9px',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {config.label}
        </div>
        {event.eventType === 'online' && (
          <div style={{
            position: 'absolute', top: '20px', left: '20px', zIndex: 4,
            background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(0,255,255,0.25)',
            color: 'var(--brand-cyan)', fontSize: '9px', fontWeight: 700,
            padding: '4px 10px', borderRadius: '4px',
            fontFamily: 'var(--font-mono)', letterSpacing: '1px',
            backdropFilter: 'blur(4px)'
          }}>💻 TRỰC TUYẾN</div>
        )}
        {event.eventType === 'workshop' && (
          <div style={{
            position: 'absolute', top: '20px', left: '20px', zIndex: 4,
            background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(16,185,129,0.25)',
            color: 'var(--brand-emerald)', fontSize: '9px', fontWeight: 700,
            padding: '4px 10px', borderRadius: '4px',
            fontFamily: 'var(--font-mono)', letterSpacing: '1px',
            backdropFilter: 'blur(4px)'
          }}>🪑 WORKSHOP</div>
        )}
      </div>
    );
  }

  return (
    <div
      className="bento-event-card"
      onClick={onClick}
      style={{
        border: `1px solid ${config.border}`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = `0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${config.glow}`;
        e.currentTarget.style.borderColor = config.borderHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        e.currentTarget.style.borderColor = config.border;
      }}
    >
      <style>{`
        .bento-event-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease;
          text-align: left;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(20, 16, 35, 0.45) 0%, rgba(10, 8, 20, 0.65) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        
        /* Tạo hiệu ứng noise nền */
        .bento-event-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }
        
        .bento-card-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .bento-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .bento-event-card:hover .bento-card-img {
          transform: scale(1.05);
        }
        
        .bento-card-content {
          padding: 22px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          position: relative;
          z-index: 2;
        }
        
        .bento-card-title {
          font-size: 17px;
          font-weight: 700;
          line-height: 1.35;
          margin: 0 0 10px 0;
          font-family: var(--font-display);
          color: var(--text-white);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.3s ease;
        }
        
        .bento-event-card:hover .bento-card-title {
          color: var(--brand-pearl);
        }
        
        .bento-card-desc {
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-muted);
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Dải thông số kiểu vé máy bay */
        .normal-card-info-bar {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }
        
        .normal-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          border-bottom: 1.2px dashed rgba(229, 223, 217, 0.08);
          padding-bottom: 6px;
        }
        
        .normal-info-label {
          opacity: 0.55;
          letter-spacing: 0.5px;
        }
        
        .normal-info-value {
          color: var(--brand-pearl);
          font-weight: 500;
        }
        
        .bento-card-btn-action {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-white);
          font-family: var(--font-mono);
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .bento-event-card:hover .bento-card-btn-action {
          background: rgba(167, 139, 250, 0.12);
          border-color: rgba(167, 139, 250, 0.4);
          color: var(--text-white);
          box-shadow: 0 0 12px rgba(167, 139, 250, 0.15);
        }
      `}</style>

      <div className="bento-card-image-wrapper">
        <img
          src={event.image}
          alt={event.title}
          className="bento-card-img"
        />

        <div className="event-cat-badge" style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 2,
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          color: config.text,
          fontSize: '9px',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {config.label}
        </div>
        {event.eventType === 'online' && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px', zIndex: 2,
            background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(0,255,255,0.25)',
            color: 'var(--brand-cyan)', fontSize: '8px', fontWeight: 700,
            padding: '3px 7px', borderRadius: '4px',
            fontFamily: 'var(--font-mono)', letterSpacing: '1px',
            display: 'flex', alignItems: 'center', gap: '4px',
            backdropFilter: 'blur(4px)'
          }}><Monitor size={9} strokeWidth={2.5} /> TRỰC TUYẾN</div>
        )}
        {event.eventType === 'workshop' && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px', zIndex: 2,
            background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(16,185,129,0.25)',
            color: 'var(--brand-emerald)', fontSize: '8px', fontWeight: 700,
            padding: '3px 7px', borderRadius: '4px',
            fontFamily: 'var(--font-mono)', letterSpacing: '1px',
            display: 'flex', alignItems: 'center', gap: '4px',
            backdropFilter: 'blur(4px)'
          }}><Users size={9} strokeWidth={2.5} /> WORKSHOP</div>
        )}
      </div>

      <div className="bento-card-content">
        <h3 className="bento-card-title">
          {event.title}
        </h3>

        <p className="bento-card-desc">
          {event.description}
        </p>

        {/* Dải thông số */}
        <div className="normal-card-info-bar">
          <div className="normal-info-row">
            <span className="normal-info-label">NGÀY</span>
            <span className="normal-info-value">{getShortDate(event.date)}</span>
          </div>
          <div className="normal-info-row">
            <span className="normal-info-label">ĐỊA ĐIỂM</span>
            <span className="normal-info-value" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getShortVenue(event.location)}
            </span>
          </div>
          <div className="normal-info-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <span className="normal-info-label">GIÁ VÉ</span>
            <span className="normal-info-value" style={{ color: config.text, fontWeight: 700 }}>
              {event.priceRange.split(' ')[0]}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button className="bento-card-btn-action" onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
            Mua Vé & Chọn Ghế &nbsp;⟶
          </button>
        </div>
      </div>
    </div>
  );
}
