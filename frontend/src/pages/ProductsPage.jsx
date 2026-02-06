import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_CONFIG = {
  undetected: { color: '#39FF14', label: 'Undetected', pulseClass: 'status-undetected' },
  testing: { color: '#FFD600', label: 'Testing', pulseClass: 'status-testing' },
  updating: { color: '#00D4FF', label: 'Updating', pulseClass: 'status-updating' },
  detected: { color: '#FF0055', label: 'Detected', pulseClass: 'status-detected' },
};

// Game logos as inline SVG components for reliability
const GameLogos = {
  Rust: () => (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="4" fill="#CD412B" />
      <path d="M8 28V12h4.5c2 0 3.5.5 4.5 1.5S18.5 15.5 18.5 17c0 1-.2 1.8-.7 2.5s-1.2 1.1-2 1.3l3.2 7.2h-3.5l-2.8-6.5H11.5V28H8zm3.5-9.5h1.2c.8 0 1.4-.2 1.8-.7.4-.4.6-1 .6-1.8 0-.7-.2-1.3-.6-1.7-.4-.4-1-.6-1.8-.6h-1.2v4.8zM33 28h-3.2l-1-3h-4.6l-1 3H20l4.8-16h3.5L33 28zm-5-6l-1.5-5.2L25 22h3z" fill="white"/>
    </svg>
  ),
  Valorant: () => (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="4" fill="#FF4655" />
      <path d="M8 12l8 16h4L12 12H8zm12 0v16h4l8-16h-4l-6 12V12h-2z" fill="white"/>
    </svg>
  ),
  'Marvel Rivals': () => (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="4" fill="#ED1D24" />
      <path d="M6 28V12h4l4 10 4-10h4v16h-3V17l-3.5 9h-3L9 17v11H6z" fill="white"/>
      <path d="M26 28V12h4.5c1.5 0 2.7.4 3.5 1.2.8.8 1.2 1.8 1.2 3.2 0 1.2-.3 2.2-1 3-.6.7-1.5 1.2-2.5 1.3L35 28h-3.5l-2.5-6.5H29V28h-3zm3-9.5h1.2c.7 0 1.2-.2 1.5-.5.4-.4.5-.9.5-1.5 0-.6-.2-1.1-.5-1.5-.3-.3-.8-.5-1.5-.5H29v4z" fill="white"/>
    </svg>
  ),
  Overwatch: () => (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="4" fill="#F99E1A" />
      <circle cx="20" cy="20" r="10" fill="none" stroke="white" strokeWidth="3"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
      <path d="M20 10v4M20 26v4M10 20h4M26 20h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'Arc Raiders': () => (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="4" fill="#1A1A2E" />
      <path d="M20 8L6 32h6l2.5-5h11L28 32h6L20 8zm0 9l3.5 7h-7L20 17z" fill="#00D4FF"/>
    </svg>
  ),
  CS2: () => (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="4" fill="#DE9B35" />
      <circle cx="20" cy="20" r="11" fill="none" stroke="white" strokeWidth="2.5"/>
      <circle cx="20" cy="20" r="2" fill="white"/>
      <path d="M20 9v5M20 26v5M9 20h5M26 20h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Minecraft: () => (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="4" fill="#3B8526" />
      <rect x="8" y="8" width="24" height="24" fill="#6D4C2A" rx="2"/>
      <rect x="12" y="12" width="6" height="6" fill="#5C3A1E"/>
      <rect x="22" y="12" width="6" height="6" fill="#5C3A1E"/>
      <rect x="14" y="22" width="12" height="6" fill="#5C3A1E"/>
      <rect x="16" y="22" width="2" height="2" fill="#3B2510"/>
      <rect x="22" y="22" width="2" height="2" fill="#3B2510"/>
      <rect x="8" y="8" width="24" height="24" rx="2" fill="none" stroke="#8B6914" strokeWidth="1.5"/>
    </svg>
  ),
};

