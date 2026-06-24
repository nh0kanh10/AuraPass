import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft, User, Lock, Ticket, BarChart2, Plus, X, Edit2,
  ImagePlus, Loader, Trash2, DollarSign, Calendar, CheckCircle,
  Clock, ChevronDown, QrCode, Video, ExternalLink, KeyRound
} from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const seatCalc = (n) => { const t = Math.max(1, Number(n) || 0), c = Math.min(t, 10); return { rows: Math.ceil(t / c), cols: c }; };

const normalizeZones = (zones = []) => zones.map((z, i) => {
  const b = { ...z, name: z.name || (i === 0 ? 'GA' : `Zone ${i + 1}`), price: Number(z.price) || 0, availableTickets: Number(z.availableTickets) || 0, isStanding: !!z.isStanding };
  if (b.isStanding) return { ...b, rows: null, cols: null };
  const rows = Number(z.rows) || 0, cols = Number(z.cols) || 0;
  if (rows > 0 && cols > 0) return { ...b, rows, cols, availableTickets: rows * cols };
  const l = seatCalc(b.availableTickets || 50);
  return { ...b, ...l, availableTickets: l.rows * l.cols };
});

const DEFAULT_ZONES = normalizeZones([
  { name: 'GA', price: 500000, isStanding: true, availableTickets: 200 },
  { name: 'VIP', price: 1500000, isStanding: false, availableTickets: 50 }
]);

const inputSt = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px',
  fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
};

const labelSt = {
  fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
  color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block'
};

const btnPrimSt = {
  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-emerald))',
  border: 'none', borderRadius: '8px', color: '#000', fontWeight: 700,
  fontSize: '13px', padding: '10px 24px', cursor: 'pointer',
  fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', transition: 'opacity 0.2s'
};

