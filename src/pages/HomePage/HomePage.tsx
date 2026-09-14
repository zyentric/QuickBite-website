import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import type { MenuItem, Restaurant } from '../../types';
import FoodCard from '../../components/FoodCard/FoodCard';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import './HomePage.css';

// ── Constants ──────────────────────────────────────────────────────────────
const BANNERS = [
  {
    id: 'b1',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop',
    tag: 'FLAT 30% OFF',
    title: 'Experience Delicious Chef Specials Today!',
    subtext: 'Handcrafted artisan pizzas, loaded crusts & sides.',
    coupon: 'QUICK30',
    minOrder: 'Min order ₹199',
    cta: 'Order Specials Now',
    link: '/menu?search=Pizza',
  },
  {
    id: 'b2',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
    tag: 'BUY 1 GET 1 FREE',
    title: 'Taco, Burger & Gourmet Shake Fiesta!',
    subtext: 'Double the flavor, half the bill on selected picks.',
    coupon: 'BOGO24',
    minOrder: 'Valid on 20+ restaurants',
    cta: 'Claim BOGO Offer',
    link: '/menu?search=Burger',
  },
  {
    id: 'b3',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=1200&auto=format&fit=crop',
    tag: 'SWEET CRAVINGS • 40% OFF',
    title: 'Dessert Indulgence & Bakery Treats',
    subtext: 'Cakes, waffles, brownie sundaes & cold brews.',
    coupon: 'SWEET40',
    minOrder: 'Instant Doorstep Delivery',
    cta: 'Explore Sweets',
    link: '/menu?search=Dessert',
  },
  {
    id: 'b4',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop',
    tag: 'EXPRESS DELIVERY',
    title: 'Late Night Munchies & Express Meals',
    subtext: 'Hot & fresh food delivered to your door in 20 mins.',
    coupon: 'EXPRESS20',
    minOrder: 'No minimum order required',
    cta: 'Order Express Now',
    link: '/menu',
  },
];

const CRAVINGS = [
  { id: '1', name: 'Pizza & Pasta', sub: 'Cheesy Bakes', emoji: '🍕', category: 'Meal', color: '#FF6B35' },
  { id: '2', name: 'Crispy Snacks', sub: 'Finger Food', emoji: '🍟', category: 'Snacks', color: '#FFB800' },
  { id: '3', name: 'Sweet Desserts', sub: 'Cakes & Treats', emoji: '🍰', category: 'Dessert', color: '#FF69B4' },
  { id: '4', name: 'Chilled Drinks', sub: 'Shakes & Sodas', emoji: '🥤', category: 'Drinks', color: '#00C9A7' },
  { id: '5', name: 'Clean & Vegan', sub: 'Salads & Greens', emoji: '🥗', category: 'Vegan', color: '#06C167' },
  { id: '6', name: 'Rice & Bowls', sub: 'Comfort Food', emoji: '🍛', category: 'Meal', color: '#E85D22' },
];

const FILTERS = [
  { id: 'all', label: 'All Dishes' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'deals', label: 'Offers & Deals' },
  { id: 'vegan', label: 'Fresh & Vegan' },
  { id: 'snacks', label: 'Snacks' },
];

