'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BiSearch } from 'react-icons/bi';
import { MdNewspaper } from 'react-icons/md';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: string;
}

const DEFAULT_CATEGORIES = ['General', 'Technology', 'Business', 'Sports', 'Health', 'Entertainment'];

const CATEGORY_TOPIC_MAP: Record<string, string> = {
  general: '',
  technology: 'technology',
  business: 'business',
  sports: 'sports',
  health: 'health',
  entertainment: 'entertainment',
};

const CATEGORY_PLACEHOLDER: Record<string, string> = {
  general:       'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80',
  technology:    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
  business:      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
  sports:        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
  health:        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
  entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
};

const MOCK_NEWS: NewsArticle[] = [
  { id:'1', title:'Neurosurgeon reveals 5 simple habits to rebuild brain health from zero', description:'Discover 5 simple habits recommended by neurosurgeon Dr. Jay Jagannathan to enhance brain health and resilience.', image: CATEGORY_PLACEHOLDER.health, url:'#', source:'Health Daily', publishedAt: new Date().toISOString(), category:'Health' },
  { id:'2', title:"PlayStation Portal's Latest Update Proves Sony Needs a Real Handheld Console Again", description:'Cloud gaming remains the future, but Sony needs a real handheld console to compete properly.', image: CATEGORY_PLACEHOLDER.technology, url:'#', source:'Tech Review', publishedAt: new Date().toISOString(), category:'Technology' },
  { id:'3', title:'Sunderland pay tribute to club legend Gary Rowell after sad passing', description:'Sunderland have paid tribute to Gary Rowell after the club legend passed away at the age of 68.', image: CATEGORY_PLACEHOLDER.sports, url:'#', source:'Sports Today', publishedAt: new Date().toISOString(), category:'Sports' },
  { id:'4', title:'The Future of AI in Enterprise: What 2026 Holds for Automation', description:'Industry leaders weigh in on how artificial intelligence is reshaping enterprise workflows.', image: CATEGORY_PLACEHOLDER.technology, url:'#', source:'TechInsider', publishedAt: new Date().toISOString(), category:'Technology' },
  { id:'5', title:'Global Markets React to Latest Federal Reserve Policy Announcements', description:'Stock markets worldwide responded swiftly as the Federal Reserve signaled a potential shift in monetary policy.', image: CATEGORY_PLACEHOLDER.business, url:'#', source:'Financial Times', publishedAt: new Date().toISOString(), category:'Business' },
  { id:'6', title:'Breakthrough in Quantum Computing Achieved by Research Team', description:'Scientists announce a landmark achievement that could accelerate the development of practical quantum computers.', image: CATEGORY_PLACEHOLDER.general, url:'#', source:'Science Daily', publishedAt: new Date().toISOString(), category:'Technology' },
];

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

  .ims-page { font-family: 'DM Sans', sans-serif; }
  .ims-page button, .ims-page a, .ims-page [role="button"] { cursor: pointer; }

  .reveal { opacity:0; transform:translateY(48px); transition:opacity .75s cubic-bezier(.22,1,.36,1), transform .75s cubic-bezier(.22,1,.36,1); }
  .reveal.from-left  { transform:translateX(-60px); }
  .reveal.from-right { transform:translateX(60px);  }
  .reveal.scale-up   { transform:scale(0.92);       }
  .reveal.visible    { opacity:1 !important; transform:none !important; }

  .stagger-children > * { opacity:0; transform:translateY(32px); transition:opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1); }
  .stagger-children.visible > *:nth-child(1){opacity:1;transform:none;transition-delay:0s}
  .stagger-children.visible > *:nth-child(2){opacity:1;transform:none;transition-delay:.1s}
  .stagger-children.visible > *:nth-child(3){opacity:1;transform:none;transition-delay:.2s}
  .stagger-children.visible > *:nth-child(4){opacity:1;transform:none;transition-delay:.3s}
  .stagger-children.visible > *:nth-child(5){opacity:1;transform:none;transition-delay:.4s}
  .stagger-children.visible > *:nth-child(6){opacity:1;transform:none;transition-delay:.5s}

  .news-card { transition:transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease; cursor:pointer; }
  .news-card:hover { transform:translateY(-6px); box-shadow:0 24px 48px rgba(0,0,0,.12); }

  @keyframes heroFadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  .hero-title    { animation:heroFadeUp .9s cubic-bezier(.22,1,.36,1) .1s both; }
  .hero-subtitle { animation:heroFadeUp .9s cubic-bezier(.22,1,.36,1) .3s both; }
  .hero-cta      { animation:heroFadeUp .9s cubic-bezier(.22,1,.36,1) .5s both; }
  .hero-badge    { animation:heroFadeUp .9s cubic-bezier(.22,1,.36,1) 0s both;  }

  .cat-pill { transition:background .2s, color .2s, transform .15s; cursor:pointer; }
  .cat-pill:hover  { transform:scale(1.05); }
  .cat-pill:active { transform:scale(0.97); }

  .feature-card { transition:transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
  .feature-card:hover { transform:translateY(-8px); box-shadow:0 32px 64px rgba(0,0,0,.10); }

  @keyframes lineGrow { from{width:0} to{width:80px} }
  .deco-line { animation:lineGrow .8s cubic-bezier(.22,1,.36,1) .6s both; }

  @keyframes marqueeScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .marquee-track { animation:marqueeScroll 22s linear infinite; }

  .search-input:focus { outline:none; box-shadow:0 0 0 2px #7C3AED; }
  .dot-divider { width:6px; height:6px; border-radius:50%; background:#7C3AED; display:inline-block; margin:0 10px; vertical-align:middle; }

  @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.04)} }
  .orb  { animation:orbFloat 7s ease-in-out infinite;    }
  .orb2 { animation:orbFloat 9s ease-in-out infinite 2s; }

  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
  .scroll-arrow { animation:bounce 1.8s ease-in-out infinite; }

  .skeleton { background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  @media (prefers-color-scheme: dark) {
    .news-card:hover    { box-shadow:0 24px 48px rgba(0,0,0,.45); }
    .feature-card:hover { box-shadow:0 32px 64px rgba(0,0,0,.4);  }
    .skeleton { background:linear-gradient(90deg,#1f2937 25%,#374151 50%,#1f2937 75%); background-size:200% 100%; }
  }
`;

// ── SVG Icon components (no emojis) ──────────────────────────────────────────
const IconShield = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:24, height:24 }}>
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
  </svg>
);
const IconIdCard = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:24, height:24 }}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <circle cx="8" cy="12" r="2.5" />
    <path d="M14 10h4M14 14h3" />
  </svg>
);
const IconLock = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:24, height:24 }}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
    <circle cx="12" cy="16" r="1" fill={color} stroke="none" />
  </svg>
);
const IconGlobe = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:24, height:24 }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
  </svg>
);
const IconSearch2 = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:24, height:24 }}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
const IconMoon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:24, height:24 }}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

// ── Scroll reveal hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .stagger-children');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [news, setNews] = useState<NewsArticle[]>(MOCK_NEWS);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>(MOCK_NEWS);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [stylesInjected, setStylesInjected] = useState(false);

  useScrollReveal();

  useEffect(() => {
    if (stylesInjected) return;
    const tag = document.createElement('style');
    tag.innerHTML = GLOBAL_STYLES;
    document.head.appendChild(tag);
    setStylesInjected(true);
  }, [stylesInjected]);

  useEffect(() => {
    fetchNews('general');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNews = async (category: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news?language=en&category=${encodeURIComponent(category)}`);
      if (!res.ok) throw new Error(`API ${res.status}`);

      const json = await res.json();
      const raw: any[] = json.articles || [];
      if (raw.length === 0) throw new Error('empty');

      const articles: NewsArticle[] = raw.map((a: any, i: number) => ({
        id:          String(a.id || a.uuid || a.article_id || i),
        title:       a.title        || 'Untitled',
        description: a.description  || a.summary || a.subtitle || '',
        image:       a.thumbnail    || a.image   || CATEGORY_PLACEHOLDER[category] || CATEGORY_PLACEHOLDER.general,
        url:         a.original_url || a.url     || '#',
        source:      a.source       || a.publisher || 'News Source',
        publishedAt: a.published_at || a.publishedAt || new Date().toISOString(),
        category:    a.category     || category,
      }));

      setNews(articles);
      setFilteredNews(articles);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('News fetch failed, using fallback:', err);
      setNews(MOCK_NEWS);
      setFilteredNews(MOCK_NEWS);
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    const lower = category.toLowerCase();
    setSelectedCategory(lower);
    setSearchQuery('');
    fetchNews(lower);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilteredNews(
      query.trim()
        ? news.filter(a =>
            a.title.toLowerCase().includes(query.toLowerCase()) ||
            a.description?.toLowerCase().includes(query.toLowerCase()))
        : news
    );
  };

  const FEATURES = [
    { Icon: IconShield,  title: 'Secure Authentication',  desc: 'Military-grade bcrypt hashing and JWT token authentication keep your account impenetrable.',                          accent: '#7C3AED' },
    { Icon: IconIdCard,  title: 'Multiple Identities',     desc: 'Craft distinct personas — professional, personal, family, online — all within one unified platform.',                  accent: '#0EA5E9' },
    { Icon: IconLock,    title: 'AES-256 Messaging',       desc: 'End-to-end encrypted conversations ensure your private messages remain truly private.',                                 accent: '#10B981' },
    { Icon: IconGlobe,   title: 'Context-Aware Sharing',   desc: 'Reveal only what each audience needs. Your professional contacts never see your personal profile.',                     accent: '#F59E0B' },
    { Icon: IconSearch2, title: 'Smart Discovery',         desc: 'Context-sensitive search finds the right person in the right sphere — every time.',                                      accent: '#EC4899' },
    { Icon: IconMoon,    title: 'Light & Dark Mode',       desc: 'Thoughtfully designed for every environment, day or night, with seamless theme switching.',                             accent: '#8B5CF6' },
  ];

  const HOW_IT_WORKS = [
    { step:'01', title:'Create Your Account',   desc:'Sign up in seconds with your email. Your credentials are immediately encrypted.' },
    { step:'02', title:'Build Your Identities', desc:'Define up to four distinct profiles — Professional, Personal, Family, Online.' },
    { step:'03', title:'Connect in Context',    desc:'Send and accept friend requests within the right identity sphere.' },
    { step:'04', title:'Communicate Securely',  desc:'Message your connections with AES-256 encryption protecting every word.' },
  ];

  const STATS = [
    { value:'91%',   label:'Test Coverage'     },
    { value:'4',     label:'Identity Contexts' },
    { value:'340ms', label:'Avg API Response'  },
    { value:'150+',  label:'Concurrent Users'  },
  ];

  const TESTIMONIALS = [
    { name:'Talha Hashmi', role:'Early Beta User', text:"Finally a platform that understands I'm a different person at work than I am with my family. IMS gets it completely." },
    { name:'Cristiano R.', role:'Public Figure',   text:'The context-based friend system is genius. My professional network stays separate from my personal circle effortlessly.' },
    { name:'Lionel M.',    role:'Power User',      text:'AES encryption on messages gives me real peace of mind. No other platform offers this level of privacy.' },
  ];

  const MARQUEE_ITEMS = ['JWT Authentication','AES-256 Encryption','Context-Aware Access Control','Multi-Identity Profiles','bcrypt Password Hashing','GDPR-First Architecture','RESTful API Design','MongoDB + Next.js','Real-Time Messaging','Dark Mode Support'];

  return (
    <div className="ims-page min-h-screen dark:bg-[#0C0C0F] bg-[#FAFAF9]">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[88vh] flex flex-col justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb absolute top-[-120px] right-[-80px] w-[520px] h-[520px] rounded-full opacity-[0.07] dark:opacity-[0.12]"
            style={{ background:'radial-gradient(circle,#7C3AED 0%,transparent 70%)' }} />
          <div className="orb2 absolute bottom-[-60px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-[0.05] dark:opacity-[0.10]"
            style={{ background:'radial-gradient(circle,#0EA5E9 0%,transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
            style={{ backgroundImage:'linear-gradient(#7C3AED 1px,transparent 1px),linear-gradient(90deg,#7C3AED 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="hero-badge inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border dark:border-purple-800/50 border-purple-200 bg-purple-50 dark:bg-purple-950/40">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300 tracking-wide">Identity & Profile Management</span>
          </div>

          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 dark:text-white text-gray-900 leading-tight tracking-tight"
            style={{ fontFamily:"'Playfair Display',serif" }}>
            One Account.<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage:'linear-gradient(135deg,#7C3AED 0%,#0EA5E9 100%)' }}>
              Infinite Identities.
            </span>
          </h1>

          <div className="deco-line h-0.5 mx-auto mb-8" style={{ background:'linear-gradient(90deg,#7C3AED,#0EA5E9)', width:'80px' }} />

          <p className="hero-subtitle text-xl md:text-2xl dark:text-gray-400 text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>
            Manage your professional, personal, family, and online identities — each with its own privacy controls, connections, and encrypted messaging.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/auth')}
              className="px-10 py-4 text-white font-semibold rounded-xl text-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              style={{ background:'linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)', boxShadow:'0 8px 32px rgba(124,58,237,0.35)' }}>
              Get Started Free
            </button>
            <button onClick={() => document.getElementById('news-section')?.scrollIntoView({ behavior:'smooth' })}
              className="px-10 py-4 dark:text-white text-gray-800 font-semibold rounded-xl text-lg border dark:border-gray-700 border-gray-300 dark:hover:bg-gray-800 hover:bg-gray-100 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]">
              Explore News Feed ↓
            </button>
          </div>

          <div className="scroll-arrow mt-16 flex justify-center opacity-40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="dark:text-white text-gray-800">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════════════════ */}
      <div className="py-4 overflow-hidden border-y dark:border-gray-800 border-gray-200 dark:bg-gray-950/50 bg-gray-100/80">
        <div className="marquee-track flex gap-12 whitespace-nowrap" style={{ width:'max-content' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-sm font-medium tracking-widest uppercase dark:text-gray-500 text-gray-500 flex items-center gap-4">
              {item}<span className="dot-divider" />
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS ═════════════════════════════════════════════════════════════ */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="stagger-children grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center p-8 rounded-2xl dark:bg-gray-900/60 bg-white border dark:border-gray-800 border-gray-200">
              <div className="text-4xl font-bold mb-2 bg-clip-text text-transparent"
                style={{ backgroundImage:'linear-gradient(135deg,#7C3AED 0%,#0EA5E9 100%)', fontFamily:"'Playfair Display',serif" }}>
                {s.value}
              </div>
              <div className="text-sm dark:text-gray-500 text-gray-500 uppercase tracking-widest font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ NEWS FEED ═════════════════════════════════════════════════════════ */}
      <section id="news-section" className="py-20 dark:bg-gray-950/40 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="reveal text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600 mb-3">Stay Informed</p>
            <h2 className="text-4xl md:text-5xl font-bold dark:text-white text-gray-900 mb-4" style={{ fontFamily:"'Playfair Display',serif" }}>
              Global News Feed
            </h2>
            <p className="dark:text-gray-400 text-gray-600 text-lg max-w-xl mx-auto">
              Curated headlines from across the world, updated in real time. Search, filter, and discover.
            </p>
          </div>

          <div className="reveal mb-10">
            <div className="flex gap-3 mb-6 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-gray-400 text-gray-500 text-xl" />
                <input type="text" placeholder="Search by keyword, topic, or source…"
                  value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                  className="search-input w-full pl-12 pr-5 py-3.5 rounded-xl dark:bg-gray-900 bg-white dark:text-white text-gray-900 dark:border-gray-700 border-gray-300 border text-base transition-shadow" />
              </div>
              <button onClick={() => handleSearch(searchQuery)}
                className="px-7 py-3.5 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background:'linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)' }}>
                Search
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {DEFAULT_CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => handleCategoryChange(cat)}
                  className={`cat-pill px-5 py-2 rounded-full text-sm font-semibold border ${
                    selectedCategory === cat.toLowerCase()
                      ? 'text-white border-transparent'
                      : 'dark:border-gray-700 border-gray-300 dark:text-gray-300 text-gray-700 dark:hover:bg-gray-800 hover:bg-gray-100'
                  }`}
                  style={selectedCategory === cat.toLowerCase() ? { background:'linear-gradient(135deg,#7C3AED,#5B21B6)' } : {}}>
                  {cat}
                </button>
              ))}
            </div>

            {lastUpdated && (
              <p className="text-center text-xs dark:text-gray-600 text-gray-400 mt-4 uppercase tracking-widest">
                Last updated · {lastUpdated} · Powered by{' '}
                <a href="https://www.freenewsapi.io" target="_blank" rel="noopener noreferrer"
                  className="text-purple-500 hover:underline">FreeNewsAPI</a>
              </p>
            )}
          </div>

          {/* News grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="dark:bg-gray-900 bg-white rounded-2xl overflow-hidden border dark:border-gray-800 border-gray-200">
                  <div className="skeleton h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-3 w-24 rounded-full" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-4/5 rounded" />
                    <div className="skeleton h-3 w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="stagger-children grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.length > 0 ? filteredNews.map((article) => (
                <div key={article.id} className="news-card group dark:bg-gray-900 bg-white rounded-2xl overflow-hidden border dark:border-gray-800 border-gray-200 flex flex-col h-full">
                  <div className="overflow-hidden h-48 bg-gray-200 dark:bg-gray-800 relative">
                    <img src={article.image} alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { (e.target as HTMLImageElement).src = CATEGORY_PLACEHOLDER[selectedCategory] || CATEGORY_PLACEHOLDER.general; }} />
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full text-white"
                      style={{ background:'rgba(124,58,237,0.85)', backdropFilter:'blur(4px)' }}>
                      {article.category || selectedCategory}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-xs font-semibold uppercase tracking-widest text-purple-600 mb-2">{article.source}</span>
                    <h3 className="text-base font-semibold dark:text-white text-gray-900 mb-3 line-clamp-3 leading-snug">{article.title}</h3>
                    {article.description && (
                      <p className="dark:text-gray-500 text-gray-500 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">{article.description}</p>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t dark:border-gray-800 border-gray-100 mt-auto">
                      <span className="text-xs dark:text-gray-600 text-gray-400">
                        {new Date(article.publishedAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                      </span>
                      <a href={article.url !== '#' ? article.url : undefined}
                        target="_blank" rel="noopener noreferrer"
                        onClick={(e) => { if (article.url === '#') e.preventDefault(); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-[1.04] active:scale-[0.97]"
                        style={{ background:'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
                        Read More
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:12, height:12 }}>
                          <path d="M3 8h10M8 3l5 5-5 5" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-24 dark:text-gray-500 text-gray-400">
                  <MdNewspaper className="text-5xl mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No news found for your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <>
          <section className="py-28 max-w-7xl mx-auto px-6">
            <div className="reveal text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600 mb-3">Why IMS</p>
              <h2 className="text-4xl md:text-5xl font-bold dark:text-white text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>
                Built for the Modern Individual
              </h2>
            </div>
            <div className="stagger-children grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ Icon, title, desc, accent }) => (
                <div key={title} className="feature-card p-8 rounded-2xl dark:bg-gray-900/70 bg-white border dark:border-gray-800 border-gray-200 cursor-default">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                    style={{ background:`${accent}18` }}>
                    <Icon color={accent} />
                  </div>
                  <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-3">{title}</h3>
                  <p className="dark:text-gray-500 text-gray-500 text-sm leading-relaxed">{desc}</p>
                  <div className="mt-6 h-0.5 w-10 rounded-full" style={{ background:accent }} />
                </div>
              ))}
            </div>
          </section>

          {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
          <section className="py-28 dark:bg-gray-950/60 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
              <div className="reveal text-center mb-20">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600 mb-3">Process</p>
                <h2 className="text-4xl md:text-5xl font-bold dark:text-white text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>
                  Up and Running in Minutes
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {HOW_IT_WORKS.map((step, i) => (
                  <div key={step.step} className={`reveal ${i % 2 === 0 ? 'from-left' : 'from-right'}`}
                    style={{ transitionDelay:`${i * 0.12}s` }}>
                    <div className="text-6xl font-bold mb-4 bg-clip-text text-transparent"
                      style={{ backgroundImage:'linear-gradient(135deg,#7C3AED 0%,#0EA5E9 100%)', fontFamily:"'Playfair Display',serif", opacity:0.4 }}>
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-3">{step.title}</h3>
                    <p className="dark:text-gray-500 text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
          <section className="py-28 max-w-6xl mx-auto px-6">
            <div className="reveal text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600 mb-3">Testimonials</p>
              <h2 className="text-4xl md:text-5xl font-bold dark:text-white text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>
                What Users Say
              </h2>
            </div>
            <div className="stagger-children grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="feature-card p-8 rounded-2xl dark:bg-gray-900/70 bg-white border dark:border-gray-800 border-gray-200">
                  <div className="text-4xl text-purple-400 mb-4 leading-none">"</div>
                  <p className="dark:text-gray-300 text-gray-700 text-base leading-relaxed mb-6 italic">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background:'linear-gradient(135deg,#7C3AED,#0EA5E9)' }}>
                      {t.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div className="font-semibold dark:text-white text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs dark:text-gray-500 text-gray-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ TECH STACK ══════════════════════════════════════════════════════ */}
          <section className="py-20 dark:bg-gray-950/60 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
              <div className="reveal text-center mb-12">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600 mb-3">Built With</p>
                <h2 className="text-4xl font-bold dark:text-white text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>
                  Modern, Production-Grade Stack
                </h2>
              </div>
              <div className="reveal stagger-children flex flex-wrap justify-center gap-4">
                {['Next.js 13+','TypeScript','Node.js','Express.js','MongoDB','JWT','bcrypt','AES-256','TailwindCSS','REST API'].map((tech) => (
                  <span key={tech}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold border dark:border-gray-700 border-gray-300 dark:text-gray-300 text-gray-700 dark:bg-gray-900 bg-white dark:hover:border-purple-700 hover:border-purple-400 transition-colors duration-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ══ CTA ═════════════════════════════════════════════════════════════ */}
          <section className="py-32 px-6">
            <div className="reveal max-w-4xl mx-auto text-center scale-up">
              <div className="relative rounded-3xl overflow-hidden p-16"
                style={{ background:'linear-gradient(135deg,#4C1D95 0%,#1E3A8A 100%)' }}>
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage:'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-5" style={{ fontFamily:"'Playfair Display',serif" }}>
                    Ready to Own Your Identity?
                  </h2>
                  <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                    Join IMS and start managing your digital presence the way it was meant to be — contextual, private, and entirely yours.
                  </p>
                  <button onClick={() => router.push('/auth')}
                    className="px-12 py-4 bg-white text-purple-900 font-bold rounded-xl text-lg transition-all duration-300 hover:scale-[1.04] active:scale-[0.98]"
                    style={{ boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
                    Create Your Account →
                  </button>
                </div>
              </div>
            </div>
          </section>
      </>

    </div>
  );
}