export default function AccountPage({
  currentUser, setCurrentUser, userTickets, fetchUserTickets,
  showAlert, showConfirm, onBack, fetchResaleTickets, initialTab
}) {
  const isOrganizer = currentUser?.role === 'organizer';
  const [activeTab, setActiveTab] = useState(initialTab || 'profile');

  const initials = (currentUser?.fullName || '?').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  const roleLabel = { admin: 'QUẢN TRỊ', organizer: 'BAN TỔ CHỨC', client: 'THÀNH VIÊN' }[currentUser?.role] || '';
  const roleColor = { admin: 'var(--brand-rose)', organizer: 'var(--brand-cyan)', client: 'var(--brand-gold)' }[currentUser?.role] || 'var(--text-muted)';

  // ── Profile ──
  const [profileName, setProfileName] = useState(currentUser?.fullName || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    if (!profileName.trim()) { await showAlert('Họ tên không được để trống'); return; }
    setSavingProfile(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/${currentUser.id}/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: profileName.trim(), email: profileEmail.trim(), phone: profilePhone.trim() })
      });
      const data = await res.json();
      if (!res.ok) { await showAlert(data.error || 'Lỗi cập nhật'); return; }
      setCurrentUser(prev => ({ ...prev, fullName: data.fullName, email: data.email, phone: data.phone }));
      await showAlert('Cập nhật thông tin thành công!');
    } catch { await showAlert('Lỗi kết nối'); }
    finally { setSavingProfile(false); }
  };

  // ── Password ──
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const handleChangePwd = async () => {
    if (!curPwd || !newPwd) { await showAlert('Vui lòng điền đầy đủ'); return; }
    if (newPwd !== confirmPwd) { await showAlert('Mật khẩu mới không khớp'); return; }
    setSavingPwd(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/${currentUser.id}/change-password`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd })
      });
      const data = await res.json();
      if (!res.ok) { await showAlert(data.error || 'Lỗi đổi mật khẩu'); return; }
      await showAlert('Đổi mật khẩu thành công!');
      setCurPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch { await showAlert('Lỗi kết nối'); }
    finally { setSavingPwd(false); }
  };

  // ── Tickets ──
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [resalePending, setResalePending] = useState(null);
  const [resalePrice, setResalePrice] = useState('');
  const [submittingResale, setSubmittingResale] = useState(false);

  const handleResaleSubmit = async () => {
    const priceNum = parseInt(resalePrice.replace(/[^0-9]/g, ''), 10);
    if (!priceNum || priceNum <= 0) { await showAlert('Giá bán không hợp lệ'); return; }
    setSubmittingResale(true);
    try {
      const res = await fetch('http://localhost:5000/api/resale/list', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: resalePending.id, resalePrice: priceNum, sellerId: currentUser.id })
      });
      const data = await res.json();
      if (!res.ok) { await showAlert(data.error || 'Đăng bán thất bại'); return; }
      await showAlert(`Đăng bán thành công với giá ${fmt(priceNum)}!`);
      setResalePending(null); setResalePrice('');
      if (fetchUserTickets) await fetchUserTickets(currentUser.id);
      if (fetchResaleTickets) await fetchResaleTickets();
    } catch { await showAlert('Lỗi kết nối'); }
    finally { setSubmittingResale(false); }
  };

  const handleCancelResale = async (ticket) => {
    const ok = await showConfirm('Thu hồi vé khỏi sàn bán lại?');
    if (!ok) return;
    try {
      const res = await fetch(`http://localhost:5000/api/resale/cancel/${ticket.id}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: currentUser.id })
      });
      if (!res.ok) { const d = await res.json(); await showAlert(d.error || 'Thất bại'); return; }
      await showAlert('Thu hồi thành công!');
      setExpandedTicket(null);
      if (fetchUserTickets) await fetchUserTickets(currentUser.id);
      if (fetchResaleTickets) await fetchResaleTickets();
    } catch { await showAlert('Lỗi kết nối'); }
  };

  // ── Dashboard (Organizer) ──
  const [orgStats, setOrgStats] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [orgBookings, setOrgBookings] = useState([]);
  const [loadingDash, setLoadingDash] = useState(false);
  const [dashSub, setDashSub] = useState('overview');

  // Event form
  const [showEvtForm, setShowEvtForm] = useState(false);
  const [editingEvt, setEditingEvt] = useState(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtCategory, setEvtCategory] = useState('concert');
  const [evtDate, setEvtDate] = useState('');
  const [evtTime, setEvtTime] = useState('19:30');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtPriceRange, setEvtPriceRange] = useState('');
  const [evtImage, setEvtImage] = useState('');
  const [evtBadge, setEvtBadge] = useState('');
  const [evtTheme, setEvtTheme] = useState('cyberpunk');
  const [evtZones, setEvtZones] = useState(DEFAULT_ZONES);
  const [evtEventType, setEvtEventType] = useState('live');
  const [evtOnlineLink, setEvtOnlineLink] = useState('');
  const [evtPlatform, setEvtPlatform] = useState('');
  const [evtOnlinePwd, setEvtOnlinePwd] = useState('');
  const [submittingEvt, setSubmittingEvt] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgRef = useRef(null);

  const fetchDashboard = async () => {
    if (!currentUser?.id) return;
    setLoadingDash(true);
    try {
      const [evtRes, statsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/events?organizerId=${currentUser.id}`),
        fetch(`http://localhost:5000/api/bookings/organizer-stats?organizerId=${currentUser.id}`)
      ]);
      if (evtRes.ok) setMyEvents(await evtRes.json());
      if (statsRes.ok) {
        const d = await statsRes.json();
        setOrgStats(d);
        setOrgBookings(d.bookings || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingDash(false); }
  };

  useEffect(() => {
    if (activeTab === 'dashboard' && isOrganizer) fetchDashboard();
  }, [activeTab]);

  const handleImgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEvtImage(data.secure_url);
    } catch { await showAlert('Upload ảnh thất bại'); }
    finally { setUploadingImg(false); }
  };

  const openCreateEvt = () => {
    setEditingEvt(null);
    setEvtTitle(''); setEvtDesc(''); setEvtCategory('concert');
    setEvtDate(''); setEvtTime('19:30'); setEvtLocation('');
    setEvtPriceRange(''); setEvtImage(''); setEvtBadge('');
    setEvtTheme('cyberpunk'); setEvtZones(DEFAULT_ZONES);
    setEvtEventType('live'); setEvtOnlineLink(''); setEvtPlatform(''); setEvtOnlinePwd('');
    setShowEvtForm(true);
  };

  const openEditEvt = (event) => {
    setEditingEvt(event);
    setEvtTitle(event.title || '');
    setEvtDesc(event.description || '');
    setEvtCategory(event.category || 'concert');
    setEvtDate(event.date || '');
    setEvtTime(event.time || '19:30');
    setEvtLocation(event.location || '');
    setEvtPriceRange(event.priceRange || '');
    setEvtImage(event.image || '');
    setEvtBadge(event.badge || '');
    setEvtTheme(event.theme || 'cyberpunk');
    setEvtZones(event.zones?.length ? normalizeZones(event.zones) : DEFAULT_ZONES);
    setEvtEventType(event.eventType || 'live');
    setEvtOnlineLink(event.onlineLink || '');
    setEvtPlatform(event.platform || '');
    setEvtOnlinePwd(event.onlinePassword || '');
    setShowEvtForm(true);
  };

  const handleEvtSubmit = async (e) => {
    e.preventDefault();
    const missing = [];
    if (!evtTitle) missing.push('Tên sự kiện');
    if (!evtDate) missing.push('Ngày');
    if (!evtLocation) missing.push('Địa điểm');
    if (!evtPriceRange) missing.push('Khoảng giá');
    if (!evtImage) missing.push('Ảnh');
    if (missing.length) { await showAlert(`Thiếu: ${missing.join(', ')}`); return; }
    setSubmittingEvt(true);
    try {
      const isEdit = !!editingEvt;
      const res = await fetch(
        isEdit ? `http://localhost:5000/api/events/${editingEvt.id}` : 'http://localhost:5000/api/events',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: evtTitle, description: evtDesc, category: evtCategory,
            date: evtDate, time: evtTime, location: evtLocation, priceRange: evtPriceRange,
            image: evtImage, badge: evtBadge, theme: evtTheme,
            zones: normalizeZones(evtZones), organizerId: currentUser.id,
            status: isEdit ? editingEvt.status : 'pending',
            eventType: evtEventType,
            onlineLink: evtEventType === 'online' ? evtOnlineLink : null,
            platform: evtEventType === 'online' ? evtPlatform : null,
            onlinePassword: evtEventType === 'online' ? evtOnlinePwd : null
          })
        }
      );
      const data = await res.json();
      if (!res.ok) { await showAlert(data.error || 'Thất bại'); return; }
      await showAlert(isEdit ? 'Cập nhật thành công!' : 'Tạo sự kiện thành công! Đang chờ admin duyệt.');
      setShowEvtForm(false);
      fetchDashboard();
    } catch { await showAlert('Lỗi kết nối'); }
    finally { setSubmittingEvt(false); }
  };

  const handleDeleteEvt = async (event) => {
    const ok = await showConfirm(`Xóa sự kiện "${event.title}"?`);
    if (!ok) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/events/${event.id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); await showAlert(d.error || 'Xóa thất bại'); return; }
      await showAlert('Đã xóa sự kiện');
      fetchDashboard();
    } catch { await showAlert('Lỗi kết nối'); }
  };

  // ── TABS ──
  const tabs = [
    { id: 'profile', label: 'Thông tin' },
    { id: 'password', label: 'Đổi mật khẩu' },
    { id: 'tickets', label: `Vé của tôi${userTickets.length ? ` (${userTickets.length})` : ''}` },
    ...(isOrganizer ? [{ id: 'dashboard', label: '⚡ Dashboard BTC' }] : [])
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto', minHeight: '80vh' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)',
          letterSpacing: '0.06em', padding: 0, marginBottom: '24px', transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={14} /> TRANG CHỦ
      </button>

      {/* User banner */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-emerald))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 700, color: '#000', fontFamily: 'var(--font-mono)'
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
            {currentUser?.fullName}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            @{currentUser?.username} · {currentUser?.email}
          </div>
          <span style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em',
            padding: '3px 8px', borderRadius: '4px', border: `1px solid ${roleColor}`, color: roleColor
          }}>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: 'none', border: 'none', padding: '10px 18px',
              fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
              cursor: 'pointer', color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: active ? 700 : 400,
              borderBottom: active ? '2px solid var(--brand-cyan)' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB: PROFILE ── */}
      {activeTab === 'profile' && (
        <div className="glass-panel" style={{ padding: '28px', maxWidth: '480px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            THÔNG TIN CÁ NHÂN
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelSt}>Họ và tên</label>
              <input style={inputSt} value={profileName} onChange={e => setProfileName(e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Email</label>
              <input style={inputSt} type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Số điện thoại</label>
              <input style={inputSt} value={profilePhone} onChange={e => setProfilePhone(e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Tên đăng nhập</label>
              <input style={{ ...inputSt, opacity: 0.45 }} value={currentUser?.username || ''} disabled />
            </div>
            <button style={btnPrimSt} onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: PASSWORD ── */}
      {activeTab === 'password' && (
        <div className="glass-panel" style={{ padding: '28px', maxWidth: '480px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            ĐỔI MẬT KHẨU
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelSt}>Mật khẩu hiện tại</label>
              <input style={inputSt} type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Mật khẩu mới</label>
              <input style={inputSt} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Xác nhận mật khẩu mới</label>
              <input style={inputSt} type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
            </div>
            <button style={btnPrimSt} onClick={handleChangePwd} disabled={savingPwd}>
              {savingPwd ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: TICKETS ── */}
      {activeTab === 'tickets' && (
        <div>
          {userTickets.length === 0 ? (
            <div className="glass-panel" style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Ticket size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: '14px' }}>Bạn chưa có vé nào</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {userTickets.map(ticket => {
                const isReselling = ticket.status === 'reselling';
                const isExpanded = expandedTicket === ticket.id;
                return (
                  <div key={ticket.id} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Image */}
                    {ticket.image && (
                      <div style={{ height: '110px', overflow: 'hidden', position: 'relative' }}>
                        <img src={ticket.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65))' }} />
                        <span style={{
                          position: 'absolute', bottom: '8px', right: '8px',
                          fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                          padding: '2px 6px', borderRadius: '4px',
                          background: isReselling ? 'var(--brand-gold)' : 'var(--brand-emerald)', color: '#000'
                        }}>
                          {isReselling ? 'ĐANG BÁN' : 'ACTIVE'}
                        </span>
                      </div>
                    )}

                    {/* Summary row — clickable to expand */}
                    <div
                      onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                      style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px', lineHeight: 1.3 }}>
                        {ticket.eventTitle}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        {ticket.zoneName}{ticket.seatNumber ? ` · Ghế ${ticket.seatNumber}` : ''}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-cyan)' }}>{fmt(ticket.price)}</span>
                        <ChevronDown size={14} style={{
                          color: 'var(--text-muted)',
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.25s'
                        }} />
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                        {/* QR area */}
                        <div style={{
                          padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                          marginBottom: '14px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)'
                        }}>
                          <QrCode size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em', wordBreak: 'break-all' }}>
                            {ticket.qrCode}
                          </div>
                        </div>

                        {/* Info rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                          {[
                            ['Mã vé', ticket.id],
                            ['Sự kiện', ticket.eventTitle],
                            ['Khu vực', ticket.zoneName],
                            ['Ghế', ticket.seatNumber || 'Khu đứng'],
                            ['Giá', fmt(ticket.price)],
                            ['Trạng thái', isReselling ? 'Đang rao bán lại' : 'Đang sử dụng']
                          ].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', gap: '8px' }}>
                              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', flexShrink: 0 }}>{k}</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                            </div>
                          ))}
                        </div>

                        {/* Online link — only visible when active + online event */}
                        {ticket.eventType === 'online' && ticket.onlineLink && (
                          <div style={{
                            padding: '12px 14px', borderRadius: '8px',
                            border: '1px solid rgba(0,255,255,0.25)',
                            background: 'rgba(0,255,255,0.06)', marginBottom: '12px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                              <Video size={13} color="var(--brand-cyan)" />
                              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--brand-cyan)', letterSpacing: '0.07em' }}>
                                LINK THAM GIA {ticket.platform ? `· ${ticket.platform.toUpperCase()}` : ''}
                              </span>
                            </div>
                            <a
                              href={ticket.onlineLink}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 12px', borderRadius: '6px',
                                background: 'var(--brand-cyan)', color: '#000',
                                fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                                textDecoration: 'none', letterSpacing: '0.05em',
                                marginBottom: ticket.onlinePassword ? '8px' : 0,
                                transition: 'opacity 0.2s'
                              }}
                            >
                              <ExternalLink size={12} /> VÀO PHÒNG NGAY
                            </a>
                            {ticket.onlinePassword && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                <KeyRound size={11} style={{ color: 'var(--text-muted)' }} />
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mật khẩu:</span>
                                <code style={{ fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>
                                  {ticket.onlinePassword}
                                </code>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action buttons */}
                        {!isReselling ? (
                          <button
                            style={{
                              width: '100%', padding: '8px', borderRadius: '6px',
                              border: '1px solid var(--brand-gold)', background: 'transparent',
                              color: 'var(--brand-gold)', fontSize: '12px', fontFamily: 'var(--font-mono)',
                              cursor: 'pointer', letterSpacing: '0.05em', transition: 'background 0.2s'
                            }}
                            onClick={() => { setResalePending(ticket); setResalePrice(String(Math.round(ticket.price * 0.85))); }}
                          >
                            BÁN LẠI
                          </button>
                        ) : (
                          <button
                            style={{
                              width: '100%', padding: '8px', borderRadius: '6px',
                              border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                              color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer'
                            }}
                            onClick={() => handleCancelResale(ticket)}
                          >
                            THU HỒI
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Resale price modal */}
          {resalePending && createPortal(
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setResalePending(null)}
            >
              <div className="glass-panel" style={{ padding: '28px', width: '320px', maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>Đặt giá bán lại</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                  {resalePending.eventTitle} · {resalePending.zoneName}
                </p>
                <label style={labelSt}>Giá bán (VNĐ)</label>
                <input
                  style={{ ...inputSt, marginBottom: '16px' }}
                  value={resalePrice}
                  onChange={e => setResalePrice(e.target.value)}
                  placeholder="VD: 200000"
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ ...btnPrimSt, flex: 1 }} onClick={handleResaleSubmit} disabled={submittingResale}>
                    {submittingResale ? 'Đang đăng...' : 'Xác nhận'}
                  </button>
                  <button
                    style={{ flex: 1, padding: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'none', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                    onClick={() => setResalePending(null)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      )}

      {/* ── TAB: DASHBOARD ── */}
      {activeTab === 'dashboard' && isOrganizer && (
        <div>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[
              { id: 'overview', label: 'Tổng quan' },
              { id: 'events', label: 'Sự kiện' },
              { id: 'bookings', label: 'Đơn hàng' }
            ].map(st => {
              const active = dashSub === st.id;
              return (
                <button key={st.id} onClick={() => setDashSub(st.id)} style={{
                  padding: '6px 16px', borderRadius: '6px',
                  border: `1px solid ${active ? 'var(--brand-cyan)' : 'rgba(255,255,255,0.1)'}`,
                  background: active ? 'rgba(0,255,255,0.08)' : 'transparent',
                  color: active ? 'var(--brand-cyan)' : 'var(--text-muted)',
                  fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  {st.label}
                </button>
              );
            })}
          </div>

          {loadingDash ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              Đang tải...
            </div>
          ) : (
            <>
              {/* Overview */}
              {dashSub === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                    {[
                      { label: 'Sự kiện', value: orgStats?.eventsCount ?? 0, color: 'var(--brand-cyan)', Icon: Calendar },
                      { label: 'Tổng đơn', value: orgStats?.totalBookings ?? 0, color: 'var(--brand-gold)', Icon: Ticket },
                      { label: 'Đã thanh toán', value: orgStats?.paidCount ?? 0, color: 'var(--brand-emerald)', Icon: CheckCircle },
                      { label: 'Chưa thanh toán', value: orgStats?.pendingCount ?? 0, color: 'var(--brand-rose)', Icon: Clock }
                    ].map(({ label, value, color, Icon }) => (
                      <div key={label} className="glass-panel" style={{ padding: '18px' }}>
                        <Icon size={16} color={color} style={{ marginBottom: '10px' }} />
                        <div style={{ fontSize: '28px', fontWeight: 700, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{value}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>TỔNG DOANH THU (ĐÃ TT)</div>
                    <div style={{ fontSize: '30px', fontWeight: 700, color: 'var(--brand-emerald)', fontFamily: 'var(--font-mono)' }}>
                      {fmt(orgStats?.totalRevenue)}
                    </div>
                  </div>
                </div>
              )}

              {/* Events */}
              {dashSub === 'events' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {myEvents.length} sự kiện
                    </span>
                    <button
                      style={{ ...btnPrimSt, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '12px' }}
                      onClick={openCreateEvt}
                    >
                      <Plus size={13} /> TẠO SỰ KIỆN
                    </button>
                  </div>

                  {myEvents.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Chưa có sự kiện nào
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {myEvents.map(evt => {
                        const statusColor = evt.status === 'approved' ? 'var(--brand-emerald)' : evt.status === 'pending' ? 'var(--brand-gold)' : 'var(--brand-rose)';
                        const statusLabel = evt.status === 'approved' ? 'ĐÃ DUYỆT' : evt.status === 'pending' ? 'CHỜ DUYỆT' : 'TỪ CHỐI';
                        return (
                          <div key={evt.id} className="glass-panel" style={{ padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                            {evt.image && (
                              <img src={evt.image} alt="" style={{ width: '52px', height: '52px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>
                                {evt.title}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{evt.date} · {evt.location}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                              <span style={{
                                fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em',
                                padding: '2px 7px', borderRadius: '4px',
                                background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`
                              }}>
                                {statusLabel}
                              </span>
                              <button onClick={() => openEditEvt(evt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }} title="Chỉnh sửa">
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => handleDeleteEvt(evt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-rose)', padding: '4px', borderRadius: '4px', opacity: 0.7 }} title="Xóa">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Bookings */}
              {dashSub === 'bookings' && (
                <div>
                  <div style={{ marginBottom: '14px', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {orgBookings.length} đơn hàng
                  </div>
                  {orgBookings.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có đơn hàng</div>
                  ) : (
                    <div className="glass-panel" style={{ overflow: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Mã đơn', 'Sự kiện', 'Khách hàng', 'SL', 'Tổng tiền', 'Thanh toán', 'Ngày'].map(h => (
                              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {orgBookings.map(b => (
                            <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                              <td style={{ padding: '10px 14px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--brand-cyan)', whiteSpace: 'nowrap' }}>{b.ticketId}</td>
                              <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-primary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.eventTitle}</td>
                              <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>{b.fullName}</td>
                              <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-primary)', textAlign: 'center' }}>{b.count}</td>
                              <td style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--brand-emerald)', whiteSpace: 'nowrap' }}>{fmt(b.totalPrice)}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{
                                  fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.07em',
                                  padding: '2px 6px', borderRadius: '4px',
                                  background: b.paymentStatus === 'Paid' ? 'rgba(0,255,128,0.15)' : 'rgba(255,200,0,0.15)',
                                  color: b.paymentStatus === 'Paid' ? 'var(--brand-emerald)' : 'var(--brand-gold)'
                                }}>
                                  {b.paymentStatus === 'Paid' ? 'ĐÃ TT' : 'CHƯA TT'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : ''}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Event form modal ── */}
      {showEvtForm && createPortal(
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '32px 20px', overflowY: 'auto'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '28px', position: 'relative' }}>
            <button onClick={() => setShowEvtForm(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
            <h3 style={{ margin: '0 0 22px', fontSize: '14px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
              {editingEvt ? 'CHỈNH SỬA SỰ KIỆN' : 'TẠO SỰ KIỆN MỚI'}
            </h3>
            <form onSubmit={handleEvtSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Image */}
              <div>
                <label style={labelSt}>Ảnh sự kiện *</label>
                <div
                  onClick={() => imgRef.current?.click()}
                  style={{
                    height: '140px', borderRadius: '8px', border: '2px dashed rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden', background: evtImage ? 'none' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  {evtImage ? (
                    <img src={evtImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : uploadingImg ? (
                    <Loader size={22} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <ImagePlus size={22} style={{ margin: '0 auto 6px', display: 'block' }} />
                      <span style={{ fontSize: '12px' }}>Click để tải ảnh</span>
                    </div>
                  )}
                </div>
                <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImgUpload} />
              </div>

              <div>
                <label style={labelSt}>Tên sự kiện *</label>
                <input style={inputSt} value={evtTitle} onChange={e => setEvtTitle(e.target.value)} placeholder="VD: Concert AuraPass 2026" />
              </div>

              <div>
                <label style={labelSt}>Mô tả</label>
                <textarea style={{ ...inputSt, minHeight: '72px', resize: 'vertical' }} value={evtDesc} onChange={e => setEvtDesc(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelSt}>Thể loại</label>
                  <select style={{ ...inputSt }} value={evtCategory} onChange={e => setEvtCategory(e.target.value)}>
                    <option value="concert">Concert</option>
                    <option value="festival">Festival</option>
                    <option value="sport">Thể thao</option>
                    <option value="theater">Sân khấu</option>
                    <option value="exhibition">Triển lãm</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Ngày diễn ra *</label>
                  <input style={inputSt} type="date" value={evtDate} onChange={e => setEvtDate(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px' }}>
                <div>
                  <label style={labelSt}>Giờ</label>
                  <input style={inputSt} type="time" value={evtTime} onChange={e => setEvtTime(e.target.value)} />
                </div>
                <div>
                  <label style={labelSt}>Địa điểm *</label>
                  <input style={inputSt} value={evtLocation} onChange={e => setEvtLocation(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelSt}>Khoảng giá hiển thị *</label>
                <input style={inputSt} value={evtPriceRange} onChange={e => setEvtPriceRange(e.target.value)} placeholder="VD: 500.000đ - 1.500.000đ" />
              </div>

              {/* Event type */}
              <div>
                <label style={labelSt}>Loại sự kiện</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { val: 'live', label: '🎤 Trực tiếp' },
                    { val: 'online', label: '💻 Trực tuyến' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setEvtEventType(opt.val)}
                      style={{
                        flex: 1, padding: '9px', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '13px', fontFamily: 'var(--font-body)', fontWeight: evtEventType === opt.val ? 600 : 400,
                        border: `1px solid ${evtEventType === opt.val ? 'var(--brand-cyan)' : 'rgba(255,255,255,0.1)'}`,
                        background: evtEventType === opt.val ? 'rgba(0,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                        color: evtEventType === opt.val ? 'var(--brand-cyan)' : 'var(--text-muted)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Online fields */}
              {evtEventType === 'online' && (
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,255,255,0.2)', background: 'rgba(0,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--brand-cyan)', letterSpacing: '0.08em', marginBottom: '2px' }}>
                    THÔNG TIN PHÒNG TRỰC TUYẾN
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={labelSt}>Nền tảng</label>
                      <input style={inputSt} value={evtPlatform} onChange={e => setEvtPlatform(e.target.value)} placeholder="Zoom, Google Meet..." />
                    </div>
                    <div>
                      <label style={labelSt}>Mật khẩu phòng (nếu có)</label>
                      <input style={inputSt} value={evtOnlinePwd} onChange={e => setEvtOnlinePwd(e.target.value)} placeholder="Tuỳ chọn" />
                    </div>
                  </div>
                  <div>
                    <label style={labelSt}>Link tham gia *</label>
                    <input style={inputSt} value={evtOnlineLink} onChange={e => setEvtOnlineLink(e.target.value)} placeholder="https://zoom.us/j/..." />
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '5px 0 0', fontStyle: 'italic' }}>
                      Link sẽ bị ẩn với công khai — chỉ hiện sau khi khán giả thanh toán thành công.
                    </p>
                  </div>
                </div>
              )}

              {/* Zones */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...labelSt, margin: 0 }}>Khu vực / Loại vé</label>
                  <button
                    type="button"
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                    onClick={() => setEvtZones(prev => [...prev, { name: '', price: 0, isStanding: false, availableTickets: 50 }])}
                  >
                    + Thêm khu
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {evtZones.map((zone, i) => (
                    <div key={i} style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                        <div>
                          <label style={{ ...labelSt, marginBottom: '4px' }}>Tên khu</label>
                          <input style={{ ...inputSt, padding: '7px 10px' }} value={zone.name} onChange={e => setEvtZones(prev => prev.map((z, j) => j === i ? { ...z, name: e.target.value } : z))} placeholder="VD: VIP" />
                        </div>
                        <div>
                          <label style={{ ...labelSt, marginBottom: '4px' }}>Giá (đ)</label>
                          <input style={{ ...inputSt, padding: '7px 10px' }} type="number" min="0" value={zone.price} onChange={e => setEvtZones(prev => prev.map((z, j) => j === i ? { ...z, price: Number(e.target.value) } : z))} />
                        </div>
                        <div>
                          <label style={{ ...labelSt, marginBottom: '4px' }}>Số lượng</label>
                          <input style={{ ...inputSt, padding: '7px 10px' }} type="number" min="1" value={zone.availableTickets} onChange={e => setEvtZones(prev => prev.map((z, j) => j === i ? { ...z, availableTickets: Number(e.target.value) } : z))} />
                        </div>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-rose)', padding: '7px 0', alignSelf: 'flex-end' }}
                          onClick={() => setEvtZones(prev => prev.filter((_, j) => j !== i))}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '8px' }}>
                        <input type="checkbox" checked={zone.isStanding} onChange={e => setEvtZones(prev => prev.map((z, j) => j === i ? { ...z, isStanding: e.target.checked } : z))} />
                        Khu đứng (không chỗ ngồi cố định)
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '6px' }}>
                <button type="submit" style={{ ...btnPrimSt, flex: 2 }} disabled={submittingEvt}>
                  {submittingEvt ? 'Đang xử lý...' : (editingEvt ? 'Cập nhật sự kiện' : 'Gửi Admin duyệt')}
                </button>
                <button type="button"
                  style={{ flex: 1, padding: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'none', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                  onClick={() => setShowEvtForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