const TRUST_ITEMS = [
  {
    id: 'delivery',
    icon: '🚀',
    title: 'Lightning 20–30 Mins Delivery',
    sub: 'Real-time GPS tracking from the hot kitchen straight to your doorstep with zero delays.',
    stat: '⚡ Avg 24 mins',
    tag: 'REAL-TIME GPS',
    tagBg: '#FEF3C7',
    tagColor: '#B45309',
    iconBg: '#FFF7ED',
    borderGlow: 'rgba(245, 158, 11, 0.25)',
  },
  {
    id: 'safe',
    icon: '🛡️',
    title: '100% Safe & Certified Clean',
    sub: 'FSSAI verified kitchen hygiene standards, tamper-evident safety seals & contactless handoff.',
    stat: '⭐ FSSAI Certified',
    tag: 'HYGIENIC & SEALED',
    tagBg: '#DCFCE7',
    tagColor: '#15803D',
    iconBg: '#ECFDF5',
    borderGlow: 'rgba(34, 197, 94, 0.25)',
  },
  {
    id: 'pay',
    icon: '💳',
    title: 'Instant & Secure Payments',
    sub: 'Encrypted 1-tap checkout via UPI (GPay, PhonePe, Paytm), Cards, NetBanking, and COD with instant refunds.',
    stat: '🔒 256-Bit SSL',
    tag: 'INSTANT REFUND',
    tagBg: '#DBEAFE',
    tagColor: '#1D4ED8',
    iconBg: '#EFF6FF',
    borderGlow: 'rgba(59, 130, 246, 0.25)',
  },
  {
    id: 'fresh',
    icon: '🌿',
    title: 'Farm Fresh Organic Ingredients',
    sub: 'Prepared fresh only upon order using non-GMO fresh produce. Never pre-cooked or reheated.',
    stat: '🔥 100% Fresh Made',
    tag: 'FARM TO FORK',
    tagBg: '#F3E8FF',
    tagColor: '#7E22CE',
    iconBg: '#FAF5FF',
    borderGlow: 'rgba(168, 85, 247, 0.25)',
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeBanner, setActiveBanner] = useState(0);

  // Carousel refs for smooth desktop scrolling
  const dealsRef = useRef<HTMLDivElement>(null);
  const bestSellersRef = useRef<HTMLDivElement>(null);
  const expressRef = useRef<HTMLDivElement>(null);
  const restaurantsRef = useRef<HTMLDivElement>(null);
  const healthyRef = useRef<HTMLDivElement>(null);

  // Auto-slide banner
  const bannerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const interval = setInterval(() => setActiveBanner(b => (b + 1) % BANNERS.length), 4500);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (bannerRef.current) {
      bannerRef.current.scrollTo({ left: activeBanner * bannerRef.current.offsetWidth, behavior: 'smooth' });
    }
  }, [activeBanner]);

  // Fetch data
  useEffect(() => {
    const load = async () => {
      try {
        const [menu, rests] = await Promise.all([api.menu.getAll(), api.restaurants.getAll()]);
        setMenuItems(Array.isArray(menu) ? menu : []);
        setRestaurants(Array.isArray(rests) ? rests : []);
      } catch {
        // Use empty arrays — live data not available
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter
  const filtered = menuItems.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'top_rated') return (item.rating || 0) >= 4.5;
    if (activeFilter === 'deals') return !!item.discountBadge || (item.originalPrice && item.originalPrice > item.price);
    if (activeFilter === 'vegan') return (item.category || '').toLowerCase().includes('vegan');
    if (activeFilter === 'snacks') return (item.category || '').toLowerCase().includes('snack');
    return true;
  });

  const bestSellers = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12);
  const rawDeals = filtered.filter(i => i.price <= 60 || !!i.discountBadge || (i.originalPrice && i.originalPrice > i.price));
  const flashDeals = rawDeals.length >= 6 ? rawDeals : [...rawDeals, ...filtered.filter(i => !rawDeals.includes(i))].slice(0, 10);

  const rawExpress = filtered.filter(i => {
    const c = (i.category || '').toLowerCase();
    return c.includes('snack') || c.includes('drink') || c.includes('dessert') || i.price < 150;
  });
  const expressItems = rawExpress.length >= 6 ? rawExpress : [...rawExpress, ...filtered.filter(i => !rawExpress.includes(i))].slice(0, 10);

  const rawHealthy = filtered.filter(i => {
    const c = (i.category || '').toLowerCase();
    const d = (i.description || '').toLowerCase();
    return c.includes('vegan') || d.includes('salad') || d.includes('healthy') || c.includes('meal');
  });
  const healthyItems = rawHealthy.length >= 6 ? rawHealthy : [...rawHealthy, ...filtered.filter(i => !rawHealthy.includes(i))].slice(0, 10);

  const recommendations = [...filtered].reverse().slice(0, 8);

  const SectionHeader = ({
    icon,
    title,
    sub,
    onViewAll,
    onScrollPrev,
    onScrollNext,
  }: {
    icon?: string;
    title: string;
    sub?: string;
    onViewAll?: () => void;
    onScrollPrev?: () => void;
    onScrollNext?: () => void;
  }) => (
    <div className="section-header">
      <div className="section-title-wrap">
        {icon && <span className="section-icon">{icon}</span>}
        <div>
          <h2 className="section-title">{title}</h2>
          {sub && <p className="section-subtitle">{sub}</p>}
        </div>
      </div>
      <div className="section-header-right">
        {(onScrollPrev || onScrollNext) && (
          <div className="scroll-controls" aria-label="Scroll controls">
            <button className="scroll-btn" onClick={onScrollPrev} aria-label="Scroll left">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="scroll-btn" onClick={onScrollNext} aria-label="Scroll right">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        )}
        {onViewAll && <button className="view-all-btn" onClick={onViewAll}>View All</button>}
      </div>
    </div>
  );

  const SkeletonRow = () => (
    <div className="h-scroll">
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ width: 224, height: 240, flexShrink: 0, borderRadius: 18 }} />)}
    </div>
  );

  return (
    <main id="home-page" className="home-page">

      {/* ── HERO HEADER — Yellow gradient matching app ── */}
      <section className="home-hero" aria-label="Welcome banner">
        <div className="container">
          <div className="home-hero-inner">
            <div className="home-hero-text">
              <h1 className="home-hero-title">Fresh Food, <span>Lightning Fast</span></h1>
              <p className="home-hero-sub">Order from 100+ local restaurants. Delivered hot in 20–30 minutes.</p>
              <div className="home-hero-actions">
                <button className="btn btn-lg home-hero-cta" id="hero-order-now-btn" onClick={() => navigate('/menu')}>
                  Order Now
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </button>
                <button className="btn btn-lg home-hero-secondary" onClick={() => navigate('/menu')}>
                  Browse Restaurants
                </button>
              </div>
              <div className="home-hero-stats">
                <div className="home-stat"><span className="home-stat-val">50K+</span><span className="home-stat-label">Happy Customers</span></div>
                <div className="home-stat-divider" />
                <div className="home-stat"><span className="home-stat-val">100+</span><span className="home-stat-label">Restaurants</span></div>
                <div className="home-stat-divider" />
                <div className="home-stat"><span className="home-stat-val">4.8★</span><span className="home-stat-label">App Rating</span></div>
              </div>
            </div>
            <div className="home-hero-visual" aria-hidden="true">
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop"
                alt="Delicious food delivery"
                className="home-hero-img"
              />
              <div className="home-hero-float-card">
                <div className="home-hero-float-icon">🚀</div>
                <div>
                  <div className="home-hero-float-title">Super Express</div>
                  <div className="home-hero-float-sub">Delivery in 20 mins</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHITE CONTENT AREA (matches app's rounded top white bg) ── */}
      <div className="home-content">

        {/* 1. WHAT'S ON YOUR MIND — Cravings Circles */}
        <section className="home-section" aria-label="Food categories">
          <div className="container">
            <SectionHeader title="What's On Your Mind?" sub="Explore curated cravings & top picks" />
            <div className="cravings-grid">
              {CRAVINGS.map(c => (
                <button key={c.id} className="craving-item" onClick={() => navigate(`/menu?category=${c.category}`)} aria-label={c.name}>
                  <div className="craving-ring" style={{ background: `linear-gradient(135deg, ${c.color}25, ${c.color}08)`, borderColor: c.color + '44' }}>
                    <div className="craving-inner">
                      <span className="craving-emoji">{c.emoji}</span>
                    </div>
                  </div>
                  <span className="craving-name">{c.name}</span>
                  <span className="craving-sub">{c.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 2. FILTER CHIPS */}
        <section className="home-section" style={{ paddingTop: 8, paddingBottom: 16 }} aria-label="Filter options">
          <div className="container">
            <div className="chips-row">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  id={`filter-chip-${f.id}`}
                  className={`chip ${activeFilter === f.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f.id)}
                  aria-pressed={activeFilter === f.id}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. PROMO BANNER CAROUSEL */}
        <section className="home-section" aria-label="Promotional banners">
          <div className="container">
            <div className="banner-wrap">
              <div className="banner-track" ref={bannerRef}>
                {BANNERS.map(b => (
                  <div
                    key={b.id}
                    className="banner-slide"
                    onClick={() => navigate(b.link)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={b.image} alt={b.title} className="banner-img" loading="lazy" />
                    <div className="banner-overlay">
                      <div className="banner-content">
                        <div className="banner-top-row">
                          <span className="banner-tag">{b.tag}</span>
                          <span className="banner-coupon-pill">
                            Use Code: <strong>{b.coupon}</strong>
                          </span>
                        </div>
                        <h3 className="banner-text">{b.title}</h3>
                        <p className="banner-sub">{b.subtext}</p>
                        <div className="banner-bottom-row">
                          <span className="banner-cta">
                            {b.cta}
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </span>
                          <span className="banner-min-order">{b.minOrder}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows with Clear Padding */}
              <button
                className="banner-nav-btn prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveBanner(b => (b > 0 ? b - 1 : BANNERS.length - 1));
                }}
                aria-label="Previous banner"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button
                className="banner-nav-btn next"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveBanner(b => (b + 1) % BANNERS.length);
                }}
                aria-label="Next banner"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </button>

              {/* Dynamic Animated Dots */}
              <div className="banner-dots" aria-label="Banner navigation">
                {BANNERS.map((_, i) => (
                  <button
                    key={i}
                    className={`banner-dot ${activeBanner === i ? 'active' : ''}`}
                    onClick={() => setActiveBanner(i)}
                    aria-label={`Go to banner ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. FLASH DEALS */}
        <section className="home-section" aria-labelledby="flash-deals-title">
          <div className="container">
            <SectionHeader
              icon="🔥"
              title="Pocket-Friendly Deals"
              sub="Big savings on delicious cravings"
              onViewAll={() => navigate('/menu')}
              onScrollPrev={() => dealsRef.current?.scrollBy({ left: -480, behavior: 'smooth' })}
              onScrollNext={() => dealsRef.current?.scrollBy({ left: 480, behavior: 'smooth' })}
            />
            {loading ? <SkeletonRow /> : (
              <div className="h-scroll" ref={dealsRef}>
                {flashDeals.map(item => (
                  <FoodCard
                    key={item.id || item._id}
                    item={item}
                    onPress={item => navigate(`/food/${item.id || item._id}`, { state: { item } })}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 5. BEST SELLERS */}
        <section className="home-section" aria-labelledby="best-sellers-title">
          <div className="container">
            <SectionHeader
              title="Best Sellers"
              sub="Most-loved dishes from our kitchen"
              onViewAll={() => navigate('/menu?sort=top')}
              onScrollPrev={() => bestSellersRef.current?.scrollBy({ left: -480, behavior: 'smooth' })}
              onScrollNext={() => bestSellersRef.current?.scrollBy({ left: 480, behavior: 'smooth' })}
            />
            {loading ? <SkeletonRow /> : (
              <div className="h-scroll" ref={bestSellersRef}>
                {bestSellers.map(item => (
                  <FoodCard
                    key={item.id || item._id}
                    item={item}
                    onPress={item => navigate(`/food/${item.id || item._id}`, { state: { item } })}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 6. EXPRESS DELIVERY */}
        <section className="home-section home-section--tinted" aria-labelledby="express-title">
          <div className="container">
            <SectionHeader
              icon="⚡"
              title="Express Under 25 Mins"
              sub="Quick bites that arrive blazing fast"
              onViewAll={() => navigate('/menu?sort=express')}
              onScrollPrev={() => expressRef.current?.scrollBy({ left: -480, behavior: 'smooth' })}
              onScrollNext={() => expressRef.current?.scrollBy({ left: 480, behavior: 'smooth' })}
            />
            {loading ? <SkeletonRow /> : (
              <div className="h-scroll" ref={expressRef}>
                {expressItems.map(item => (
                  <FoodCard
                    key={item.id || item._id}
                    item={item}
                    onPress={item => navigate(`/food/${item.id || item._id}`, { state: { item } })}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 7. TOP RESTAURANTS */}
        <section className="home-section" aria-labelledby="restaurants-title">
          <div className="container">
            <SectionHeader
              title="Top Restaurants Near You"
              sub="Fast delivery & top ratings"
              onViewAll={() => navigate('/menu')}
              onScrollPrev={() => restaurantsRef.current?.scrollBy({ left: -540, behavior: 'smooth' })}
              onScrollNext={() => restaurantsRef.current?.scrollBy({ left: 540, behavior: 'smooth' })}
            />
            {loading ? <SkeletonRow /> : restaurants.length > 0 ? (
              <div className="h-scroll" ref={restaurantsRef}>
                {restaurants.map(r => <RestaurantCard key={r.id || r._id} restaurant={r} />)}
              </div>
            ) : (
              <div className="empty-state">
                <p>No restaurants found. Make sure the backend is running.</p>
              </div>
            )}
          </div>
        </section>

        {/* 8. HEALTHY CORNER */}
        <section className="home-section home-section--green" aria-labelledby="healthy-title">
          <div className="container">
            <SectionHeader
              icon="🥗"
              title="Guilt-Free & Healthy Corner"
              sub="Clean eats, big flavors, zero regrets"
              onViewAll={() => navigate('/menu?category=Vegan')}
              onScrollPrev={() => healthyRef.current?.scrollBy({ left: -480, behavior: 'smooth' })}
              onScrollNext={() => healthyRef.current?.scrollBy({ left: 480, behavior: 'smooth' })}
            />
            {loading ? <SkeletonRow /> : (
              <div className="h-scroll" ref={healthyRef}>
                {healthyItems.map(item => (
                  <FoodCard
                    key={item.id || item._id}
                    item={item}
                    onPress={item => navigate(`/food/${item.id || item._id}`, { state: { item } })}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 9. CHEF'S RECOMMENDATIONS — Grid */}
        <section className="home-section" aria-labelledby="recommendations-title">
          <div className="container">
            <SectionHeader title="Chef's Special Recommendations" sub="Curated picks you'll absolutely love" onViewAll={() => navigate('/menu')} />
            {loading ? (
              <div className="rec-grid">
                {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 260 }} />)}
              </div>
            ) : (
              <div className="rec-grid">
                {recommendations.map(item => (
                  <FoodCard key={item.id} item={item} onPress={item => navigate(`/food/${item.id || item._id}`, { state: { item } })} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 10. QUICKBITE PROMISE / TRUST BADGES */}
        <section className="home-section" aria-labelledby="trust-title">
          <div className="container">
            <div className="trust-wrapper">
              <div className="trust-header">
                <span className="trust-header-badge">★ THE QUICKBITE PROMISE</span>
                <h2 className="trust-header-title" id="trust-title">Why Food Lovers Trust Us</h2>
                <p className="trust-header-sub">
                  Obsessed with quality, lightning delivery speeds & unforgettable food experiences.
                </p>
              </div>

              {/* Bento Grid 4 Pillars */}
              <div className="trust-bento-grid">
                {TRUST_ITEMS.map(item => (
                  <div key={item.id} className="trust-bento-card" style={{ borderColor: item.borderGlow }}>
                    <div className="trust-bento-top">
                      <div className="trust-bento-icon" style={{ background: item.iconBg }}>
                        <span>{item.icon}</span>
                      </div>
                      <span className="trust-bento-tag" style={{ background: item.tagBg, color: item.tagColor }}>
                        {item.tag}
                      </span>
                    </div>
                    <div className="trust-bento-body">
                      <h3 className="trust-bento-title">{item.title}</h3>
                      <p className="trust-bento-sub">{item.sub}</p>
                    </div>
                    <div className="trust-bento-footer">
                      <span className="trust-bento-stat">{item.stat}</span>
                      <span className="trust-bento-verified">✓ Verified Standard</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Live Metrics Bar */}
              <div className="trust-stats-strip">
                <div className="trust-stat-col">
                  <strong>50,000+</strong>
                  <span>Meals Delivered</span>
                </div>
                <div className="trust-stat-sep" />
                <div className="trust-stat-col">
                  <strong>4.9 ★</strong>
                  <span>Average Rating</span>
                </div>
                <div className="trust-stat-sep" />
                <div className="trust-stat-col">
                  <strong>99.2%</strong>
                  <span>On-Time Arrival</span>
                </div>
                <div className="trust-stat-sep" />
                <div className="trust-stat-col">
                  <strong>24 / 7</strong>
                  <span>Live Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. CTA STRIP */}
        <section className="home-cta-strip" aria-label="Call to action">
          <div className="container">
            <div className="home-cta-inner">
              <div>
                <h2 className="home-cta-title">Ready to Order?</h2>
                <p className="home-cta-sub">Explore 500+ dishes from local restaurants. Delivered fast.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-lg" style={{ background: '#FFFFFF', color: 'var(--color-primary)', fontWeight: 800 }} onClick={() => navigate('/menu')} id="cta-browse-menu-btn">
                  Browse Full Menu
                </button>
                <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.3)' }} onClick={() => navigate('/register')}>
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
