import React, { useState, useEffect } from 'react';
import { Armchair, ArrowLeft, Layers, Info } from 'lucide-react';

const getSeatLayoutFromCapacity = (capacity = 0) => {
  const total = Math.max(1, Number(capacity) || 0);
  const cols = Math.min(total, 10);
  return { rows: Math.ceil(total / cols), cols };
};

const normalizeSeatZones = (zones = []) => zones.map((zone) => {
  if (!zone || zone.isStanding) return zone;
  const rows = Number(zone.rows) || 0;
  const cols = Number(zone.cols) || 0;
  if (rows > 0 && cols > 0) return { ...zone, rows, cols, availableTickets: rows * cols };
  const layout = getSeatLayoutFromCapacity(zone.availableTickets);
  return { ...zone, ...layout, availableTickets: layout.rows * layout.cols };
});

export default function SeatMap({ event, onBack, onProceedCheckout, showAlert }) {
  console.log('[SeatMap] eventType:', event?.eventType, '| id:', event?.id, '| title:', event?.title);
  const normalizedZones = normalizeSeatZones(event.zones || []);
  const [selectedZone, setSelectedZone] = useState(normalizedZones[0]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [standingCount, setStandingCount] = useState(0);
  const [takenSeats, setTakenSeats] = useState([]);
  const [loadingTakenSeats, setLoadingTakenSeats] = useState(false);
  const [allZoneTakenSeats, setAllZoneTakenSeats] = useState({});


  useEffect(() => {
    if (event.eventType === 'workshop') return;
    setSelectedSeats([]);
    setStandingCount(0);
  }, [selectedZone]);

  useEffect(() => {
    const fetchTakenSeats = async () => {
      if (!selectedZone || selectedZone.isStanding) {
        setTakenSeats([]);
        return;
      }
      setLoadingTakenSeats(true);
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/taken-seats?zoneId=${selectedZone.id}`);
        if (response.ok) {
          const data = await response.json();
          setTakenSeats(data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách ghế đã bán:", error);
      } finally {
        setLoadingTakenSeats(false);
      }
    };

    fetchTakenSeats();
  }, [selectedZone]);

  // Prefetch taken seats for all zones when workshop type
  useEffect(() => {
    if (event.eventType !== 'workshop') return;
    (async () => {
      const results = {};
      await Promise.all(
        (event.zones || []).filter(z => !z.isStanding).map(async zone => {
          try {
            const r = await fetch(`http://localhost:5000/api/bookings/taken-seats?zoneId=${zone.id}`);
            if (r.ok) results[zone.id] = await r.json();
          } catch {}
        })
      );
      setAllZoneTakenSeats(results);
    })();
  }, []);

  const isSeatTaken = (zoneId, rowIdx, seatNum) => {
    if (selectedZone.isStanding) return false;
    const rowLetter = String.fromCharCode(65 + rowIdx);
    const seatId = `${rowLetter}-${seatNum}`;
    return takenSeats.includes(seatId);
  };

  const toggleSeatSelection = (rowName, colNum) => {
    const seatId = `${rowName}-${colNum}`;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        showAlert("Bạn chỉ được đặt tối đa 6 ghế trong một lượt giao dịch.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };


  const handleStandingIncrement = () => {
    if (standingCount >= 6) {
      showAlert("Bạn chỉ được đặt tối đa 6 vé trong một lượt giao dịch.");
      return;
    }
    if (standingCount < selectedZone.availableTickets) {
      setStandingCount(standingCount + 1);
    }
  };

  const handleStandingDecrement = () => {
    if (standingCount > 0) {
      setStandingCount(standingCount - 1);
    }
  };

  const handleWorkshopSeatToggle = (zone, seatId) => {
    const key = `${zone.id}:${seatId}`;
    if (selectedSeats.includes(key)) {
      setSelectedSeats(selectedSeats.filter(k => k !== key));
    } else {
      if (selectedSeats.length >= 6) {
        showAlert('Bạn chỉ được đặt tối đa 6 ghế trong một lượt giao dịch.');
        return;
      }
      setSelectedSeats([...selectedSeats, key]);
      setSelectedZone(zone);
    }
  };

  const ticketCount = selectedZone.isStanding ? standingCount : selectedSeats.length;
  const totalPrice = ticketCount * selectedZone.price;


  const isVipZone = (zone) => zone && zone.name && /vip/i.test(zone.name);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleProceed = () => {
    if (ticketCount === 0) return;

    const ticketDetails = {
      event,
      zone: selectedZone,
      count: ticketCount,
      seats: selectedSeats,
      totalPrice
    };
    onProceedCheckout(ticketDetails);
  };

  // ── Online event: no seat selection, simple quantity UI ──
  if (event.eventType === 'online') {
    const onlineCount = standingCount;
    const onlineTotal = onlineCount * (selectedZone?.price || 0);
    return (
      <div style={{ padding: '36px 24px 48px', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Back */}
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)', padding: 0, alignSelf: 'flex-start' }}>
          <ArrowLeft size={14} /> QUAY LẠI
        </button>

        {/* Event banner */}
        <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
          {event.image && (
            <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
              <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75))' }} />
              <span style={{
                position: 'absolute', bottom: '12px', left: '16px',
                fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em',
                padding: '4px 10px', borderRadius: '4px',
                background: 'var(--brand-cyan)', color: '#000'
              }}>💻 SỰ KIỆN TRỰC TUYẾN</span>
            </div>
          )}
          <div style={{ padding: '16px 20px 20px' }}>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{event.title}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{event.date} {event.time && `· ${event.time}`}</div>
          </div>
        </div>

        {/* Zone selection */}
        {normalizedZones.length > 1 && (
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '10px' }}>LOẠI VÉ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {normalizedZones.map(zone => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  style={{
                    padding: '14px 16px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                    border: `1px solid ${selectedZone?.id === zone.id ? 'var(--brand-cyan)' : 'rgba(255,255,255,0.1)'}`,
                    background: selectedZone?.id === zone.id ? 'rgba(0,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{zone.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{zone.availableTickets} vé còn lại</div>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {formatPrice(zone.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + proceed */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '16px' }}>SỐ LƯỢNG VÉ</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <button
              onClick={handleStandingDecrement}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            >−</button>
            <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', minWidth: '32px', textAlign: 'center' }}>{onlineCount}</span>
            <button
              onClick={handleStandingIncrement}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--brand-cyan)', background: 'rgba(0,255,255,0.08)', color: 'var(--brand-cyan)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            >+</button>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>vé (tối đa 6)</span>
          </div>

          {/* Info box */}
          <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.15)', marginBottom: '20px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <span style={{ color: 'var(--brand-cyan)', fontWeight: 600 }}>💡 Lưu ý:</span> Link tham gia sẽ được hiển thị trong mục <strong style={{ color: 'var(--text-primary)' }}>Vé của tôi</strong> ngay sau khi thanh toán thành công.
          </div>

          {/* Summary row */}
          {onlineCount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{onlineCount} × {selectedZone?.name}</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brand-cyan)', fontFamily: 'var(--font-mono)' }}>{formatPrice(onlineTotal)}</span>
            </div>
          )}

          <button
            onClick={() => {
              if (onlineCount === 0) { showAlert('Vui lòng chọn ít nhất 1 vé'); return; }
              onProceedCheckout({ event, zone: selectedZone, count: onlineCount, seats: [], totalPrice: onlineTotal });
            }}
            disabled={onlineCount === 0}
            style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
              background: onlineCount > 0 ? 'linear-gradient(135deg, var(--brand-cyan), var(--brand-emerald))' : 'rgba(255,255,255,0.08)',
              color: onlineCount > 0 ? '#000' : 'var(--text-muted)',
              fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
              cursor: onlineCount > 0 ? 'pointer' : 'default', transition: 'all 0.2s'
            }}
          >
            TIẾN HÀNH THANH TOÁN →
          </button>
        </div>
      </div>
    );
  }

  // ── Workshop event: table floor plan ──
  if (event.eventType === 'workshop') {
    const wsCount = selectedSeats.length + standingCount;
    const wsTotal = selectedSeats.reduce((sum, key) => {
      const zId = key.split(':')[0];
      const z = normalizedZones.find(z => z.id === zId);
      return sum + (z?.price || 0);
    }, 0) + standingCount * (selectedZone?.isStanding ? (selectedZone?.price || 0) : 0);
    const wsSelectedZoneNames = [...new Set(selectedSeats.map(key => {
      const zId = key.split(':')[0];
      return normalizedZones.find(z => z.id === zId)?.name || '';
    }).filter(Boolean))];

    const getZoneCapacity = (zone) => {
      const orig = (event.zones || []).find(z => z.id === zone.id);
      if (!orig) return zone.availableTickets || 8;
      if (orig.rows > 0 && orig.cols > 0) return orig.rows * orig.cols;
      const taken = allZoneTakenSeats[zone.id] || [];
      return (orig.availableTickets || 0) + taken.length;
    };

    const renderTable = (zone) => {
      const taken = allZoneTakenSeats[zone.id] || [];
      const totalChairs = Math.max(1, Math.min(getZoneCapacity(zone), 14));
      const CONT = 260;
      const TABLE_R = 58;
      const ORBIT = 100;
      const CH_R = 18;
      const isZoneSel = selectedSeats.some(k => k.startsWith(`${zone.id}:`));

      return (
        <div key={zone.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', width: CONT, height: CONT }}>
            {/* Table surface */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: TABLE_R * 2, height: TABLE_R * 2, borderRadius: '50%',
              background: isZoneSel ? 'rgba(0,255,255,0.1)' : 'var(--glass-bg)',
              border: `2.5px solid ${isZoneSel ? 'var(--brand-cyan)' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', textAlign: 'center', padding: '6px', zIndex: 1, boxSizing: 'border-box'
            }}>
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isZoneSel ? 'var(--brand-cyan)' : 'var(--text-primary)', lineHeight: 1.3 }}>
                {zone.name}
              </span>
              <span style={{ fontSize: '10px', color: isZoneSel ? 'rgba(0,255,255,0.8)' : 'var(--text-muted)', marginTop: '3px' }}>
                {formatPrice(zone.price)}
              </span>
            </div>

            {/* Chairs around the table */}
            {Array.from({ length: totalChairs }, (_, i) => {
              const angle = (i / totalChairs) * 2 * Math.PI - Math.PI / 2;
              const cx = CONT / 2 + Math.cos(angle) * ORBIT - CH_R;
              const cy = CONT / 2 + Math.sin(angle) * ORBIT - CH_R;
              const seatId = `${i + 1}`;
              const isTaken = taken.some(t => {
                if (t === seatId) return true;
                // legacy format "ZoneName-N": only match if zone name also matches
                const dash = t.lastIndexOf('-');
                if (dash === -1) return false;
                return t.substring(0, dash) === zone.name && t.substring(dash + 1) === seatId;
              });
              const isSel = selectedSeats.includes(`${zone.id}:${seatId}`);
              return (
                <div key={i}
                  onClick={() => { if (!isTaken) handleWorkshopSeatToggle(zone, String(i + 1)); }}
                  title={isTaken ? 'Đã đặt' : `Ghế ${i + 1}`}
                  style={{
                    position: 'absolute', left: cx, top: cy,
                    width: CH_R * 2, height: CH_R * 2, borderRadius: '50%',
                    background: isTaken ? 'rgba(239,68,68,0.25)' : isSel ? 'var(--brand-cyan)' : 'rgba(255,255,255,0.1)',
                    border: `2px solid ${isTaken ? 'rgba(239,68,68,0.6)' : isSel ? 'var(--brand-cyan)' : 'rgba(255,255,255,0.25)'}`,
                    cursor: isTaken ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600,
                    color: isTaken ? 'rgba(239,68,68,0.6)' : isSel ? '#000' : 'var(--text-muted)',
                    transition: 'all 0.15s'
                  }}
                >{i + 1}</div>
              );
            })}
          </div>

          <div style={{ fontSize: '14px', fontWeight: 700, color: isZoneSel ? 'var(--brand-cyan)' : 'var(--text-primary)', textAlign: 'center', maxWidth: '180px', lineHeight: 1.3 }}>
            {zone.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{zone.availableTickets} ghế còn</div>
        </div>
      );
    };

    const seatedZones = normalizedZones.filter(z => !z.isStanding);
    const standingZones = normalizedZones.filter(z => z.isStanding);

    if (seatedZones.length === 0 && standingZones.length === 0) {
      return (
        <div className="seatmap-outer-wrapper" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', minHeight: '300px' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', padding: 0, alignSelf: 'flex-start', marginBottom: '16px' }}>
            <ArrowLeft size={14} /> QUAY LẠI
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🪑</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Sự kiện chưa cấu hình chỗ ngồi</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Ban tổ chức chưa thêm phân khu vé cho sự kiện này.</div>
          </div>
        </div>
      );
    }

    return (
      <div className="seatmap-outer-wrapper" style={{ padding: '36px 24px 48px 24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>

        {/* Back button */}
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)', padding: 0, alignSelf: 'flex-start' }}>
          <ArrowLeft size={14} /> QUAY LẠI DANH SÁCH SỰ KIỆN
        </button>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>

          {/* LEFT: Floor plan panel */}
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '0.12em', color: 'var(--brand-cyan)', textTransform: 'uppercase', fontWeight: 600 }}>Workshop Floor Plan</span>
              <h2 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 700, margin: '8px 0 6px 0', color: 'var(--text-primary)' }}>Chọn Bàn & Ghế Ngồi</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>{event.title}</p>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
              {[
                { bg: 'rgba(255,255,255,0.08)', bd: 'rgba(255,255,255,0.18)', label: 'Còn trống' },
                { bg: 'var(--brand-cyan)', bd: 'var(--brand-cyan)', label: 'Đang chọn' },
                { bg: 'rgba(239,68,68,0.2)', bd: 'rgba(239,68,68,0.5)', label: 'Đã đặt' }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 13, height: 13, borderRadius: '50%', background: item.bg, border: `1.5px solid ${item.bd}`, flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Screen/stage bar */}
            <div style={{ width: '55%', maxWidth: '320px', margin: '0 auto', padding: '9px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', textAlign: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              KHU VỰC GIẢNG / TRÌNH CHIẾU
            </div>

            {/* Tables grid */}
            {seatedZones.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                {seatedZones.map(zone => renderTable(zone))}
              </div>
            )}

            {/* Standing zones */}
            {standingZones.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.1em', marginBottom: '12px' }}>KHU VỰC ĐỨNG / GENERAL ADMISSION</div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {standingZones.map(zone => (
                    <button key={zone.id} onClick={() => { setSelectedZone(zone); setSelectedSeats([]); setStandingCount(0); }} style={{ padding: '12px 18px', borderRadius: '10px', cursor: 'pointer', border: `1px solid ${selectedZone?.id === zone.id ? 'var(--brand-cyan)' : 'rgba(255,255,255,0.12)'}`, background: selectedZone?.id === zone.id ? 'rgba(0,255,255,0.06)' : 'rgba(255,255,255,0.02)', textAlign: 'center', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{zone.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--brand-cyan)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{formatPrice(zone.price)}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{zone.availableTickets} còn lại</div>
                    </button>
                  ))}
                </div>
                {selectedZone?.isStanding && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
                    <button onClick={handleStandingDecrement} style={{ width: 36, height: 36, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', minWidth: '28px', textAlign: 'center' }}>{standingCount}</span>
                    <button onClick={handleStandingIncrement} style={{ width: 36, height: 36, borderRadius: '8px', border: '1px solid var(--brand-cyan)', background: 'rgba(0,255,255,0.08)', color: 'var(--brand-cyan)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Invoice panel */}
          <div style={{ background: 'var(--invoice-bg)', border: '1px solid var(--invoice-border)', borderRadius: '24px', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '120px' }}>

            {/* Invoice header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontWeight: 700 }}>TICKET INVOICE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--brand-gold)', letterSpacing: '0.05em', fontWeight: 600, marginTop: '2px' }}>
                  #WS-{(event.id || '').toString().substring(0, 4).toUpperCase()}-{(selectedZone?.id || '').toString().replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>WORKSHOP SEAT</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--brand-cyan)', fontWeight: 600, letterSpacing: '0.05em' }}>AURAPASS</div>
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { label: 'Sự kiện:', value: event.title },
                { label: 'Bàn:', value: wsSelectedZoneNames.length > 0 ? wsSelectedZoneNames.join(', ') : '—' },
                { label: 'Đơn giá / ghế:', value: formatPrice(selectedZone?.price || 0), cyan: true },
                { label: 'Phí dịch vụ & VAT:', value: '0đ (Đã bao gồm)' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: '12px', color: row.cyan ? 'var(--brand-cyan)' : 'var(--text-primary)', textAlign: 'right', wordBreak: 'break-word', maxWidth: '170px' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Selected seats */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '10px' }}>
                {wsCount === 0 ? '✦ CHƯA CHỌN GHẾ ✦' : `${wsCount} GHẾ ĐANG CHỌN`}
              </div>
              {wsCount === 0 ? (
                <div style={{ border: '1.5px dashed rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--brand-gold)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '6px' }}>✦ KHÔNG CÓ GHẾ ĐƯỢC CHỌN ✦</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>Vui lòng nhấp vào ghế trên sơ đồ bàn để đặt chỗ.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', maxHeight: '240px', overflowY: 'auto' }}>
                  {selectedSeats.map(key => {
                    const [zId, seatNum] = key.split(':');
                    const z = normalizedZones.find(z => z.id === zId);
                    return (
                      <div key={key} style={{ display: 'flex', height: '54px', background: 'linear-gradient(135deg, rgba(22,16,42,0.85) 0%, rgba(10,8,20,0.95) 100%)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                        <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.12em', color: '#a78bfa', background: 'rgba(139,92,246,0.12)', padding: '1px 5px', borderRadius: '3px', alignSelf: 'flex-start' }}>WORKSHOP SEAT</span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2d9f3' }}>{z?.name} · Ghế {seatNum}</span>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0', flexShrink: 0 }} />
                        <div style={{ width: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', flexShrink: 0 }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{formatPrice(z?.price || 0)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
              <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', color: wsCount === 0 ? 'var(--text-muted)' : 'var(--brand-cyan)' }}>
                {formatPrice(wsTotal)}
              </span>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', display: 'flex', gap: '6px' }}>
              <Info size={13} color="var(--brand-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Giới hạn tối đa 6 vé trên một giao dịch. Hệ thống sẽ giữ vé trong 10 phút sau khi nhấn Đặt Vé.</span>
            </div>

            {/* Proceed button */}
            <button
              onClick={() => {
                if (wsCount === 0) { showAlert('Vui lòng chọn ít nhất 1 ghế'); return; }
                const firstZId = selectedSeats[0]?.split(':')[0];
                const firstZone = normalizedZones.find(z => z.id === firstZId) || selectedZone;
                onProceedCheckout({
                  event,
                  zone: firstZone,
                  count: wsCount,
                  seats: selectedSeats.map(k => k.split(':')[1]),
                  perSeatZoneIds: selectedSeats.map(k => k.split(':')[0]),
                  totalPrice: wsTotal
                });
              }}
              disabled={wsCount === 0}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: wsCount > 0 ? 'linear-gradient(135deg, var(--brand-cyan), var(--brand-emerald))' : 'rgba(255,255,255,0.08)', color: wsCount > 0 ? '#000' : 'var(--text-muted)', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', cursor: wsCount > 0 ? 'pointer' : 'default', transition: 'all 0.2s' }}
            >
              TIẾP TỤC ĐẶT VÉ →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seatmap-outer-wrapper" style={{ padding: '36px 24px 48px 24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>

      <style>{`

        .vip-seat-glass-panel {
          background: var(--glass-bg) !important;
          border: 1px solid var(--glass-border) !important;
          border-radius: 24px !important;
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .vip-seat-glass-panel:hover {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }


        .seat {
          width: 38px !important;
          height: 38px !important;
          border-radius: 8px 8px 4px 4px !important;
          border: 1.5px solid rgba(255, 255, 255, 0.15) !important;
          background: rgba(255, 255, 255, 0.02) !important;
          font-size: 11.5px !important;
          font-family: var(--font-mono) !important;
          color: rgba(255, 255, 255, 0.45) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          user-select: none !important;
          position: relative;
          box-sizing: border-box;
          box-shadow: 
            inset 0 1px 1px rgba(255, 255, 255, 0.03), 
            inset 2px 0 0 rgba(255, 255, 255, 0.04),
            inset -2px 0 0 rgba(255, 255, 255, 0.04),
            0 2px 4px rgba(0,0,0,0.15);
        }


        .seat::before {
          content: '';
          position: absolute;
          bottom: 3px;
          left: 4px;
          right: 4px;
          height: 11px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 3px;
          transition: all 0.25s ease;
          box-shadow: inset 0 -1px 2px rgba(0, 0, 0, 0.3);
          z-index: 1;
        }

        .seat.vip {
          border-color: rgba(253, 218, 13, 0.3) !important;
          color: rgba(253, 218, 13, 0.75) !important;
          background: rgba(253, 218, 13, 0.02) !important;
          box-shadow: 
            0 0 6px rgba(253, 218, 13, 0.05),
            inset 0 1px 1px rgba(255, 255, 255, 0.02),
            inset 2.5px 0 0 rgba(253, 218, 13, 0.05),
            inset -2.5px 0 0 rgba(253, 218, 13, 0.05);
        }
        .seat.vip::before {
          background: rgba(253, 218, 13, 0.12);
        }
        
        .seat.vip:hover:not(.taken):not(.selected) {
          border-color: var(--brand-gold) !important;
          background: rgba(253, 218, 13, 0.18) !important;
          color: #fff !important;
          box-shadow: 0 0 15px rgba(253, 218, 13, 0.45), 0 0 30px rgba(253, 218, 13, 0.2) !important;
          transform: scale(1.12) !important;
        }
        .seat.vip:hover::before {
          background: rgba(253, 218, 13, 0.3) !important;
        }

        .seat.standard {
          border-color: rgba(167, 139, 250, 0.3) !important;
          color: rgba(167, 139, 250, 0.75) !important;
          background: rgba(167, 139, 250, 0.02) !important;
          box-shadow: 
            0 0 6px rgba(167, 139, 250, 0.05),
            inset 0 1px 1px rgba(255, 255, 255, 0.02),
            inset 2.5px 0 0 rgba(167, 139, 250, 0.05),
            inset -2.5px 0 0 rgba(167, 139, 250, 0.05);
        }
        .seat.standard::before {
          background: rgba(167, 139, 250, 0.12);
        }

        .seat.standard:hover:not(.taken):not(.selected) {
          border-color: var(--brand-violet) !important;
          background: rgba(167, 139, 250, 0.18) !important;
          color: #fff !important;
          box-shadow: 0 0 15px rgba(167, 139, 250, 0.45), 0 0 30px rgba(167, 139, 250, 0.2) !important;
          transform: scale(1.12) !important;
        }
        .seat.standard:hover::before {
          background: rgba(167, 139, 250, 0.3) !important;
        }

        .seat.taken {
          background: rgba(255, 255, 255, 0.06) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          color: rgba(255, 255, 255, 0.15) !important;
          opacity: 0.65 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }
        .seat.taken::before {
          content: '' !important;
          position: absolute !important;
          top: 15% !important;
          left: 50% !important;
          width: 1.5px !important;
          height: 70% !important;
          background: rgba(239, 68, 68, 0.6) !important;
          transform: translateX(-50%) rotate(45deg) !important;
          display: block !important;
          z-index: 2 !important;
          box-shadow: none !important;
          border-radius: 1px !important;
        }
        .seat.taken::after {
          content: '' !important;
          position: absolute !important;
          top: 15% !important;
          left: 50% !important;
          width: 1.5px !important;
          height: 70% !important;
          background: rgba(239, 68, 68, 0.6) !important;
          transform: translateX(-50%) rotate(-45deg) !important;
          display: block !important;
          z-index: 2 !important;
          box-shadow: none !important;
          border-radius: 1px !important;
        }

        .seat.selected {
          font-weight: 800 !important;
          transform: scale(1.12) !important;
          animation: seatPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes seatPop {
          0% { transform: scale(0.9); }
          50% { transform: scale(1.18); }
          100% { transform: scale(1.12); }
        }

        .seat.vip.selected {
          background: var(--brand-gold) !important;
          color: #0b0b0f !important;
          border-color: var(--brand-gold) !important;
          box-shadow: 0 0 20px rgba(253, 218, 13, 0.6), 0 0 35px rgba(253, 218, 13, 0.25) !important;
        }
        .seat.vip.selected::before {
          background: rgba(0, 0, 0, 0.15) !important;
        }

        .seat.standard.selected {
          background: var(--brand-violet) !important;
          color: #fff !important;
          border-color: var(--brand-violet) !important;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.6), 0 0 35px rgba(139, 92, 246, 0.25) !important;
        }
        .seat.standard.selected::before {
          background: rgba(0, 0, 0, 0.15) !important;
        }


        .seatmap-stage-container {
          width: 100%;
          margin: 10px auto 36px auto;
          position: relative;
          text-align: center;
        }
        .seatmap-stage-glow {
          position: absolute;
          top: 0;
          left: 5%;
          width: 90%;
          height: 60px;
          background: radial-gradient(ellipse at top, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 75%);
          border-radius: 0 0 100px 100px;
          border-bottom: 2.5px solid var(--brand-cyan);
          box-shadow: 
            0 8px 24px rgba(6, 182, 212, 0.25),
            0 0 40px rgba(139, 92, 246, 0.12);
          z-index: 1;
        }
        .seatmap-stage-title {
          position: relative;
          z-index: 2;
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.35em;
          color: #fff;
          text-shadow: 
            0 0 10px rgba(6, 182, 212, 0.6),
            0 0 20px rgba(139, 92, 246, 0.3);
          padding-top: 14px;
        }

        /* Lưới ghế và ranh giới phân khu */
        .seat-grid-scroll-wrapper {
          overflow-x: auto;
          display: flex;
          justify-content: center;
          width: 100%;
          padding-bottom: 12px;
        }
        .seat-grid-scroll-wrapper::-webkit-scrollbar {
          height: 5px;
        }
        .seat-grid-scroll-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        .seat-grid-scroll-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }

        .seat-grid-container {
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 24px;
          padding: 28px;
          background: rgba(255, 255, 255, 0.003);
          position: relative;
          margin-bottom: 8px;
          transition: all 0.3s ease;
        }
        .seat-grid-container.vip-active {
          border-color: rgba(253, 218, 13, 0.18);
          background: radial-gradient(circle at center, rgba(253, 218, 13, 0.015) 0%, transparent 80%);
          box-shadow: 0 0 35px rgba(253, 218, 13, 0.02);
        }
        .seat-grid-container.standard-active {
          border-color: rgba(167, 139, 250, 0.15);
          background: radial-gradient(circle at center, rgba(167, 139, 250, 0.01) 0%, transparent 80%);
          box-shadow: 0 0 35px rgba(139, 92, 246, 0.01);
        }


        .seatmap-watermark {
          position: absolute;
          bottom: 20px;
          right: 20px;
          color: rgba(255, 255, 255, 0.012);
          pointer-events: none;
          z-index: 1;
        }


        .counter-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-white);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.2s ease;
        }
        
        .counter-btn:hover:not(:disabled) {
          border-color: var(--brand-cyan);
          background: rgba(6, 182, 212, 0.05);
          box-shadow: 0 0 12px var(--brand-cyan-glow);
          color: #fff;
        }

        .counter-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }


        .mini-ticket-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .mini-ticket-wrapper::-webkit-scrollbar {
          width: 4px;
        }
        .mini-ticket-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .mini-ticket {
          position: relative;
          display: flex;
          height: 78px;
          background: linear-gradient(135deg, rgba(22, 16, 42, 0.85) 0%, rgba(10, 8, 20, 0.95) 100%);
          border-radius: 12px;
          overflow: visible;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mini-ticket.vip {
          border: 1px solid rgba(253, 218, 13, 0.18);
        }
        .mini-ticket.vip:hover {
          border-color: rgba(253, 218, 13, 0.45);
          box-shadow: 0 8px 28px rgba(253, 218, 13, 0.08);
          transform: translateY(-1px);
        }

        .mini-ticket.standard {
          border: 1px solid rgba(167, 139, 250, 0.18);
        }
        .mini-ticket.standard:hover {
          border-color: rgba(167, 139, 250, 0.45);
          box-shadow: 0 8px 28px rgba(167, 139, 250, 0.08);
          transform: translateY(-1px);
        }

        .mini-ticket.standing {
          border: 1px solid rgba(6, 182, 212, 0.18);
        }
        .mini-ticket.standing:hover {
          border-color: rgba(6, 182, 212, 0.45);
          box-shadow: 0 8px 28px rgba(6, 182, 212, 0.08);
          transform: translateY(-1px);
        }

        .mini-ticket-body {
          width: 68%;
          padding: 10px 14px 10px 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
          text-align: left;
        }

        .mini-ticket-badge {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.14em;
          font-weight: 700;
          text-transform: uppercase;
        }
        .mini-ticket-badge.vip {
          color: var(--brand-gold);
        }
        .mini-ticket-badge.standard {
          color: var(--brand-violet-glow);
        }
        .mini-ticket-badge.standing {
          color: var(--brand-cyan);
        }

        .mini-ticket-title {
          font-family: var(--font-display);
          font-size: 11px;
          color: rgba(255, 255, 255, 0.45);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 1px 0;
        }

        .mini-ticket-seat {
          font-family: var(--font-mono);
          font-size: 15px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.02em;
        }

        .mini-ticket-stub {
          width: 32%;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: rgba(255, 255, 255, 0.01);
          border-top-right-radius: 12px;
          border-bottom-right-radius: 12px;
          box-sizing: border-box;
        }

        .mini-ticket-price {
          font-family: var(--font-mono);
          font-size: 11.5px;
          font-weight: 700;
        }
        .mini-ticket-price.vip {
          color: var(--brand-gold);
        }
        .mini-ticket-price.standard {
          color: var(--brand-violet-glow);
        }
        .mini-ticket-price.standing {
          color: var(--brand-cyan);
        }

        .mini-ticket-divider {
          width: 1px;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }
        .mini-ticket-divider-line {
          position: absolute;
          top: 8px;
          bottom: 8px;
          width: 1px;
          background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 50%, transparent 50%);
          background-size: 1px 6px;
          background-repeat: repeat-y;
        }

        .mini-ticket-notch {
          position: absolute;
          width: 12px;
          height: 12px;
          background: var(--bg-dark-gray) !important;
          border-radius: 50%;
          z-index: 10;
        }
        .mini-ticket-notch.notch-top {
          top: -6px;
          left: -6px;
        }
        .mini-ticket-notch.notch-bottom {
          bottom: -6px;
          left: -6px;
        }


        .mini-ticket-placeholder {
          width: 100%;
          border: 1.5px dashed rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 24px 16px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.002);
          transition: all 0.3s ease;
        }
        .mini-ticket-placeholder:hover {
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.005);
        }


        .seatmap-summary-box {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }


        .luxury-receipt {
          background: linear-gradient(180deg, rgba(28, 22, 48, 0.95) 0%, rgba(18, 14, 30, 0.97) 100%) !important;
          border: 1px solid rgba(167, 139, 250, 0.22) !important;
          border-radius: 24px !important;
          box-shadow: 
            0 30px 70px rgba(0, 0, 0, 0.65),
            0 0 45px rgba(139, 92, 246, 0.06),
            inset 0 1px 2px rgba(255, 255, 255, 0.06) !important;
          position: relative;
          overflow: visible !important;
        }


        .luxury-receipt::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 12px;
          right: 12px;
          height: 6px;
          background-image: 
            linear-gradient(45deg, transparent 33.333%, #06040c 33.333%, #06040c 66.667%, transparent 66.667%),
            linear-gradient(-45deg, transparent 33.333%, #06040c 33.333%, #06040c 66.667%, transparent 66.667%);
          background-size: 10px 12px;
          background-position: 0 -6px;
          background-repeat: repeat-x;
          opacity: 0.85;
          z-index: 10;
        }


        .luxury-receipt-tear {
          height: 6px;
          width: 100%;
          background-image: radial-gradient(circle at 50% 100%, #06040a 4px, transparent 5px);
          background-size: 12px 12px;
          background-repeat: repeat-x;
          position: absolute;
          bottom: -1px;
          left: 0;
          z-index: 10;
          opacity: 0.95;
        }

        .receipt-header-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
          padding-bottom: 14px;
          margin-bottom: 16px;
          position: relative;
          z-index: 5;
        }

        .receipt-watermark-crest {
          position: absolute;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.015;
          pointer-events: none;
          z-index: 1;
          color: var(--brand-cyan);
        }

        .receipt-summary-table {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
          padding-bottom: 16px;
          margin-bottom: 16px;
          position: relative;
          z-index: 5;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 13.5px;
          gap: 16px;
        }

        .receipt-row-label {
          color: rgba(255, 255, 255, 0.45);
          font-family: var(--font-body);
        }

        .receipt-row-value {
          font-weight: 600;
          color: #fff;
          text-align: right;
          font-family: var(--font-body);
        }

        .receipt-serial {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.16em;
          color: rgba(255, 255, 255, 0.35);
          text-transform: uppercase;
        }
      `}</style>


      <button
        onClick={onBack}
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
        QUAY LẠI DANH SÁCH SỰ KIỆN
      </button>


      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '32px',
        alignItems: 'start'
      }}>


        <div className="vip-seat-glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          <div className="seatmap-watermark">
            <svg width="220" height="220" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
              <rect x="5" y="20" width="90" height="60" rx="6" />
              <circle cx="70" cy="20" r="4" fill="none" />
              <circle cx="70" cy="80" r="4" fill="none" />
              <line x1="70" y1="24" x2="70" y2="76" strokeDasharray="2 2" />
              <path d="M38 42 s6-3 6-7V29l-6-2-6 2v6c0 4 6 7 6 7z" />
              <text x="15" y="65" fontFamily="var(--font-mono)" fontSize="4" letterSpacing="0.5" opacity="0.6">VIP INVITATION PASS</text>
            </svg>
          </div>

          <div style={{ zIndex: 2, position: 'relative' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '0.12em', color: 'var(--brand-cyan)', textTransform: 'uppercase', fontWeight: 600 }}>
              Seat Map Selection
            </span>
            <h2 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 700, margin: '8px 0 6px 0', color: '#fff' }}>Chọn Vé & Vị Trí Ghế</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{event.title}</p>
          </div>


          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px', zIndex: 2, position: 'relative' }}>
            {normalizedZones.map((zone) => {
              const isActive = selectedZone.id === zone.id;
              const isVip = zone.id === 'vip-zone';
              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={isActive ? 'zone-pill-active' : 'zone-pill-inactive'}
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: `1px solid ${isActive ? (isVip ? 'var(--brand-gold)' : 'var(--brand-violet)') : 'rgba(255,255,255,0.06)'}`,
                    color: isActive ? 'var(--text-white)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isActive ? (isVip ? '0 0 15px var(--brand-gold-glow)' : '0 0 15px var(--brand-violet-glow)') : 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isVip ? 'var(--brand-gold)' : 'var(--brand-violet)',
                    boxShadow: `0 0 6px ${isVip ? 'var(--brand-gold)' : 'var(--brand-violet)'}`,
                    display: 'inline-block'
                  }} />
                  {zone.name} - {formatPrice(zone.price)}
                </button>
              );
            })}
          </div>


          {selectedZone.isStanding ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '56px 32px',
            backgroundColor: 'rgba(255,255,255,0.01)',
            borderRadius: '12px',
            border: '1px dashed rgba(255,255,255,0.08)',
            zIndex: 2,
            position: 'relative'
          }}>
            <Armchair size={40} color="var(--brand-cyan)" style={{ marginBottom: '20px', opacity: 0.8 }} />
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '6px' }}>Vé Đứng GA (Tự Do)</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '28px', textAlign: 'center', maxWidth: '360px', lineHeight: '1.5' }}>
              Vị trí đứng tự do trong khu vực phòng vé. Vé còn lại: <strong style={{ color: 'var(--text-white)' }}>{selectedZone.availableTickets}</strong> vé.
            </p>


            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button
                onClick={handleStandingDecrement}
                disabled={standingCount === 0}
                className="counter-btn"
              >
                -
              </button>
              <span style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', fontWeight: 700, width: '40px', textAlign: 'center', color: 'var(--text-white)' }}>
                {standingCount}
              </span>
              <button
                onClick={handleStandingIncrement}
                disabled={standingCount >= 6}
                className="counter-btn"
              >
                +
              </button>
            </div>
          </div>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 2, position: 'relative' }}>
            <div className="seatmap-stage-container">
              <div className="seatmap-stage-glow" />
              <span className="seatmap-stage-title">✦ MAIN STAGE ✦</span>
            </div>


            <div className="seat-grid-scroll-wrapper">
              <div className={`seat-grid-container ${isVipZone(selectedZone) ? 'vip-active' : 'standard-active'}`}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  minWidth: 'fit-content'
                }}>
                  {Array.from({ length: selectedZone.rows }).map((_, rIdx) => {
                    const rowLetter = String.fromCharCode(65 + rIdx); // A, B, C, D...
                    return (
                      <div key={rowLetter} style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>

                        <span style={{
                          width: '18px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {rowLetter}
                        </span>


                        <div style={{ display: 'flex', gap: '10px' }}>
                          {Array.from({ length: selectedZone.cols }).map((_, cIdx) => {
                            const seatNum = cIdx + 1;
                            const isTaken = isSeatTaken(selectedZone.id, rIdx, seatNum);
                            const seatId = `${rowLetter}-${seatNum}`;
                            const isSelected = selectedSeats.includes(seatId);

                            return (
                              <button
                                key={seatNum}
                                disabled={isTaken}
                                onClick={() => toggleSeatSelection(rowLetter, seatNum)}
                                className={`seat ${isVipZone(selectedZone) ? 'vip' : 'standard'} ${isTaken ? 'taken' : ''} ${isSelected ? 'selected' : ''}`}
                                title={`${rowLetter}-${seatNum} (${isTaken ? 'Đã bán' : 'Còn trống'})`}
                              >
                                {isSelected ? '◉' : (seatNum < 10 ? `0${seatNum}` : seatNum)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>


            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              fontSize: '12px',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              paddingTop: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`seat ${isVipZone(selectedZone) ? 'vip' : 'standard'}`} style={{ cursor: 'default' }} />
                <span style={{ color: 'var(--text-muted)' }}>Còn trống</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="seat selected" style={{ cursor: 'default', background: isVipZone(selectedZone) ? 'var(--brand-gold)' : 'var(--brand-violet)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>◉</span>
                <span style={{ color: 'var(--text-muted)' }}>Đang chọn</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="seat taken" style={{ cursor: 'default' }} />
                <span style={{ color: 'var(--text-muted)' }}>Đã bán</span>
              </div>
            </div>
          </div>
          )}
        </div>


        <div className="luxury-receipt" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '120px', borderRadius: '24px' }}>
          {/* Đường răng cưa đáy hóa đơn */}
          <div className="luxury-receipt-tear" />

          {/* Logo chìm giữa hóa đơn */}
          <div className="receipt-watermark-crest">
            <svg width="200" height="200" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
              <circle cx="50" cy="50" r="45" strokeDasharray="1 3" />
              <path d="M50 20 L53.5 35 L68 35 L56 44 L60.5 59 L50 50 L39.5 59 L44 44 L32 35 L46.5 35 Z" fill="currentColor" opacity="0.1" />
            </svg>
          </div>

          {/* Tiêu đề hóa đơn */}
          <div className="receipt-header-meta" style={{ marginBottom: '4px', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
              <span className="receipt-serial">TICKET INVOICE</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--brand-gold)', letterSpacing: '0.05em', fontWeight: 600 }}>
                #INV-{event.id.substring(0, 4).toUpperCase()}-{selectedZone.id.replace('-zone', '').toUpperCase()}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block' }}>OFFICIAL ACCESS</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--brand-cyan)', letterSpacing: '0.05em', fontWeight: 600 }}>AURAPASS VIP</span>
            </div>
          </div>

          {/* Chi tiết hóa đơn */}
          <div className="receipt-summary-table" style={{ gap: '10px', marginBottom: '4px', paddingBottom: '12px' }}>
            <div className="receipt-row">
              <span className="receipt-row-label">Sự kiện:</span>
              <span className="receipt-row-value" style={{ maxWidth: '170px', wordBreak: 'break-word' }}>{event.title}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Khu vực:</span>
              <span className="receipt-row-value">{selectedZone.name}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Đơn giá:</span>
              <span className="receipt-row-value" style={{ color: isVipZone(selectedZone) ? 'var(--brand-gold)' : 'var(--brand-cyan)' }}>{formatPrice(selectedZone.price)}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Phí dịch vụ & VAT:</span>
              <span className="receipt-row-value">0đ (Đã bao gồm)</span>
            </div>
          </div>

          {/* Danh sách vé đang chọn */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 5, position: 'relative' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', fontWeight: 700, textAlign: 'left', display: 'block' }}>
              {ticketCount === 0 ? '✦ CHƯA CHỌN VÉ ✦' : `${ticketCount} VÉ ĐANG CHỌN`}
            </span>

            {ticketCount === 0 ? (
              <div className="mini-ticket-placeholder">
                <span style={{ fontSize: '11px', color: 'var(--brand-gold)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '6px' }}>✦ KHÔNG CÓ GHẾ ĐƯỢC CHỌN ✦</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
                  Vui lòng chọn vị trí trên sơ đồ để kích hoạt vé mời VIP của bạn.
                </span>
              </div>
            ) : selectedZone.isStanding ? (

              <div className="mini-ticket-wrapper">
                {Array.from({ length: standingCount }).map((_, idx) => (
                  <div key={idx} className="mini-ticket standing">
                    <div className="mini-ticket-notch notch-top"></div>
                    <div className="mini-ticket-notch notch-bottom"></div>
                    <div className="mini-ticket-body">
                      <span className="mini-ticket-badge standing">GA PASS</span>
                      <span className="mini-ticket-title">{event.title}</span>
                      <span className="mini-ticket-seat">VÉ ĐỨNG #{idx + 1}</span>
                    </div>
                    <div className="mini-ticket-divider">
                      <div className="mini-ticket-divider-line"></div>
                    </div>
                    <div className="mini-ticket-stub">
                      <span className="mini-ticket-price standing">{formatPrice(selectedZone.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (

              <div className="mini-ticket-wrapper">
                {selectedSeats.map(seatId => {
                  const isVip = isVipZone(selectedZone);
                  return (
                    <div key={seatId} className={`mini-ticket ${isVip ? 'vip' : 'standard'}`}>
                      <div className="mini-ticket-notch notch-top"></div>
                      <div className="mini-ticket-notch notch-bottom"></div>
                      <div className="mini-ticket-body">
                        <span className={`mini-ticket-badge ${isVip ? 'vip' : 'standard'}`}>{isVip ? 'VIP PASS' : 'STANDARD PASS'}</span>
                        <span className="mini-ticket-title">{event.title}</span>
                        <span className="mini-ticket-seat">GHẾ {seatId}</span>
                      </div>
                      <div className="mini-ticket-divider">
                        <div className="mini-ticket-divider-line"></div>
                      </div>
                      <div className="mini-ticket-stub">
                        <span className={`mini-ticket-price ${isVip ? 'vip' : 'standard'}`}>{formatPrice(selectedZone.price)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tóm tắt vị trí vé */}
          {ticketCount > 0 && (
            <div className="seatmap-summary-box" style={{ zIndex: 5, position: 'relative', marginTop: '-4px' }}>
              <strong>Tóm tắt:</strong> Đã chọn {ticketCount} vé khu vực <strong>{selectedZone.name}</strong>
              {!selectedZone.isStanding && (
                <span> (Vị trí: <strong>{selectedSeats.join(', ')}</strong>)</span>
              )}
            </div>
          )}

          {/* Đường kẻ trang trí */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 -4px 0', zIndex: 5, position: 'relative', color: 'rgba(255,255,255,0.06)' }}>
            ━━━━━━ ✦ ━━━━━━
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 5, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
              <span style={{
                fontSize: '24px',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: ticketCount === 0 ? 'var(--text-muted)' : (isVipZone(selectedZone) ? 'var(--brand-gold)' : 'var(--brand-cyan)'),
                textShadow: ticketCount === 0 ? 'none' : (isVipZone(selectedZone) ? '0 0 10px rgba(253, 218, 13, 0.2)' : '0 0 10px rgba(6, 182, 212, 0.2)')
              }}>
                {formatPrice(totalPrice)}
              </span>
            </div>


            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', textAlign: 'left' }}>
              <Info size={13} color="var(--brand-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Giới hạn tối đa 6 vé trên một giao dịch. Hệ thống sẽ giữ vé của bạn trong vòng 10 phút sau khi nhấn Đặt Vé.</span>
            </div>


            <button
              onClick={handleProceed}
              disabled={ticketCount === 0}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '13.5px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                borderRadius: '8px',
                background: ticketCount === 0
                  ? 'rgba(255,255,255,0.02)'
                  : 'linear-gradient(90deg, var(--brand-violet) 0%, var(--brand-cyan) 100%)',
                border: ticketCount === 0
                  ? '1px solid rgba(255,255,255,0.05)'
                  : '1px solid rgba(6, 182, 212, 0.3)',
                color: ticketCount === 0 ? 'rgba(255,255,255,0.15)' : 'var(--text-white)',
                cursor: ticketCount === 0 ? 'not-allowed' : 'pointer',
                boxShadow: ticketCount === 0
                  ? 'none'
                  : '0 4px 15px rgba(6, 182, 212, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
              onMouseEnter={(e) => {
                if (ticketCount > 0) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, var(--brand-cyan) 0%, var(--brand-violet) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.5)';
                  e.currentTarget.style.boxShadow = '0 6px 22px rgba(167, 139, 250, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (ticketCount > 0) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, var(--brand-violet) 0%, var(--brand-cyan) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.2)';
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              Tiếp Tục Đặt Vé &nbsp; ⟶
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
