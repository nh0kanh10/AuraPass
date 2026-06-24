import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, QrCode, ClipboardCheck, Mail, Phone, User, CheckCircle2 } from 'lucide-react';

export default function Checkout({ bookingData, onBack, onComplete, showAlert, currentUser, onConfirmBooking }) {
  const { event, zone, count, seats, totalPrice } = bookingData;
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [createdTicketId, setCreatedTicketId] = useState('');
  const [createdTickets, setCreatedTickets] = useState([]);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (step === 2) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            showAlert("Đã hết thời gian giữ vé. Vui lòng thực hiện đặt vé lại.");
            onBack();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email không hợp lệ.";
    if (!phone.trim() || phone.length < 9) newErrors.phone = "Số điện thoại không hợp lệ.";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(2);
    }
  };

  const handleConfirmPayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await onConfirmBooking({ fullName, email, phone });
      if (result) {
        if (result.booking) {
          setCreatedTicketId(result.booking.ticketId);
          setCreatedTickets(result.tickets || []);
        } else if (result.ticketId) {
          setCreatedTicketId(result.ticketId);
        }
        setStep(3);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };


  const displayTicketId = createdTicketId || `AP-${Math.floor(100000 + Math.random() * 900000)}`;

  const qrData = JSON.stringify({ ticketId: displayTicketId, eventTitle: event.title, zone: zone.name, seats, fullName });
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0b0b0f&bgcolor=ffffff&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="checkout-outer-wrapper" style={{ padding: '0 24px 64px 24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      <style>{`

        .vip-checkout-panel {
          background: rgba(255, 255, 255, 0.01) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
          border-radius: 20px !important;
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .vip-checkout-panel:hover {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .checkout-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 18px;
          text-align: left;
          position: relative;
          z-index: 2;
        }

        .checkout-label {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          letter-spacing: 0.01em;
          transition: color 0.3s ease;
        }

        .checkout-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
          color: #fff !important;
          outline: none !important;
          font-size: 14px !important;
          font-family: var(--font-body) !important;
          transition: all 0.3s ease !important;
          box-sizing: border-box;
        }

        .checkout-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
          font-size: 13px;
        }

        .checkout-input:focus {
          border-color: rgba(167, 139, 250, 0.5) !important;
          background: rgba(255, 255, 255, 0.04) !important;
          box-shadow: 
            0 0 12px rgba(167, 139, 250, 0.08),
            inset 0 1px 1px rgba(255, 255, 255, 0.03) !important;
        }

        .checkout-input-group:focus-within .checkout-label {
          color: var(--brand-cyan);
        }

        .checkout-watermark {
          position: absolute;
          bottom: 20px;
          right: 20px;
          color: rgba(255, 255, 255, 0.012);
          pointer-events: none;
          z-index: 1;
        }


        .vip-e-ticket-card {
          width: 100%;
          max-width: 600px;
          background: linear-gradient(160deg, rgba(20, 16, 36, 0.98) 0%, rgba(10, 8, 18, 0.99) 100%);
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hologram-sweep {
          position: absolute;
          top: 0; left: -150%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent);
          transform: skewX(-20deg);
          pointer-events: none;
          z-index: 5;
        }

        .vip-e-ticket-card:hover .hologram-sweep {
          left: 150%;
          transition: left 1.5s ease-in-out;
        }

        .error-glow-msg {
          font-size: 12px;
          color: oklch(65% 0.15 30);
          text-shadow: 0 0 8px rgba(239, 68, 68, 0.1);
          margin-top: 4px;
          font-family: var(--font-body);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
      `}</style>
      

      {step < 3 && (
        <button 
          onClick={step === 1 ? onBack : () => setStep(1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            alignSelf: 'flex-start',
            transition: 'color 0.2s ease',
            letterSpacing: '0.05em'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-white)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={14} />
          {step === 1 ? "QUAY LẠI SƠ ĐỒ CHỌN GHẾ" : "QUAY LẠI NHẬP THÔNG TIN"}
        </button>
      )}

      {step === 1 && (

        <div className="checkout-step-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '32px',
          alignItems: 'start'
        }}>

          <div className="vip-checkout-panel" style={{ padding: '36px' }}>
            <div className="checkout-watermark">
              <svg width="220" height="220" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                <rect x="5" y="20" width="90" height="60" rx="6" />
                <circle cx="70" cy="20" r="4" fill="none" />
                <circle cx="70" cy="80" r="4" fill="none" />
                <line x1="70" y1="24" x2="70" y2="76" strokeDasharray="2 2" />
                <path d="M38 42 s6-3 6-7V29l-6-2-6 2v6c0 4 6 7 6 7z" />
                <text x="15" y="65" fontFamily="var(--font-mono)" fontSize="4" letterSpacing="0.5" opacity="0.6">VIP INVITATION PASS</text>
              </svg>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', zIndex: 2, position: 'relative' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--brand-cyan)', letterSpacing: '0.12em', fontWeight: 600 }}>CLIENT REGISTER</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--brand-gold)', letterSpacing: '0.08em', fontWeight: 600 }}>BACKSTAGE ACCESS</span>
            </div>

            <h2 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '24px', zIndex: 2, position: 'relative' }}>
              Thông Tin Nhận Vé
            </h2>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              
              <div className="checkout-input-group">
                <label className="checkout-label">Họ và Tên</label>
                <input 
                  type="text" 
                  placeholder="Nguyễn Văn A" 
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setErrors({...errors, fullName: null}); }}
                  className="checkout-input"
                />
                {errors.fullName && <span className="error-glow-msg">✦ {errors.fullName}</span>}
              </div>

              <div className="checkout-input-group">
                <label className="checkout-label">Địa chỉ Email (Nhận vé điện tử)</label>
                <input 
                  type="email" 
                  placeholder="yourmail@domain.com" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: null}); }}
                  className="checkout-input"
                />
                {errors.email && <span className="error-glow-msg">✦ {errors.email}</span>}
              </div>

              <div className="checkout-input-group">
                <label className="checkout-label">Số Điện Thoại</label>
                <input 
                  type="tel" 
                  placeholder="0912345678" 
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors({...errors, phone: null}); }}
                  className="checkout-input"
                />
                {errors.phone && <span className="error-glow-msg">✦ {errors.phone}</span>}
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '15px',
                  fontSize: '14.5px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, var(--brand-violet) 0%, oklch(48% 0.25 300) 100%)',
                  border: '1px solid rgba(167, 139, 250, 0.25)',
                  color: 'var(--text-white)',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)',
                  marginTop: '16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, oklch(60% 0.25 300) 0%, var(--brand-cyan) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, var(--brand-violet) 0%, oklch(48% 0.25 300) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.25)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.2)';
                }}
              >
                Tiến Hành Thanh Toán
              </button>
            </form>
          </div>


          <div className="vip-checkout-panel checkout-summary-panel" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', color: '#fff' }}>Chi Tiết Đơn Hàng</h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--brand-gold)', letterSpacing: '0.05em' }}>SUMMARY</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-display)', fontSize: '15px' }}>{event.title}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{event.date} · {event.time}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{event.location.split(',')[0]}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Khu vực:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>{zone.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Số lượng:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>{count} vé</span>
              </div>
              {!zone.isStanding && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ghế đã chọn:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>{seats.join(', ')}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
              <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--brand-cyan)' }}>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (

        <div className="checkout-step-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '32px',
          alignItems: 'start'
        }}>

          <div className="vip-checkout-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
            
            <div style={{ zIndex: 2, position: 'relative' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--brand-cyan)', letterSpacing: '0.12em', fontWeight: 600 }}>BANK TRANSFER ENTRY</span>
              <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', color: '#fff', margin: '8px 0 6px 0' }}>Quét Mã QR Đặt Vé</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                Sử dụng ứng dụng ngân hàng của bạn quét mã VietQR để hoàn tất chuyển khoản giữ chỗ
              </p>
            </div>


            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.04)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: 'var(--brand-gold)',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              padding: '10px 20px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 2,
              position: 'relative',
              boxShadow: '0 0 15px var(--brand-gold-glow)'
            }}>
              ⏰ Thời gian giữ vé còn lại: {formatTime(timeLeft)}
            </div>


            <div style={{
              padding: '16px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              zIndex: 2,
              position: 'relative'
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '13px',
                color: '#0054a5',
                borderBottom: '1px solid #eee',
                width: '100%',
                paddingBottom: '6px',
                letterSpacing: '0.05em'
              }}>
                Viet<span style={{ color: '#ea1c24' }}>QR</span>
              </div>
              
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180&color=0b0b0f&bgcolor=ffffff&data=${encodeURIComponent(`STK: 1903333333333 | NGAN HANG: AURABANK | SO TIEN: ${totalPrice} | NOI DUNG: THANH TOAN DAT VE ${displayTicketId}`)}`} 
                alt="Payment QR" 
                style={{ width: '180px', height: '180px' }}
              />
            </div>


            <div style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '13.5px',
              textAlign: 'left',
              zIndex: 2,
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ngân hàng thụ hưởng:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>AuraBank (NHTMCP Hào Quang)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Số tài khoản:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>1903 3333 3333 33</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Số tiền:</span>
                <span style={{ fontWeight: 600, color: 'var(--brand-cyan)' }}>{formatPrice(totalPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nội dung chuyển khoản:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>THANH TOAN DAT VE {displayTicketId}</span>
              </div>
            </div>

            <button 
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="btn-primary" 
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '15px',
                fontSize: '14.5px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                borderRadius: '8px',
                background: isProcessing 
                  ? 'var(--text-muted)' 
                  : 'linear-gradient(90deg, var(--brand-violet) 0%, oklch(48% 0.25 300) 100%)',
                border: '1px solid rgba(167, 139, 250, 0.25)',
                color: 'var(--text-white)',
                boxShadow: isProcessing ? 'none' : '0 4px 15px rgba(139, 92, 246, 0.2)',
                transition: 'all 0.3s ease',
                zIndex: 2,
                position: 'relative',
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (isProcessing) return;
                e.currentTarget.style.background = 'linear-gradient(90deg, oklch(60% 0.25 300) 0%, var(--brand-cyan) 100%)';
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.25)';
              }}
              onMouseLeave={(e) => {
                if (isProcessing) return;
                e.currentTarget.style.background = 'linear-gradient(90deg, var(--brand-violet) 0%, oklch(48% 0.25 300) 100%)';
                e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.25)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.2)';
              }}
            >
              {isProcessing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span className="spinner" />
                  Đang xác thực giao dịch...
                </div>
              ) : "Tôi Đã Hoàn Tất Chuyển Khoản"}
            </button>
          </div>


          <div className="vip-checkout-panel checkout-summary-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', color: '#fff' }}>Thông Tin Nhận Vé</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <div><strong style={{ color: 'var(--text-white)' }}>Họ tên:</strong> {fullName}</div>
              <div><strong style={{ color: 'var(--text-white)' }}>Email:</strong> {email}</div>
              <div><strong style={{ color: 'var(--text-white)' }}>Điện thoại:</strong> {phone}</div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (() => {
        const isVip = zone.name.toLowerCase().includes('vip');
        return (

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
            padding: '24px 0'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid var(--brand-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--brand-emerald-glow)',
                marginBottom: '8px'
              }}>
                <CheckCircle2 size={32} color="var(--brand-emerald)" />
              </div>
              <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', color: 'var(--brand-pearl)' }}>Đặt Vé Thành Công!</h2>
              <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', maxWidth: '460px', lineHeight: '1.6' }}>
                Vé điện tử đã được gửi về email <strong style={{ color: 'var(--brand-cyan)' }}>{email}</strong>. Bạn hãy lưu lại mã QR check-in dưới đây để xuất trình tại cổng sự kiện.
              </p>
            </div>


            <div 
              className="vip-e-ticket-card" 
              style={{
                border: isVip ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isVip ? '0 30px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.04)' : '0 30px 60px rgba(0, 0, 0, 0.7)'
              }}
            >

              <div className="hologram-sweep" />


              <div style={{
                position: 'relative',
                height: '150px',
                backgroundImage: `linear-gradient(to bottom, transparent 35%, rgba(10, 8, 18, 0.98)), url(${event.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '24px'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '20px',
                  right: '24px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isVip ? 'var(--brand-gold)' : '#fff',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: isVip ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(255,255,255,0.1)',
                  letterSpacing: '0.05em'
                }}>
                  CODE: {displayTicketId}
                </span>
                <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                  {event.title}
                </h3>
              </div>


              <div className="checkout-ticket-body-row" style={{ padding: '24px', display: 'flex', gap: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
                  

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>Thời Gian</span>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--brand-pearl)', marginTop: '4px', lineHeight: '1.4' }}>
                        {event.date}<br />{event.time}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>Địa Điểm</span>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--brand-pearl)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px', lineHeight: '1.4' }} title={event.location}>
                        {event.location.split(',')[0]}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>Hạng Vé</span>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: isVip ? 'var(--brand-gold)' : 'var(--brand-cyan)', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
                        {zone.name}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>Vị trí ghế / vé</span>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--brand-pearl)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        {zone.isStanding ? `${count} Vé Đứng` : seats.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>Khách Hàng VIP</span>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--brand-pearl)', marginTop: '4px' }}>
                      {fullName} · {phone}
                    </div>
                  </div>

                </div>


                <div className="checkout-qr-block" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  flexShrink: 0
                }}>
                  <img src={qrCodeUrl} alt="Check-in QR" style={{ width: '130px', height: '130px' }} />
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0b0b0f', borderTop: '1px dashed #ddd', width: '100%', textAlign: 'center', paddingTop: '4px', letterSpacing: '0.05em' }}>
                    SCAN TO ENTER
                  </span>
                </div>
              </div>


              <div style={{
                borderTop: '1px dashed rgba(255,255,255,0.12)',
                margin: '8px 0',
                position: 'relative',
                height: '1px'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-dark)',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  zIndex: 3
                }} />
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-dark)',
                  borderLeft: '1px solid rgba(255,255,255,0.06)',
                  zIndex: 3
                }} />
              </div>


              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.05em'
              }}>
                <span>TỔNG: {formatPrice(totalPrice)} (PAID)</span>
                <span>AUTHENTICATED BY AURAPASS</span>
              </div>

            </div>

            <button 
              onClick={onComplete}
              className="btn-secondary"
              style={{
                marginTop: '16px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                padding: '12px 32px',
                borderRadius: '8px',
                border: '1px solid var(--brand-pearl)',
                cursor: 'pointer'
              }}
            >
              Quay Về Trang Chủ
            </button>
          </div>
        );
      })()}

    </div>
  );
}
