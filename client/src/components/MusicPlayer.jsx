import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Shuffle, RotateCcw, X, ListMusic, Minimize2 } from 'lucide-react';

const PLAYLIST = [
  { id: 1, title: 'Tháng Tư Là Lời Nói Dối Của Em', artist: 'Hà Anh Tuấn', duration: 276, image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=120&auto=format&fit=crop' },
  { id: 2, title: 'Lạ Lùng', artist: 'Vũ.', duration: 262, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=120&auto=format&fit=crop' },
  { id: 3, title: 'Mang Tiền Về Cho Mẹ', artist: 'Đen Vâu', duration: 304, image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=120&auto=format&fit=crop' },
  { id: 4, title: 'Anh Em Ta Là Cái Gì Nào', artist: 'Rap Việt Concert', duration: 228, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=120&auto=format&fit=crop' }
];

// Vẽ khung vé dọc dạng SVG (có vết khuyết 2 bên và bo góc)
function buildVerticalTicketPath(W, H, BR, NR, MR, stubY) {
  const midX = W / 2;
  return [
    `M ${BR} 0`,
    `L ${midX - MR} 0`,
    `A ${MR} ${MR} 0 0 0 ${midX + MR} 0`,
    `L ${W - BR} 0`,
    `Q ${W} 0 ${W} ${BR}`,
    `L ${W} ${stubY - NR}`,
    `A ${NR} ${NR} 0 0 0 ${W} ${stubY + NR}`,
    `L ${W} ${H - BR}`,
    `Q ${W} ${H} ${W - BR} ${H}`,
    `L ${midX + MR} ${H}`,
    `A ${MR} ${MR} 0 0 0 ${midX - MR} ${H}`,
    `L ${BR} ${H}`,
    `Q 0 ${H} 0 ${H - BR}`,
    `L 0 ${stubY + NR}`,
    `A ${NR} ${NR} 0 0 0 0 ${stubY - NR}`,
    `L 0 ${BR}`,
    `Q 0 0 ${BR} 0 Z`
  ].join(' ');
}

// Vẽ viền đôi bên trong vé dọc
function buildInnerVerticalTicketPath(W, H, BR, NR, MR, stubY, d = 3.5) {
  const BR_in = Math.max(2, BR - d);
  const NR_in = Math.max(2, NR - 2 * d);
  const MR_in = Math.max(2, MR - 2 * d);
  const midX = W / 2;

  return [
    `M ${BR_in + d} ${d}`,
    `L ${midX - MR_in} ${d}`,
    `A ${MR_in} ${MR_in} 0 0 0 ${midX + MR_in} ${d}`,
    `L ${W - BR_in - d} ${d}`,
    `Q ${W - d} ${d} ${W - d} ${BR_in + d}`,
    `L ${W - d} ${stubY - NR_in}`,
    `A ${NR_in} ${NR_in} 0 0 0 ${W - d} ${stubY + NR_in}`,
    `L ${W - d} ${H - BR_in - d}`,
    `Q ${W - d} ${H - d} ${W - BR_in - d} ${H - d}`,
    `L ${midX + MR_in} ${H - d}`,
    `A ${MR_in} ${MR_in} 0 0 0 ${midX - MR_in} ${H - d}`,
    `L ${BR_in + d} ${H - d}`,
    `Q ${d} ${H - d} ${d} ${H - BR_in - d}`,
    `L ${d} ${stubY + NR_in}`,
    `A ${NR_in} ${NR_in} 0 0 0 ${d} ${stubY - NR_in}`,
    `L ${d} ${BR_in + d}`,
    `Q ${d} ${d} ${BR_in + d} ${d} Z`
  ].join(' ');
}

export default function MusicPlayer() {
  const [themeMode, setThemeMode] = useState('dark');

  useEffect(() => {
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setThemeMode(initialTheme);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
          setThemeMode(currentTheme);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileModal, setMobileModal] = useState(false);

  const timerRef = useRef(null);
  const playerRef = useRef(null);
  const currentTrack = PLAYLIST[currentTrackIndex];

  const isLg = themeMode === 'light';
  const textTitleColor = isLg ? '#1e293b' : '#ffffff';
  const textMutedColor = isLg ? 'rgba(15, 23, 42, 0.62)' : 'rgba(255, 255, 255, 0.3)';
  const textMutedDeep = isLg ? 'rgba(15, 23, 42, 0.48)' : 'rgba(255, 255, 255, 0.22)';
  const artistColor = isLg ? '#7c3aed' : 'var(--brand-cyan)';

  useEffect(() => {
    function handleClickOutside(event) {
      if (isExpanded && playerRef.current && !playerRef.current.contains(event.target)) {
        setIsExpanded(false);
        setShowPlaylist(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) { handleNext(); return 0; }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(v => !v);

  const handleNext = () => {
    if (isRepeat) { setCurrentTime(0); return; }
    setCurrentTrackIndex(i => isShuffle
      ? Math.floor(Math.random() * PLAYLIST.length)
      : (i + 1) % PLAYLIST.length);
    setCurrentTime(0);
  };
  const handlePrev = () => {
    setCurrentTime(0);
    setCurrentTrackIndex(i => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
  };
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const pct = (currentTime / currentTrack.duration) * 100;

  // Kích thước vé dọc
  const W = isExpanded ? 230 : 84;
  const H = isExpanded ? 370 : 180;
  const stubY = isExpanded ? 265 : 126;
  const BR = isExpanded ? 14 : 11;
  const NR = isExpanded ? 10 : 8;
  const MR = isExpanded ? 10 : 8;
  const d = 3.5; // Khoảng cách viền đôi

  const outerPath = buildVerticalTicketPath(W, H, BR, NR, MR, stubY);
  const innerPath = buildInnerVerticalTicketPath(W, H, BR, NR, MR, stubY, d);

  // Trình phát nhạc trên mobile (đĩa xoay)
  if (isMobile) {
    return (
      <>
        <style>{`
          @keyframes spinDisc { to { transform: rotate(360deg); } }
        `}</style>
        <div
          onClick={() => setMobileModal(true)}
          className="music-player-fixed-mobile"
          style={{
            position: 'fixed', bottom: 24, left: 24, zIndex: 999,
            width: 50, height: 50, borderRadius: '50%',
            background: isLg ? 'linear-gradient(135deg,#ffffff,#f1f3f7)' : 'linear-gradient(135deg,rgba(28,20,50,.96),rgba(12,8,22,.98))',
            border: isLg ? '1.5px solid rgba(139,92,246,.3)' : '1.5px solid rgba(0,242,254,.4)',
            boxShadow: isLg ? '0 4px 16px rgba(15,23,42,.1),0 0 10px rgba(139,92,246,.15)' : '0 4px 16px rgba(0,0,0,.5),0 0 10px rgba(139,92,246,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            backgroundImage: `url(${currentTrack.image})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            animation: isPlaying ? 'spinDisc 10s linear infinite' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isLg ? '0 0 8px rgba(139,92,246,0.2)' : '0 0 8px rgba(0,242,254,0.3)',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: isLg ? '#fff' : 'rgba(12,8,22,.95)', border: isLg ? '1.5px solid rgba(15,23,42,.15)' : '1.5px solid rgba(255,255,255,.4)' }} />
          </div>
        </div>

        {mobileModal && (
          <div onClick={() => setMobileModal(false)} style={{
            position: 'fixed', inset: 0, background: isLg ? 'rgba(255,255,255,.85)' : 'rgba(5,4,10,.88)',
            backdropFilter: 'blur(24px)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              width: '100%', maxWidth: 340,
              background: isLg ? 'linear-gradient(145deg,#ffffff,#f4f6fa)' : 'linear-gradient(145deg,rgba(26,18,48,.98),rgba(12,8,22,.99))',
              border: isLg ? '1px solid rgba(139,92,246,.15)' : '1px solid rgba(167,139,250,.22)', borderRadius: 24,
              padding: '32px 24px', boxShadow: isLg ? '0 16px 48px rgba(15,23,42,.08)' : '0 24px 64px rgba(0,0,0,.8)',
              position: 'relative', textAlign: 'center',
            }}>
              <button onClick={() => setMobileModal(false)} style={{
                position: 'absolute', top: 16, right: 16, background: isLg ? 'rgba(15,23,42,.05)' : 'rgba(255,255,255,.05)',
                border: 'none', borderRadius: '50%', width: 32, height: 32,
                color: isLg ? 'rgba(15,23,42,.5)' : 'rgba(255,255,255,.5)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>

              <div style={{
                width: 150, height: 150, borderRadius: '50%', margin: '0 auto 20px',
                backgroundImage: `url(${currentTrack.image})`, backgroundSize: 'cover',
                border: isLg ? '2px solid rgba(15,23,42,.06)' : '2px solid rgba(255,255,255,.1)',
                boxShadow: isLg ? '0 8px 24px rgba(15,23,42,.1)' : '0 12px 32px rgba(0,0,0,.5)',
                animation: isPlaying ? 'spinDisc 10s linear infinite' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: isLg ? '#fff' : 'rgba(12,8,22,.95)', border: isLg ? '3px solid rgba(15,23,42,.15)' : '3px solid rgba(255,255,255,.35)' }} />
              </div>

              <div style={{ fontSize: 17, fontWeight: 700, color: isLg ? '#1e293b' : '#fff', fontFamily: 'var(--font-display)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.title}</div>
              <div style={{ fontSize: 12, color: isLg ? '#7c3aed' : 'var(--brand-cyan)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>{currentTrack.artist}</div>

              <input type="range" min="0" max={currentTrack.duration} value={currentTime}
                onChange={e => setCurrentTime(+e.target.value)}
                style={{ width: '100%', marginBottom: 6, accentColor: isLg ? '#7c3aed' : 'var(--brand-violet)', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', color: isLg ? 'rgba(15,23,42,.45)' : 'rgba(255,255,255,.35)', marginBottom: 20 }}>
                <span>{fmt(currentTime)}</span><span>{fmt(currentTrack.duration)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <button onClick={handlePrev} style={{ background: 'none', border: 'none', color: isLg ? 'rgba(15,23,42,.6)' : 'rgba(255,255,255,.6)', cursor: 'pointer' }}><SkipBack size={20} /></button>
                <button onClick={togglePlay} style={{ width: 50, height: 50, borderRadius: '50%', background: isLg ? '#7c3aed' : 'var(--brand-violet)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isLg ? '0 4px 12px rgba(139,92,246,.3)' : '0 0 16px rgba(139,92,246,.5)' }}>
                  {isPlaying ? <Pause size={20} fill="#fff" /> : <Play size={20} fill="#fff" style={{ marginLeft: 3 }} />}
                </button>
                <button onClick={handleNext} style={{ background: 'none', border: 'none', color: isLg ? 'rgba(15,23,42,.6)' : 'rgba(255,255,255,.6)', cursor: 'pointer' }}><SkipForward size={20} /></button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Trình phát nhạc trên desktop
  return (
    <div
      ref={playerRef}
      className="music-player-fixed-desktop"
      style={{
        position: 'fixed', bottom: 24, left: 24, zIndex: 999,
        width: W, height: H,
        transition: 'width 0.48s cubic-bezier(0.16, 1, 0.3, 1), height 0.48s cubic-bezier(0.16, 1, 0.3, 1)',
        filter: isLg
          ? 'drop-shadow(0 12px 28px rgba(15, 23, 42, 0.08)) drop-shadow(0 4px 10px rgba(139, 92, 246, 0.04))'
          : 'drop-shadow(0 16px 36px rgba(0, 0, 0, 0.68)) drop-shadow(0 4px 16px rgba(0, 242, 254, 0.06))',
      }}
    >
      <style>{`
        @keyframes spinDisc  { to { transform:rotate(360deg); } }
        @keyframes sheenSlideVertical {
          0%   { transform:translateY(-100%) skewY(-15deg); }
          100% { transform:translateY(280%)  skewY(-15deg); }
        }
        .tkt-btn {
          background:none; border:none; padding:0;
          color:rgba(255,255,255,.4); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:color .2s, transform .18s;
        }
        .tkt-btn:hover  { color:rgba(255,255,255,.9); transform:scale(1.12); }
        .tkt-btn.cy     { color:var(--brand-cyan); text-shadow: 0 0 6px rgba(0,242,254,0.45); }
        .tkt-btn.gd     { color:var(--brand-gold); text-shadow: 0 0 6px rgba(212,175,55,0.45); }
        .tkt-bar {
          -webkit-appearance:none; appearance:none;
          height:3.5px; border-radius:2px; outline:none; width:100%; cursor:pointer;
          transition: background 0.15s ease;
        }
        .tkt-bar::-webkit-slider-thumb {
          -webkit-appearance:none;
          width:10px; height:10px; border-radius:50%;
          background:#fff; cursor:pointer;
          box-shadow:0 0 8px rgba(0,242,254,.95);
          transition:transform .15s;
        }
        .tkt-bar::-webkit-slider-thumb:hover { transform:scale(1.4); }
        .tkt-vol {
          -webkit-appearance:none; height:3px; border-radius:2px; outline:none;
          background:rgba(255,255,255,.12); width:40px; cursor:pointer;
          accent-color:var(--brand-cyan);
        }
        .tkt-play-btn {
          border:none; border-radius:50%;
          background:linear-gradient(135deg, var(--brand-violet), #9b51e0); color:#fff; cursor:pointer;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
          box-shadow:0 0 12px rgba(139,92,246,.55), 0 2px 6px rgba(0,0,0,.4);
          transition:transform .2s, box-shadow .2s;
        }
        .tkt-play-btn:hover {
          transform:scale(1.08);
          box-shadow:0 0 18px rgba(139,92,246,.8), 0 2px 6px rgba(0,0,0,.45);
        }
        .disc-glow {
          box-shadow: 0 0 10px rgba(0, 242, 254, 0.22), 0 4px 8px rgba(0,0,0,0.55);
          transition: box-shadow 0.4s ease;
        }
        .disc-glow.playing {
          box-shadow: 0 0 16px rgba(139, 92, 246, 0.42), 0 0 8px rgba(0, 242, 254, 0.3), 0 4px 10px rgba(0,0,0,0.55);
        }

        :root[data-theme="light"] .tkt-btn {
          color: rgba(15, 23, 42, 0.5);
        }
        :root[data-theme="light"] .tkt-btn:hover {
          color: rgba(15, 23, 42, 0.9);
        }
        :root[data-theme="light"] .tkt-btn.cy {
          color: #7c3aed;
          text-shadow: 0 0 4px rgba(124, 58, 237, 0.2);
        }
        :root[data-theme="light"] .tkt-btn.gd {
          color: #d97706;
          text-shadow: 0 0 4px rgba(217, 119, 6, 0.2);
        }
        :root[data-theme="light"] .tkt-vol {
          background: rgba(15, 23, 42, 0.12);
          accent-color: #7c3aed;
        }
        :root[data-theme="light"] .tkt-bar::-webkit-slider-thumb {
          background: #7c3aed;
          box-shadow: 0 0 6px rgba(139, 92, 246, 0.4);
        }
        :root[data-theme="light"] .tkt-play-btn {
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3), 0 2px 4px rgba(15, 23, 42, 0.08);
        }
        :root[data-theme="light"] .disc-glow {
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
        }
        :root[data-theme="light"] .disc-glow.playing {
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.25), 0 4px 14px rgba(15, 23, 42, 0.1);
        }
      `}</style>

      {/* Khung nền vé dạng SVG và hiệu ứng phát sáng */}
      <svg
        width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        style={{
          position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1,
          transition: 'width 0.48s cubic-bezier(0.16, 1, 0.3, 1), height 0.48s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <defs>
          {/* Màu nền của vé */}
          <linearGradient id="vTicketBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isLg ? "#ffffff" : "#1b1236"} stopOpacity={isLg ? 0.98 : 0.97} />
            <stop offset="100%" stopColor={isLg ? "#f4f6fa" : "#080414"} stopOpacity={isLg ? 0.99 : 0.99} />
          </linearGradient>

          {/* Viền neon của vé */}
          <linearGradient id="vTicketBorderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isLg ? "#00a2ff" : "#00f2fe"} />
            <stop offset="60%" stopColor="#9b51e0" />
            <stop offset="100%" stopColor={isLg ? "#ec4899" : "#f857a6"} />
          </linearGradient>

          {/* ClipPath theo khung vé */}
          <clipPath id="vTicketClip">
            <path d={outerPath} />
          </clipPath>
        </defs>

        {/* Thân vé */}
        <path d={outerPath} fill="url(#vTicketBgGrad)" />

        {/* Viền neon */}
        <path d={outerPath} fill="none" stroke="url(#vTicketBorderGrad)" strokeWidth="1.5" style={{ opacity: isLg ? 0.45 : 0.8 }} />

        {/* Đường chỉ viền đôi nét đứt */}
        <path d={innerPath} fill="none" stroke="url(#vTicketBorderGrad)" strokeWidth="1" strokeDasharray="3.5,3.5" style={{ opacity: isLg ? 0.22 : 0.38 }} />

        {/* Đường xé răng cưa nằm ngang */}
        <line
          x1={MR + 2} y1={stubY}
          x2={W - MR - 2} y2={stubY}
          stroke={isLg ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.22)"}
          strokeWidth="1.2"
          strokeDasharray="4,4"
        />
      </svg>

      {/* Hiệu ứng bóng sáng và phản chiếu kính */}
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: 'url(#vTicketClip)',
        pointerEvents: 'none', zIndex: 2
      }}>
        {/* Ánh sáng phản chiếu góc trên bên trái */}
        <div style={{
          position: 'absolute', inset: 0,
          background: isLg
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.15) 25%, transparent 50%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 25%, transparent 50%)',
        }} />

        {/* Hiệu ứng quét sáng chạy tự động */}
        {isPlaying && (
          <div style={{
            position: 'absolute', left: 0, right: 0, height: '40%',
            background: isLg
              ? 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
              : 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
            animation: 'sheenSlideVertical 4.5s ease-in-out infinite',
          }} />
        )}
      </div>

      {/* Watermark chữ nổi AURAPASS chìm dưới nền */}
      <div style={{
        position: 'absolute',
        bottom: isExpanded ? 112 : 62,
        left: '50%',
        transform: 'translateX(-50%) rotate(-12deg)',
        fontSize: isExpanded ? 34 : 14,
        fontWeight: 900,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.08em',
        color: 'transparent',
        WebkitTextStroke: isLg ? '1px rgba(15,23,42,0.025)' : '1px rgba(255,255,255,0.03)',
        userSelect: 'none', pointerEvents: 'none', zIndex: 2,
        whiteSpace: 'nowrap', lineHeight: 1,
      }}>
        AURAPASS ♫
      </div>

      {/* Lớp nội dung tương tác */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        display: 'flex', flexDirection: 'column',
        background: 'transparent',
        cursor: isExpanded ? 'default' : 'pointer'
      }}
        onClick={!isExpanded ? () => setIsExpanded(true) : undefined}
      >
        {/* Phần thân trên */}
        <div style={{
          height: stubY, minHeight: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          padding: isExpanded ? '18px 14px 12px 14px' : '16px 8px 8px 8px',
          justifyContent: isExpanded ? 'space-between' : 'flex-start',
          gap: isExpanded ? 0 : 8,
          position: 'relative'
        }}>
          {/* Bản thu nhỏ */}
          {!isExpanded && (
            <>
              {/* Đĩa nhạc xoay */}
              <div
                className={`disc-glow ${isPlaying ? 'playing' : ''}`}
                style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  backgroundImage: `url(${currentTrack.image})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  border: isLg ? '1.5px solid rgba(15,23,42,0.08)' : '1.5px solid rgba(255,255,255,0.12)',
                  animation: isPlaying ? 'spinDisc 10s linear infinite' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 4,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isLg ? '#fff' : 'rgba(12,8,22,.96)', border: isLg ? '1.2px solid rgba(15,23,42,.15)' : '1.2px solid rgba(255,255,255,.35)' }} />
              </div>

              {/* Dòng chữ in dọc */}
              <div style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
                fontSize: 8,
                fontFamily: 'var(--font-mono)',
                color: isLg ? '#7c3aed' : 'var(--brand-cyan)',
                opacity: isLg ? 0.8 : 0.65,
                letterSpacing: '0.12em',
                marginTop: 10,
                fontWeight: 600,
                userSelect: 'none'
              }}>
                AURA PASS
              </div>
            </>
          )}

          {/* Bản đầy đủ */}
          {isExpanded && (
            <>
              {/* Tiêu đề và nút thu nhỏ */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 7.5, fontFamily: 'var(--font-mono)', color: textMutedColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  <Music size={7} style={{ color: isLg ? '#7c3aed' : 'var(--brand-cyan)' }} /> AURA MUSIC
                </div>
                <button className="tkt-btn" onClick={(e) => { e.stopPropagation(); setIsExpanded(false); setShowPlaylist(false); }} title="Thu nhỏ">
                  <Minimize2 size={12} />
                </button>
              </div>

              {/* Đĩa nhạc xoay */}
              <div
                className={`disc-glow ${isPlaying ? 'playing' : ''}`}
                style={{
                  width: 76, height: 76, borderRadius: '50%', flexShrink: 0,
                  backgroundImage: `url(${currentTrack.image})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  border: isLg ? '2px solid rgba(15,23,42,0.06)' : '2px solid rgba(255,255,255,0.15)',
                  animation: isPlaying ? 'spinDisc 10s linear infinite' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '8px auto 0',
                }}
              >
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: isLg ? '#fff' : 'rgba(12,8,22,.96)', border: isLg ? '1.5px solid rgba(15,23,42,.15)' : '1.5px solid rgba(255,255,255,.35)' }} />
              </div>

              {/* Tên bài hát và ca sĩ */}
              <div style={{ width: '100%', textAlign: 'center', marginTop: 8 }}>
                <div style={{
                  fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--font-display)', color: textTitleColor,
                  lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {currentTrack.title}
                </div>
                <div style={{
                  fontSize: 9.5, color: artistColor, fontFamily: 'var(--font-mono)',
                  marginTop: 2, fontWeight: 500
                }}>
                  {currentTrack.artist}
                </div>
              </div>

              {/* Thanh tiến trình nhạc */}
              <div style={{ width: '100%', marginTop: 8 }}>
                <input
                  type="range" min="0" max={currentTrack.duration} value={currentTime}
                  onChange={e => setCurrentTime(+e.target.value)}
                  className="tkt-bar"
                  style={{
                    background: isLg
                      ? `linear-gradient(to right, #7c3aed 0%, #ec4899 ${pct}%, rgba(15,23,42,0.05) ${pct}%)`
                      : `linear-gradient(to right, var(--brand-cyan) 0%, var(--brand-violet) ${pct}%, rgba(255,255,255,.08) ${pct}%)`
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 8.5, fontFamily: 'var(--font-mono)', color: textMutedColor }}>
                  <span>{fmt(currentTime)}</span><span>{fmt(currentTrack.duration)}</span>
                </div>
              </div>

              {/* Điều khiển: trộn, lùi, phát/dừng, tiếp, lặp */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 10 }}>
                <button className={`tkt-btn ${isShuffle ? 'cy' : ''}`} onClick={(e) => { e.stopPropagation(); setIsShuffle(v => !v); }} title="Tráo bài"><Shuffle size={12} /></button>
                <button className="tkt-btn" onClick={(e) => { e.stopPropagation(); handlePrev(); }}><SkipBack size={14} /></button>
                <button className="tkt-play-btn" style={{ width: 32, height: 32 }} onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                  {isPlaying ? <Pause size={14} fill="#fff" /> : <Play size={14} fill="#fff" style={{ marginLeft: 2 }} />}
                </button>
                <button className="tkt-btn" onClick={(e) => { e.stopPropagation(); handleNext(); }}><SkipForward size={14} /></button>
                <button className={`tkt-btn ${isRepeat ? 'gd' : ''}`} onClick={(e) => { e.stopPropagation(); setIsRepeat(v => !v); }} title="Lặp bài"><RotateCcw size={11} /></button>
              </div>

              {/* Âm lượng và danh sách phát */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 8, borderTop: isLg ? '1px solid rgba(15,23,42,0.06)' : '1px solid rgba(255,255,255,0.05)', paddingTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button className="tkt-btn" onClick={(e) => { e.stopPropagation(); setIsMuted(v => !v); }}>
                    {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                  <input type="range" min="0" max="100" value={isMuted ? 0 : volume}
                    onChange={e => { setVolume(+e.target.value); setIsMuted(false); }}
                    className="tkt-vol"
                  />
                </div>
                <button
                  className={`tkt-btn ${showPlaylist ? 'cy' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setShowPlaylist(v => !v); }}
                  title="Playlist"
                  style={{ padding: 2 }}
                >
                  <ListMusic size={14} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Cuống vé phía dưới */}
        <div style={{
          height: H - stubY, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          padding: isExpanded ? '12px 14px' : '8px',
          background: isLg ? 'rgba(15, 23, 42, 0.015)' : 'rgba(255, 255, 255, 0.02)',
          gap: isExpanded ? 0 : 4,
        }}>
          {/* Cuống vé bản thu nhỏ */}
          {!isExpanded && (
            <button
              className="tkt-play-btn"
              style={{ width: 28, height: 28 }}
              onClick={e => { e.stopPropagation(); togglePlay(); }}
            >
              {isPlaying ? <Pause size={12} fill="#fff" /> : <Play size={12} fill="#fff" style={{ marginLeft: 2 }} />}
            </button>
          )}

          {/* Cuống vé bản đầy đủ */}
          {isExpanded && (
            <>
              {/* Số thứ tự bài hát */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ fontSize: 7.5, fontFamily: 'var(--font-mono)', color: textMutedColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>TRACK RECORD</div>
                <div style={{
                  fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-mono)',
                  background: 'linear-gradient(135deg, #00f2fe, #9b51e0)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1
                }}>
                  {String(currentTrackIndex + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Mã vạch nằm ngang */}
              <div style={{ display: 'flex', gap: 2.2, alignItems: 'center', width: '100%', justifyContent: 'center', height: 26, overflow: 'hidden', opacity: 0.55 }}>
                {[3, 5, 2, 4, 3, 6, 2, 4, 3, 5, 2, 4, 3, 5, 2, 4, 3, 6, 2, 3].map((h, i) => (
                  <div key={i} style={{ width: 2, height: h * 3, background: isLg ? 'rgba(15,23,42,0.32)' : 'rgba(255,255,255,.35)', borderRadius: 0.5 }} />
                ))}
              </div>

              {/* Ghi chú dưới cùng */}
              <div style={{
                fontSize: 7.5,
                fontFamily: 'var(--font-mono)',
                color: textMutedDeep,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                userSelect: 'none',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                ✦ AURA PASSPORT VIP ✦
              </div>
            </>
          )}
        </div>
      </div>

      {/* Danh sách phát nhạc */}
      {isExpanded && showPlaylist && (
        <div style={{
          position: 'absolute', bottom: H + 12, left: 0, width: W,
          background: isLg ? 'linear-gradient(148deg,rgba(255,255,255,.98),rgba(244,246,250,.99))' : 'linear-gradient(148deg,rgba(26,18,50,.98),rgba(12,8,22,.99))',
          border: isLg ? '1px solid rgba(139, 92, 246, 0.18)' : '1px solid rgba(0, 242, 254, 0.25)',
          borderRadius: 14, padding: 14,
          boxShadow: isLg ? '0 12px 36px rgba(15,23,42,0.06), 0 0 20px rgba(139,92,246,0.05)' : '0 12px 36px rgba(0,0,0,0.7), 0 0 20px rgba(139,92,246,0.15)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          zIndex: 20,
          overflow: 'hidden',
        }}>
          {/* Lớp phủ phản chiếu kính */}
          <div style={{ position: 'absolute', inset: 0, background: isLg ? 'linear-gradient(135deg,rgba(255,255,255,.3) 0%,transparent 40%)' : 'linear-gradient(135deg,rgba(255,255,255,.04) 0%,transparent 40%)', pointerEvents: 'none', borderRadius: 14 }} />

          <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: textMutedColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, position: 'relative' }}>
            Aura Beats Playlist · {PLAYLIST.length} songs
          </div>

          {PLAYLIST.map((track, idx) => {
            const active = currentTrackIndex === idx;
            return (
              <div
                key={track.id}
                onClick={(e) => { e.stopPropagation(); setCurrentTrackIndex(idx); setCurrentTime(0); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 6px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
                  background: active ? (isLg ? 'rgba(139, 92, 246, 0.08)' : 'rgba(0, 242, 254, 0.08)') : 'transparent',
                  border: `1px solid ${active ? (isLg ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0, 242, 254, 0.2)') : 'transparent'}`,
                  transition: 'all .2s', position: 'relative',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = isLg ? 'rgba(15,23,42,.03)' : 'rgba(255,255,255,.04)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 5, flexShrink: 0,
                  backgroundImage: `url(${track.image})`, backgroundSize: 'cover',
                  border: `1px solid ${active ? (isLg ? 'rgba(139, 92, 246, 0.4)' : 'rgba(0, 242, 254, 0.4)') : (isLg ? 'rgba(15,23,42,.08)' : 'rgba(255,255,255,.08)')}`
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, fontWeight: active ? 700 : 400, color: active ? (isLg ? '#7c3aed' : 'var(--brand-cyan)') : (isLg ? '#1e293b' : 'rgba(255,255,255,.88)'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: 8.5, color: isLg ? 'rgba(15,23,42,.45)' : 'rgba(255,255,255,.4)', marginTop: 1, fontFamily: 'var(--font-mono)' }}>
                    {track.artist}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