function GameSection({ game, products, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const LogoComponent = GameLogos[game];
  const udCount = products.filter(p => p.status === 'undetected').length;

  return (
    <motion.div
      data-testid={`game-section-${game.toLowerCase().replace(/\s/g, '-')}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/10 bg-cc-paper overflow-hidden"
    >
      {/* Game header */}
      <button
        data-testid={`game-toggle-${game.toLowerCase().replace(/\s/g, '-')}`}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 md:px-8 py-6 hover:bg-white/[0.02] transition-colors duration-200"
      >
        <div className="flex items-center gap-5">
          {/* Game logo */}
          <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden">
            {LogoComponent ? <LogoComponent /> : (
              <div className="w-full h-full bg-cc-blue/20 border border-cc-blue/30 flex items-center justify-center">
                <span className="font-heading text-sm font-bold text-cc-blue">{game[0]}</span>
              </div>
            )}
          </div>
          <div className="text-left">
            <h3 className="font-heading text-xl md:text-2xl font-bold text-white uppercase tracking-tight">{game}</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-gray-600 mt-0.5">
              {products.length} {products.length === 1 ? 'product' : 'products'} available
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          {udCount > 0 && (
            <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-cc-green/10 border border-cc-green/20">
              <div className="w-2 h-2 rounded-full bg-cc-green status-undetected" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-cc-green">{udCount} Undetected</span>
            </span>
          )}
          <ChevronDown
            size={20}
            className={`text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded products */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-4 md:px-6 py-4 space-y-2">
              {products.map((product, i) => {
                const statusCfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.undetected;
                return (
                  <motion.div
                    key={product.product_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={`/products/${product.product_id}`}
                      data-testid={`product-link-${product.product_id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 px-5 md:px-6 bg-black/30 border border-white/5 hover:border-cc-blue/30 hover:bg-cc-blue/[0.03] transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Status indicator */}
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${statusCfg.pulseClass}`}
                          style={{ backgroundColor: statusCfg.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-heading text-lg font-bold text-white group-hover:text-cc-blue transition-colors duration-200">
                              {product.name}
                            </h4>
                            <span className="inline-block px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest border"
                              style={{
                                borderColor: product.accent_color + '40',
                                color: product.accent_color,
                                backgroundColor: product.accent_color + '10'
                              }}
                            >
                              {product.tier}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-widest"
                              style={{ color: statusCfg.color }}
                            >
                              {statusCfg.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.description}</p>

                          {/* Features row */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {product.features.map((f, fi) => (
                              <span key={fi} className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5">{f}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Price + arrow */}
                      <div className="flex items-center gap-5 flex-shrink-0 sm:ml-4 pl-7 sm:pl-0">
                        <div className="text-left sm:text-right">
                          <span className="font-heading text-2xl font-bold text-white">${product.price}</span>
                          <span className="text-[10px] text-gray-600 font-mono block">/month</span>
                        </div>
                        <ArrowRight size={18} className="text-gray-700 group-hover:text-cc-blue transition-colors duration-200" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [games, setGames] = useState([]);

  useEffect(() => {
    axios.get(`${API}/products`).then(r => setProducts(r.data)).catch(() => {});
    axios.get(`${API}/games`).then(r => setGames(r.data)).catch(() => {});
  }, []);

  const gameGroups = games.map(g => ({
    name: g.name,
    products: products.filter(p => p.game === g.name),
  })).filter(g => g.products.length > 0);

  return (
    <div data-testid="products-page" className="min-h-screen bg-cc-bg pt-28 pb-24">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-overlay" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-cc-blue/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-cc-green/[0.015] rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-blue mb-4">// Browse Collection</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white mb-4">
            Products
          </h1>
          <p className="text-lg text-gray-400 max-w-lg">
            Select a game below to browse available software.
          </p>

          {/* Quick stats */}
          <div className="flex gap-10 mt-10 pt-6 border-t border-white/10">
            <div>
              <p className="font-heading text-3xl font-bold text-white">{products.length}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">Total Products</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-bold text-cc-green">{products.filter(p => p.status === 'undetected').length}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">Undetected</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-bold text-white">{games.length}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">Games Supported</p>
            </div>
          </div>
        </motion.div>

        {/* Game accordion list */}
        <div className="space-y-4">
          {gameGroups.map((group, i) => (
            <GameSection
              key={group.name}
              game={group.name}
              products={group.products}
              defaultOpen={i === 0}
            />
          ))}
        </div>

        {gameGroups.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 font-mono text-sm">Loading products...</p>
          </div>
        )}
      </div>
    </div>
  );
}
