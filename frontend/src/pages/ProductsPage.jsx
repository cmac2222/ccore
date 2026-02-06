import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const GAME_LOGOS = {
  'Rust': '/logos/rust.jpg',
  'Valorant': '/logos/valorant.svg',
  'Marvel Rivals': '/logos/marvel-rivals.jpg',
  'Overwatch': '/logos/overwatch.jpg',
  'Arc Raiders': '/logos/arc-raiders.jpg',
  'CS2': '/logos/cs2.jpg',
  'Minecraft': '/logos/minecraft.svg',
};

const GAME_ORDER = ['Rust', 'Valorant', 'CS2', 'Marvel Rivals', 'Overwatch', 'Arc Raiders', 'Minecraft'];

const GAME_ACCENTS = {
  'Rust': '#CD412B',
  'Valorant': '#FF4655',
  'CS2': '#DE9B35',
  'Marvel Rivals': '#ED1D24',
  'Overwatch': '#F99E1A',
  'Arc Raiders': '#00D4FF',
  'Minecraft': '#6AAC2B',
};

function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [games, setGames] = useState([]);

  useEffect(() => {
    axios.get(`${API}/products`).then(r => setProducts(r.data)).catch(() => {});
    axios.get(`${API}/games`).then(r => setGames(r.data)).catch(() => {});
  }, []);

  const gameCards = GAME_ORDER
    .map(name => {
      const gameProducts = products.filter(p => p.game === name);
      if (gameProducts.length === 0) return null;
      const udCount = gameProducts.filter(p => p.status === 'undetected').length;
      const lowestPrice = Math.min(...gameProducts.map(p => p.price));
      return { name, products: gameProducts, udCount, lowestPrice, slug: toSlug(name) };
    })
    .filter(Boolean);

  // Add any games not in the predefined order
  const orderedNames = new Set(GAME_ORDER);
  games.forEach(g => {
    if (!orderedNames.has(g.name)) {
      const gameProducts = products.filter(p => p.game === g.name);
      if (gameProducts.length > 0) {
        gameCards.push({
          name: g.name,
          products: gameProducts,
          udCount: gameProducts.filter(p => p.status === 'undetected').length,
          lowestPrice: Math.min(...gameProducts.map(p => p.price)),
          slug: toSlug(g.name),
        });
      }
    }
  });

  return (
    <div data-testid="products-page" className="min-h-screen bg-cc-bg pt-28 pb-24">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-overlay" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cc-blue/[0.02] rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-cc-green/[0.015] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-blue mb-4">// Select Your Game</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase text-white mb-4">
            Products
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-xl">
            Choose a game to browse our premium tools. Instant delivery, 24/7 support, and transparent status on every product.
          </p>

          <div className="flex gap-10 mt-10 pt-6 border-t border-white/10">
            <div>
              <p className="font-heading text-3xl font-bold text-white">{products.length}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">Products</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-bold text-cc-green">{products.filter(p => p.status === 'undetected').length}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">Undetected</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-bold text-white">{games.length}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">Games</p>
            </div>
          </div>
        </motion.div>

        {/* Game Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gameCards.map((game, i) => {
            const accent = GAME_ACCENTS[game.name] || '#00D4FF';
            return (
              <motion.div
                key={game.name}
                data-testid={`game-card-${game.slug}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  to={`/products/${game.slug}`}
                  className="group relative block bg-cc-paper border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300"
                >
                  {/* Accent glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(ellipse at bottom, ${accent}10, transparent 70%)` }}
                  />
                  {/* Top accent line on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }}
                  />

                  <div className="relative p-7">
                    {/* Logo + Game Name */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden bg-cc-subtle border border-white/10 group-hover:border-white/20 transition-colors duration-300">
                        <img
                          src={GAME_LOGOS[game.name]}
                          alt={game.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-family:Space Grotesk;font-size:16px;font-weight:bold;color:${accent}">${game.name[0]}</span>`;
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl font-bold text-white uppercase tracking-tight group-hover:text-white transition-colors duration-200">
                          {game.name}
                        </h3>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-0.5">
                          {game.products.length} {game.products.length === 1 ? 'product' : 'products'}
                        </p>
                      </div>
                    </div>

                    {/* Status + Price row */}
                    <div className="flex items-center justify-between mb-5">
                      {game.udCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-cc-green status-undetected" />
                          <span className="font-mono text-[10px] uppercase tracking-widest text-cc-green">
                            {game.udCount} Undetected
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-cc-yellow status-testing" />
                          <span className="font-mono text-[10px] uppercase tracking-widest text-cc-yellow">Testing</span>
                        </div>
                      )}
                      <div className="text-right">
                        <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">From </span>
                        <span className="font-heading text-lg font-bold text-white">${game.lowestPrice}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-5 border-t border-white/5">
                      <span className="font-heading text-xs uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors duration-200">
                        Browse Products
                      </span>
                      <ArrowRight size={16} className="text-gray-600 group-hover:text-cc-blue group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {gameCards.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 font-mono text-sm">Loading games...</p>
          </div>
        )}

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          <div className="flex items-center gap-2 text-gray-600">
            <Shield size={14} />
            <span className="font-mono text-[10px] uppercase tracking-widest">Anti-Cheat Tested</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-cc-green" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Instant Delivery</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-cc-blue" />
            <span className="font-mono text-[10px] uppercase tracking-widest">24/7 Support</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
