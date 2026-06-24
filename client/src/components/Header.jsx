import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Ticket, ChevronDown, Plus, X, Globe, Calendar, Users, Menu, Sun, Moon, Mail, Lock, User, ImagePlus, Loader, Eye, Pencil, MapPin } from 'lucide-react';

const SECTION_LED = {
  events: { color: 'oklch(70% 0.18 300)', glow: 'oklch(70% 0.18 300 / 0.9)' },
  resale: { color: 'oklch(68% 0.2 200)', glow: 'oklch(68% 0.2 200 / 0.9)' },
  artists: { color: 'oklch(76% 0.15 85)', glow: 'oklch(76% 0.15 85 / 0.9)' },
};
const zoneFieldStyle={display:'flex',flexDirection:'column',gap:'6px'};
const zoneLabelStyle={fontSize:'10px',fontFamily:'var(--font-mono)',letterSpacing:'0.08em',color:'var(--text-muted)',textTransform:'uppercase'};
const seatLayout=(n=0)=>{const t=Math.max(1,Number(n)||0),c=Math.min(t,10);return{rows:Math.ceil(t/c),cols:c};};
const normalizeOrganizerZones=(zones=[])=>zones.map((z,i)=>{const b={...z,name:z.name||(i===0?'GA':`Zone ${i+1}`),price:Number(z.price)||0,availableTickets:Number(z.availableTickets)||0,isStanding:!!z.isStanding};if(b.isStanding)return{...b,rows:null,cols:null};const rows=Number(z.rows)||0,cols=Number(z.cols)||0;if(rows>0&&cols>0)return{...b,rows,cols,availableTickets:rows*cols};const l=seatLayout(b.availableTickets||50);return{...b,...l,availableTickets:l.rows*l.cols};});
const DEFAULT_ORGANIZER_ZONES=normalizeOrganizerZones([{name:'GA',price:500000,isStanding:true,availableTickets:200},{name:'VIP',price:1500000,isStanding:false,availableTickets:50}]);

