import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_CONFIG = {
  undetected: { color: '#39FF14', label: 'Undetected', pulseClass: 'status-undetected', bg: 'rgba(57, 255, 20, 0.08)' },
  testing: { color: '#FFD600', label: 'Testing', pulseClass: 'status-testing', bg: 'rgba(255, 214, 0, 0.08)' },
  updating: { color: '#00D4FF', label: 'Updating', pulseClass: 'status-updating', bg: 'rgba(0, 212, 255, 0.08)' },
  detected: { color: '#FF0055', label: 'Detected', pulseClass: 'status-detected', bg: 'rgba(255, 0, 85, 0.08)' },
};

export default function StatusPage() {
  const [statuses, setStatuses] = useState([]);
  const [filterGame, setFilterGame] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    axios.get(`${API}/product-status`).then(r => setStatuses(r.data)).catch(() => {});
  }, []);

  const games = [...new Set(statuses.map(s => s.game))].sort();
  const filtered = statuses.filter(s => {
    if (filterGame !== 'all' && s.game !== filterGame) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const statusCounts = {
    undetected: statuses.filter(s => s.status === 'undetected').length,
    testing: statuses.filter(s => s.status === 'testing').length,
    updating: statuses.filter(s => s.status === 'updating').length,
    detected: statuses.filter(s => s.status === 'detected').length,
  };

  return (
    <div data-testid="status-page" className="min-h-screen bg-cc-bg pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-green mb-4">// Real-Time Monitoring</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white mb-4">
            Product Status
          </h1>
          <p className="text-base text-gray-400 max-w-lg">
            Live detection status for all Cheatcore products. Updated continuously.
          </p>
        </motion.div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Object.entries(STATUS_CONFIG).map(([key, cfg], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              data-testid={`status-summary-${key}`}
              className="bg-cc-paper border border-white/10 p-5 cursor-pointer hover:bg-white/5 transition-colors duration-200"
              style={{ borderColor: filterStatus === key ? cfg.color + '50' : undefined }}
              onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${cfg.pulseClass}`} style={{ backgroundColor: cfg.color }} />
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
              </div>
              <p className="font-heading text-3xl font-bold text-white">{statusCounts[key]}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            data-testid="filter-game-all"
            onClick={() => setFilterGame('all')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest border transition-colors duration-200 ${
              filterGame === 'all' ? 'border-cc-blue text-cc-blue bg-cc-blue/10' : 'border-white/10 text-gray-500 hover:text-white'
            }`}
          >
            All Games
          </button>
          {games.map(g => (
            <button
              key={g}
              data-testid={`filter-game-${g.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => setFilterGame(filterGame === g ? 'all' : g)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest border transition-colors duration-200 ${
                filterGame === g ? 'border-cc-blue text-cc-blue bg-cc-blue/10' : 'border-white/10 text-gray-500 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, i) => {
            const cfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.undetected;
            return (
              <motion.div
                key={product.product_id}
                data-testid={`status-card-${product.product_id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group bg-cc-paper border border-white/10 p-5 hover:border-opacity-50 transition-colors duration-300"
                style={{ 
                  '--hover-border': cfg.color,
                  borderColor: undefined,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = cfg.color + '50'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-1">{product.game}</p>
                    <h3 className="font-heading text-lg font-bold text-white">{product.name}</h3>
                  </div>
                  <div className={`w-3 h-3 rounded-full mt-1 ${cfg.pulseClass}`} style={{ backgroundColor: cfg.color }} />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <span className="font-mono text-[10px] text-gray-600">
                    Updated {new Date(product.last_updated).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 font-mono text-sm">No products match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
