import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, ArrowLeft, Loader2, ChevronDown, Monitor, Cpu, Eye, Lock } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../App';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_CONFIG = {
  undetected: { color: '#39FF14', label: 'Undetected', pulseClass: 'status-undetected' },
  testing: { color: '#FFD600', label: 'Testing', pulseClass: 'status-testing' },
  updating: { color: '#00D4FF', label: 'Updating', pulseClass: 'status-updating' },
  detected: { color: '#FF0055', label: 'Detected', pulseClass: 'status-detected' },
};

const FALLBACK_DURATIONS = [
  { key: '1day', label: '1 Day', price: null, days: 1 },
  { key: '1week', label: '1 Week', price: null, days: 7 },
  { key: '1month', label: '1 Month', price: null, days: 30 },
];

const CATEGORY_ICONS = {
  'Aimbot': Cpu,
  'ESP': Eye,
  'Visuals': Monitor,
  'Movement': ArrowLeft,
  'Weapon': Shield,
  'World ESP': Eye,
  'Misc': Monitor,
  'Settings': Lock,
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    axios.get(`${API}/products/${productId}`)
      .then(r => {
        setProduct(r.data);
        // Default to the first pricing tier or '1month'
        if (r.data.pricing_tiers && r.data.pricing_tiers.length > 0) {
          setDuration(r.data.pricing_tiers[0].key);
        } else {
          setDuration('1month');
        }
      })
      .catch(() => navigate('/products'));
  }, [productId, navigate]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/checkout/create`, {
        product_id: productId,
        origin_url: window.location.origin,
        duration,
      }, { withCredentials: true });
      if (res.data.url) window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (!product) return (
    <div className="min-h-screen bg-cc-bg flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-cc-blue" />
    </div>
  );

  const statusCfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.undetected;
  const gameSlug = product.game.toLowerCase().replace(/\s+/g, '-');
  const hasRichData = product.feature_categories || product.screenshots;
  const screenshots = product.screenshots || [];
  const pricingTiers = product.pricing_tiers || FALLBACK_DURATIONS.map(d => ({
    ...d,
    price: d.key === '1day' ? Math.round(product.price / 4 * 100) / 100
      : d.key === '1week' ? Math.round(product.price / 2 * 100) / 100
      : product.price
  }));
  const selectedTier = pricingTiers.find(t => t.key === duration) || pricingTiers[0];
  const requirements = product.requirements || [];

  return (
    <div data-testid="product-detail-page" className="min-h-screen bg-cc-bg pt-28 pb-24">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-overlay" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-cc-blue/[0.02] rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Back */}
        <Link
          to={`/products/${gameSlug}`}
          data-testid="back-to-game"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors duration-200 mb-10 font-mono text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back to {product.game}
        </Link>

        {/* Hero area: Screenshot gallery + Purchase */}
        <div className="grid lg:grid-cols-5 gap-8 mb-16">
          {/* Left: Gallery (3 cols) */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Status + Game */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${statusCfg.pulseClass}`} style={{ backgroundColor: statusCfg.color }} />
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                <span className="text-gray-700 mx-1">|</span>
                <span className="font-mono text-xs uppercase tracking-widest text-gray-600">{product.game}</span>
                <span className="text-gray-700 mx-1">|</span>
                <span className="font-mono text-xs uppercase tracking-widest text-gray-600">External</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase text-white mb-3">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="text-base md:text-lg text-cc-blue mb-4">{product.tagline}</p>
              )}
              <p className="text-base text-gray-400 leading-relaxed mb-8 max-w-2xl">{product.description}</p>

              {/* Main screenshot */}
              {screenshots.length > 0 && (
                <div className="mb-4">
                  <div className="relative overflow-hidden border border-white/10 bg-cc-paper">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImage}
                        src={screenshots[activeImage]}
                        alt={`${product.name} screenshot ${activeImage + 1}`}
                        className="w-full h-auto object-contain max-h-[420px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </AnimatePresence>
                  </div>
                  {/* Thumbnail strip */}
                  {screenshots.length > 1 && (
                    <div className="flex gap-2 mt-3">
                      {screenshots.map((src, i) => (
                        <button
                          key={i}
                          data-testid={`screenshot-thumb-${i}`}
                          onClick={() => setActiveImage(i)}
                          className={`w-20 h-14 overflow-hidden border transition-colors duration-200 flex-shrink-0 ${
                            i === activeImage ? 'border-cc-blue' : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Purchase panel (2 cols) */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-28"
            >
              <div className="glass p-6">
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-widest mb-6">Select Duration</h3>
                <div className="space-y-2 mb-6">
                  {pricingTiers.map(tier => (
                    <button
                      key={tier.key}
                      data-testid={`duration-${tier.key}`}
                      onClick={() => setDuration(tier.key)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 border text-sm transition-colors duration-200 ${
                        duration === tier.key
                          ? 'border-cc-blue bg-cc-blue/10 text-white'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span className="font-heading uppercase tracking-widest text-xs">{tier.label}</span>
                      <span className="font-heading font-bold text-lg">${tier.price}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-6 mb-6">
                  <div className="flex items-end justify-between mb-1">
                    <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Total</span>
                    <span className="font-heading text-4xl font-bold text-white">${selectedTier?.price}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 font-mono text-right">Instant delivery after purchase</p>
                </div>

                <button
                  data-testid="purchase-btn"
                  onClick={handlePurchase}
                  disabled={loading || product.status === 'detected'}
                  className="w-full py-4 bg-cc-blue text-black font-heading font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    : product.status === 'detected' ? 'Currently Unavailable'
                    : 'Purchase Now'}
                </button>

                {!user && (
                  <p className="text-[10px] text-gray-600 font-mono text-center mt-3 uppercase tracking-widest">Login required to purchase</p>
                )}

                {/* Requirements */}
                {requirements.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-white/10">
                    <h4 className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-3">Requirements</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                          <Check size={10} className="text-cc-green flex-shrink-0" />
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Feature categories (for rich products like Disconnect) */}
        {product.feature_categories && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-8">
              Features
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(product.feature_categories).map(([category, features], ci) => {
                const isOpen = expandedCategories[category] !== false; // default open
                const IconComp = CATEGORY_ICONS[category] || Shield;
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * ci }}
                    className="bg-cc-paper border border-white/10 overflow-hidden"
                  >
                    <button
                      data-testid={`feature-cat-${category.toLowerCase().replace(/\s/g, '-')}`}
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 flex items-center justify-center border border-cc-blue/30 text-cc-blue">
                          <IconComp size={14} />
                        </div>
                        <span className="font-heading text-sm font-bold text-white uppercase tracking-wider">{category}</span>
                        <span className="font-mono text-[10px] text-gray-600">{features.length}</span>
                      </div>
                      <ChevronDown size={16} className={`text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 pt-1 border-t border-white/5">
                            <div className="space-y-1.5">
                              {features.map((f, fi) => (
                                <div key={fi} className="flex items-start gap-2 py-1">
                                  <Check size={12} className="text-cc-green mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-400">{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Simple features list fallback (for products without rich data) */}
        {!product.feature_categories && product.features && (
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-white uppercase tracking-tight mb-6">Features</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {product.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-cc-paper border border-white/5 px-4 py-3">
                  <Check size={16} className="text-cc-green flex-shrink-0" />
                  <span className="text-sm text-gray-300">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security note */}
        <div className="bg-cc-paper border border-white/10 p-6 flex items-start gap-4">
          <Shield size={24} className="text-cc-green flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-heading text-sm font-bold text-white mb-1">Security Guarantee</h4>
            <p className="text-sm text-gray-500">Tested against all major anti-cheat systems. Encrypted injection with HWID spoofing support. Session traces wiped automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
