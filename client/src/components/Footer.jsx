import React, { useState } from 'react';
import { Mail, MapPin, Phone, ArrowRight, Radio, PlaySquare, Share2, Music, Calendar, Ticket, Mic, Sparkles, Send, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const isLight = () => document.documentElement.dataset.theme === 'light';

const FOOTER_LINKS = {
  'Khám phá': [
    { label: 'Sự kiện nghệ thuật', Icon: Calendar, nav: 'events' },
    { label: 'Chợ chuyển nhượng', Icon: Ticket, nav: 'resale' },
    { label: 'Nghệ sĩ spotlight', Icon: Mic, nav: 'creators' },
    { label: 'Lễ hội âm nhạc', nav: 'events' },
    { label: 'Workshop sáng tạo', nav: 'events' }
  ],
  'Công ty': [
    { label: 'Về chúng tôi' },
    { label: 'Tuyển dụng' },
    { label: 'Báo chí & Tin tức' },
    { label: 'Đối tác phát triển', Icon: Sparkles }
  ],
  'Hỗ trợ': [
    { label: 'Trung tâm trợ giúp' },
    { label: 'Chính sách hoàn vé' },
    { label: 'Gửi yêu cầu hỗ trợ', Icon: Send },
    { label: 'Ứng dụng di động' }
  ],
  'Dành cho Creator': [
    { label: 'Tạo sự kiện mới', Icon: PlusCircle, nav: 'create-event' },
    { label: 'Giải pháp bán vé' },
    { label: 'API tích hợp' },
    { label: 'Dashboard quản trị', Icon: LayoutDashboard }
  ]
};

const SOCIALS = [
  { Icon: Radio, label: 'Instagram', color: '#ec4899', url: 'https://www.instagram.com/' },
  { Icon: PlaySquare, label: 'YouTube', color: '#ef4444', url: 'https://www.youtube.com/' },
  { Icon: Share2, label: 'Facebook', color: '#3b82f6', url: 'https://www.facebook.com/' },
  { Icon: Music, label: 'TikTok', color: '#10b981', url: 'https://www.tiktok.com/' },
];

export default function Footer({ onNavigate }) {
  const [revealRef, isVisible] = useScrollReveal(0.04, '0px 0px 0px 0px');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const handleSubscribe = () => {
    if (email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer
      ref={revealRef}
      className={`reveal-fade${isVisible ? ' reveal-visible' : ''} app-footer-wrapper`}
    >
      {/* Gradient divider */}
      <div className="app-footer-divider" />

      {/* Subtle Ambient Glow */}
      <div style={{
        position: 'absolute', top: '-120px', left: '25%', width: '500px', height: '240px',
        background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.035) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Newsletter Banner */}
        <div style={{
          borderBottom: '1px solid var(--glass-border)',
          padding: '40px 0',
        }}>
          <div className="footer-newsletter-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap', boxSizing: 'border-box', width: '100%' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.25em', color: isLight() ? 'oklch(44% 0.08 250)' : 'rgba(167, 139, 250, 0.75)', textTransform: 'uppercase', marginBottom: '8px' }}>AURA INSIDER</p>
              <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 800, color: 'var(--brand-pearl)', margin: 0, letterSpacing: '0.02em' }}>
                Đăng ký nhận tin sự kiện
              </h4>
            </div>
            <div style={{ display: 'flex', gap: '0', flex: '0 1 420px', width: '100%' }}>
              <input
                type="email"
                placeholder="Địa chỉ email của bạn"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                style={{
                  flex: 1, padding: '12px 20px',
                  background: isLight() ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: isLight() ? 'blur(12px)' : 'none',
                  border: emailFocused
                    ? (isLight() ? '1px solid rgba(15, 23, 42, 0.5)' : '1px solid rgba(167, 139, 250, 0.4)')
                    : (isLight() ? '1px solid rgba(15, 23, 42, 0.15)' : '1px solid var(--glass-border)'),
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px', color: 'var(--brand-pearl)',
                  fontSize: '13px', outline: 'none',
                  fontFamily: 'var(--font-body)',
                  transition: 'border-color 0.3s ease',
                }}
              />
              <button
                className="footer-subscribe-btn"
                onClick={handleSubscribe}
                style={{
                  background: subscribed
                    ? '#10b981'
                    : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  border: 'none', borderRadius: '0 8px 8px 0',
                  padding: '12px 24px', color: '#fff',
                  fontWeight: 600, fontSize: '12.5px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.25s ease', whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-body)',
                  boxShadow: subscribed ? 'none' : '0 4px 10px rgba(124, 58, 237, 0.15)',
                }}
                onMouseEnter={e => {
                  if (!subscribed) {
                    e.currentTarget.style.transform = 'translateY(-1.5px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(124, 58, 237, 0.25)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = subscribed ? 'none' : '0 4px 10px rgba(124, 58, 237, 0.15)';
                }}
              >
                {subscribed ? '✓ Đã đăng ký' : <><span>Đăng ký</span><ArrowRight size={13} /></>}
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="footer-main-grid" style={{ maxWidth: '1240px', margin: '0 auto', padding: '56px 32px 40px 32px', display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1fr', gap: '40px', boxSizing: 'border-box', width: '100%' }}>
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', cursor: 'pointer' }}>
              <div className="logo-icon-box" style={{ width: '34px', height: '34px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div className="logo-glow" />
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.55))' }}>
                  <path d="M16 3 L26 7.5 V15 C26 21.5 16 28 16 28 C16 28 6 21.5 6 15 V7.5 L16 3 Z" stroke="var(--logo-shield-stroke, oklch(60% 0.22 300))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 5.5 L24 9 V15 C24 20.3 16 25.5 16 25.5 C16 25.5 8 20.3 8 15 V9 L16 5.5 Z" stroke="var(--logo-shield-stroke, oklch(60% 0.22 300))" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
                  <g transform="rotate(-15 16 15)" style={{ filter: 'drop-shadow(0 0 4px oklch(70% 0.2 290 / 0.8))' }}>
                    <path
                      d="M11.5 9 H20.5 A1 1 0 0 1 21.5 10 V12.5 A1 1 0 0 0 21.5 14.5 V20 A1 1 0 0 1 20.5 21 H11.5 A1 1 0 0 1 10.5 20 V14.5 A1 1 0 0 0 10.5 12.5 V10 A1 1 0 0 1 11.5 9 Z"
                      stroke="var(--logo-ticket-stroke, var(--brand-pearl))"
                      strokeWidth="1.1"
                      fill="var(--logo-ticket-fill, rgba(8, 18, 30, 0.85))"
                    />
                    <path d="M10.5 13.5 H21.5" stroke="var(--logo-ticket-stroke, var(--brand-pearl))" strokeWidth="0.7" strokeDasharray="1.2 1.2" opacity="0.6" />
                    <path d="M13.5 10.5 V12 M16 10.5 V12 M18.5 10.5 V12" stroke="var(--logo-ticket-stroke, var(--brand-pearl))" strokeWidth="0.8" opacity="0.8" />
                    <path d="M16 16.5l.2.5.5.1-.3.3.1.5-.5-.3-.5.3.1-.5-.3-.3.5-.1z" fill="var(--logo-ticket-stroke, var(--brand-pearl))" stroke="none" />
                  </g>
                  <path d="M23 5.5 L23.6 7.2 L25.4 7.4 L24 8.7 L24.4 10.4 L23 9.4 L21.6 10.4 L22 8.7 L20.6 7.4 L22.4 7.2 Z" fill="var(--logo-shield-stroke, oklch(60% 0.22 300))" opacity="0.9" />
                </svg>
              </div>
              <span className="logo-text-title" style={{ fontSize: '20px' }}>AuraPass</span>
            </div>
            
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px', maxWidth: '240px', fontFamily: 'var(--font-body)' }}>
              Nền tảng vé sự kiện & nghệ thuật cao cấp. Kết nối khán giả với những trải nghiệm sân khấu đỉnh cao.
            </p>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
              {[
                { Icon: MapPin, text: 'Quận 1, TP. Hồ Chí Minh' },
                { Icon: Phone, text: '1800 6868 (Hotline miễn phí)' },
                { Icon: Mail, text: 'hello@aurapass.vn' },
              ].map(({ Icon, text }) => (
                <div key={text} className="footer-contact-item">
                  <Icon size={13} color="rgba(167, 139, 250, 0.8)" style={{ flexShrink: 0 }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {SOCIALS.map(({ Icon, label, color, url }) => (
                <button
                  key={label}
                  title={label}
                  className="footer-social-btn"
                  onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = color;
                    e.currentTarget.style.borderColor = `${color}44`;
                    e.currentTarget.style.boxShadow = `0 0 10px ${color}22`;
                    e.currentTarget.style.background = `${color}08`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '';
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.background = '';
                  }}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([col, links]) => (
            <div key={col} className="footer-menu-col">
              <p className="footer-col-title">{col}</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {links.map(link => {
                  const hasIcon = !!link.Icon;
                  return (
                    <li key={link.label}>
                      <button
                        className="footer-link-btn"
                        onClick={link.nav ? () => onNavigate?.(link.nav) : undefined}
                        style={link.nav ? { cursor: 'pointer' } : { cursor: 'default', opacity: 0.6 }}
                      >
                        {hasIcon && <link.Icon size={13} className="footer-link-icon" />}
                        <span>{link.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid var(--glass-border)', padding: '24px 0' }}>
          <div className="footer-bottom-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                © {new Date().getFullYear()} AuraPass. Bảo lưu mọi quyền.
              </span>
              <div style={{ display: 'flex', gap: '16px' }}>
                {['Điều khoản sử dụng', 'Chính sách bảo mật', 'Quy chế hoạt động'].map(t => (
                  <button key={t} className="footer-link-btn" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="system-status-indicator">
              <div className="status-dot" />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                Hệ thống vận hành tốt
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
