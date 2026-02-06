import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_CONFIG = {
  undetected: { color: '#39FF14', label: 'Undetected', pulseClass: 'status-undetected' },
  testing: { color: '#FFD600', label: 'Testing', pulseClass: 'status-testing' },
  updating: { color: '#00D4FF', label: 'Updating', pulseClass: 'status-updating' },
  detected: { color: '#FF0055', label: 'Detected', pulseClass: 'status-detected' },
};

const GAME_ICONS = {
  'Rust': 'R',
  'Valorant': 'V',
  'Marvel Rivals': 'MR',
  'Overwatch': 'OW',
  'Arc Raiders': 'AR',
  'CS2': 'CS',
  'Minecraft': 'MC',
};

function GameSection({ game, products, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      data-testid={`game-section-${game.toLowerCase().replace(/\s/g, '-')}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/10 bg-cc-paper overflow-hidden"
    >
      {/* Game header - clickable */}
      <button
        data-testid={`game-toggle-${game.toLowerCase().replace(/\s/g, '-')}`}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors duration-200"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-cc-blue/30 bg-cc-blue/10 flex items-center justify-center">
            <span className="font-heading text-xs font-bold text-cc-blue">{GAME_ICONS[game] || game[0]}</span>
          </div>
          <div className="text-left">
            <h3 className="font-heading text-lg font-bold text-white uppercase tracking-tight">{game}</h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'} available
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            {products.filter(p => p.status === 'undetected').length > 0 && (
              <span className="flex items-center gap-1.5 px-2 py-1 bg-cc-green/10 border border-cc-green/20">
                <div className="w-1.5 h-1.5 rounded-full bg-cc-green status-undetected" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-cc-green">
                  {products.filter(p => p.status === 'undetected').length} UD
                </span>
              </span>
            )}
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded product list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-6 py-4 space-y-3">
              {products.map((product, i) => {
                const statusCfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.undetected;
                return (
                  <motion.div
                    key={product.product_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/products/${product.product_id}`}
                      data-testid={`product-link-${product.product_id}`}
                      className="group flex items-center justify-between py-4 px-4 bg-black/30 border border-white/5 hover:border-cc-blue/30 hover:bg-cc-blue/[0.03] transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Status dot */}
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusCfg.pulseClass}`}
                          style={{ backgroundColor: statusCfg.color }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-heading text-base font-bold text-white group-hover:text-cc-blue transition-colors duration-200">
                              {product.name}
                            </h4>
                            <span className="inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest border"
                              style={{
                                borderColor: product.accent_color + '40',
                                color: product.accent_color,
                                backgroundColor: product.accent_color + '10'
                              }}
                            >
                              {product.tier}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-md">{product.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                        {/* Features count */}
                        <div className="hidden md:flex items-center gap-1.5">
                          {product.features.slice(0, 3).map((f, fi) => (
                            <span key={fi} className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-0.5">{f}</span>
                          ))}
                          {product.features.length > 3 && (
                            <span className="text-[10px] font-mono text-gray-700">+{product.features.length - 3}</span>
                          )}
                        </div>

                        {/* Status label */}
                        <span className="font-mono text-[10px] uppercase tracking-widest hidden sm:block"
                          style={{ color: statusCfg.color }}
                        >
                          {statusCfg.label}
                        </span>

                        {/* Price */}
                        <div className="text-right">
                          <span className="font-heading text-lg font-bold text-white">${product.price}</span>
                          <span className="text-[10px] text-gray-600 font-mono block">/mo</span>
                        </div>

                        {/* Arrow */}
                        <ArrowRight size={16} className="text-gray-700 group-hover:text-cc-blue transition-colors duration-200" />
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

  // Group products by game
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-blue mb-4">// Browse Collection</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white mb-4">
            Products
          </h1>
          <p className="text-base text-gray-400 max-w-lg">
            Premium tools for {games.length} games. Select a game to view available software.
          </p>

          {/* Quick stats */}
          <div className="flex gap-8 mt-8 pt-6 border-t border-white/10">
            <div>
              <p className="font-heading text-2xl font-bold text-white">{products.length}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600">Total Products</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-cc-green">{products.filter(p => p.status === 'undetected').length}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600">Undetected</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-white">{games.length}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600">Games</p>
            </div>
          </div>
        </motion.div>

        {/* Game accordion list */}
        <div className="space-y-3">
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