export default function Header({
  theme,
  setTheme,
  searchTerm,
  setSearchTerm,
  onHomeClick,
  cartCount,
  activeSection,
  onSectionClick,
  currentUser,
  setCurrentUser,
  userTickets,
  setUserTickets,
  resaleTickets,
  setResaleTickets,
  fetchUserTickets,
  fetchResaleTickets,
  openLoginTrigger,
  openWalletTrigger,
  showAlert,
  showConfirm
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCreateHovered, setIsCreateHovered] = useState(false);
  const [isMyTicketsHovered, setIsMyTicketsHovered] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [isLangHovered, setIsLangHovered] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authDirection, setAuthDirection] = useState(null);
  const [selectedLang, setSelectedLang] = useState('VI');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [resaleTicketPending, setResaleTicketPending] = useState(null);
  const [resalePriceInput, setResalePriceInput] = useState('');
  const [isResaleSubmitting, setIsResaleSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeQrTicket, setActiveQrTicket] = useState(null);

  useEffect(() => {
    if (openLoginTrigger > 0) {
      setModalType('login');
      setIsSignUp(false);
    }
  }, [openLoginTrigger]);

  useEffect(() => {
    if (openWalletTrigger > 0) {
      setModalType('tickets');
    }
  }, [openWalletTrigger]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('aura_remember') || 'null');
    if (saved) {
      setLoginEmail(saved.email || '');
      setLoginPassword(saved.password || '');
      setRememberMe(true);
    }
  }, []);
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [evtTitle, setEvtTitle] = useState('');
  const [evtDescription, setEvtDescription] = useState('');
  const [evtCategory, setEvtCategory] = useState('concert');
  const [evtDate, setEvtDate] = useState('');
  const [evtTime, setEvtTime] = useState('19:30');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtPriceRange, setEvtPriceRange] = useState('');
  const [evtImage, setEvtImage] = useState('');
  const [evtBadge, setEvtBadge] = useState('');
  const [evtTheme, setEvtTheme] = useState('cyberpunk');
  const [evtZones, setEvtZones] = useState(DEFAULT_ORGANIZER_ZONES);
  const [isEvtSubmitting, setIsEvtSubmitting] = useState(false);
  const [isImgUploading, setIsImgUploading] = useState(false);
  const imgInputRef = useRef(null);
  const timeInputRef = useRef(null);
  const [myEvents, setMyEvents] = useState([]);
  const [loadingMyEvents, setLoadingMyEvents] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [myCreator, setMyCreator] = useState(null);

  useEffect(() => {
    const fetchMyCreator = async () => {
      if (!currentUser || currentUser.role !== 'organizer') {
        setMyCreator(null);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/creators?userId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setMyCreator(data[0]);
          } else {
            setMyCreator(null);
          }
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin Creator liên kết:", err);
      }
    };

    fetchMyCreator();
  }, [currentUser]);

  const startEditEvent = (event) => {
    setEditingEvent(event);
    setEvtTitle(event.title || '');
    setEvtDescription(event.description || '');
    setEvtCategory(event.category || 'concert');
    setEvtDate(event.date || '');
    setEvtTime(event.time || '19:30');
    setEvtLocation(event.location || '');
    setEvtPriceRange(event.priceRange || '');
    setEvtImage(event.image || '');
    setEvtBadge(event.badge || '');
    setEvtTheme(event.theme || 'cyberpunk');
    setEvtZones(event.zones && event.zones.length > 0 ? normalizeOrganizerZones(event.zones) : DEFAULT_ORGANIZER_ZONES);
    setModalType('edit-event');
  };

  const startViewEvent = (event) => {
    setViewingEvent(event);
    setModalType('view-event-detail');
  };

  const fetchMyEvents = async () => {
    if (!currentUser || !currentUser.id) return;
    setLoadingMyEvents(true);
    try {
      const res = await fetch(`http://localhost:5000/api/events?organizerId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMyEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMyEvents(false);
    }
  };

  useEffect(() => {
    if (modalType === 'my-events') {
      fetchMyEvents();
    }
  }, [modalType]);

  const handleImgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImgUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setEvtImage(data.secure_url);
    } catch (err) {
      console.error(err);
      await showAlert('Không thể upload ảnh. Vui lòng thử lại.');
    } finally {
      setIsImgUploading(false);
    }
  };

  const handleEventFormSubmit = async (e) => {
    e.preventDefault();
    const missing = [];
    if (!evtTitle) missing.push('Tên sự kiện');
    if (!evtDate) missing.push('Ngày diễn ra');
    if (!evtTime) missing.push('Giờ diễn ra');
    if (!evtLocation) missing.push('Địa điểm');
    if (!evtPriceRange) missing.push('Khoảng giá hiển thị');
    if (!evtImage) missing.push('Ảnh sự kiện');

    if (missing.length > 0) {
      await showAlert(`Vui lòng điền đầy đủ các thông tin bắt buộc:\n- ${missing.join('\n- ')}`);
      return;
    }
    setIsEvtSubmitting(true);
    try {
      const isEdit = modalType === 'edit-event';
      const url = isEdit 
        ? `http://localhost:5000/api/events/${editingEvent.id}`
        : 'http://localhost:5000/api/events';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: evtTitle,
          description: evtDescription,
          category: evtCategory,
          date: evtDate,
          time: evtTime,
          location: evtLocation,
          priceRange: evtPriceRange,
          image: evtImage,
          badge: evtBadge,
          theme: evtTheme,
          zones: normalizeOrganizerZones(evtZones),
          organizerId: currentUser ? currentUser.id : null,
          creatorId: myCreator ? myCreator.id : (isEdit ? editingEvent.creatorId : null),
          status: isEdit ? editingEvent.status : 'pending'
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        await showAlert(errData.error || (isEdit ? 'Cập nhật sự kiện thất bại' : 'Tạo sự kiện thất bại'));
        setIsEvtSubmitting(false);
        return;
      }

      await showAlert(isEdit 
        ? 'Cập nhật sự kiện thành công!' 
        : 'Tạo sự kiện thành công! Sự kiện đang được chờ ban quản trị phê duyệt.'
      );
      setModalType('my-events');
      setEditingEvent(null);
      setShowTimePicker(false);
      setEvtTitle('');
      setEvtDescription('');
      setEvtCategory('concert');
      setEvtDate('');
      setEvtTime('19:30');
      setEvtLocation('');
      setEvtPriceRange('');
      setEvtImage('');
      setEvtBadge('');
      setEvtTheme('cyberpunk');
      setEvtZones(DEFAULT_ORGANIZER_ZONES);
      fetchMyEvents();
    } catch (err) {
      console.error(err);
      await showAlert('Không thể kết nối tới server API');
    } finally {
      setIsEvtSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginEmail,
          password: loginPassword
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        await showAlert(errData.error || 'Đăng nhập thất bại');
        return;
      }

      const userData = await res.json();
      if (userData.role === 'admin') {
        await showAlert("Đăng nhập Admin thành công. Vui lòng truy cập http://localhost:5175 để quản trị.");
      }
      if (rememberMe) {
        localStorage.setItem('aura_remember', JSON.stringify({ email: loginEmail, password: loginPassword }));
      } else {
        localStorage.removeItem('aura_remember');
        setLoginEmail('');
        setLoginPassword('');
      }
      setCurrentUser(userData);
      setModalType(null);
    } catch (err) {
      console.error(err);
      await showAlert('Không thể kết nối tới server API đăng nhập');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) return;

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signUpEmail.split('@')[0],
          password: signUpPassword,
          email: signUpEmail,
          fullName: signUpName,
          phone: '0900000000'
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        await showAlert(errData.error || 'Đăng ký thất bại');
        return;
      }

      const userData = await res.json();
      setCurrentUser(userData);
      setModalType(null);
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPassword('');
    } catch (err) {
      console.error(err);
      await showAlert('Không thể kết nối tới server API đăng ký');
    }
  };

  const handleSellBackClick = (ticket) => {
    const suggestedPrice = Math.round(ticket.price * 0.85);
    setResaleTicketPending(ticket);
    setResalePriceInput(String(suggestedPrice));
  };

  const handleConfirmResale = async () => {
    if (!resaleTicketPending) return;
    const priceNum = parseInt(resalePriceInput.replace(/[^0-9]/g, ''), 10);
    if (!priceNum || priceNum <= 0) {
      await showAlert('Vui lòng nhập giá bán hợp lệ (lớn hơn 0).');
      return;
    }
    setIsResaleSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/resale/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: resaleTicketPending.id,
          resalePrice: priceNum,
          sellerId: currentUser.id
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        await showAlert(errData.error || 'Đăng bán vé thất bại');
        return;
      }

      setResaleTicketPending(null);
      setResalePriceInput('');
      await showAlert(`Vé đã được đăng bán lại thành công trên Chợ Vé với giá ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum)}!`);
      setModalType(null);

      if (fetchUserTickets) await fetchUserTickets(currentUser.id);
      if (fetchResaleTickets) await fetchResaleTickets();
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi kết nối API đăng bán vé');
    } finally {
      setIsResaleSubmitting(false);
    }
  };

  const handleCancelResale = async (ticket) => {
    const isConfirmed = await showConfirm(`Bạn có chắc muốn thu hồi vé "${ticket.eventTitle}" khỏi sàn bán lại không? Vé sẽ được trả về ví của bạn.`);
    if (!isConfirmed) return;
    try {
      const res = await fetch(`http://localhost:5000/api/resale/cancel/${ticket.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: currentUser.id })
      });
      if (!res.ok) {
        const errData = await res.json();
        await showAlert(errData.error || 'Thu hồi vé thất bại');
        return;
      }
      await showAlert('Thu hồi thành công! Vé đã được trả lại vào ví của bạn.');
      if (fetchUserTickets) await fetchUserTickets(currentUser.id);
      if (fetchResaleTickets) await fetchResaleTickets();
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi kết nối API thu hồi vé');
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    onHomeClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Sự kiện', sectionId: 'events', action: () => onSectionClick?.('events') },
    { label: 'Chợ vé', sectionId: 'resale', action: () => onSectionClick?.('resale') },
    { label: 'Nghệ sĩ', sectionId: 'artists', action: () => onSectionClick?.('artists') },
  ];

  return (
    <>
      <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="app-header-container">

          {/* Logo và menu bên trái */}
          <div className="header-logo-nav-group" style={{ display: 'flex', alignItems: 'center', gap: '48px', flexShrink: 0 }}>
            {/* Logo */}
            <div onClick={handleLogoClick} className="logo-wrapper">
              <div className="logo-icon-box">
                <div className="logo-glow" />
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
                  {/* Premium Shield shape with double borders styled in purple glow */}
                  <path d="M16 3 L26 7.5 V15 C26 21.5 16 28 16 28 C16 28 6 21.5 6 15 V7.5 L16 3 Z" stroke="var(--logo-shield-stroke, oklch(60% 0.22 300))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 5.5 L24 9 V15 C24 20.3 16 25.5 16 25.5 C16 25.5 8 20.3 8 15 V9 L16 5.5 Z" stroke="var(--logo-shield-stroke, oklch(60% 0.22 300))" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Miniature premium ticket inside the shield styled as a vertical artsy ticket */}
                  <g transform="rotate(-15 16 15)" style={{ filter: 'drop-shadow(0 0 4px oklch(70% 0.2 290 / 0.8))' }}>
                    <path
                      d="M11.5 9 H20.5 A1 1 0 0 1 21.5 10 V12.5 A1 1 0 0 0 21.5 14.5 V20 A1 1 0 0 1 20.5 21 H11.5 A1 1 0 0 1 10.5 20 V14.5 A1 1 0 0 0 10.5 12.5 V10 A1 1 0 0 1 11.5 9 Z"
                      stroke="var(--logo-ticket-stroke, var(--brand-pearl))"
                      strokeWidth="1.1"
                      fill="var(--logo-ticket-fill, rgba(8, 18, 30, 0.85))"
                    />
                    <path d="M10.5 13.5 H21.5" stroke="var(--logo-ticket-stroke, var(--brand-pearl))" strokeWidth="0.7" strokeDasharray="1.2 1.2" opacity="0.6" />
                    {/* Vạch mã vạch đứng siêu nhỏ */}
                    <path d="M13.5 10.5 V12 M16 10.5 V12 M18.5 10.5 V12" stroke="var(--logo-ticket-stroke, var(--brand-pearl))" strokeWidth="0.8" opacity="0.8" />
                    {/* Ngôi sao siêu nhỏ lấp lánh ở nửa dưới */}
                    <path d="M16 16.5l.2.5.5.1-.3.3.1.5-.5-.3-.5.3.1-.5-.3-.3.5-.1z" fill="var(--logo-ticket-stroke, var(--brand-pearl))" stroke="none" />
                  </g>

                  {/* Glow core star in warm champagne gold at top right */}
                  <path d="M23 5.5 L23.6 7.2 L25.4 7.4 L24 8.7 L24.4 10.4 L23 9.4 L21.6 10.4 L22 8.7 L20.6 7.4 L22.4 7.2 Z" fill="oklch(86% 0.08 85)" opacity="0.95" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                <span className="logo-text-title">AuraPass</span>
                <span className="logo-text-subtitle">Ticket & Arts Platform</span>
              </div>
            </div>

            {/* Menu điều hướng */}
            <nav className="nav-links-list">
              {navLinks.map(link => {
                const isActive = activeSection === link.sectionId;
                const led = SECTION_LED[link.sectionId];
                return (
                  <button
                    key={link.label}
                    onClick={link.action}
                    className={`header-nav-link${isActive ? ' nav-active' : ''}`}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="active-nav-dot"
                        style={{
                          background: led.color,
                          '--led-color': led.glow,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Thanh tìm kiếm đã ẩn */}

          {/* Các nút chức năng bên phải */}
          <div className="nav-actions-container">
            {/* Nút vé của tôi */}
            <button
              onMouseEnter={() => setIsMyTicketsHovered(true)}
              onMouseLeave={() => setIsMyTicketsHovered(false)}
              onClick={() => setModalType('tickets')}
              className="btn-my-tickets"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={isMyTicketsHovered ? 'var(--text-white)' : 'oklch(55% 0.03 250)'}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  width: '13px',
                  height: '13px',
                  transition: 'all 0.25s ease',
                  filter: isMyTicketsHovered ? 'drop-shadow(0 0 4px oklch(70% 0.2 290 / 0.8))' : 'none'
                }}
              >
                {/* Khung vé dọc */}
                <path d="M6 3h12a2 2 0 0 1 2 2v3.5a1.5 1.5 0 0 0 0 3v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5a1.5 1.5 0 0 0 0-3V5a2 2 0 0 1 2-2Z" />
                {/* Đường xé vé răng cưa */}
                <path d="M4 11.5h16" strokeDasharray="1.5 1.5" strokeWidth="1" opacity="0.6" />
                {/* Mã vạch trang trí */}
                <path d="M9 6v2.5M12 6v2.5M15 6v2.5" strokeWidth="1.2" opacity="0.8" />
                {/* Ngôi sao trang trí */}
                <path d="M12 14.5l.3.9 1 .1-.7.7.2.9-.8-.5-.8.5.2-.9-.7-.7 1-.1z" fill={isMyTicketsHovered ? 'var(--text-white)' : 'oklch(55% 0.03 250)'} stroke="none" />
              </svg>
              <span>Vé của tôi</span>
            </button>

            <span className="nav-divider-line" />

            {currentUser && currentUser.role === 'organizer' && (
              <>
                <button
                  onClick={() => setModalType('my-events')}
                  className="btn-my-tickets"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Calendar size={14} style={{ opacity: 0.65 }} />
                  <span>Sự kiện của tôi</span>
                </button>
                <span className="nav-divider-line" />
              </>
            )}

            {currentUser && (currentUser.role === 'organizer' || currentUser.role === 'admin') && (
              <>
                <button
                  onMouseEnter={() => setIsCreateHovered(true)}
                  onMouseLeave={() => setIsCreateHovered(false)}
                  onClick={() => setModalType('create')}
                  className="btn-create-event"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Plus size={12} strokeWidth={2.5} />
                  <span>Tạo sự kiện</span>
                </button>
                <span className="nav-divider-line" />
              </>
            )}

            {/* User Nav Group (Auth, Cart, Lang) */}
            <div className="user-nav-group">
              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--brand-cyan)',
                    letterSpacing: '0.04em',
                    textShadow: '0 0 12px oklch(70% 0.18 200 / 0.5)'
                  }}>
                    {currentUser.fullName.toUpperCase()} {currentUser.role === 'organizer' && '(BAN TỔ CHỨC)'} {currentUser.role === 'admin' && '(ADMIN)'}
                  </span>
                  <button
                    onClick={() => setCurrentUser(null)}
                    className="btn-logout"
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ĐĂNG XUẤT
                  </button>
                </div>
              ) : (
                <button
                  onMouseEnter={() => setIsLoginHovered(true)}
                  onMouseLeave={() => setIsLoginHovered(false)}
                  onClick={() => { setModalType('login'); setIsSignUp(false); }}
                  className="btn-auth-link"
                >
                  <span onClick={(e) => { e.stopPropagation(); setModalType('login'); setIsSignUp(false); }}>Đăng nhập</span>
                  <span className="nav-divider-slash" style={{ margin: '0 6px' }}>/</span>
                  <span onClick={(e) => { e.stopPropagation(); setModalType('login'); setIsSignUp(true); }}>Đăng ký</span>
                </button>
              )}

              <span className="nav-divider-line" />

              {/* Giỏ hàng */}
              <div
                onMouseEnter={() => setIsCartHovered(true)}
                onMouseLeave={() => setIsCartHovered(false)}
                onClick={() => onHomeClick()}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.25s ease',
                  transform: isCartHovered ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                <ShoppingBag
                  size={15}
                  color={isCartHovered ? 'oklch(70% 0.18 300)' : 'oklch(70% 0.03 250)'}
                  style={{
                    transition: 'all 0.25s ease',
                    filter: isCartHovered ? 'drop-shadow(0 0 5px oklch(70% 0.18 300))' : 'none',
                    display: 'block'
                  }}
                />
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-5px',
                    backgroundColor: 'oklch(55% 0.26 300)', color: '#fff',
                    fontSize: '9px', fontWeight: 700, width: '14px', height: '14px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 8px oklch(55% 0.26 300)',
                  }}>{cartCount}</span>
                )}
              </div>

              <span className="nav-divider-line" />

              {/* Nút switch theme */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="btn-theme-toggle"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2) rotate(15deg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun size={13.5} className="theme-icon-sun" />
                ) : (
                  <Moon size={13.5} className="theme-icon-moon" />
                )}
              </button>
            </div>

            {/* Hamburger button */}
            <button
              className="hamburger-menu-btn"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={20} color="oklch(80% 0.03 250)" />
            </button>
          </div>
        </div>
      </header>

      {/* MODALS */}
      {modalType && (
        <div
          className="modal-overlay-scrollable"
          onClick={e => { if (e.target === e.currentTarget) setModalType(null); }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--bg-overlay-medium)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          <style>{`
            /* CSS cho modal */
            .edm-modal-carrier {
              width: 92%;
              max-width: 460px;
              background: linear-gradient(160deg, rgba(38, 30, 64, 0.97) 0%, rgba(26, 20, 48, 0.99) 100%);
              border: 1px solid rgba(255, 255, 255, 0.16);
              border-radius: 24px;
              padding: 42px 38px 36px 38px;
              box-shadow: 
                0 30px 70px rgba(0, 0, 0, 0.95),
                0 0 50px rgba(139, 92, 246, 0.08),
                inset 0 1px 1.5px rgba(255, 255, 255, 0.04);
              position: relative;
              overflow: hidden;
              transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .my-events-modal-carrier {
              max-width: 720px !important;
            }

            /* Khung chứa vé auth */
            .auth-modal-carrier {
              max-width: 860px !important; /* Increased length of carrier */
              padding: 0 !important;
              height: 400px; /* Increased height of carrier */
              display: flex;
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              overflow: visible !important;
            }

            .auth-tickets-stack {
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              perspective: 2000px;
            }

            .auth-ticket-dummy {
              position: absolute;
              width: 100%;
              height: 100%;
              max-width: 820px; /* Increased length from 700px */
              height: 370px; /* Increased height from 315px */
              border-radius: 20px;
              background: linear-gradient(160deg, rgba(32, 24, 52, 0.96) 0%, rgba(22, 16, 40, 0.98) 100%);
              border: 1px solid rgba(253, 218, 13, 0.28); /* Increased border contrast slightly for clarity */
              box-shadow: 0 15px 40px rgba(0, 0, 0, 0.65);
              pointer-events: none;
              opacity: 0.55; /* Increased opacity from 0.4 to make background tickets clearer */
              transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s;
            }
            .auth-ticket-dummy.dummy-left {
              transform: translate(-32px, -18px) rotate(-5.5deg) scale(0.96);
              z-index: 2;
            }
            .auth-ticket-dummy.dummy-right {
              transform: translate(32px, -18px) rotate(5.5deg) scale(0.96);
              z-index: 2;
            }
            /* Xòe vé khi hover */
            .auth-tickets-stack:hover .auth-ticket-dummy.dummy-left {
              transform: translate(-42px, -22px) rotate(-7deg) scale(0.96);
              opacity: 0.52; /* Increased from 0.32 */
            }
            .auth-ticket-card {
              position: absolute;
              width: 100%;
              height: 100%;
              max-width: 820px; /* Increased length from 700px */
              height: 370px; /* Increased height from 315px */
              border-radius: 20px;
              overflow: visible; /* Changed to visible so notches can overlay borders */
              display: flex;
              background: linear-gradient(160deg, rgba(38, 30, 64, 0.97) 0%, rgba(26, 20, 48, 0.99) 100%);
              border: 1px solid rgba(253, 218, 13, 0.35); /* Softened gold border to look less CAD/Blueprint */
              box-shadow: 
                0 25px 60px rgba(0, 0, 0, 0.75),
                0 0 40px rgba(253, 218, 13, 0.08),
                inset 0 1px 2px rgba(255, 255, 255, 0.08);
              backface-visibility: hidden;
              -webkit-backface-visibility: hidden;
              transform-style: preserve-3d;
              transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s, filter 0.65s, border-color 0.4s ease, box-shadow 0.4s ease;
            }
            .auth-ticket-card:hover {
              border-color: rgba(253, 218, 13, 0.35); /* Shines beautifully on hover */
              box-shadow: 
                0 30px 85px rgba(0, 0, 0, 0.95),
                0 0 45px rgba(253, 218, 13, 0.08),
                inset 0 1px 2px rgba(255, 255, 255, 0.05);
            }

            /* Hide all child contents of inactive cards in the stack to prevent overlaps/text bleed-through */
            .auth-ticket-card.inactive-back-left *,
            .auth-ticket-card.inactive-back-right *,
            .auth-ticket-card.shuffling-left *,
            .auth-ticket-card.shuffling-right * {
              opacity: 0 !important;
              pointer-events: none !important;
              transition: opacity 0.25s ease;
            }

            /* Hiệu ứng quét sáng cho đăng nhập/đăng ký */
            .auth-ticket-reflection {
              position: absolute;
              inset: 0;
              pointer-events: none;
              z-index: 5;
              overflow: hidden;
              border-radius: inherit;
            }
            .auth-ticket-reflection::after {
              content: '';
              position: absolute;
              top: 0;
              left: -150%;
              width: 80%;
              height: 100%;
              transform: skewX(-25deg);
              pointer-events: none;
            }
            
            /* Quét sáng cho đăng nhập */
            .signin.active-front .auth-ticket-reflection::after {
              background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(139, 92, 246, 0.01) 30%,
                rgba(6, 182, 212, 0.12) 50%,
                rgba(139, 92, 246, 0.01) 70%,
                transparent 100%
              );
              animation: authGlassSweepLeft 6s cubic-bezier(0.25, 1, 0.5, 1) infinite;
            }
            /* Quét sáng cho đăng ký */
            .signup.active-front .auth-ticket-reflection::after {
              background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(253, 218, 13, 0.01) 30%,
                rgba(253, 218, 13, 0.12) 50%,
                rgba(253, 218, 13, 0.01) 70%,
                transparent 100%
              );
              animation: authGlassSweepRight 6s cubic-bezier(0.25, 1, 0.5, 1) infinite;
              animation-delay: 1.5s; /* Lệch pha hoạt ảnh */
            }

            @keyframes authGlassSweepLeft {
              0% { left: -150%; }
              40% { left: 150%; }
              100% { left: 150%; }
            }
            @keyframes authGlassSweepRight {
              0% { left: -150%; }
              40% { left: 150%; }
              100% { left: 150%; }
            }

            /* Hiệu ứng hologram khi hover vé */
            .auth-holographic-sheen {
              position: absolute;
              inset: 0;
              z-index: 6;
              pointer-events: none;
              opacity: 0;
              mix-blend-mode: color-dodge;
              transition: opacity 0.4s ease, background-position 0.4s ease;
              border-radius: inherit;
              background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0) 20%,
                rgba(255, 0, 128, 0.06) 30%,
                rgba(0, 255, 255, 0.06) 40%,
                rgba(253, 218, 13, 0.06) 50%,
                rgba(139, 92, 246, 0.06) 60%,
                rgba(255, 255, 255, 0) 80%
              );
              background-size: 250% 250%;
              background-position: 150% 150%;
            }
            .auth-ticket-card:hover .auth-holographic-sheen {
              opacity: 1;
              background-position: 0% 0%;
              transition: opacity 0.4s ease, background-position 1.5s cubic-bezier(0.16, 1, 0.3, 1);
            }

            /* Thân và cuống vé */
            .auth-ticket-body {
              width: 65%;
              padding: 24px 44px 22px 44px; /* Increased padding slightly for larger dimensions */
              display: flex;
              flex-direction: column;
              justify-content: center;
              box-sizing: border-box;
              position: relative;
              text-align: left;
              border-top-left-radius: 20px;
              border-bottom-left-radius: 20px;
            }

            .auth-ticket-stub {
              width: 35%;
              padding: 24px 26px 22px 26px; /* Increased padding slightly for larger dimensions */
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: linear-gradient(150deg, rgba(32, 24, 54, 0.97) 0%, rgba(22, 16, 40, 0.99) 100%);
              border-left: 1px solid rgba(253, 218, 13, 0.1);
              position: relative;
              box-sizing: border-box;
              text-align: center;
              border-top-right-radius: 20px;
              border-bottom-right-radius: 20px;
            }

            /* Ticket Divider & Bevel Notches */
            .auth-ticket-divider {
              width: 1px;
              height: 100%;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              pointer-events: none;
              z-index: 6;
            }
            .auth-ticket-divider-line {
              position: absolute;
              top: 15px;
              bottom: 15px;
              width: 1px;
              background-image: linear-gradient(to bottom, rgba(253, 218, 13, 0.18) 50%, transparent 50%);
              background-size: 1px 12px;
              background-repeat: repeat-y;
            }

            /* Khuyết bo tròn đè lên viền */
            .auth-ticket-notch {
              position: absolute;
              width: 20px;
              height: 10px; /* Only 10px tall to fit completely inside the card edge */
              background: var(--bg-dark) !important; /* Matches brightened background instead of pitch black */
              z-index: 20;
              box-sizing: border-box;
              transform: translateZ(5px); /* Lift in 3D space to overlay the parent borders/outlines */
            }
            .auth-ticket-notch.notch-top {
              top: 0; /* Starts from the top edge going down */
              left: -10px;
              border-radius: 0 0 10px 10px; /* U-shape notch curving inwards */
              border: 1px solid rgba(253, 218, 13, 0.25);
              border-top: none !important; /* Hide top border so it flows seamlessly */
            }
            .auth-ticket-notch.notch-bottom {
              bottom: 0; /* Starts from the bottom edge going up */
              left: -10px;
              border-radius: 10px 10px 0 0; /* Inverted U-shape notch curving inwards */
              border: 1px solid rgba(253, 218, 13, 0.25);
              border-bottom: none !important; /* Hide bottom border so it flows seamlessly */
            }

            /* Ngôi sao trang trí trong cuống vé */
            .auth-stub-sparkle {
              position: absolute;
              top: 12px;
              left: 16px; /* Moved to left side to prevent overlapping the Close button on the right */
              font-size: 11px;
              color: rgba(253, 218, 13, 0.35);
              animation: authSparkle 4s infinite alternate;
              pointer-events: none;
              z-index: 10;
            }
            @keyframes authSparkle {
              0% { opacity: 0.3; transform: scale(0.9) rotate(0deg); }
              100% { opacity: 0.95; transform: scale(1.15) rotate(15deg); filter: drop-shadow(0 0 2px rgba(253,218,13,0.3)); }
            }

            /* Active Front State */
            .auth-ticket-card.active-front {
              transform: translate(0, 0) rotate(0) scale(1);
              z-index: 10;
              opacity: 1;
              filter: brightness(1);
              pointer-events: auto;
            }

            /* Inactive Back States for Fanned Stack */
            .auth-ticket-card.inactive-back-left {
              transform: translate(-22px, -14px) rotate(-4deg) scale(0.97);
              z-index: 4;
              opacity: 0.45;
              filter: brightness(0.65);
              cursor: pointer;
              pointer-events: auto;
            }

            .auth-ticket-card.inactive-back-right {
              transform: translate(22px, -14px) rotate(4deg) scale(0.97);
              z-index: 4;
              opacity: 0.45;
              filter: brightness(0.65);
              cursor: pointer;
              pointer-events: auto;
            }

            /* Hover states for fanned stack to look interactive */
            .auth-ticket-card.inactive-back-left:hover {
              transform: translate(-30px, -18px) rotate(-5deg) scale(0.97);
              opacity: 0.7;
              filter: brightness(0.85);
            }
            .auth-ticket-card.inactive-back-right:hover {
              transform: translate(30px, -18px) rotate(5deg) scale(0.97);
              opacity: 0.7;
              filter: brightness(0.85);
            }

            /* Card Shuffling Animations */
            @keyframes shuffleLeftToBack {
              0% {
                transform: translate(0, 0) rotate(0) scale(1);
                z-index: 12;
                filter: brightness(1);
              }
              38% {
                transform: translate(-108%, 10px) rotate(-8deg) scale(0.98);
                z-index: 12;
                filter: brightness(0.85);
              }
              39% {
                transform: translate(-108%, 10px) rotate(-8deg) scale(0.98);
                z-index: 4;
              }
              100% {
                transform: translate(-22px, -14px) rotate(-4deg) scale(0.97);
                z-index: 4;
                filter: brightness(0.65);
              }
            }

            @keyframes shuffleRightToBack {
              0% {
                transform: translate(0, 0) rotate(0) scale(1);
                z-index: 12;
                filter: brightness(1);
              }
              38% {
                transform: translate(108%, 10px) rotate(8deg) scale(0.98);
                z-index: 12;
                filter: brightness(0.85);
              }
              39% {
                transform: translate(108%, 10px) rotate(8deg) scale(0.98);
                z-index: 4;
              }
              100% {
                transform: translate(22px, -14px) rotate(4deg) scale(0.97);
                z-index: 4;
                filter: brightness(0.65);
              }
            }

            .auth-ticket-card.shuffling-left {
              animation: shuffleLeftToBack 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              pointer-events: none;
            }

            .auth-ticket-card.shuffling-right {
              animation: shuffleRightToBack 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              pointer-events: none;
            }

            /* Typography */
            .auth-form-main-title {
              font-family: var(--font-display);
              font-size: 24px;
              font-weight: 700;
              color: #fff;
              margin: 4px 0 16px 0;
              text-align: left;
              background: linear-gradient(90deg, #fff 60%, #e2d9ff 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }

            /* Inputs */
            .auth-line-input-group {
              position: relative;
              margin-bottom: 14px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.08);
              transition: border-color 0.3s ease;
              text-align: left;
            }
            .auth-line-input {
              width: 100%;
              padding: 10px 30px 10px 0;
              background: transparent;
              border: none;
              color: #fff;
              font-size: 13.5px;
              font-family: var(--font-body);
              outline: none;
              box-sizing: border-box;
            }
            .auth-line-label {
              position: absolute;
              left: 0;
              top: 10px;
              color: rgba(255, 255, 255, 0.55);
              font-size: 13.5px;
              font-family: var(--font-body);
              pointer-events: none;
              transition: all 0.3s ease;
            }
            .auth-line-icon {
              position: absolute;
              right: 5px;
              top: 10px;
              font-size: 13px;
              color: rgba(255, 255, 255, 0.25);
              pointer-events: none;
              transition: color 0.3s ease;
            }
            .auth-line-input:focus ~ .auth-line-label,
            .auth-line-input:not(:placeholder-shown) ~ .auth-line-label {
              top: -12px;
              font-size: 9.5px;
              color: #fbbf24;
            }
            .auth-line-input-group:focus-within {
              border-bottom-color: #fbbf24;
            }
            .auth-line-input-group:focus-within .auth-line-icon {
              color: #fbbf24;
            }

            /* Remember me row */
            .auth-remember-row {
              display: flex;
              align-items: center;
              gap: 7px;
              cursor: pointer;
              padding: 2px 0;
            }
            .auth-remember-checkbox {
              width: 13px;
              height: 13px;
              accent-color: #8b5cf6;
              cursor: pointer;
              flex-shrink: 0;
            }
            .auth-remember-label {
              font-family: var(--font-body);
              font-size: 11.5px;
              color: rgba(255, 255, 255, 0.48);
              cursor: pointer;
              user-select: none;
            }

            /* Barcode section with Hologram overlay */
            .auth-stub-barcode-section {
              width: 90%; /* Increased width */
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              margin-bottom: 12px; /* Increased spacing */
              position: relative;
              z-index: 5;
            }
            .auth-stub-barcode-container {
              position: relative;
              width: 100%;
              height: 38px; /* Increased height for a more prominent barcode */
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              border-radius: 2px;
              color: var(--brand-pearl);
            }
            .auth-stub-barcode-hologram {
              position: absolute;
              inset: 0;
              background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0) 30%,
                rgba(0, 255, 255, 0.12) 45%,
                rgba(255, 0, 128, 0.12) 55%,
                rgba(255, 255, 255, 0) 70%
              );
              background-size: 200% 200%;
              background-position: 100% 100%;
              mix-blend-mode: color-dodge;
              z-index: 2;
              pointer-events: none;
              animation: authBarcodeHolo 4s ease infinite;
            }
            @keyframes authBarcodeHolo {
              0% { background-position: 100% 100%; }
              50% { background-position: 0% 0%; }
              100% { background-position: 100% 100%; }
            }
            .auth-stub-barcode {
              width: 100%;
              height: 100%;
              opacity: 0.85; /* Increased opacity for clear visibility */
              color: inherit;
              filter: drop-shadow(0 0 2px rgba(255,255,255,0.15));
            }
            .auth-stub-code {
              font-family: var(--font-mono);
              font-size: 7px;
              letter-spacing: 0.16em;
              color: rgba(255, 255, 255, 0.5);
              margin-top: 2px;
              text-transform: uppercase;
            }

            /* Circular stamp VIP badge */
            .auth-stub-circle-stamp {
              width: 92px; /* Increased from 82px to make it pop */
              height: 92px; /* Increased from 82px to make it pop */
              border-radius: 50%;
              border: 1px dashed rgba(253, 218, 13, 0.25);
              background: radial-gradient(circle, rgba(253, 218, 13, 0.04) 0%, rgba(253, 218, 13, 0.01) 70%); /* Added soft radial glow */
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              margin-bottom: 14px; /* Increased spacing */
              position: relative;
              box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.6), 0 0 15px rgba(253, 218, 13, 0.02);
              transition: all 0.3s ease;
              z-index: 5;
            }
            .auth-ticket-card:hover .auth-stub-circle-stamp {
              border-color: rgba(253, 218, 13, 0.45);
              box-shadow: inset 0 0 18px rgba(253, 218, 13, 0.06), 0 0 10px rgba(253, 218, 13, 0.12);
            }
            .auth-stub-stamp-text-top {
              font-family: var(--font-mono);
              font-size: 6.5px;
              letter-spacing: 0.14em;
              color: rgba(253, 218, 13, 0.6);
              margin-bottom: 2px;
            }
            .auth-stub-stamp-text-middle {
              font-family: var(--font-display);
              font-size: 16px; /* Increased from 14px */
              font-weight: 800;
              color: #fbbf24;
              text-shadow: 0 0 6px rgba(251, 191, 36, 0.3);
              margin-bottom: 2px;
            }
            .auth-stub-stamp-text-bottom {
              font-family: var(--font-mono);
              font-size: 6.5px;
              letter-spacing: 0.1em;
              color: rgba(255, 255, 255, 0.4);
            }

            /* Chi tiết vé sự kiện */
            .auth-stub-meta-details {
              display: flex;
              justify-content: space-between;
              width: 90%;
              max-width: 220px;
              margin-bottom: 16px;
              border-top: 1px dashed rgba(253, 218, 13, 0.12);
              border-bottom: 1px dashed rgba(253, 218, 13, 0.12);
              padding: 8px 0;
              box-sizing: border-box;
              z-index: 5;
            }
            .auth-stub-meta-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              flex: 1;
            }
            .auth-stub-meta-item:not(:last-child) {
              border-right: 1px solid rgba(253, 218, 13, 0.08);
            }
            .auth-stub-meta-label {
              font-family: var(--font-mono);
              font-size: 7px;
              letter-spacing: 0.08em;
              color: rgba(253, 218, 13, 0.55);
              margin-bottom: 2px;
              text-transform: uppercase;
            }
            .auth-stub-meta-value {
              font-family: var(--font-display);
              font-size: 9px;
              font-weight: 750;
              color: #fff;
              letter-spacing: 0.02em;
              text-transform: uppercase;
            }

            /* Chữ in chìm dọc */
            .auth-stub-bg-text {
              position: absolute;
              right: 6px;
              top: 50%;
              transform: translateY(-50%) rotate(90deg);
              transform-origin: center right;
              font-family: var(--font-mono);
              font-size: 8px;
              letter-spacing: 0.28em;
              color: rgba(253, 218, 13, 0.025); /* Cực kỳ mờ ảo chìm sâu */
              white-space: nowrap;
              pointer-events: none;
              text-transform: uppercase;
              z-index: 1;
            }

            .auth-stub-toggle-btn {
              background: transparent;
              border: 1px solid rgba(253, 218, 13, 0.25);
              color: #fff;
              padding: 7px 16px;
              border-radius: 30px;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.08em;
              cursor: pointer;
              transition: all 0.3s ease;
              font-family: var(--font-display);
              text-transform: uppercase;
              position: relative;
              z-index: 5;
            }
            .auth-stub-toggle-btn:hover {
              border-color: #fbbf24;
              color: #fbbf24;
              background: rgba(251, 191, 36, 0.04);
              box-shadow: 0 0 12px rgba(251, 191, 36, 0.12);
              transform: translateY(-1px);
            }

            .mobile-only-toggle {
              display: none;
            }

            @media (max-width: 600px) {
              .auth-modal-carrier {
                max-width: 420px !important;
                height: auto;
                min-height: 410px;
              }
              .auth-tickets-stack {
                perspective: none;
              }
              .auth-ticket-dummy {
                display: none !important;
              }
              .auth-ticket-card {
                position: relative;
                width: 100%;
                height: auto;
                min-height: 410px;
                transform: none !important;
                backface-visibility: visible;
                display: none;
                outline: none;
                border-color: rgba(255, 255, 255, 0.07);
              }
              
              /* Only display active card */
              .auth-ticket-card.active-front {
                display: flex;
              }
              
              .auth-ticket-stub {
                display: none !important;
              }
              
              .auth-ticket-body {
                width: 100% !important;
                padding: 36px 26px;
              }
              
              .mobile-only-toggle {
                display: block;
              }
            }

            /* Ambient VIP Backstage Glow Backplate */
            .edm-modal-carrier::before {
              content: '';
              position: absolute;
              top: -50%; left: -50%; width: 200%; height: 200%;
              background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 60%);
              pointer-events: none;
              z-index: 1;
            }

            /* Luxury Noise Texture */
            .edm-modal-carrier::after {
              content: '';
              position: absolute;
              top: 0; left: 0; width: 100%; height: 100%;
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.012'/%3E%3C/svg%3E");
              pointer-events: none;
              z-index: 1;
            }

            /* Glass sweep reflection */
            .edm-modal-glass-sweep {
              position: absolute;
              top: 0; left: -150%; width: 100%; height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent);
              transform: skewX(-20deg);
              animation: modalReflection 8s infinite ease-in-out;
              pointer-events: none;
              z-index: 2;
            }

            @keyframes modalReflection {
              0% { left: -150%; }
              30%, 100% { left: 150%; }
            }

            /* Close Button */
            .edm-modal-close-btn {
              position: absolute;
              top: 18px;
              right: 18px;
              background: rgba(255, 255, 255, 0.02);
              border: 1px solid rgba(255, 255, 255, 0.04);
              border-radius: 50%;
              width: 26px;
              height: 26px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: rgba(255, 255, 255, 0.35);
              cursor: pointer;
              transition: all 0.3s ease;
              z-index: 10;
            }

            .edm-modal-close-btn:hover {
              background: rgba(239, 68, 68, 0.08);
              border-color: rgba(239, 68, 68, 0.25);
              color: #ef4444;
              transform: rotate(90deg);
              box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
            }

            /* VIP Subtitle */
            .vip-modal-subtitle {
              font-family: var(--font-mono);
              font-size: 8.5px;
              font-weight: 600;
              letter-spacing: 0.12em;
              color: var(--brand-cyan);
              text-transform: uppercase;
              opacity: 0.8;
            }

            /* Title styling using Lora/Playfair Display */
            .edm-modal-glow-title {
              font-family: var(--font-display);
              font-size: 28px; /* Increased for better visibility */
              font-weight: 800;
              color: #fff;
              letter-spacing: 0.01em;
              margin-bottom: 12px;
              text-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
              position: relative;
              z-index: 2;
              background: linear-gradient(90deg, #fff 40%, #e2d9ff 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }

            .edm-modal-desc {
              font-family: var(--font-body);
              font-size: 14.5px; /* Increased for better readability */
              color: var(--text-secondary); /* Pearl white instead of muted slate */
              line-height: 1.6;
              margin-bottom: 22px;
              position: relative;
              z-index: 2;
            }

            /* Minimalist Elegant Forms */
            .edm-input-group {
              display: flex;
              flex-direction: column;
              gap: 5px;
              margin-bottom: 14px;
              position: relative;
              z-index: 2;
              text-align: left;
            }

            .edm-input-label {
              font-family: var(--font-body);
              font-size: 13.5px; /* Increased from 11.5px */
              font-weight: 600;
              color: var(--text-secondary);
              letter-spacing: 0.01em;
              transition: color 0.3s ease;
            }

            .edm-input-field-new {
              width: 100%;
              padding: 11px 13px; /* Slightly more spacing inside input */
              border-radius: 7px;
              background: rgba(255, 255, 255, 0.015);
              border: 1px solid rgba(255, 255, 255, 0.05);
              color: #fff;
              outline: none;
              font-size: 13.5px;
              font-family: var(--font-body);
              transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
              box-sizing: border-box;
            }

            .edm-input-field-new::placeholder {
              color: rgba(255, 255, 255, 0.15);
              font-size: 12px;
            }

            .edm-input-field-new:focus {
              border-color: rgba(167, 139, 250, 0.35);
              background: rgba(255, 255, 255, 0.025);
              box-shadow: 
                0 0 10px rgba(167, 139, 250, 0.05),
                inset 0 1px 1px rgba(255, 255, 255, 0.02);
            }

            .edm-input-group:focus-within .edm-input-label {
              color: var(--brand-cyan);
            }

            /* Elegant watermark AuraPass Crest / Ticket - top right */
            .edm-modal-watermark-top {
              position: absolute;
              top: -15px;
              right: -15px;
              color: rgba(253, 218, 13, 0.04); /* Warm gold tone at 4% opacity */
              pointer-events: none;
              z-index: 1;
              transform: rotate(15deg) scale(0.9);
              transform-origin: top right;
            }

            /* Elegant Watermark bottom left */
            .edm-modal-watermark-bottom {
              position: absolute;
              bottom: -25px;
              left: -25px;
              color: rgba(255, 255, 255, 0.015);
              pointer-events: none;
              z-index: 1;
              transform: rotate(-15deg);
            }

            /* VIP Minimalist Action Button - Luxury Champagne Pearl Style */
            .edm-btn-action {
              width: 100%;
              padding: 13px 24px;
              border-radius: 8px;
              font-family: var(--font-mono);
              font-size: 12.5px;
              font-weight: 700;
              color: #0b0914; /* Midnight dark text */
              background: linear-gradient(135deg, #eae5df 0%, #d5cdbf 100%); /* Champagne Pearl gradient */
              border: 1px solid rgba(255, 255, 255, 0.4);
              letter-spacing: 0.14em;
              text-transform: uppercase;
              transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
              margin-top: 12px;
              z-index: 2;
              position: relative;
              overflow: hidden;
              cursor: pointer;
              box-shadow: 
                0 6px 20px rgba(0, 0, 0, 0.45),
                inset 0 1px 0 rgba(255, 255, 255, 0.5);
            }

            .edm-btn-action::before {
              content: '';
              position: absolute;
              top: 0; left: -100%; width: 100%; height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
              transition: none;
              z-index: 1;
            }

            .edm-btn-action:hover {
              background: linear-gradient(135deg, #f5f0eb 0%, #e2d9cc 100%);
              border-color: rgba(253, 218, 13, 0.8); /* Gold accent shine */
              color: #000;
              box-shadow: 
                0 10px 25px rgba(253, 218, 13, 0.15),
                0 0 15px rgba(253, 218, 13, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.6);
              transform: translateY(-2px);
            }

            .edm-btn-action:active {
              transform: translateY(-0.5px);
              box-shadow: 
                0 4px 10px rgba(0, 0, 0, 0.3),
                inset 0 1px 2px rgba(0, 0, 0, 0.15);
            }

            .edm-btn-action:hover::before {
              left: 100%;
              transition: left 0.7s ease;
            }

            /* ── Image picker ── */
            .evt-img-picker {
              width: 100%;
              height: 110px;
              border: 1.5px dashed rgba(167, 139, 250, 0.35);
              border-radius: 10px;
              background: rgba(139, 92, 246, 0.04);
              color: rgba(255,255,255,0.55);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 6px;
              cursor: pointer;
              transition: all 0.2s ease;
              font-family: var(--font-body);
              font-size: 13px;
            }
            .evt-img-picker:hover:not(:disabled) {
              border-color: rgba(167, 139, 250, 0.65);
              background: rgba(139, 92, 246, 0.08);
              color: rgba(255,255,255,0.8);
            }
            .evt-img-picker:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }
            .evt-img-preview {
              position: relative;
              width: 100%;
              height: 140px;
              border-radius: 10px;
              overflow: hidden;
              cursor: pointer;
            }
            .evt-img-overlay {
              position: absolute;
              inset: 0;
              background: rgba(0,0,0,0.45);
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              color: #fff;
              font-size: 13px;
              font-weight: 600;
              opacity: 0;
              transition: opacity 0.2s ease;
              border-radius: 10px;
            }
            .evt-img-preview:hover .evt-img-overlay { opacity: 1; }
            @keyframes spin { to { transform: rotate(360deg); } }
            .evt-img-spin { animation: spin 1s linear infinite; }

            /* ── Zone config section ── */
            .evt-zones-section {
              padding: 14px 16px;
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 10px;
              background: rgba(255,255,255,0.025);
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .evt-zones-title {
              font-family: var(--font-mono);
              font-size: 10px;
              letter-spacing: 0.14em;
              color: var(--text-muted);
              font-weight: 700;
              text-transform: uppercase;
            }
            .evt-zones-header-row {
              display: flex;
              gap: 8px;
              align-items: center;
              font-family: var(--font-mono);
              font-size: 10px;
              color: var(--text-muted);
              letter-spacing: 0.06em;
            }
            .evt-zones-header-row span { flex: 1; }
            .evt-zone-row {
              display: flex;
              gap: 8px;
              align-items: center;
            }
            .evt-zone-name {
              width: 38px;
              font-family: var(--font-mono);
              font-size: 11px;
              font-weight: 700;
              color: var(--text-white);
              flex-shrink: 0;
            }
            .evt-zone-input {
              flex: 1;
              padding: 8px 10px !important;
              font-size: 12px !important;
              height: 36px;
            }
            .evt-zone-standing-label {
              width: 52px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .evt-zone-checkbox {
              width: 15px;
              height: 15px;
              cursor: pointer;
              accent-color: var(--brand-violet);
            }

            /* ── My Events Modal Enhancement ── */
            .my-evt-card {
              background: var(--bg-dark-gray);
              border: 1px solid var(--glass-border);
              border-radius: 12px;
              padding: 16px;
              display: flex;
              gap: 16px;
              position: relative;
              overflow: hidden;
              transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
              box-shadow: var(--glass-shadow);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }
            .my-evt-card:hover {
              transform: translateY(-2px);
              border-color: var(--brand-cyan);
              box-shadow: 
                0 10px 25px rgba(0, 242, 254, 0.08),
                0 0 15px rgba(0, 242, 254, 0.03);
            }
            .my-evt-img {
              width: 72px;
              height: 96px;
              object-fit: cover;
              border-radius: 8px;
              border: 1px solid var(--glass-border);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
              transition: transform 0.3s ease;
            }
            .my-evt-card:hover .my-evt-img {
              transform: scale(1.03);
            }
            .my-evt-info {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              min-width: 0;
              justify-content: space-between;
            }
            .my-evt-title {
              font-size: 15px;
              font-weight: 800;
              color: var(--brand-pearl);
              margin: 4px 0 6px 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-family: var(--font-display);
              letter-spacing: 0.02em;
            }
            .my-evt-meta {
              font-size: 11.5px;
              color: var(--text-secondary);
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 3px;
              font-family: var(--font-body);
              opacity: 0.9;
            }
            .my-evt-price {
              font-size: 12px;
              color: var(--brand-cyan);
              font-weight: 750;
              margin-top: 4px;
              font-family: var(--font-mono);
            }
            .my-evt-actions {
              display: flex;
              gap: 8px;
              margin-top: 10px;
              z-index: 5;
            }
            .my-evt-btn {
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 6px;
              font-family: var(--font-mono);
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border: none;
            }
            .my-evt-btn-view {
              background: var(--brand-navy-glow);
              color: var(--brand-cyan);
              border: 1px solid var(--brand-cyan-glow);
            }
            .my-evt-btn-view:hover {
              background: var(--brand-cyan-glow);
              border-color: var(--brand-cyan);
              box-shadow: 0 0 10px rgba(0, 242, 254, 0.15);
            }
            .my-evt-btn-edit {
              background: rgba(251, 191, 36, 0.08);
              color: var(--brand-gold);
              border: 1px solid rgba(251, 191, 36, 0.2);
            }
            .my-evt-btn-edit:hover {
              background: rgba(251, 191, 36, 0.15);
              border-color: var(--brand-gold);
              box-shadow: 0 0 10px rgba(253, 218, 13, 0.12);
            }

            /* Detail Modal */
            .detail-modal-carrier {
              max-width: 720px !important;
              width: 90% !important;
            }
            .create-modal-carrier {
              max-width: 680px !important;
              width: 95% !important;
            }
            .detail-hero-banner {
              width: 100%;
              height: 160px;
              object-fit: cover;
              border-radius: 12px;
              border: 1px solid var(--glass-border);
              margin-bottom: 18px;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            }
            .detail-field-group {
              display: flex;
              flex-direction: column;
              gap: 6px;
              background: var(--bg-dark-gray);
              border: 1px solid var(--glass-border);
              border-radius: 10px;
              padding: 14px 16px;
            }
            .detail-field-label {
              font-family: var(--font-mono);
              font-size: 9px;
              color: var(--text-muted);
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .detail-field-value {
              font-size: 13px;
              color: var(--brand-pearl);
              font-weight: 500;
            }
          `}</style>

          <div className={`edm-modal-carrier ${modalType === 'login' ? 'auth-modal-carrier' : ''} ${(modalType === 'create' || modalType === 'edit-event') ? 'create-modal-carrier' : ''} ${modalType === 'view-event-detail' ? 'detail-modal-carrier' : ''} ${modalType === 'my-events' ? 'my-events-modal-carrier' : ''}`}>
            {modalType !== 'login' && (
              <button 
                onClick={() => {
                  if (modalType === 'edit-event' || modalType === 'view-event-detail') {
                    setModalType('my-events');
                    setEditingEvent(null);
                    setViewingEvent(null);
                  } else {
                    setModalType(null);
                  }
                }} 
                className="edm-modal-close-btn"
              >
                <X size={13} />
              </button>
            )}

            {/* Visual Overlays */}
            <div className="edm-modal-glass-sweep"></div>

            {/* Luxury Crest Watermark top right to eliminate blank spaces */}
            {modalType !== 'login' && (
              <div className="edm-modal-watermark-top">
                <svg width="180" height="180" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.6">
                  {/* Outer abstract luxury orbit */}
                  <circle cx="50" cy="50" r="45" strokeDasharray="1 3" />
                  <circle cx="50" cy="50" r="38" opacity="0.3" strokeDasharray="2 2" />

                  {/* Elegant Star emblem in the center */}
                  <path d="M50 20 L53.5 35 L68 35 L56 44 L60.5 59 L50 50 L39.5 59 L44 44 L32 35 L46.5 35 Z" fill="currentColor" opacity="0.45" />

                  {/* Ticket shape nested inside */}
                  <rect x="28" y="32" width="44" height="26" rx="2" strokeWidth="0.8" opacity="0.8" />
                  <line x1="50" y1="32" x2="50" y2="58" strokeDasharray="1.5 1.5" opacity="0.7" />
                  <circle cx="50" cy="32" r="2" fill="#000" stroke="currentColor" strokeWidth="0.6" />
                  <circle cx="50" cy="58" r="2" fill="#000" stroke="currentColor" strokeWidth="0.6" />
                </svg>
              </div>
            )}

            {/* Faint luxury watermark ticket bottom left */}
            <div className="edm-modal-watermark-bottom">
              <svg width="220" height="220" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                <rect x="5" y="20" width="90" height="60" rx="6" />
                <circle cx="70" cy="20" r="4" fill="none" />
                <circle cx="70" cy="80" r="4" fill="none" />
                <line x1="70" y1="24" x2="70" y2="76" strokeDasharray="2 2" />
                <path d="M38 42 s6-3 6-7V29l-6-2-6 2v6c0 4 6 7 6 7z" />
                <circle cx="38" cy="34" r="1.5" />
                <path d="M38 52 l2 -2 l2 2 l-2 2 z" />
                <line x1="15" y1="70" x2="60" y2="70" opacity="0.5" />
                <text x="15" y="65" fontFamily="var(--font-mono)" fontSize="4" letterSpacing="0.5" opacity="0.6">VIP INVITATION PASS</text>
              </svg>
            </div>

            {(modalType === 'create' || modalType === 'edit-event') && <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', zIndex: 2, position: 'relative' }}>
                <span className="vip-modal-subtitle">{modalType === 'edit-event' ? 'Cập Nhật Sự Kiện' : 'Tạo Sự Kiện Mới'}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', letterSpacing: '0.12em', color: '#fbbf24', opacity: 0.95, fontWeight: 700 }}>
                  {modalType === 'edit-event' ? 'EDIT PASS' : 'ORGANIZER PANEL'}
                </span>
              </div>

              {modalType === 'edit-event' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', zIndex: 2, position: 'relative' }}>
                  <button 
                    onClick={() => {
                      setModalType('my-events');
                      setEditingEvent(null);
                    }} 
                    style={{ background: 'none', border: 'none', color: 'var(--brand-cyan)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                  >
                    &larr; QUAY LẠI DANH SÁCH
                  </button>
                </div>
              )}

              <h3 className="edm-modal-glow-title">{modalType === 'edit-event' ? 'Sửa Sự Kiện' : 'Tạo Sự Kiện'}</h3>
              <p className="edm-modal-desc">
                {modalType === 'edit-event' 
                  ? 'Chỉnh sửa các thông tin chi tiết bên dưới để cập nhật lại thông tin sự kiện.' 
                  : 'Điền các thông tin chi tiết bên dưới để gửi yêu cầu phê duyệt sự kiện mới lên hệ thống.'}
              </p>

              {myCreator && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: theme === 'light' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.08)',
                  borderRadius: '8px',
                  border: theme === 'light' ? '1px solid rgba(139, 92, 246, 0.28)' : '1px solid rgba(139, 92, 246, 0.2)',
                  marginBottom: '10px',
                  zIndex: 2,
                  position: 'relative'
                }}>
                  <img src={myCreator.logo} alt={myCreator.name} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: theme === 'light' ? '1px solid rgba(15, 23, 42, 0.12)' : '1px solid rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: '12px', color: theme === 'light' ? 'var(--text-secondary)' : 'var(--text-white)' }}>
                    Đăng ký dưới danh nghĩa: <strong style={{ color: theme === 'light' ? '#0369a1' : 'var(--brand-cyan)' }}>{myCreator.name}</strong>
                  </span>
                </div>
              )}

              <form onSubmit={handleEventFormSubmit} style={{
                zIndex: 2,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImgUpload}
                />
                <div className="edm-input-group">
                  <label className="edm-input-label">Tên sự kiện *</label>
                  <input
                    type="text"
                    required
                    value={evtTitle}
                    onChange={(e) => setEvtTitle(e.target.value)}
                    placeholder="Nhập tên sự kiện..."
                    className="edm-input-field-new"
                  />
                </div>

                <div className="edm-input-group">
                  <label className="edm-input-label">Mô tả sự kiện</label>
                  <textarea
                    value={evtDescription}
                    onChange={(e) => setEvtDescription(e.target.value)}
                    placeholder="Mô tả ngắn về sự kiện..."
                    className="edm-input-field-new"
                    style={{ minHeight: '60px', resize: 'vertical', padding: '10px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="edm-input-group" style={{ flex: 1 }}>
                    <label className="edm-input-label">Thể loại</label>
                    <select
                      value={evtCategory}
                      onChange={(e) => setEvtCategory(e.target.value)}
                      className="edm-input-field-new"
                      style={{ padding: '8px', height: '38px' }}
                    >
                      <option value="concert">Concert</option>
                      <option value="festival">Festival</option>
                      <option value="club">Club Event</option>
                      <option value="theater">Theater</option>
                    </select>
                  </div>
                  <div className="edm-input-group" style={{ flex: 1 }}>
                    <label className="edm-input-label">Chủ đề (Theme)</label>
                    <select
                      value={evtTheme}
                      onChange={(e) => setEvtTheme(e.target.value)}
                      className="edm-input-field-new"
                      style={{ padding: '8px', height: '38px' }}
                    >
                      <option value="cyberpunk">Cyberpunk (Tím)</option>
                      <option value="aurora">Aurora (Xanh lá)</option>
                      <option value="neon-sun">Neon Sun (Cam)</option>
                      <option value="magma">Magma (Đỏ)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="edm-input-group" style={{ flex: 1 }}>
                    <label className="edm-input-label">Ngày diễn ra *</label>
                    <input
                      type="date"
                      required
                      value={evtDate}
                      onChange={(e) => setEvtDate(e.target.value)}
                      className="edm-input-field-new"
                    />
                  </div>
                  <div className="edm-input-group" style={{ flex: 1, position: 'relative' }} ref={timeInputRef}>
                    <label className="edm-input-label">Giờ diễn ra *</label>
                    <div
                      onClick={() => setShowTimePicker(!showTimePicker)}
                      className="edm-input-field-new"
                      style={{
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '0 13px',
                        userSelect: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13.5px',
                        borderColor: showTimePicker ? 'rgba(167, 139, 250, 0.5)' : ''
                      }}
                    >
                      <span>{evtTime || '19:30'}</span>
                      <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
                    </div>

                    {showTimePicker && (
                      <>
                        <div 
                          onClick={() => setShowTimePicker(false)}
                          style={{ position: 'fixed', inset: 0, zIndex: 1504 }}
                        />
                        <div
                          className="custom-time-picker-panel"
                          style={{
                            position: 'fixed',
                            top: timeInputRef.current ? timeInputRef.current.getBoundingClientRect().bottom + window.scrollY + 6 : window.scrollY + 100,
                            left: timeInputRef.current ? timeInputRef.current.getBoundingClientRect().left + window.scrollX : window.scrollX + 100,
                            width: '180px',
                            height: '180px',
                            background: 'linear-gradient(160deg, rgba(38, 30, 64, 0.98) 0%, rgba(22, 16, 42, 0.99) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.16)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            display: 'flex',
                            zIndex: 1505,
                            overflow: 'hidden',
                            padding: '8px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '4px', borderRight: '1px solid rgba(255,255,255,0.08)' }} className="time-picker-column">
                            <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textAlign: 'center', color: '#fbbf24', paddingBottom: '4px', borderBottom: '1px dashed rgba(255,255,255,0.1)', marginBottom: '4px', position: 'sticky', top: 0, background: 'rgba(38, 30, 64, 0.98)' }}>GIỜ</div>
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => {
                              const [currentH, currentM] = (evtTime || '19:30').split(':');
                              const isSelected = currentH === h;
                              return (
                                <button
                                  key={h}
                                  type="button"
                                  onClick={() => setEvtTime(`${h}:${currentM || '30'}`)}
                                  style={{
                                    background: isSelected ? 'rgba(139, 92, 246, 0.35)' : 'transparent',
                                    border: isSelected ? '1px solid rgba(139, 92, 246, 0.6)' : 'none',
                                    borderRadius: '6px',
                                    padding: '6px 0',
                                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.65)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '12.5px',
                                    fontWeight: isSelected ? 700 : 400,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  className="time-picker-item"
                                >
                                  {h}
                                </button>
                              );
                            })}
                          </div>

                          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '4px' }} className="time-picker-column">
                            <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textAlign: 'center', color: '#fbbf24', paddingBottom: '4px', borderBottom: '1px dashed rgba(255,255,255,0.1)', marginBottom: '4px', position: 'sticky', top: 0, background: 'rgba(38, 30, 64, 0.98)' }}>PHÚT</div>
                            {Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')).map(m => {
                              const [currentH, currentM] = (evtTime || '19:30').split(':');
                              const isSelected = currentM === m;
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setEvtTime(`${currentH || '19'}:${m}`)}
                                  style={{
                                    background: isSelected ? 'rgba(139, 92, 246, 0.35)' : 'transparent',
                                    border: isSelected ? '1px solid rgba(139, 92, 246, 0.6)' : 'none',
                                    borderRadius: '6px',
                                    padding: '6px 0',
                                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.65)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '12.5px',
                                    fontWeight: isSelected ? 700 : 400,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  className="time-picker-item"
                                >
                                  {m}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="edm-input-group">
                  <label className="edm-input-label">Địa điểm *</label>
                  <input
                    type="text"
                    required
                    value={evtLocation}
                    onChange={(e) => setEvtLocation(e.target.value)}
                    placeholder="Tên sân khấu, địa chỉ..."
                    className="edm-input-field-new"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="edm-input-group" style={{ flex: 1 }}>
                    <label className="edm-input-label">Khoảng giá hiển thị *</label>
                    <input
                      type="text"
                      required
                      value={evtPriceRange}
                      onChange={(e) => setEvtPriceRange(e.target.value)}
                      placeholder="Ví dụ: 500k - 2.5M"
                      className="edm-input-field-new"
                    />
                  </div>
                  <div className="edm-input-group" style={{ flex: 1 }}>
                    <label className="edm-input-label">Badge nổi bật</label>
                    <input
                      type="text"
                      value={evtBadge}
                      onChange={(e) => setEvtBadge(e.target.value)}
                      placeholder="Ví dụ: HOT, LIVE"
                      className="edm-input-field-new"
                    />
                  </div>
                </div>

                <div className="edm-input-group">
                  <label className="edm-input-label">Ảnh sự kiện *</label>
                  {evtImage ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <div className="evt-img-preview" onClick={() => imgInputRef.current?.click()}>
                        <img src={evtImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', display: 'block' }} />
                        <div className="evt-img-overlay">
                          <ImagePlus size={16} />
                          <span>Đổi ảnh</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEvtImage('');
                          if (imgInputRef.current) imgInputRef.current.value = '';
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(239, 68, 68, 0.85)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          cursor: 'pointer',
                          zIndex: 10,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        title="Xóa ảnh"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="evt-img-picker"
                      onClick={() => imgInputRef.current?.click()}
                      disabled={isImgUploading}
                    >
                      {isImgUploading ? (
                        <>
                          <Loader size={20} className="evt-img-spin" />
                          <span>Đang upload lên Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus size={22} />
                          <span>Bấm để chọn ảnh từ máy</span>
                          <span style={{ fontSize: '11px', opacity: 0.5 }}>JPG · PNG · WEBP · tối đa 10MB</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="evt-zones-section">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                    <span className="evt-zones-title">CẤU HÌNH PHÂN KHU VÉ</span>
                    <button
                      type="button"
                      disabled={evtZones.length >= 3}
                      onClick={() => setEvtZones([...evtZones, normalizeOrganizerZones([{ name: 'Zone Mới', price: 100000, isStanding: false, availableTickets: 30 }])[0]])}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        color: '#fff',
                        background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: evtZones.length >= 3 ? 'not-allowed' : 'pointer',
                        opacity: evtZones.length >= 3 ? 0.5 : 1
                      }}
                    >
                      + THÊM PHÂN KHU
                    </button>
                  </div>
                  {evtZones.map((zone, idx) => (
                    <div key={idx} style={{display:'flex',flexDirection:'column',gap:'8px',padding:'12px',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'10px',background:'rgba(255,255,255,0.02)', position:'relative'}}>
                      {evtZones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEvtZones(evtZones.filter((_, i) => i !== idx))}
                          style={{
                            position:'absolute',
                            top:'6px',
                            right:'8px',
                            width:'22px',
                            height:'22px',
                            borderRadius:'6px',
                            background:'rgba(239,68,68,0.1)',
                            border:'1px solid rgba(239,68,68,0.2)',
                            color:'#f87171',
                            fontSize:'12px',
                            cursor:'pointer',
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center'
                          }}
                        >×</button>
                      )}
                      <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr 1fr',gap:'8px'}}>
                        <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tên Phân Khu</span>
                          <input type="text" value={zone.name} onChange={(e)=>setEvtZones(evtZones.map((z,i)=>i===idx?{...z,name:e.target.value}:z))} className="edm-input-field-new evt-zone-input" placeholder="VIP, GA..." />
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Giá Vé (VND)</span>
                          <input type="number" value={zone.price} onChange={(e)=>setEvtZones(evtZones.map((z,i)=>i===idx?{...z,price:Number(e.target.value)||0}:z))} className="edm-input-field-new evt-zone-input" placeholder="500000" />
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Loại Khu</span>
                          <select value={zone.isStanding?'standing':'seated'} onChange={(e)=>setEvtZones(normalizeOrganizerZones(evtZones.map((z,i)=>i===idx?{...z,isStanding:e.target.value==='standing'}:z)))} className="edm-input-field-new evt-zone-input">
                            <option value="seated">Ghế ngồi</option>
                            <option value="standing">Vé đứng GA</option>
                          </select>
                        </div>
                      </div>
                      {zone.isStanding ? (
                        <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Số Vé Đăng Ký</span>
                          <input type="number" value={zone.availableTickets} onChange={(e)=>setEvtZones(evtZones.map((z,i)=>i===idx?{...z,availableTickets:Number(e.target.value)||0}:z))} className="edm-input-field-new evt-zone-input" placeholder="200" />
                        </div>
                      ) : (
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
                          <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Số Hàng Ghế</span>
                            <input type="number" value={zone.rows||''} onChange={(e)=>setEvtZones(normalizeOrganizerZones(evtZones.map((z,i)=>i===idx?{...z,rows:Number(e.target.value)||0}:z)))} className="edm-input-field-new evt-zone-input" placeholder="3" />
                          </div>
                          <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ghế Mỗi Hàng</span>
                            <input type="number" value={zone.cols||''} onChange={(e)=>setEvtZones(normalizeOrganizerZones(evtZones.map((z,i)=>i===idx?{...z,cols:Number(e.target.value)||0}:z)))} className="edm-input-field-new evt-zone-input" placeholder="5" />
                          </div>
                          <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tổng Số Ghế</span>
                            <input type="number" value={zone.availableTickets||0} readOnly className="edm-input-field-new evt-zone-input" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, marginTop:'6px' }}>* Khu đứng chỉ nhập tổng số vé. Khu ghế ngồi tự tính tổng ghế bằng Số hàng × Ghế mỗi hàng. Giới hạn tối đa 3 phân khu.</span>
                </div>

                <button type="submit" disabled={isEvtSubmitting} className="edm-btn-action" style={{ marginTop: '6px' }}>
                  {isEvtSubmitting ? 'ĐANG GỬI YÊU CẦU...' : 'GỬI YÊU CẦU DUYỆT SỰ KIỆN'}
                </button>
              </form>
            </>}

            {modalType === 'my-events' && <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', zIndex: 2, position: 'relative' }}>
                <span className="vip-modal-subtitle">Ban Tổ Chức</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', letterSpacing: '0.12em', color: 'var(--brand-cyan)', opacity: 0.95, fontWeight: 700 }}>MY EVENTS</span>
              </div>

              <h3 className="edm-modal-glow-title" style={{ marginBottom: '8px' }}>Sự Kiện Của Tôi</h3>
              <p className="edm-modal-desc" style={{ marginBottom: '16px' }}>
                Danh sách các sự kiện do bạn tạo và trạng thái phê duyệt từ ban quản trị hệ thống.
              </p>

              <div className="wallet-tickets-container" style={{
                maxHeight: '560px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                padding: '8px 6px 8px 2px',
                zIndex: 2,
                position: 'relative'
              }}>
                {loadingMyEvents ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Đang tải danh sách sự kiện...</p>
                  </div>
                ) : myEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Bạn chưa tạo sự kiện nào.</p>
                  </div>
                ) : (
                  myEvents.map(event => {
                    let statusColor = '#fbbf24';
                    let statusText = 'Chờ duyệt';
                    if (event.status === 'approved') {
                      statusColor = '#10b981';
                      statusText = 'Đã duyệt';
                    } else if (event.status === 'rejected') {
                      statusColor = '#ef4444';
                      statusText = 'Từ chối';
                    }

                    return (
                      <div key={event.id} className="my-evt-card">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="my-evt-img"
                        />

                        <div className="my-evt-info">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: `${statusColor}1A`,
                              color: statusColor,
                              border: `1px solid ${statusColor}40`,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              fontSize: '8.5px',
                              letterSpacing: '0.04em'
                            }}>
                              {statusText}
                            </span>

                            <span style={{
                              fontSize: '9px',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--text-muted)'
                            }}>
                              {(event.id || '').toUpperCase()}
                            </span>
                          </div>

                          <h4 className="my-evt-title">
                            {event.title}
                          </h4>

                          <div className="my-evt-meta">
                            <Calendar size={12} style={{ opacity: 0.6 }} />
                            <span>{event.date} • {event.time}</span>
                          </div>
                          
                          <div className="my-evt-meta" style={{ opacity: 0.75 }}>
                            <MapPin size={12} style={{ opacity: 0.6 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.location}</span>
                          </div>

                          <div className="my-evt-price">Giá: {event.priceRange}</div>

                          <div className="my-evt-actions">
                            <button className="my-evt-btn my-evt-btn-view" onClick={() => startViewEvent(event)}>
                              <Eye size={11} />
                              <span>Chi tiết</span>
                            </button>
                            <button className="my-evt-btn my-evt-btn-edit" onClick={() => startEditEvent(event)}>
                              <Pencil size={10} />
                              <span>Sửa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>}

            {modalType === 'view-event-detail' && viewingEvent && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', zIndex: 2, position: 'relative' }}>
                  <span className="vip-modal-subtitle">Chi Tiết Sự Kiện</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', letterSpacing: '0.12em', color: 'var(--brand-cyan)', opacity: 0.95, fontWeight: 700 }}>EVENT DETAILS</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', zIndex: 2, position: 'relative' }}>
                  <button 
                    onClick={() => {
                      setModalType('my-events');
                      setViewingEvent(null);
                    }} 
                    style={{ background: 'none', border: 'none', color: 'var(--brand-cyan)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                  >
                    &larr; QUAY LẠI DANH SÁCH
                  </button>
                </div>

                <div className="wallet-tickets-container" style={{
                  maxHeight: '420px',
                  overflowY: 'auto',
                  paddingRight: '6px',
                  zIndex: 2,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <img src={viewingEvent.image} alt={viewingEvent.title} className="detail-hero-banner" />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: 'rgba(0, 242, 254, 0.1)',
                      color: 'var(--brand-cyan)',
                      border: '1px solid rgba(0, 242, 254, 0.25)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '9px',
                      letterSpacing: '0.05em'
                    }}>
                      {viewingEvent.category}
                    </span>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      ID: {(viewingEvent.id || '').toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-pearl)', margin: '8px 0', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                    {viewingEvent.title}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="detail-field-group">
                      <span className="detail-field-label">Thời gian</span>
                      <span className="detail-field-value">{viewingEvent.date} • {viewingEvent.time}</span>
                    </div>
                    <div className="detail-field-group">
                      <span className="detail-field-label">Khoảng giá</span>
                      <span className="detail-field-value">{viewingEvent.priceRange}</span>
                    </div>
                  </div>

                  <div className="detail-field-group">
                    <span className="detail-field-label">Địa điểm tổ chức</span>
                    <span className="detail-field-value">{viewingEvent.location}</span>
                  </div>

                  {viewingEvent.description && (
                    <div className="detail-field-group">
                      <span className="detail-field-label">Mô tả sự kiện</span>
                      <span className="detail-field-value" style={{ fontWeight: 400, opacity: 0.85, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {viewingEvent.description}
                      </span>
                    </div>
                  )}

                  {viewingEvent.zones && viewingEvent.zones.length > 0 && (
                    <div className="detail-field-group">
                      <span className="detail-field-label">Hạng vé cấu hình</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                        {viewingEvent.zones.map((zone, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '4px', borderBottom: idx < viewingEvent.zones.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                            <span style={{ fontWeight: 700, color: 'var(--brand-pearl)' }}>{zone.name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {zone.price.toLocaleString('vi-VN')} đ • <span style={{ color: 'var(--brand-cyan)' }}>{zone.availableTickets} vé</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                 </div>

                <button 
                  onClick={() => startEditEvent(viewingEvent)} 
                  className="edm-btn-action" 
                  style={{ marginTop: '14px', zIndex: 10, position: 'relative' }}
                >
                  CHỈNH SỬA SỰ KIỆN NÀY
                </button>
              </>)}

            {modalType === 'tickets' && !currentUser && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', zIndex: 2, position: 'relative' }}>
                  <span className="vip-modal-subtitle">VIP Member Portal</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', letterSpacing: '0.12em', color: '#fbbf24', opacity: 0.95, fontWeight: 700 }}>MEMBERSHIP ACCESS</span>
                </div>

                <h3 className="edm-modal-glow-title">Vé Của Tôi</h3>
                <p className="edm-modal-desc">Truy cập cổng thông tin VIP để kiểm tra lịch sử đặt vé, các vé đang ký gửi giao dịch và sự kiện sắp diễn ra của bạn.</p>

                <button onClick={() => setModalType('login')} className="edm-btn-action">
                  ĐĂNG NHẬP HỆ THỐNG &nbsp; ⟶
                </button>
              </>
            )}

            {modalType === 'tickets' && currentUser && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', zIndex: 2, position: 'relative' }}>
                  <span className="vip-modal-subtitle">Ví Vé Thành Viên</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', letterSpacing: '0.12em', color: 'var(--brand-cyan)', opacity: 0.95, fontWeight: 700 }}>TICKET WALLET</span>
                </div>

                <h3 className="edm-modal-glow-title" style={{ marginBottom: '8px' }}>Vé Của Bạn</h3>
                <p className="edm-modal-desc" style={{ marginBottom: '16px' }}>
                  Xin chào <strong>{currentUser.fullName}</strong>. Dưới đây là danh sách vé bạn đang sở hữu. Bạn có thể check-in bằng mã QR hoặc ký gửi bán lại lên sàn chuyển nhượng.
                </p>

                <div className="wallet-tickets-container" style={{
                  maxHeight: '340px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  padding: '8px 6px 8px 2px',
                  zIndex: 2,
                  position: 'relative'
                }}>
                  {userTickets.filter(t => t.userId === currentUser.id).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Bạn chưa sở hữu tấm vé nào. Hãy đặt vé ngay trên trang chủ!</p>
                    </div>
                  ) : (
                    userTickets.filter(t => t.userId === currentUser.id).map(ticket => {
                      const isReselling = ticket.status === 'reselling';
                      return (
                        <div
                          key={ticket.id}
                          className="wallet-ticket-item"
                          style={{
                            background: 'linear-gradient(135deg, rgba(25, 20, 45, 0.6) 0%, rgba(12, 10, 20, 0.8) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            gap: '14px',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div className="auth-holographic-sheen" style={{ opacity: 0.15 }}></div>

                          <img
                            src={ticket.image}
                            alt={ticket.eventTitle}
                            style={{ width: '70px', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}
                          />

                          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: ticket.purchaseType === 'resale' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                                color: ticket.purchaseType === 'resale' ? 'var(--brand-cyan)' : 'oklch(70% 0.18 300)',
                                border: `1px solid ${ticket.purchaseType === 'resale' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(139, 92, 246, 0.25)'}`,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                fontSize: '8.5px',
                                letterSpacing: '0.04em'
                              }}>
                                {ticket.purchaseType === 'resale' ? 'MUA LẠI' : 'MUA GỐC'}
                              </span>

                              <span style={{
                                fontSize: '9px',
                                fontFamily: 'var(--font-mono)',
                                color: isReselling ? 'oklch(75% 0.14 70)' : 'var(--text-muted)'
                              }}>
                                {isReselling ? 'ĐANG RAO BÁN' : ticket.id.toUpperCase()}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '6px 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }}>
                              {ticket.eventTitle}
                            </h4>

                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>
                              {ticket.zoneName} {ticket.seatNumber ? `• Ghế ${ticket.seatNumber}` : ''}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                              <span style={{ fontSize: '11px', color: theme === 'light' ? 'var(--brand-pearl)' : '#fff', fontWeight: 600 }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticket.price)}
                              </span>

                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => {
                                    setActiveQrTicket(ticket);
                                  }}
                                  style={{
                                    background: theme === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255,255,255,0.04)',
                                    border: theme === 'light' ? '1px solid rgba(15, 23, 42, 0.08)' : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    color: theme === 'light' ? 'var(--text-secondary)' : '#fff',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-mono)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = theme === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.color = theme === 'light' ? 'var(--brand-pearl)' : '#fff';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = theme === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255,255,255,0.04)';
                                    e.currentTarget.style.color = theme === 'light' ? 'var(--text-secondary)' : '#fff';
                                  }}
                                >
                                  QR CODE
                                </button>

                                {!isReselling && (
                                  <button
                                    onClick={() => handleSellBackClick(ticket)}
                                    style={{
                                      background: 'rgba(245, 158, 11, 0.1)',
                                      border: '1px solid rgba(245, 158, 11, 0.25)',
                                      borderRadius: '6px',
                                      padding: '4px 10px',
                                      color: theme === 'light' ? 'oklch(45% 0.14 70)' : 'oklch(75% 0.14 70)',
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      fontFamily: 'var(--font-mono)',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.18)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'; }}
                                  >
                                    BÁN LẠI
                                  </button>
                                )}
                                {isReselling && (
                                  <button
                                    onClick={() => handleCancelResale(ticket)}
                                    style={{
                                      background: 'rgba(239, 68, 68, 0.1)',
                                      border: '1px solid rgba(239, 68, 68, 0.25)',
                                      borderRadius: '6px',
                                      padding: '4px 10px',
                                      color: 'oklch(68% 0.18 25)',
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      fontFamily: 'var(--font-mono)',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                                  >
                                    THU HỒI
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {modalType === 'login' && (
              <div className="auth-tickets-stack">
                <div className="auth-ticket-dummy dummy-left"></div>
                <div className="auth-ticket-dummy dummy-right"></div>

                <div
                  onClick={() => { if (isSignUp) { setIsSignUp(false); setAuthDirection('to-login'); } }}
                  className={`auth-ticket-card signin ${!isSignUp
                      ? 'active-front'
                      : (authDirection === 'to-signup' ? 'shuffling-left' : 'inactive-back-left')
                    }`}
                >
                  <div className="auth-ticket-reflection"></div>
                  <div className="auth-holographic-sheen"></div>

                  <button onClick={(e) => { e.stopPropagation(); setModalType(null); }} className="edm-modal-close-btn" style={{ zIndex: 30, top: '18px', right: '18px' }}>
                    <X size={13} />
                  </button>

                  <div className="auth-ticket-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{ width: '22px', height: '22px', background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(109,40,217,0.10) 100%)', border: '1px solid rgba(139,92,246,0.32)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Ticket size={12} color="rgba(139,92,246,0.9)" />
                        </div>
                        <span className="vip-modal-subtitle" style={{ fontSize: '9.5px', opacity: 1, fontWeight: 700 }}>AuraPass Member</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', letterSpacing: '0.12em', color: '#fbbf24', opacity: 0.95, fontWeight: 700 }}>MEMBER ACCESS</span>
                    </div>
                    <h3 className="auth-form-main-title">Đăng Nhập</h3>
                    <p className="edm-modal-desc" style={{ marginBottom: '12px' }}>
                      Tiếp tục hành trình khám phá sự kiện và nghệ thuật của bạn.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                      <div className="auth-line-input-group" style={{ marginBottom: 0 }}>
                        <input
                          type="text"
                          required
                          placeholder=" "
                          className="auth-line-input"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                        />
                        <label className="auth-line-label">Email hoặc Username</label>
                        <span className="auth-line-icon"><Mail size={13} /></span>
                      </div>

                      <div className="auth-line-input-group" style={{ marginBottom: 0 }}>
                        <input
                          type="password"
                          required
                          placeholder=" "
                          className="auth-line-input"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                        />
                        <label className="auth-line-label">Mật khẩu</label>
                        <span className="auth-line-icon"><Lock size={13} /></span>
                      </div>

                      <label className="auth-remember-row">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="auth-remember-checkbox"
                        />
                        <span className="auth-remember-label">Ghi nhớ đăng nhập</span>
                      </label>
                    </div>

                    <button type="submit" onClick={handleLoginSubmit} className="edm-btn-action" style={{ marginTop: '4px' }}>
                      ĐĂNG NHẬP HỆ THỐNG &nbsp; ⟶
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '11.5px', color: 'var(--text-muted)' }} className="mobile-only-toggle">
                      Chưa có tài khoản? <span onClick={(e) => { e.stopPropagation(); setIsSignUp(true); setAuthDirection('to-signup'); }} style={{ color: 'var(--brand-cyan)', cursor: 'pointer', fontWeight: 600 }}>ĐĂNG KÝ NGAY</span>
                    </p>
                  </div>

                  <div className="auth-ticket-divider">
                    <div className="auth-ticket-divider-line"></div>
                    <div className="auth-ticket-notch notch-top"></div>
                    <div className="auth-ticket-notch notch-bottom"></div>
                  </div>

                  <div className="auth-ticket-stub">
                    <div className="auth-stub-sparkle" aria-hidden="true">✦</div>
                    <div className="auth-stub-bg-text">PREMIERE PASS • CONCERT ACCESS</div>

                    <div className="auth-stub-circle-stamp">
                      <span className="auth-stub-stamp-text-top">AURAPASS</span>
                      <span className="auth-stub-stamp-text-middle">VIP</span>
                      <span className="auth-stub-stamp-text-bottom">✦ GUEST ✦</span>
                    </div>

                    <div className="auth-stub-meta-details">
                      <div className="auth-stub-meta-item">
                        <span className="auth-stub-meta-label">PASS</span>
                        <span className="auth-stub-meta-value">PREMIERE</span>
                      </div>
                      <div className="auth-stub-meta-item">
                        <span className="auth-stub-meta-label">ACCESS</span>
                        <span className="auth-stub-meta-value">VIP ACCESS</span>
                      </div>
                      <div className="auth-stub-meta-item">
                        <span className="auth-stub-meta-label">GATE</span>
                        <span className="auth-stub-meta-value">STAGE</span>
                      </div>
                    </div>

                    <div className="auth-stub-barcode-section">
                      <div className="auth-stub-barcode-container">
                        <div className="auth-stub-barcode-hologram" />
                        <svg className="auth-stub-barcode" viewBox="0 0 100 40" fill="currentColor">
                          <rect x="0" y="0" width="3" height="40" />
                          <rect x="5" y="0" width="1" height="40" />
                          <rect x="8" y="0" width="2" height="40" />
                          <rect x="12" y="0" width="4" height="40" />
                          <rect x="18" y="0" width="1" height="40" />
                          <rect x="20" y="0" width="3" height="40" />
                          <rect x="25" y="0" width="2" height="40" />
                          <rect x="29" y="0" width="1" height="40" />
                          <rect x="32" y="0" width="4" height="40" />
                          <rect x="38" y="0" width="2" height="40" />
                          <rect x="42" y="0" width="1" height="40" />
                          <rect x="45" y="0" width="3" height="40" />
                          <rect x="50" y="0" width="4" height="40" />
                          <rect x="56" y="0" width="1" height="40" />
                          <rect x="59" y="0" width="2" height="40" />
                          <rect x="63" y="0" width="3" height="40" />
                          <rect x="68" y="0" width="1" height="40" />
                          <rect x="71" y="0" width="4" height="40" />
                          <rect x="77" y="0" width="2" height="40" />
                          <rect x="81" y="0" width="1" height="40" />
                          <rect x="84" y="0" width="3" height="40" />
                          <rect x="89" y="0" width="1" height="40" />
                          <rect x="92" y="0" width="2" height="40" />
                          <rect x="96" y="0" width="4" height="40" />
                        </svg>
                      </div>
                      <div className="auth-stub-code">AUTH-098827-VIP</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setIsSignUp(true); setAuthDirection('to-signup'); }}
                      className="auth-stub-toggle-btn"
                    >
                      TẠO TÀI KHOẢN &nbsp; ⟶
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => { if (!isSignUp) { setIsSignUp(true); setAuthDirection('to-signup'); } }}
                  className={`auth-ticket-card signup ${isSignUp
                      ? 'active-front'
                      : (authDirection === 'to-login' ? 'shuffling-right' : 'inactive-back-right')
                    }`}
                >
                  <div className="auth-ticket-reflection"></div>
                  <div className="auth-holographic-sheen"></div>

                  <button onClick={(e) => { e.stopPropagation(); setModalType(null); }} className="edm-modal-close-btn" style={{ zIndex: 30, top: '18px', right: '18px' }}>
                    <X size={13} />
                  </button>

                  <div className="auth-ticket-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{ width: '22px', height: '22px', background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(109,40,217,0.10) 100%)', border: '1px solid rgba(139,92,246,0.32)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Ticket size={12} color="rgba(139,92,246,0.9)" />
                        </div>
                        <span className="vip-modal-subtitle" style={{ fontSize: '9.5px', opacity: 1, fontWeight: 700 }}>Tham gia AuraPass</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', letterSpacing: '0.12em', color: '#fbbf24', opacity: 0.95, fontWeight: 700 }}>MEMBER AREA</span>
                    </div>
                    <h3 className="auth-form-main-title">Đăng Ký</h3>
                    <p className="edm-modal-desc" style={{ marginBottom: '12px' }}>
                      Khám phá sự kiện độc quyền, nhận ưu đãi và lưu trữ vé điện tử.
                    </p>

                    <div style={{ height: '142px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div className="auth-line-input-group" style={{ marginBottom: 0 }}>
                        <input
                          type="text"
                          required
                          placeholder=" "
                          className="auth-line-input"
                          value={signUpName}
                          onChange={e => setSignUpName(e.target.value)}
                        />
                        <label className="auth-line-label">Họ và Tên</label>
                        <span className="auth-line-icon"><User size={13} /></span>
                      </div>

                      <div className="auth-line-input-group" style={{ marginBottom: 0 }}>
                        <input
                          type="email"
                          required
                          placeholder=" "
                          className="auth-line-input"
                          value={signUpEmail}
                          onChange={e => setSignUpEmail(e.target.value)}
                        />
                        <label className="auth-line-label">Email liên hệ</label>
                        <span className="auth-line-icon"><Mail size={13} /></span>
                      </div>

                      <div className="auth-line-input-group" style={{ marginBottom: 0 }}>
                        <input
                          type="password"
                          required
                          placeholder=" "
                          className="auth-line-input"
                          value={signUpPassword}
                          onChange={e => setSignUpPassword(e.target.value)}
                        />
                        <label className="auth-line-label">Mật khẩu</label>
                        <span className="auth-line-icon"><Lock size={13} /></span>
                      </div>
                    </div>

                    <button type="submit" onClick={handleSignUpSubmit} className="edm-btn-action" style={{ marginTop: '6px' }}>
                      KÍCH HOẠT TÀI KHOẢN &nbsp; ⟶
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '11.5px', color: 'var(--text-muted)' }} className="mobile-only-toggle">
                      Đã có tài khoản? <span onClick={(e) => { e.stopPropagation(); setIsSignUp(false); setAuthDirection('to-login'); }} style={{ color: 'var(--brand-cyan)', cursor: 'pointer', fontWeight: 600 }}>ĐĂNG NHẬP NGAY</span>
                    </p>
                  </div>

                  <div className="auth-ticket-divider">
                    <div className="auth-ticket-divider-line"></div>
                    <div className="auth-ticket-notch notch-top"></div>
                    <div className="auth-ticket-notch notch-bottom"></div>
                  </div>

                  <div className="auth-ticket-stub">
                    <div className="auth-stub-sparkle" aria-hidden="true">✦</div>
                    <div className="auth-stub-bg-text">EVENT MEMBER • BACKSTAGE ACCESS</div>

                    <div className="auth-stub-circle-stamp">
                      <span className="auth-stub-stamp-text-top">AURAPASS</span>
                      <span className="auth-stub-stamp-text-middle">VIP</span>
                      <span className="auth-stub-stamp-text-bottom">✦ ACCESS ✦</span>
                    </div>

                    <div className="auth-stub-meta-details">
                      <div className="auth-stub-meta-item">
                        <span className="auth-stub-meta-label">PASS</span>
                        <span className="auth-stub-meta-value">REGISTER</span>
                      </div>
                      <div className="auth-stub-meta-item">
                        <span className="auth-stub-meta-label">ACCESS</span>
                        <span className="auth-stub-meta-value">FULL ACCESS</span>
                      </div>
                      <div className="auth-stub-meta-item">
                        <span className="auth-stub-meta-label">GATE</span>
                        <span className="auth-stub-meta-value">MEMBER</span>
                      </div>
                    </div>

                    <div className="auth-stub-barcode-section">
                      <div className="auth-stub-barcode-container">
                        <div className="auth-stub-barcode-hologram" />
                        <svg className="auth-stub-barcode" viewBox="0 0 100 40" fill="currentColor">
                          <rect x="0" y="0" width="2" height="40" />
                          <rect x="4" y="0" width="4" height="40" />
                          <rect x="10" y="0" width="1" height="40" />
                          <rect x="13" y="0" width="2" height="40" />
                          <rect x="17" y="0" width="3" height="40" />
                          <rect x="22" y="0" width="1" height="40" />
                          <rect x="25" y="0" width="4" height="40" />
                          <rect x="31" y="0" width="2" height="40" />
                          <rect x="35" y="0" width="1" height="40" />
                          <rect x="38" y="0" width="3" height="40" />
                          <rect x="43" y="0" width="2" height="40" />
                          <rect x="47" y="0" width="1" height="40" />
                          <rect x="50" y="0" width="4" height="40" />
                          <rect x="56" y="0" width="1" height="40" />
                          <rect x="59" y="0" width="3" height="40" />
                          <rect x="64" y="0" width="2" height="40" />
                          <rect x="68" y="0" width="1" height="40" />
                          <rect x="71" y="0" width="4" height="40" />
                          <rect x="77" y="0" width="2" height="40" />
                          <rect x="81" y="0" width="1" height="40" />
                          <rect x="84" y="0" width="3" height="40" />
                          <rect x="89" y="0" width="1" height="40" />
                          <rect x="92" y="0" width="4" height="40" />
                          <rect x="98" y="0" width="2" height="40" />
                        </svg>
                      </div>
                      <div className="auth-stub-code">REG-076124-VIP</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setIsSignUp(false); setAuthDirection('to-login'); }}
                      className="auth-stub-toggle-btn"
                    >
                      ĐĂNG NHẬP HỆ THỐNG &nbsp; ⟶
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {resaleTicketPending && (
        <div
          className="modal-overlay-scrollable"
          onClick={(e) => { if (e.target === e.currentTarget) { setResaleTicketPending(null); setResalePriceInput(''); } }}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: theme === 'light' ? 'rgba(226, 232, 240, 0.75)' : 'rgba(5, 4, 10, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div className="resale-price-modal-card" style={{
            width: '92%',
            maxWidth: '460px',
            background: theme === 'light' 
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(245, 247, 250, 0.98) 100%)' 
              : 'linear-gradient(160deg, rgba(38, 30, 64, 0.98) 0%, rgba(22, 16, 42, 0.99) 100%)',
            border: theme === 'light' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '20px',
            padding: '36px 36px 30px 36px',
            boxShadow: theme === 'light' 
              ? '0 20px 48px rgba(15, 23, 42, 0.08), 0 0 30px rgba(245, 158, 11, 0.02)' 
              : '0 30px 80px rgba(0,0,0,0.95), 0 0 50px rgba(245,158,11,0.06), inset 0 1px 1.5px rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 60% 50% at 80% 0%, rgba(245,158,11,0.04) 0%, transparent 70%)',
              borderRadius: 'inherit'
            }} />

            <button
              onClick={() => { setResaleTicketPending(null); setResalePriceInput(''); }}
              style={{
                position: 'absolute', top: '18px', right: '18px',
                background: theme === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255,255,255,0.04)',
                border: theme === 'light' ? '1px solid rgba(15, 23, 42, 0.06)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '50%',
                width: '30px', height: '30px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s ease',
                zIndex: 10
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.background = theme === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255,255,255,0.1)'; 
                e.currentTarget.style.color = theme === 'light' ? 'var(--brand-pearl)' : '#fff'; 
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.background = theme === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255,255,255,0.04)'; 
                e.currentTarget.style.color = 'var(--text-muted)'; 
              }}
            >
              <X size={13} />
            </button>

            <div style={{ zIndex: 2, position: 'relative' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '8.5px',
                letterSpacing: '0.14em', color: theme === 'light' ? 'oklch(45% 0.14 70)' : 'oklch(75% 0.14 70)',
                fontWeight: 700, textTransform: 'uppercase', opacity: 0.9,
                display: 'block', marginBottom: '6px'
              }}>
                ✦ KÝ GỬI VÉ · TICKET RESALE
              </span>

              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: '22px',
                fontWeight: 800, color: theme === 'light' ? 'var(--brand-pearl)' : '#fff',
                margin: '0 0 6px 0',
                textShadow: theme === 'light' ? 'none' : '0 0 20px rgba(245,158,11,0.25)'
              }}>
                Nhập Giá Bán Lại
              </h3>

              <p style={{ fontSize: '12.5px', color: theme === 'light' ? 'var(--text-secondary)' : 'var(--text-muted)', margin: '0 0 22px 0', lineHeight: 1.6 }}>
                Vé: <strong style={{ color: theme === 'light' ? 'var(--brand-pearl)' : '#fff' }}>{resaleTicketPending.eventTitle}</strong>
                {resaleTicketPending.seatNumber && <> · Ghế <strong style={{ color: theme === 'light' ? 'var(--brand-pearl)' : '#fff' }}>{resaleTicketPending.seatNumber}</strong></>}
                <br />
                Giá gốc: <strong style={{ color: theme === 'light' ? 'oklch(50% 0.22 300)' : 'oklch(70% 0.18 300)' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(resaleTicketPending.price)}
                </strong>
              </p>

              <div style={{ marginBottom: '8px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: 600,
                  color: theme === 'light' ? 'oklch(45% 0.14 70)' : 'oklch(75% 0.14 70)', fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  marginBottom: '10px'
                }}>
                  Giá Bán Lại (VNĐ)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    value={resalePriceInput}
                    onChange={e => setResalePriceInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleConfirmResale(); }}
                    autoFocus
                    style={{
                      width: '100%',
                      height: '48px',
                      background: theme === 'light' ? 'rgba(15, 23, 42, 0.02)' : 'rgba(255,255,255,0.04)',
                      border: theme === 'light' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(245, 158, 11, 0.35)',
                      borderRadius: '10px',
                      padding: '0 16px',
                      color: theme === 'light' ? 'var(--brand-pearl)' : '#fff',
                      fontSize: '18px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      transition: 'all 0.25s ease',
                      boxSizing: 'border-box',
                      boxShadow: '0 0 0 0 rgba(245,158,11,0)'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'rgba(245,158,11,0.7)';
                      e.currentTarget.style.background = theme === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = theme === 'light' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245,158,11,0.35)';
                      e.currentTarget.style.background = theme === 'light' ? 'rgba(15, 23, 42, 0.02)' : 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.boxShadow = '0 0 0 0 rgba(245,158,11,0)';
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {[1.0, 0.9, 0.85, 0.75].map(ratio => {
                    const quickPrice = Math.round(resaleTicketPending.price * ratio);
                    const label = ratio === 1.0 ? 'Giá gốc' : ratio === 0.85 ? 'Gợi ý (−15%)' : ratio === 0.9 ? '−10%' : '−25%';
                    const isSelected = String(quickPrice) === String(resalePriceInput);
                    return (
                      <button
                        key={ratio}
                        onClick={() => setResalePriceInput(String(quickPrice))}
                        style={{
                          background: isSelected 
                            ? 'rgba(245,158,11,0.18)' 
                            : (theme === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255,255,255,0.04)'),
                          border: isSelected 
                            ? '1px solid rgba(245,158,11,0.45)' 
                            : (theme === 'light' ? '1px solid rgba(15, 23, 42, 0.08)' : '1px solid rgba(255,255,255,0.08)'),
                          borderRadius: '6px',
                          padding: '5px 10px',
                          color: isSelected 
                            ? (theme === 'light' ? 'oklch(45% 0.14 70)' : 'oklch(75% 0.14 70)') 
                            : (theme === 'light' ? 'var(--text-secondary)' : 'var(--text-muted)'),
                          fontSize: '10px',
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          letterSpacing: '0.02em'
                        }}
                      >
                        {label}<br />
                        <span style={{ fontSize: '9px', opacity: 0.8 }}>
                          {new Intl.NumberFormat('vi-VN').format(quickPrice)}đ
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => { setResaleTicketPending(null); setResalePriceInput(''); }}
                  style={{
                    flex: 1, height: '44px',
                    background: theme === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255,255,255,0.04)',
                    border: theme === 'light' ? '1px solid rgba(15, 23, 42, 0.08)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: theme === 'light' ? 'var(--text-secondary)' : 'var(--text-muted)',
                    fontSize: '12px', fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    letterSpacing: '0.04em'
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.background = theme === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255,255,255,0.08)'; 
                    e.currentTarget.style.color = theme === 'light' ? 'var(--brand-pearl)' : '#fff'; 
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.background = theme === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255,255,255,0.04)'; 
                    e.currentTarget.style.color = theme === 'light' ? 'var(--text-secondary)' : 'var(--text-muted)'; 
                  }}
                >
                  HỦY
                </button>

                <button
                  onClick={handleConfirmResale}
                  disabled={isResaleSubmitting}
                  style={{
                    flex: 2, height: '44px',
                    background: isResaleSubmitting
                      ? 'rgba(245,158,11,0.3)'
                      : 'linear-gradient(135deg, rgba(245,158,11,0.85) 0%, rgba(234,130,0,0.9) 100%)',
                    border: '1px solid rgba(245,158,11,0.5)',
                    borderRadius: '10px',
                    color: '#0a0705',
                    fontSize: '12px', fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    cursor: isResaleSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.25s ease',
                    letterSpacing: '0.06em',
                    boxShadow: isResaleSubmitting ? 'none' : (theme === 'light' ? '0 4px 12px rgba(245,158,11,0.2)' : '0 4px 20px rgba(245,158,11,0.3)')
                  }}
                  onMouseEnter={e => { 
                    if (!isResaleSubmitting) { 
                      e.currentTarget.style.transform = 'translateY(-1px)'; 
                      e.currentTarget.style.boxShadow = theme === 'light' ? '0 6px 18px rgba(245,158,11,0.35)' : '0 6px 28px rgba(245,158,11,0.45)'; 
                    } 
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.transform = 'translateY(0)'; 
                    e.currentTarget.style.boxShadow = isResaleSubmitting ? 'none' : (theme === 'light' ? '0 4px 12px rgba(245,158,11,0.2)' : '0 4px 20px rgba(245,158,11,0.3)'); 
                  }}
                >
                  {isResaleSubmitting ? 'ĐANG ĐĂNG...' : '✦ ĐĂNG BÁN NGAY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeQrTicket && (() => {
        const qrData = JSON.stringify({
          ticketId: activeQrTicket.id,
          eventTitle: activeQrTicket.eventTitle,
          zone: activeQrTicket.zoneName,
          seat: activeQrTicket.seatNumber || 'GA'
        });
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=0b0b0f&bgcolor=ffffff&data=${encodeURIComponent(qrData)}`;

        return (
          <div
            className="modal-overlay-scrollable"
            onClick={(e) => { if (e.target === e.currentTarget) setActiveQrTicket(null); }}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: theme === 'light' ? 'rgba(226, 232, 240, 0.75)' : 'rgba(5, 4, 10, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              zIndex: 2100,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div className="resale-price-modal-card" style={{
              width: '92%',
              maxWidth: '420px',
              background: theme === 'light' 
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(245, 247, 250, 0.98) 100%)' 
                : 'linear-gradient(160deg, rgba(38, 30, 64, 0.98) 0%, rgba(22, 16, 42, 0.99) 100%)',
              border: theme === 'light' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '36px 32px 32px 32px',
              boxShadow: theme === 'light' 
                ? '0 20px 48px rgba(15, 23, 42, 0.08)' 
                : '0 30px 80px rgba(0,0,0,0.95)',
              position: 'relative',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              <button
                onClick={() => setActiveQrTicket(null)}
                style={{
                  position: 'absolute', top: '18px', right: '18px',
                  background: theme === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255,255,255,0.04)',
                  border: theme === 'light' ? '1px solid rgba(15, 23, 42, 0.06)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '50%',
                  width: '30px', height: '30px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s ease',
                  zIndex: 10
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = theme === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255,255,255,0.1)'; 
                  e.currentTarget.style.color = theme === 'light' ? 'var(--brand-pearl)' : '#fff'; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = theme === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255,255,255,0.04)'; 
                  e.currentTarget.style.color = 'var(--text-muted)'; 
                }}
              >
                <X size={13} />
              </button>

              <div style={{ width: '100%' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '8.5px',
                  letterSpacing: '0.14em', color: 'var(--brand-cyan)',
                  fontWeight: 700, textTransform: 'uppercase',
                  display: 'block', marginBottom: '6px'
                }}>
                  ✦ Vé Điện Tử · E-Ticket
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: '20px',
                  fontWeight: 800, color: theme === 'light' ? 'var(--brand-pearl)' : '#fff',
                  margin: 0
                }}>
                  Mã Check-in Vé
                </h3>
              </div>

              {/* QR Image Frame */}
              <div style={{
                padding: '16px',
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: theme === 'light' ? '0 10px 30px rgba(15,23,42,0.06)' : '0 12px 36px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <img 
                  src={qrCodeUrl} 
                  alt="Check-in QR" 
                  style={{ width: '180px', height: '180px' }}
                />
                <span style={{ 
                  fontSize: '9.5px', 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 700, 
                  color: '#0b0b0f', 
                  borderTop: '1px dashed #ddd', 
                  width: '100%', 
                  textAlign: 'center', 
                  paddingTop: '6px', 
                  letterSpacing: '0.08em' 
                }}>
                  {activeQrTicket.id.toUpperCase()}
                </span>
              </div>

              {/* Ticket Details */}
              <div style={{
                width: '100%',
                backgroundColor: theme === 'light' ? 'rgba(15, 23, 42, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                border: theme === 'light' ? '1px solid rgba(15, 23, 42, 0.06)' : '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sự kiện:</span>
                  <span style={{ fontWeight: 700, color: theme === 'light' ? 'var(--brand-pearl)' : '#fff', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeQrTicket.eventTitle}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Khu vực:</span>
                  <span style={{ fontWeight: 600, color: theme === 'light' ? 'var(--brand-pearl)' : '#fff' }}>
                    {activeQrTicket.zoneName}
                  </span>
                </div>
                {activeQrTicket.seatNumber && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Vị trí ghế:</span>
                    <span style={{ fontWeight: 700, color: 'var(--brand-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {activeQrTicket.seatNumber}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveQrTicket(null)}
                style={{
                  width: '100%', height: '44px',
                  background: 'linear-gradient(135deg, var(--brand-violet) 0%, oklch(48% 0.25 300) 100%)',
                  border: '1px solid rgba(167, 139, 250, 0.25)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13px', fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, oklch(60% 0.25 300) 0%, var(--brand-cyan) 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(6, 182, 212, 0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--brand-violet) 0%, oklch(48% 0.25 300) 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)';
                }}
              >
                XÁC NHẬN
              </button>
            </div>
          </div>
        );
      })()}

      {/* Hamburger Drawer — mobile/tablet menu */}
      {isMenuOpen && (
        <>
          <div className="hamburger-overlay" onClick={() => setIsMenuOpen(false)} />
          <div className="hamburger-drawer">
            {/* Close button */}
            <button className="hamburger-drawer-close" onClick={() => setIsMenuOpen(false)} aria-label="Đóng menu">
              <X size={18} />
            </button>

            {/* Brand */}
            <div className="hamburger-drawer-brand">AuraPass</div>

            <div className="hamburger-drawer-divider" />

            {/* Nav links */}
            <nav className="hamburger-drawer-nav">
              {[
                { key: 'events', label: 'Sự kiện' },
                { key: 'resale', label: 'Chợ vé' },
                { key: 'artists', label: 'Nghệ sĩ' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`hamburger-drawer-nav-item${activeSection === key ? ' active' : ''}`}
                  onClick={() => { onSectionClick?.(key); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  {activeSection === key && <span className="hamburger-drawer-active-dot" />}
                  {label}
                </button>
              ))}
            </nav>

            <div className="hamburger-drawer-divider" />

            {/* Actions */}
            <div className="hamburger-drawer-actions">
              {currentUser && (currentUser.role === 'organizer' || currentUser.role === 'admin') && (
                <button
                  className="hamburger-drawer-action-btn primary"
                  onClick={() => { setModalType('create'); setIsMenuOpen(false); }}
                >
                  <Plus size={14} />
                  Tạo sự kiện
                </button>
              )}
              {currentUser && currentUser.role === 'organizer' && (
                <button
                  className="hamburger-drawer-action-btn"
                  onClick={() => { setModalType('my-events'); setIsMenuOpen(false); }}
                >
                  <Calendar size={14} />
                  Sự kiện của tôi
                </button>
              )}
              {currentUser ? (
                <button
                  className="hamburger-drawer-action-btn"
                  onClick={() => { setModalType('tickets'); setIsMenuOpen(false); }}
                >
                  <Ticket size={14} />
                  Vé của tôi
                </button>
              ) : (
                <button
                  className="hamburger-drawer-action-btn"
                  onClick={() => { setModalType('login'); setIsSignUp(false); setIsMenuOpen(false); }}
                >
                  Đăng nhập / Đăng ký
                </button>
              )}
            </div>

            {/* Language */}
            <div className="hamburger-drawer-lang">
              {['VI', 'EN'].map(lang => (
                <button
                  key={lang}
                  className={`hamburger-drawer-lang-btn${selectedLang === lang ? ' active' : ''}`}
                  onClick={() => setSelectedLang(lang)}
                >
                  {lang === 'VI' ? '🇻🇳 VI' : '🇬🇧 EN'}
                </button>
              ))}
            </div>

            {/* User info + logout */}
            {currentUser && (
              <>
                <div className="hamburger-drawer-divider" />
                <div className="hamburger-drawer-user">
                  <span className="hamburger-drawer-username">
                    {currentUser.fullName} {currentUser.role === 'organizer' && '(BTC)'} {currentUser.role === 'admin' && '(ADMIN)'}
                  </span>
                  <button
                    className="hamburger-drawer-logout"
                    onClick={() => { setCurrentUser(null); setIsMenuOpen(false); }}
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Bottom Navigation Tab Bar cho Mobile */}
      <div className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <button
          onClick={() => {
            setModalType(null);
            onSectionClick?.('events');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`mobile-bottom-tab-btn${activeSection === 'events' && !modalType ? ' active' : ''}`}
          style={{
            background: 'none', border: 'none', color: activeSection === 'events' && !modalType ? 'oklch(70% 0.18 300)' : 'var(--text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500, transition: 'color 0.2s ease'
          }}
        >
          <Calendar size={20} style={{ filter: activeSection === 'events' && !modalType ? 'drop-shadow(0 0 5px oklch(70% 0.18 300 / 0.6))' : 'none', transition: 'all 0.3s ease' }} />
          <span>Sự kiện</span>
        </button>

        <button
          onClick={() => {
            setModalType(null);
            onSectionClick?.('resale');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`mobile-bottom-tab-btn${activeSection === 'resale' && !modalType ? ' active' : ''}`}
          style={{
            background: 'none', border: 'none', color: activeSection === 'resale' && !modalType ? 'oklch(68% 0.2 200)' : 'var(--text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500, transition: 'color 0.2s ease'
          }}
        >
          <ShoppingBag size={20} style={{ filter: activeSection === 'resale' && !modalType ? 'drop-shadow(0 0 5px oklch(68% 0.2 200 / 0.6))' : 'none', transition: 'all 0.3s ease' }} />
          <span>Chợ vé</span>
        </button>

        <button
          onClick={() => {
            setModalType(null);
            onSectionClick?.('artists');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`mobile-bottom-tab-btn${activeSection === 'artists' && !modalType ? ' active' : ''}`}
          style={{
            background: 'none', border: 'none', color: activeSection === 'artists' && !modalType ? 'oklch(76% 0.15 85)' : 'var(--text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500, transition: 'color 0.2s ease'
          }}
        >
          <Users size={20} style={{ filter: activeSection === 'artists' && !modalType ? 'drop-shadow(0 0 5px oklch(76% 0.15 85 / 0.6))' : 'none', transition: 'all 0.3s ease' }} />
          <span>Nghệ sĩ</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              setModalType('tickets');
            } else {
              setModalType('login');
              setIsSignUp(false);
            }
          }}
          className={`mobile-bottom-tab-btn${modalType === 'tickets' || modalType === 'login' ? ' active' : ''}`}
          style={{
            background: 'none', border: 'none', color: modalType === 'tickets' || modalType === 'login' ? 'oklch(70% 0.18 300)' : 'var(--text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500, transition: 'color 0.2s ease'
          }}
        >
          <Ticket size={20} style={{ filter: modalType === 'tickets' || modalType === 'login' ? 'drop-shadow(0 0 5px oklch(70% 0.18 300 / 0.6))' : 'none', transition: 'all 0.3s ease' }} />
          <span>{currentUser ? 'Ví vé' : 'Đăng nhập'}</span>
        </button>
      </div>
    </>
  );
}
