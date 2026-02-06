import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [games, setGames] = useState([]);
  const [filterGame, setFilterGame] = useState('all');

  useEffect(() => {
    axios.get(`${API}/products`).then(r => setProducts(r.data)).catch(() => {});
    axios.get(`${API}/games`).then(r => setGames(r.data)).catch(() => {});
  }, []);

  const filtered = filterGame === 'all' ? products : products.filter(p => p.game === filterGame);
  const gameNames = games.map(g => g.name);

  return (
    <div data-testid="products-page" className="min-h-screen bg-cc-bg pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-blue mb-4">// Browse Collection</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white mb-4">
            Products
          </h1>
          <p className="text-base text-gray-400 max-w-lg">
            Premium tools for {gameNames.length} games. All products include instant delivery and 24/7 support.
          </p>
        </motion.div>

        {/* Game Filters */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            data-testid="product-filter-all"
            onClick={() => setFilterGame('all')}
            className={`px-5 py-2.5 text-xs font-mono uppercase tracking-widest border transition-colors duration-200 ${
              filterGame === 'all' ? 'border-cc-blue text-cc-blue bg-cc-blue/10' : 'border-white/10 text-gray-500 hover:text-white'
            }`}
          >
            All ({products.length})
          </button>
          {gameNames.map(g => (
            <button
              key={g}
              data-testid={`product-filter-${g.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => setFilterGame(filterGame === g ? 'all' : g)}
              className={`px-5 py-2.5 text-xs font-mono uppercase tracking-widest border transition-colors duration-200 ${
                filterGame === g ? 'border-cc-blue text-cc-blue bg-cc-blue/10' : 'border-white/10 text-gray-500 hover:text-white'
              }`}
            >
              {g} ({products.filter(p => p.game === g).length})
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.product_id} product={product} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 font-mono text-sm">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
