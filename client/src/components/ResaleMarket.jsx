import React, { useState, useEffect, useRef } from 'react';
import { Tag, PlusCircle, ShoppingCart, User, Check, RefreshCw, MapPin, Armchair, ChevronDown } from 'lucide-react';

export default function ResaleMarket({ tickets, userTickets = [], onBuyResale, onListResale, events, currentUser, onNeedLogin, onOpenWallet, onRefreshUserTickets, onRefreshResaleTickets, showAlert, showConfirm }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showResaleModal, setShowResaleModal] = useState(false);
  const [selectedUserTicket, setSelectedUserTicket] = useState(null);
  const [customResalePrice, setCustomResalePrice] = useState('');

  const handleConfirmResaleListing = async () => {
    if (!selectedUserTicket || !customResalePrice) return;
    
    const priceNum = Number(customResalePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      await showAlert("Vui lòng nhập giá bán lại hợp lệ.");
      return;
    }
    if (priceNum > selectedUserTicket.price) {
      await showAlert("Giá bán lại không được lớn hơn giá gốc.");
      return;
    }

    const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn đăng bán lại vé này với giá ${formatPrice(priceNum)} chứ?`);
    if (!isConfirmed) return;

    try {
      const res = await fetch('http://localhost:5000/api/resale/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedUserTicket.id,
          resalePrice: priceNum,
          sellerId: currentUser.id
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        await showAlert(errData.error || 'Đăng bán vé thất bại');
        return;
      }

      await showAlert(`Vé của bạn đã được đăng ký gửi bán lại thành công với giá ${formatPrice(priceNum)}!`);
      setShowResaleModal(false);
      setSelectedUserTicket(null);
      setCustomResalePrice('');

      if (onRefreshUserTickets) await onRefreshUserTickets();
      if (onRefreshResaleTickets) await onRefreshResaleTickets();
    } catch (e) {
      console.error(e);
      await showAlert("Không thể kết nối tới server API đăng bán.");
    }
  };
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const [zoneName, setZoneName] = useState('');
  const [seatInfo, setSeatInfo] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [resalePrice, setResalePrice] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedEvent = events.find(ev => ev.id === selectedEventId) || events[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!zoneName || !seatInfo || !originalPrice || !resalePrice || !sellerName) {
      await showAlert("Vui lòng điền đầy đủ thông tin ký gửi.");
      return;
    }

    const event = events.find(ev => ev.id === selectedEventId);

    const newTicket = {
      id: `resale-${Date.now()}`,
      eventId: selectedEventId,
      eventTitle: event?.title || "Sự kiện ký gửi",
      zoneName,
      seatInfo,
      originalPrice: Number(originalPrice),
      resalePrice: Number(resalePrice),
      sellerName,
      status: "available"
    };

    onListResale(newTicket);
    setSuccessMessage("Ký gửi vé thành công! Vé của bạn đã được đưa lên sàn giao dịch.");
    
    // Reset form
    setZoneName('');
    setSeatInfo('');
    setOriginalPrice('');
    setResalePrice('');
    setSellerName('');
    
    setTimeout(() => {
      setSuccessMessage('');
      setShowAddForm(false);
    }, 2500);
  };

  return (
    <section className="glass-panel" style={{ margin: '0 0 48px 0', padding: '32px', textAlign: 'left' }}>
      <style>{`
        .resale-ticket-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
          gap: 28px;
        }

        .resale-ticket-card-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: visible;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .resale-ticket-card-wrapper:hover {
          transform: translateY(-6px);
        }

        .resale-ticket-body-part {
          position: relative;
          background: linear-gradient(135deg, rgba(25, 28, 41, 0.45) 0%, rgba(15, 17, 26, 0.65) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px 16px 12px 12px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: border-color 0.45s ease;
        }

        .resale-ticket-stub-part {
          position: relative;
          background: linear-gradient(135deg, rgba(25, 28, 41, 0.45) 0%, rgba(15, 17, 26, 0.65) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: none;
          border-radius: 12px 12px 16px 16px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          margin-top: 4px;
          box-shadow: var(--glass-shadow);
          box-shadow: var(--inset-glow), var(--glass-shadow);
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease;
        }

        .resale-ticket-stub {
          padding: 16px 20px 22px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .resale-ticket-card-wrapper:hover .resale-ticket-stub-part {
          transform: translateY(3px);
          border-color: rgba(167, 139, 250, 0.25);
        }

        .resale-ticket-card-wrapper:hover .resale-ticket-body-part {
          border-color: rgba(167, 139, 250, 0.25);
        }

        .resale-ticket-reflection {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 3;
          overflow: hidden;
          border-radius: 16px 16px 12px 12px;
        }

        .resale-ticket-reflection::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 80%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0) 70%,
            transparent 100%
          );
          transform: skewX(-25deg);
          pointer-events: none;
          transition: left 0s ease;
        }

        .resale-ticket-card-wrapper:hover .resale-ticket-reflection::after {
          left: 150%;
          transition: left 0.8s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .resale-ticket-img-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 15px 15px 0 0;
          overflow: hidden;
        }

        .resale-ticket-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .resale-ticket-card-wrapper:hover .resale-ticket-img {
          transform: scale(1.06);
        }

        .resale-ticket-badge-resale {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--brand-cyan);
          border: 1px solid var(--brand-cyan-glow);
          background: rgba(6, 182, 212, 0.15);
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          font-weight: 600;
          backdrop-filter: blur(4px);
          z-index: 2;
        }

        .resale-ticket-badge-discount {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 10px;
          font-family: var(--font-mono);
          color: oklch(72% 0.17 150);
          border: 1px solid rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.15);
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 700;
          backdrop-filter: blur(4px);
          z-index: 2;
        }

        .resale-ticket-body {
          padding: 16px 20px 12px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: 110px;
          justify-content: space-between;
        }

        .resale-ticket-title {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          line-height: 1.4;
          color: var(--brand-pearl);
          height: 42px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .resale-ticket-pills-row {
          display: flex;
          gap: 6px;
          flex-wrap: nowrap;
          overflow: hidden;
          height: 28px;
        }

        .resale-ticket-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 4px 10px;
          border-radius: 20px;
          max-width: 50%;
          overflow: hidden;
        }

        .resale-ticket-price-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: var(--font-mono);
        }

        .resale-ticket-buy-btn {
          position: relative;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, var(--brand-navy), oklch(30% 0.08 250));
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-white);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 13px;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(11, 37, 58, 0.15);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          z-index: 2;
        }

        .resale-ticket-buy-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.12) 50%,
            transparent 100%
          );
          transform: skewX(-25deg);
          pointer-events: none;
          animation: resaleShine 5s infinite ease-in-out;
        }

        @keyframes resaleShine {
          0% { left: -100%; }
          35%, 100% { left: 150%; }
        }

        .resale-ticket-buy-btn:hover {
          transform: translateY(-1px);
          background: linear-gradient(135deg, oklch(28% 0.07 250), var(--brand-violet));
          border-color: rgba(167, 139, 250, 0.3);
          box-shadow: 0 6px 18px rgba(167, 139, 250, 0.2);
        }

        @keyframes pulseDot {
          0% { transform: scale(0.95); opacity: 0.5; box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.6); }
          70% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 6px rgba(6, 182, 212, 0); }
          100% { transform: scale(0.95); opacity: 0.5; box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
        }

        .resale-live-dot {
          width: 8px;
          height: 8px;
          background-color: var(--brand-cyan);
          border-radius: 50%;
          display: inline-block;
          animation: pulseDot 2s infinite ease-in-out;
          box-shadow: 0 0 8px var(--brand-cyan);
        }

        .resale-refresh-icon {
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .resale-title-hover:hover .resale-refresh-icon {
          transform: rotate(360deg);
        }

        .btn-resale-post-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(167, 139, 250, 0.08);
          color: var(--text-white);
          border: 1px solid rgba(167, 139, 250, 0.3);
          font-family: var(--font-mono);
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 12px 24px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(167, 139, 250, 0.05);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-resale-post-action:hover {
          transform: translateY(-2px);
          background: rgba(6, 182, 212, 0.15);
          border-color: var(--brand-cyan);
          box-shadow: 
            0 8px 24px rgba(6, 182, 212, 0.25),
            0 0 10px rgba(6, 182, 212, 0.15);
        }

        .resale-header-box-office {
          position: relative;
          background: linear-gradient(135deg, rgba(20, 15, 35, 0.65) 0%, rgba(10, 8, 20, 0.85) 100%);
          border: 1px solid rgba(167, 139, 250, 0.25);
          border-radius: 20px;
          padding: 28px 36px;
          margin-bottom: 36px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          overflow: hidden;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 
            0 10px 40px rgba(0, 0, 0, 0.5),
            inset 0 1px 2px rgba(255, 255, 255, 0.05),
            0 0 20px rgba(139, 92, 246, 0.15);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease;
        }

        .resale-header-box-office:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 
            0 15px 45px rgba(0, 0, 0, 0.6),
            inset 0 1px 2px rgba(255, 255, 255, 0.08),
            0 0 30px rgba(6, 182, 212, 0.2),
            0 0 15px rgba(139, 92, 246, 0.15);
          transform: translateY(-2px);
        }

        .resale-header-box-office::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 45%),
                      radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 45%);
          pointer-events: none;
        }

        .resale-header-box-office-top-line {
          position: absolute;
          top: 0;
          left: 10%;
          width: 80%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--brand-cyan), var(--brand-purple-glow), transparent);
          opacity: 0.8;
        }

        .resale-neon-title {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 800;
          color: var(--text-white);
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          transition: text-shadow 0.3s ease;
        }

        .resale-header-box-office:hover .resale-neon-title {
          text-shadow: 
            0 0 8px rgba(6, 182, 212, 0.5),
            0 0 20px rgba(167, 139, 250, 0.3);
        }

        .resale-neon-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          color: var(--brand-cyan);
          border: 1px solid var(--brand-cyan-glow);
          background: rgba(6, 182, 212, 0.12);
          padding: 3px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.15);
          animation: resaleNeonBlink 3s infinite alternate ease-in-out;
        }

        @keyframes resaleNeonBlink {
          0% {
            opacity: 0.9;
            box-shadow: 0 0 4px rgba(6, 182, 212, 0.1), inset 0 0 2px rgba(6, 182, 212, 0.1);
            border-color: rgba(6, 182, 212, 0.25);
          }
          100% {
            opacity: 1;
            box-shadow: 0 0 12px rgba(6, 182, 212, 0.4), inset 0 0 4px rgba(6, 182, 212, 0.2);
            border-color: rgba(6, 182, 212, 0.6);
          }
        }

        .resale-live-pulse-dot {
          width: 6px;
          height: 6px;
          background-color: var(--brand-cyan);
          border-radius: 50%;
          position: relative;
        }

        .resale-live-pulse-dot::after {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid var(--brand-cyan);
          animation: resalePulse 2s infinite ease-out;
        }

        @keyframes resalePulse {
          0% {
            transform: scale(0.6);
            opacity: 1;
          }
           100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        .resale-form-container {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.55) 0%, rgba(10, 8, 20, 0.75) 100%);
          border: 1px solid rgba(167, 139, 250, 0.16);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 36px;
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.6),
            0 0 30px rgba(139, 92, 246, 0.04),
            inset 0 1px 2px rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
        }
        
        .resale-form-container:hover {
          border-color: rgba(167, 139, 250, 0.25);
          box-shadow: 
            0 25px 60px rgba(0, 0, 0, 0.65),
            0 0 35px rgba(139, 92, 246, 0.08),
            inset 0 1px 2px rgba(255, 255, 255, 0.05);
        }

        .resale-form-header-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 14px;
        }

        .resale-form-title {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.01em;
          margin: 0;
          background: linear-gradient(90deg, #fff 40%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.12);
        }

        .resale-form-subtitle {
          font-family: var(--font-mono);
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: rgba(253, 218, 13, 0.7);
          text-transform: uppercase;
          opacity: 0.9;
        }

        .resale-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px 24px;
          align-items: end;
        }

        .resale-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .resale-input-label {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.02em;
          transition: color 0.3s ease;
        }

        .resale-input-group:focus-within .resale-input-label {
          color: var(--brand-cyan);
        }

        .resale-input-field,
        .resale-select-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 12px 14px;
          color: #fff;
          font-size: 13.5px;
          font-family: var(--font-body);
          outline: none;
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .resale-input-field::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }

        .resale-input-field:hover,
        .resale-select-field:hover {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .resale-input-field:focus,
        .resale-select-field:focus {
          background: rgba(255, 255, 255, 0.045);
          border-color: rgba(167, 139, 250, 0.45);
          box-shadow: 
            0 0 12px rgba(167, 139, 250, 0.1),
            inset 0 1px 1px rgba(255, 255, 255, 0.02);
        }

        .resale-btn-submit {
          padding: 12px 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(24, 18, 38, 0.9) 0%, rgba(12, 8, 20, 0.95) 100%);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(253, 218, 13, 0.15);
          font-weight: 600;
          font-size: 13px;
          font-family: var(--font-display);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.03);
        }

        .resale-btn-submit::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
          transition: none;
          z-index: 1;
        }

        .resale-btn-submit:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%);
          border-color: rgba(253, 218, 13, 0.45);
          color: #fff;
          box-shadow: 
            0 6px 18px rgba(139, 92, 246, 0.06),
            0 0 12px rgba(253, 218, 13, 0.12),
            inset 0 1px 1.5px rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }

        .resale-btn-submit:hover::before {
          left: 100%;
          transition: left 0.7s ease;
        }

        .resale-custom-select-container {
          position: relative;
          width: 100%;
        }

        .resale-custom-select-trigger {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 12px 14px;
          color: #fff;
          font-size: 13.5px;
          font-family: var(--font-body);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          outline: none;
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        .resale-custom-select-trigger:hover {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .resale-custom-select-trigger.active {
          border-color: rgba(167, 139, 250, 0.45);
          box-shadow: 0 0 12px rgba(167, 139, 250, 0.1);
          background: rgba(255, 255, 255, 0.045);
        }

        .resale-custom-select-trigger svg {
          transition: transform 0.3s ease;
          color: rgba(255, 255, 255, 0.4);
        }

        .resale-custom-select-trigger.active svg {
          transform: rotate(180deg);
          color: var(--brand-cyan);
        }

        .resale-custom-select-options {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          width: 100%;
          max-height: 240px;
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.95) 0%, rgba(10, 8, 20, 0.98) 100%);
          border: 1px solid rgba(167, 139, 250, 0.2);
          border-radius: 12px;
          overflow-y: auto;
          z-index: 100;
          padding: 6px;
          box-shadow: 
            0 15px 40px rgba(0, 0, 0, 0.7),
            0 0 25px rgba(139, 92, 246, 0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-sizing: border-box;
        }

        .resale-custom-select-options::-webkit-scrollbar {
          width: 5px;
        }
        .resale-custom-select-options::-webkit-scrollbar-track {
          background: transparent;
        }
        .resale-custom-select-options::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }
        .resale-custom-select-options::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .resale-custom-select-option {
          padding: 10px 14px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 13.5px;
          font-family: var(--font-body);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
        }

        .resale-custom-select-option:hover {
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%);
          color: #fff;
          padding-left: 18px;
        }

        .resale-custom-select-option.selected {
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%);
          color: #fff;
          font-weight: 600;
          border-left: 2.5px solid var(--brand-cyan);
        }

        .resale-custom-select-option .option-check-icon {
          color: var(--brand-cyan);
          opacity: 0.85;
        }

        .resale-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 4, 10, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: resaleFadeIn 0.3s ease;
        }

        .resale-modal-card {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.95) 0%, rgba(10, 8, 20, 0.98) 100%);
          border: 1px solid rgba(167, 139, 250, 0.2);
          border-radius: 16px;
          padding: 28px;
          width: 90%;
          max-width: 520px;
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.6),
            0 0 30px rgba(139, 92, 246, 0.15);
          animation: resaleScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: #fff;
          text-align: left;
        }

        @keyframes resaleFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes resaleScaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .resale-modal-title {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 12px;
          color: #fff;
        }

        .resale-modal-ticket-list {
          max-height: 280px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
          padding-right: 6px;
        }

        .resale-modal-ticket-list::-webkit-scrollbar {
          width: 5px;
        }
        .resale-modal-ticket-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .resale-modal-ticket-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }

        .resale-modal-ticket-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          gap: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .resale-modal-ticket-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(167, 139, 250, 0.3);
        }

        .resale-modal-ticket-item.selected {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(167, 139, 250, 0.6);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.15);
        }
      `}</style>
      
      <div className="resale-header-box-office">
        <div className="resale-header-box-office-top-line" />
        
        <div className="resale-ticket-reflection" style={{ borderRadius: '20px' }} />

        <div className="resale-title-hover" style={{ zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="resale-neon-badge">
              <span className="resale-live-pulse-dot" />
              Ticket Exchange
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              • Live P2P Trading Hub
            </span>
          </div>
          <h2 className="resale-neon-title">
            <RefreshCw size={22} color="var(--brand-cyan)" className="resale-refresh-icon" />
            Sàn Giao Dịch Vé
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '600px', lineHeight: '1.5' }}>
            Quầy ký gửi và mua lại vé trực tiếp giữa những người hâm mộ. Hệ thống xác thực AuraPass đảm bảo giao dịch an toàn 100%.
          </p>
        </div>

        <button 
          onClick={async () => {
            if (!currentUser) {
              onNeedLogin();
            } else {
              onOpenWallet?.();
            }
          }}
          className="btn-resale-post-action"
          style={{
            zIndex: 4
          }}
        >
          <PlusCircle size={16} />
          Ký Gửi Vé Của Bạn
        </button>
      </div>

      {successMessage && (
        <div style={{
          backgroundColor: 'oklch(68% 0.18 155 / 0.12)',
          border: '1px solid var(--brand-emerald)',
          color: 'var(--brand-emerald)',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: 600
        }}>
          {successMessage}
        </div>
      )}

      {showAddForm && (
        <div className="resale-form-container">
          <div className="resale-form-header-wrapper">
            <h3 className="resale-form-title">Tạo Tin Đăng Ký Gửi Vé</h3>
            <span className="resale-form-subtitle">RESALE APPLICATION</span>
          </div>
          
          <form onSubmit={handleSubmit} className="resale-form-grid">
            <div className="resale-input-group" ref={selectRef}>
              <label className="resale-input-label">Chọn Sự Kiện</label>
              <div className="resale-custom-select-container">
                <button
                  type="button"
                  className={`resale-custom-select-trigger ${isDropdownOpen ? 'active' : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                    {selectedEvent?.title || "Chọn sự kiện..."}
                  </span>
                  <ChevronDown size={16} />
                </button>
                
                {isDropdownOpen && (
                  <div className="resale-custom-select-options">
                    {events.map(ev => (
                      <div
                        key={ev.id}
                        className={`resale-custom-select-option ${selectedEventId === ev.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedEventId(ev.id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                          {ev.title}
                        </span>
                        {selectedEventId === ev.id && <Check size={14} className="option-check-icon" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="resale-input-group">
              <label className="resale-input-label">Phân Khu Vé (Khu vực / Loại vé)</label>
              <input 
                type="text" 
                placeholder="Ví dụ: VIP Zone, Khán đài A..."
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="resale-input-field"
              />
            </div>

            <div className="resale-input-group">
              <label className="resale-input-label">Thông Tin Vị Trí Ghế (Nếu có)</label>
              <input 
                type="text" 
                placeholder="Ví dụ: Hàng B - Ghế 04 hoặc Vé đứng"
                value={seatInfo}
                onChange={(e) => setSeatInfo(e.target.value)}
                className="resale-input-field"
              />
            </div>

            <div className="resale-input-group">
              <label className="resale-input-label">Giá Gốc (VNĐ)</label>
              <input 
                type="number" 
                placeholder="Giá ghi trên vé"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="resale-input-field"
              />
            </div>

            <div className="resale-input-group">
              <label className="resale-input-label">Giá Sang Nhượng (VNĐ)</label>
              <input 
                type="number" 
                placeholder="Giá bạn muốn bán lại"
                value={resalePrice}
                onChange={(e) => setResalePrice(e.target.value)}
                className="resale-input-field"
              />
            </div>

            <div className="resale-input-group">
              <label className="resale-input-label">Tên Người Bán</label>
              <input 
                type="text" 
                placeholder="Họ tên của bạn"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="resale-input-field"
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="submit" className="resale-btn-submit">
                Xác Nhận Ký Gửi
              </button>
            </div>
          </form>
        </div>
      )}

      {tickets.length === 0 ? (
        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
          Hiện chưa có vé nào được đăng bán lại. Bạn hãy là người đầu tiên ký gửi!
        </p>
      ) : (
        <div className="resale-ticket-grid">
          {tickets.map(ticket => {
            const event = events.find(ev => ev.id === ticket.eventId);
            const fallbackImages = [
              'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80'
            ];
            const getFallback = (id) => {
              const hash = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              return fallbackImages[hash % fallbackImages.length];
            };
            const eventImage = event?.image || getFallback(ticket.id);
            const original = Number(ticket.originalPrice) || 0;
            const resale = Number(ticket.resalePrice) || 0;
            const savings = original > resale ? original - resale : 0;
            const discountPercent = original > 0 ? Math.round((savings / original) * 100) : 0;

            return (
              <div key={ticket.id} className="resale-ticket-card-wrapper">
                <div className="resale-ticket-body-part">
                  <div className="resale-ticket-reflection" />

                  <div className="resale-ticket-img-container">
                    <img 
                      src={eventImage} 
                      alt={ticket.eventTitle} 
                      className="resale-ticket-img"
                    />
                    <span className="resale-ticket-badge-resale">Sang Nhượng</span>
                    {discountPercent > 0 && (
                      <span className="resale-ticket-badge-discount">-{discountPercent}% OFF</span>
                    )}
                  </div>

                  <div className="resale-ticket-body">
                    <h4 className="resale-ticket-title">
                      {ticket.eventTitle}
                    </h4>
                    <div className="resale-ticket-pills-row">
                      <span className="resale-ticket-pill">
                        <MapPin size={11} color="var(--brand-cyan)" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.zoneName}
                        </span>
                      </span>
                      <span className="resale-ticket-pill">
                        <Armchair size={11} color="oklch(75% 0.09 300)" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.seatInfo}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="resale-ticket-stub-part">
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '12px',
                    right: '12px',
                    borderTop: '1.2px dashed rgba(255, 255, 255, 0.15)',
                    pointerEvents: 'none'
                  }} />

                  <div className="resale-ticket-stub">
                    <div className="resale-ticket-price-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Giá gốc:</span>
                        <span style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                          {formatPrice(ticket.originalPrice)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Giá bán lại:</span>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'oklch(72% 0.17 150)' }}>
                          {formatPrice(ticket.resalePrice)}
                        </span>
                      </div>
                      {savings > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: 'oklch(72% 0.17 150)', fontWeight: 600, marginTop: '2px' }}>
                          <span>Tiết kiệm: {formatPrice(savings)}</span>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => onBuyResale(ticket)}
                      className="resale-ticket-buy-btn"
                      style={{ marginTop: '2px' }}
                    >
                      <ShoppingCart size={13} />
                      MUA NGAY
                    </button>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      alignItems: 'center',
                      marginTop: '4px',
                      userSelect: 'none'
                    }}>
                      <div style={{
                        height: '10px',
                        width: '80%',
                        opacity: 0.08,
                        display: 'flex',
                        gap: '2px'
                      }}>
                        {[1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 1, 2, 1, 4, 2, 1, 3, 2].map((w, idx) => (
                          <div key={idx} style={{
                            width: `${w}px`,
                            height: '100%',
                            backgroundColor: 'var(--text-white)'
                          }} />
                        ))}
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '8px',
                        color: 'var(--text-muted)',
                        opacity: 0.45,
                        letterSpacing: '1px'
                      }}>
                        AURAPASS #TKT-{String(ticket.id).toUpperCase()}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                      paddingTop: '8px',
                      marginTop: '2px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={11} />
                        <span>{ticket.sellerName}</span>
                      </div>
                      <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--brand-cyan)', letterSpacing: '0.5px' }}>verified</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {showResaleModal && (
        <div className="resale-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowResaleModal(false); setSelectedUserTicket(null); setCustomResalePrice(''); } }}>
          <div className="resale-modal-card">
            <h4 className="resale-modal-title">Chọn Vé Ký Gửi Bán Lại</h4>
            
            {userTickets.filter(t => t.userId === currentUser?.id && t.status === 'active').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '20px' }}>
                  Bạn hiện không sở hữu tấm vé active nào có thể ký gửi bán lại.
                </p>
                <button 
                  onClick={() => setShowResaleModal(false)}
                  className="resale-btn-submit"
                  style={{ width: '100%' }}
                >
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <div className="resale-modal-ticket-list">
                  {userTickets
                    .filter(t => t.userId === currentUser?.id && t.status === 'active')
                    .map(ticket => {
                      const isSelected = selectedUserTicket?.id === ticket.id;
                      return (
                        <div 
                          key={ticket.id} 
                          className={`resale-modal-ticket-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedUserTicket(ticket);
                            setCustomResalePrice(String(Math.round(ticket.price * 0.85)));
                          }}
                        >
                          <img 
                            src={ticket.image} 
                            alt={ticket.eventTitle} 
                            style={{ width: '54px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }} 
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, justifyContent: 'center' }}>
                            <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ticket.eventTitle}
                            </h5>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
                              {ticket.zoneName} {ticket.seatNumber ? `• Ghế ${ticket.seatNumber}` : ''}
                            </p>
                            <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 600 }}>
                              Giá gốc: {formatPrice(ticket.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {selectedUserTicket && (
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.01)', 
                    border: '1px solid rgba(255, 255, 255, 0.05)', 
                    borderRadius: '10px', 
                    padding: '16px', 
                    marginBottom: '20px'
                  }}>
                    <div className="resale-input-group">
                      <label className="resale-input-label" style={{ color: '#a78bfa' }}>
                        Giá Sang Nhượng (VNĐ) - Gợi ý giảm 15%
                      </label>
                      <input 
                        type="number" 
                        value={customResalePrice}
                        onChange={(e) => setCustomResalePrice(e.target.value)}
                        placeholder="Nhập giá bạn muốn bán lại..."
                        className="resale-input-field"
                        style={{ marginTop: '4px' }}
                      />
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        * Giá bán lại không được vượt quá giá gốc của vé ({formatPrice(selectedUserTicket.price)}).
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button 
                    onClick={() => {
                      setShowResaleModal(false);
                      setSelectedUserTicket(null);
                      setCustomResalePrice('');
                    }}
                    className="resale-custom-select-trigger"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Hủy
                  </button>
                  <button 
                    disabled={!selectedUserTicket || !customResalePrice}
                    onClick={handleConfirmResaleListing}
                    className="resale-btn-submit"
                    style={{ 
                      flex: 1.5,
                      opacity: (!selectedUserTicket || !customResalePrice) ? 0.5 : 1,
                      cursor: (!selectedUserTicket || !customResalePrice) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Xác Nhận Ký Gửi
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
