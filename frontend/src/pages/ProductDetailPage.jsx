import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Check, ArrowLeft, Loader2 } from 'lucide-react';
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

const DURATIONS = [
  { key: 'daily', label: '1 Day', multiplier: 0.25 },
  { key: 'weekly', label: '7 Days', multiplier: 0.5 },
  { key: 'monthly', label: '30 Days', multiplier: 1 },
];

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [duration, setDuration] = useState('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/products/${productId}`).then(r => setProduct(r.data)).catch(() => navigate('/products'));
  }, [productId, navigate]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      return;
    }
    setLoading(true);
    try {
      const originUrl = window.location.origin;
      const res = await axios.post(`${API}/checkout/create`, {
        product_id: productId,
        origin_url: originUrl,
        duration,
      }, { withCredentials: true });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return (
    <div className="min-h-screen bg-cc-bg flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-cc-blue" />
    </div>
  );

  const statusCfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.undetected;
  const selectedDuration = DURATIONS.find(d => d.key === duration);
  const displayPrice = (product.price * selectedDuration.multiplier).toFixed(2);
  const gameSlug = product.game.toLowerCase().replace(/\s+/g, '-');

  return (
    <div data-testid="product-detail-page" className="min-h-screen bg-cc-bg pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Back button */}
        <Link
          to={`/products/${gameSlug}`}
          data-testid="back-to-game"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors duration-200 mb-8 font-mono text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to {product.game}
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusCfg.pulseClass}`} style={{ backgroundColor: statusCfg.color }} />
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                </div>
                <span className="inline-block px-3 py-1 text-[10px] font-mono uppercase tracking-widest border"
                  style={{ borderColor: product.accent_color + '40', color: product.accent_color, backgroundColor: product.accent_color + '10' }}
                >
                  {product.tier}
                </span>
              </div>

              <p className="font-mono text-xs uppercase tracking-widest text-gray-600 mb-2">{product.game}</p>
              <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white mb-6">
                {product.name}
              </h1>
              <p className="text-base text-gray-400 leading-relaxed mb-10 max-w-xl">
                {product.description}
              </p>

              {/* Features */}
              <div className="mb-10">
                <h3 className="font-heading text-lg font-bold text-white mb-6">Features</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {product.features.map((f, i) => (
                    <motion.div
                      key={f}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 bg-cc-paper border border-white/5 px-4 py-3"
                    >
                      <Check size={16} className="text-cc-green flex-shrink-0" />
                      <span className="text-sm text-gray-300">{f}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Security note */}
              <div className="bg-cc-paper border border-white/10 p-6 flex items-start gap-4">
                <Shield size={24} className="text-cc-green flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-heading text-sm font-bold text-white mb-1">Security Guarantee</h4>
                  <p className="text-sm text-gray-500">Tested against all major anti-cheat systems. Encrypted injection with HWID spoofing support. Session traces wiped automatically.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Purchase sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-28"
            >
              <div className="glass p-6">
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-widest mb-6">Select Duration</h3>

                <div className="space-y-3 mb-6">
                  {DURATIONS.map(d => (
                    <button
                      key={d.key}
                      data-testid={`duration-${d.key}`}
                      onClick={() => setDuration(d.key)}
                      className={`w-full flex items-center justify-between px-4 py-3 border text-sm transition-colors duration-200 ${
                        duration === d.key
                          ? 'border-cc-blue bg-cc-blue/10 text-white'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span className="font-heading uppercase tracking-widest text-xs">{d.label}</span>
                      <span className="font-heading font-bold">${(product.price * d.multiplier).toFixed(2)}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-6 mb-6">
                  <div className="flex items-end justify-between mb-1">
                    <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Total</span>
                    <span className="font-heading text-3xl font-bold text-white">${displayPrice}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 font-mono text-right">Instant delivery after purchase</p>
                </div>

                <button
                  data-testid="purchase-btn"
                  onClick={handlePurchase}
                  disabled={loading || product.status === 'detected'}
                  className="w-full py-4 bg-cc-blue text-black font-heading font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  ) : product.status === 'detected' ? (
                    'Currently Unavailable'
                  ) : (
                    'Purchase Now'
                  )}
                </button>

                {!user && (
                  <p className="text-[10px] text-gray-600 font-mono text-center mt-3 uppercase tracking-widest">
                    Login required to purchase
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
