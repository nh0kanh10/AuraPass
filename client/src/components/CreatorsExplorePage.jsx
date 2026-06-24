import React, { useState, useEffect, useRef } from 'react';
import { Star, Users, Ticket, MapPin } from 'lucide-react';
import { renderStageIcon } from './FeaturedCreators';
import StatsCountUp from './StatsCountUp';

// Component thẻ nghệ sĩ (CreatorCard)
export function CreatorCard({ creator, index, reduced, onViewEvents, isFeatured = false, isExpanded, onToggleExpand }) {
  const [counted, setCounted] = useState(
    typeof IntersectionObserver === 'undefined'
  );
  const cardRef = useRef(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || reduced) {
      setCounted(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCounted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      obs.observe(cardRef.current);
    }
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <article
      ref={cardRef}
      role="article"
      aria-label={creator.name}
      className={`cep-split-ticket ${isFeatured ? 'cep-split-ticket--featured' : ''} ${isExpanded ? 'is-open' : ''} ${reduced ? '' : 'cep-card--enter'}`}
      style={{
        '--spotlight-rgb': creator.accentColor,
        animationDelay: reduced ? '0ms' : `${index * 50 + 100}ms`,
      }}
      onClick={() => onToggleExpand(creator.id)}
    >
      <div className="cst-top">
        <div className="cst-visual">
          <img src={creator.logo} alt={creator.name} loading="lazy" />
          <div className="cst-gradient" />
          <div className="cst-glass-sweep"></div>
          {isFeatured && <div className="cep-card-sheen" aria-hidden="true" />}

          <div className="cst-title-overlay">
            <div className="cst-title-pill">
              <h3 className="cst-title-text">{creator.name}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="cst-middle">
        <div className="cst-middle-content">
          <div className="cst-statline">
            <div className="cst-stat-item">
              <span className="cst-stat-val">
                <Star size={11} className="cst-stat-icon" /> {creator.rating}
              </span>
              <span className="cst-stat-lbl">Đánh giá</span>
            </div>
            <div className="cst-stat-item">
              <span className="cst-stat-val">
                <Users size={11} className="cst-stat-icon" /> {creator.followers}
              </span>
              <span className="cst-stat-lbl">Theo dõi</span>
            </div>
            <div className="cst-stat-item">
              <span className="cst-stat-val">
                <Ticket size={11} className="cst-stat-icon" /> {creator.eventCount}
              </span>
              <span className="cst-stat-lbl">Sự kiện</span>
            </div>
            <div className="cst-stat-item">
              <span className="cst-stat-val">
                <MapPin size={11} className="cst-stat-icon" /> {creator.location}
              </span>
              <span className="cst-stat-lbl">Địa điểm</span>
            </div>
          </div>

          <p className="cst-desc">{creator.description}</p>
          <div className="cst-middle-footer">
            <button
              className="cst-view-btn"
              onClick={(e) => {
                e.stopPropagation();
                onViewEvents(creator.id);
              }}
            >
              Khám phá lịch diễn →
            </button>
          </div>
        </div>
      </div>

      <div className="cst-bottom">
        <div className="cst-body">
          <div className="cst-bg-text">CREATOR PASS • BACKSTAGE ACCESS</div>

          <div className="cst-circle-stamp">
            <span className="cst-stamp-text-top">AURAPASS</span>
            <span className="cst-stamp-text-middle">VIP</span>
            <span className="cst-stamp-text-bottom">✦ CREATOR ✦</span>
          </div>

          <div className="cst-meta-details">
            <div className="cst-meta-item">
              <span className="cst-meta-label">TYPE</span>
              <span className="cst-meta-value">{creator.filterType}</span>
            </div>
            <div className="cst-meta-item">
              <span className="cst-meta-label">CLASS</span>
              <span className="cst-meta-value">{creator.type}</span>
            </div>
            <div className="cst-meta-item">
              <span className="cst-meta-label">INDEX</span>
              <span className="cst-meta-value">{String(index + 1).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="cst-barcode-section">
            <div className="cst-barcode-container">
              <div className="cst-barcode-hologram" />
              <svg className="cst-svg-barcode" viewBox="0 0 100 40" fill="currentColor">
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
            <div className="cst-barcode-text">ORG-{String(creator.id).padStart(5, '0')}-VIP</div>
          </div>

          <div className="cst-chevron-indicator">
            <span className="cst-indicator-line"></span>
            <span className="cst-indicator-text">
              <span className="cst-text-closed">Khám phá</span>
              <span className="cst-text-open">Thu gọn</span>
            </span>
            <span className="cst-indicator-line"></span>
          </div>
        </div>
      </div>
    </article>
  );
}

const FILTER_OPTIONS = ['Tất cả', 'Nhà Hát', 'Nhạc Hội', 'Sân Khấu', 'Triển Lãm', 'Nghệ Sĩ'];

const CREATOR_EVENTS_MAP = {
};
const HERO_MEDIA_MAP = {
  'saigon-opera': {
    heroImage: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop',
    ambientImage: 'https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200&auto=format&fit=crop',
    detailImage: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?q=80&w=900&auto=format&fit=crop',
  },
  idecaf: {
    heroImage: 'https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200&auto=format&fit=crop',
    ambientImage: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=1200&auto=format&fit=crop',
    detailImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=900&auto=format&fit=crop',
  },
  benthanh: {
    heroImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop',
    ambientImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
    detailImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=900&auto=format&fit=crop',
  },
  ntpmm: {
    heroImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
    ambientImage: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1200&auto=format&fit=crop',
    detailImage: 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=900&auto=format&fit=crop',
  },
  'secret-garden': {
    heroImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop',
    ambientImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    detailImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=900&auto=format&fit=crop',
  },
  spacespeakers: {
    heroImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
    ambientImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop',
    detailImage: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=900&auto=format&fit=crop',
  },
};

function getHeroMedia(creator) {
  const media = HERO_MEDIA_MAP[creator?.id];

  if (media) return media;

  return {
    heroImage: creator?.logo,
    ambientImage: creator?.logo,
    detailImage: creator?.logo,
  };
}

function getHeroCreators(filteredCreators, creators) {
  const list = creators || [];
  const source = filteredCreators.length > 0 ? filteredCreators : list;
  const unique = [];

  for (const creator of [...source, ...list]) {
    if (!unique.some(item => item.id === creator.id)) {
      unique.push(creator);
    }

    if (unique.length === 3) break;
  }

  return unique;
}

export default function CreatorsExplorePage({ creators, onBack }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [animationKey, setAnimationKey] = useState(0);
  const [toastMsg, setToastMsg] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const handleToggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setAnimationKey(k => k + 1);
  };
  const resultsRef = useRef(null);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  const handleViewEvents = (creatorId) => {
    const hasEvents = CREATOR_EVENTS_MAP[creatorId]?.length > 0;
    if (hasEvents) {
      onBack();
      setTimeout(() => {
        const el = document.getElementById('events-section');
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 80);
    } else {
      setToastMsg('Đang cập nhật — vui lòng quay lại sau!');
    }
  };

  const handleFilterChange = (filter) => {
    const value = filter === 'Tất cả' ? 'all' : filter;
    setActiveFilter(value);
    setAnimationKey(k => k + 1);
  };

  const filteredCreators = (creators || []).filter(c => {
    const matchesFilter = activeFilter === 'all' || c.filterType === activeFilter;
    const matchesSearch = searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });
  const heroCreators = getHeroCreators(filteredCreators, creators);
  const featuredCreator = heroCreators[0];
  const supportingCreators = heroCreators.slice(1);
  const featuredMedia = getHeroMedia(featuredCreator);
  const ambientCreator = supportingCreators[0] || featuredCreator;
  const ambientMedia = getHeroMedia(ambientCreator);
  const categoryCount = new Set((creators || []).map(creator => creator.filterType)).size;
  const highlightStat = (creators || []).find(creator => creator.id === 'spacespeakers')?.stats || featuredCreator?.stats || '';

  const scrollToResults = () => {
    if (!resultsRef.current) return;

    resultsRef.current.scrollIntoView({
      behavior: prefersReducedMotion.current ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="creators-explore-page">
      <div className="creators-explore-container">
        <section
          className="cep-hero"
          style={{ '--hero-accent-rgb': featuredCreator?.accentColor || '139, 92, 246' }}
        >
          <div className="cep-hero-copy">
            <div className="cep-hero-topline">
              <span className="cep-hero-eyebrow">Curated Creators</span>
              <span className="cep-hero-inline-pill">{(creators || []).length} gương mặt chọn lọc</span>
            </div>

            <h1 className="cep-hero-title-main">
              <span>Những cái tên đứng sau</span>
              <span>những đêm diễn đáng nhớ</span>
            </h1>

            <p className="cep-hero-subtitle">
              Khám phá những đơn vị đang tạo nên hệ sinh thái biểu diễn nghệ thuật Việt Nam.
            </p>

            <p className="cep-hero-note">
              Từ nhà hát lịch sử, collective đương đại đến các không gian triển lãm,
              mỗi creator mang một bầu không khí rất riêng.
            </p>

            <div className="cep-hero-actions">
              <button className="cep-hero-btn cep-hero-btn-primary" onClick={scrollToResults}>
                Khám phá creators
              </button>
              <button
                className="cep-hero-btn cep-hero-btn-secondary"
                onClick={() => handleViewEvents(featuredCreator.id)}
              >
                Xem lịch của featured
              </button>
            </div>

            <div className="cep-hero-stats" aria-label="Thống kê creators">
              <div className="cep-hero-stat">
                <strong>{(creators || []).length}</strong>
                <span>đơn vị nổi bật</span>
              </div>
              <div className="cep-hero-stat">
                <strong>{categoryCount}</strong>
                <span>loại hình tuyển chọn</span>
              </div>
              <div className="cep-hero-stat">
                <strong>{highlightStat}</strong>
                <span>quy mô cộng đồng</span>
              </div>
            </div>
          </div>

          <div className="cep-hero-stage" aria-label="Creator featured">
            <div className="cep-hero-stage-lines" aria-hidden="true" />

            <article className="cep-hero-ambient glass-panel">
              <img
                src={ambientMedia.ambientImage}
                alt={ambientCreator.name}
                className="cep-hero-ambient-image"
                loading="lazy"
              />
              <div className="cep-hero-ambient-overlay" />
              <div className="cep-hero-ambient-copy">
                <span>Live Atmosphere</span>
                <strong>{ambientCreator.name}</strong>
              </div>
            </article>

            {supportingCreators.map((creator, index) => {
              const creatorMedia = getHeroMedia(creator);

              return (
                <article
                  key={creator.id}
                  className={`cep-hero-mini-card cep-hero-mini-card-${index + 1} glass-panel`}
                  style={{ '--mini-accent-rgb': creator.accentColor }}
                >
                  <img
                    src={index % 2 === 0 ? creatorMedia.detailImage : creatorMedia.heroImage}
                    alt={creator.name}
                    className="cep-hero-mini-image"
                    loading="lazy"
                  />
                  <div className="cep-hero-mini-overlay" />
                  <div className="cep-hero-mini-content">
                    <span className="cep-hero-mini-type">{creator.filterType}</span>
                    <strong>{creator.name}</strong>
                  </div>
                </article>
              );
            })}

            <article className="cep-hero-detail-chip glass-panel">
              <img
                src={featuredMedia.detailImage}
                alt={featuredCreator.name}
                className="cep-hero-detail-chip-image"
                loading="lazy"
              />
              <div className="cep-hero-detail-chip-overlay" />
              <div className="cep-hero-detail-chip-content">
                <span>Behind The Scene</span>
                <strong>{featuredCreator.stats}</strong>
              </div>
            </article>

            <article
              className="cep-hero-featured glass-panel"
              style={{ '--spotlight-rgb': featuredCreator?.accentColor || '139, 92, 246' }}
            >
              <img
                src={featuredMedia.heroImage}
                alt={featuredCreator.name}
                className="cep-hero-featured-image"
                loading="lazy"
              />

              <div className="cep-hero-featured-glow" aria-hidden="true" />
              <div className="cep-hero-featured-overlay" aria-hidden="true" />

              <div className="cep-hero-featured-content">
                <span className="cep-hero-featured-badge">Featured This Week</span>

                <span className="cep-hero-featured-type">
                  {renderStageIcon(featuredCreator.icon)}
                  {featuredCreator.type}
                </span>

                <h2>{featuredCreator.name}</h2>

                <p>{featuredCreator.description}</p>

                <div className="cep-hero-featured-meta">
                  <span>{featuredCreator.filterType}</span>
                  <span>{featuredCreator.stats}</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="cep-results-shell glass-panel" ref={resultsRef}>
          <div className="cep-header">
            <div className="cep-results-kicker">
              <span className="cep-results-eyebrow">Curated Roster</span>
              <span className="cep-results-divider" aria-hidden="true" />
              <span className="cep-results-summary">Những đơn vị nổi bật đang định hình live scene</span>
            </div>

            <nav className="cep-breadcrumb" aria-label="Breadcrumb">
              <button onClick={onBack} aria-label="Về trang chủ">Trang chủ</button>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Nghệ Sĩ & Nhà Tổ Chức</span>
            </nav>

            <div className="cep-title-row">
              <div className="cep-title-wrapper">
                <h1 className="cep-title">
                  Nghệ Sĩ & Nhà Tổ Chức
                  <span className="cep-title-shimmer" aria-hidden="true" />
                </h1>
              </div>
              <span className="cep-count">{filteredCreators.length} đơn vị đang hiển thị</span>
            </div>
          </div>

          <div className="cep-controls-row">
            <div className="cep-filter-shell">
              <div className="cep-filter-bar" role="group" aria-label="Lọc theo loại">
                {FILTER_OPTIONS.map(f => (
                  <button
                    key={f}
                    className={`cep-filter-btn${(activeFilter === (f === 'Tất cả' ? 'all' : f)) ? ' active' : ''}`}
                    onClick={() => handleFilterChange(f)}
                    aria-pressed={activeFilter === (f === 'Tất cả' ? 'all' : f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="cep-search-shell">
              <div className="cep-search-wrapper">
                <svg
                  className="cep-search-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  className="cep-search-input"
                  placeholder="Tìm nghệ sĩ, nhà tổ chức..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Tìm kiếm nghệ sĩ và nhà tổ chức"
                />
                {searchQuery && (
                  <button
                    className="cep-search-clear"
                    onClick={() => { setSearchQuery(''); setAnimationKey(k => k + 1); }}
                    aria-label="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {filteredCreators.length === 0
            ? (
              <div className="cep-empty glass-panel">
                <p>Không tìm thấy creators phù hợp.</p>
              </div>
            )
            : (
              <div
                className="cep-horizontal-track"
                key={`grid-${activeFilter}-${animationKey}`}
              >
                {filteredCreators.map((creator, i) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    index={i}
                    reduced={prefersReducedMotion.current}
                    onViewEvents={handleViewEvents}
                    isFeatured={i === 0}
                    isExpanded={expandedId === creator.id}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </div>
            )
          }
        </section>

      </div>

      {toastMsg && (
        <div
          className="glass-panel"
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            maxWidth: '320px',
            fontSize: '14px',
            color: 'var(--brand-pearl)',
            pointerEvents: 'none',
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
