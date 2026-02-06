import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Shield, Zap, Clock } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_CONFIG = {
  undetected: { color: '#39FF14', label: 'Undetected', pulseClass: 'status-undetected' },
  testing: { color: '#FFD600', label: 'Testing', pulseClass: 'status-testing' },
  updating: { color: '#00D4FF', label: 'Updating', pulseClass: 'status-updating' },
  detected: { color: '#FF0055', label: 'Detected', pulseClass: 'status-detected' },
};

const GAME_LOGOS = {
  'Rust': '/logos/rust.jpg',
  'Valorant': '/logos/valorant.svg',
  'Marvel Rivals': '/logos/marvel-rivals.jpg',
  'Overwatch': '/logos/overwatch.jpg',
  'Arc Raiders': '/logos/arc-raiders.jpg',
  'CS2': '/logos/cs2.jpg',
  'Minecraft': '/logos/minecraft.svg',
};

const GAME_ACCENTS = {
  'Rust': '#CD412B',
  'Valorant': '#FF4655',
  'CS2': '#DE9B35',
  'Marvel Rivals': '#ED1D24',
  'Overwatch': '#F99E1A',
  'Arc Raiders': '#00D4FF',
  'Minecraft': '#6AAC2B',
};

// Product images — Rust software pulled from cheatvault
const PRODUCT_IMAGES = {
  'rust-disconnect': 'https://cheatvault.net/images/index/rust_disconnect.webp',
  'rust-fluent': 'https://bucket.cheatvault.net/products/rust-fluent-cheat/f4.png',
  'rust-serenity': 'https://bucket.cheatvault.net/products/rust-serenity-cheat/s4.jpg',
};

function slugToName(slug) {
  const map = {
    'rust': 'Rust',
    'valorant': 'Valorant',
    'cs2': 'CS2',
    'marvel-rivals': 'Marvel Rivals',
    'overwatch': 'Overwatch',
    'arc-raiders': 'Arc Raiders',
    'minecraft': 'Minecraft',
  };
  return map[slug] || slug;
}

export default function GameProductsPage() {
  const { gameSlug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const gameName = slugToName(gameSlug);
  const logo = GAME_LOGOS[gameName];

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/products?game=${encodeURIComponent(gameName)}`)
      .then(r => {
        setProducts(r.data);
        if (r.data.length === 0) {
          navigate(`/product/${gameSlug}`, { replace: true });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [gameName, gameSlug, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-cc-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-cc-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const udCount = products.filter(p => p.status === 'undetected').length;

  return (
    <div data-testid="game-products-page" className="min-h-screen bg-cc-bg pt-28 pb-24">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-overlay" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: `${GAME_ACCENTS[gameName] || '#00D4FF'}08` }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-12">
        {/* Back link */}
        <Link
          to="/products"
          data-testid="back-to-products"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors duration-200 mb-10 font-mono text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> All Games
        </Link>

        {/* Game header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-cc-subtle border border-white/10">
              {logo && <img src={logo} alt={gameName} className="w-full h-full object-cover" />}
            </div>
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase text-white">
                {gameName}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="font-mono text-xs uppercase tracking-widest text-gray-500">
                  {products.length} {products.length === 1 ? 'product' : 'products'}
                </span>
                {udCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-cc-green status-undetected" />
                    <span className="font-mono text-xs uppercase tracking-widest text-cc-green">{udCount} Undetected</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Cards */}
        <div className="space-y-5">
          {products.map((product, i) => {
            const statusCfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.undetected;
            const isDisabled = product.status === 'detected';
            const productImage = PRODUCT_IMAGES[product.product_id];

            return (
              <motion.div
                key={product.product_id}
                data-testid={`game-product-card-${product.product_id}`}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link
                  to={`/product/${product.product_id}`}
                  className={`group relative block bg-cc-paper border border-white/10 overflow-hidden transition-all duration-300 ${
                    isDisabled ? 'opacity-60' : 'hover:border-white/20'
                  }`}
                >
                  {/* Accent top line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(to right, transparent, ${product.accent_color}, transparent)` }}
                  />
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(ellipse at left center, ${product.accent_color}08, transparent 60%)` }}
                  />

                  <div className="relative p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
                      {/* Product image (if available) */}
                      {productImage && (
                        <div className="lg:w-64 xl:w-80 flex-shrink-0 overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors duration-300">
                          <img
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-cover min-h-[160px] lg:min-h-0"
                          />
                        </div>
                      )}

                      {/* Product info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        {/* Top: Name + status */}
                        <div>
                          <div className="flex items-center gap-3 flex-wrap mb-3">
                            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white group-hover:text-cc-blue transition-colors duration-200 tracking-tight uppercase">
                              {product.name}
                            </h2>
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${statusCfg.pulseClass}`} style={{ backgroundColor: statusCfg.color }} />
                              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: statusCfg.color }}>
                                {statusCfg.label}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-4 max-w-2xl">
                            {product.description}
                          </p>

                          {/* Type tag */}
                          <span className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 bg-white/[0.04] border border-white/5 px-3 py-1.5 uppercase tracking-widest">
                            External
                          </span>
                        </div>
                      </div>

                      {/* Right: Price + CTA */}
                      <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 lg:gap-3 flex-shrink-0 lg:min-w-[180px]">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest block mb-0.5">Starting at</span>
                          <span className="font-heading text-3xl md:text-4xl font-bold text-white">${product.price}</span>
                          <span className="text-xs text-gray-600 font-mono">/mo</span>
                        </div>
                        <div
                          className="inline-flex items-center gap-2 px-6 py-3 font-heading text-xs uppercase tracking-widest font-bold transition-all duration-300"
                          style={{
                            backgroundColor: isDisabled ? 'transparent' : product.accent_color + '15',
                            borderColor: product.accent_color + '40',
                            color: isDisabled ? '#52525B' : product.accent_color,
                            border: '1px solid',
                          }}
                        >
                          {isDisabled ? 'Unavailable' : (
                            <>View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" /></>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {products.length === 0 && !loading && (
          <div className="text-center py-20 bg-cc-paper border border-white/10">
            <p className="text-gray-500 font-mono text-sm">No products found for this game.</p>
            <Link to="/products" className="text-cc-blue text-sm mt-2 inline-block hover:underline">Back to all games</Link>
          </div>
        )}

        {/* Trust section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid sm:grid-cols-3 gap-4"
        >
          {[
            { icon: Shield, title: 'Tested Daily', desc: 'Every product is tested against the latest anti-cheat updates.', color: '#39FF14' },
            { icon: Zap, title: 'Instant Delivery', desc: 'License key delivered to your dashboard within seconds.', color: '#00D4FF' },
            { icon: Clock, title: 'Flexible Plans', desc: 'Daily, weekly, or monthly options to fit your needs.', color: '#FFD600' },
          ].map((item, i) => (
            <div key={i} className="bg-black/30 border border-white/5 p-5 flex items-start gap-4">
              <div className="w-8 h-8 flex items-center justify-center border flex-shrink-0"
                style={{ borderColor: item.color + '30', color: item.color }}
              >
                <item.icon size={16} />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
