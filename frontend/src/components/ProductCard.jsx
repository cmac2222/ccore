import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  undetected: { color: '#39FF14', label: 'Undetected', pulseClass: 'status-undetected' },
  testing: { color: '#FFD600', label: 'Testing', pulseClass: 'status-testing' },
  updating: { color: '#00D4FF', label: 'Updating', pulseClass: 'status-updating' },
  detected: { color: '#FF0055', label: 'Detected', pulseClass: 'status-detected' },
};

export default function ProductCard({ product, index }) {
  const statusCfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.undetected;

  return (
    <motion.div
      data-testid={`product-card-${product.product_id}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        to={`/products/${product.product_id}`}
        className="group relative block overflow-hidden bg-cc-paper border border-white/10 hover:border-cc-blue/50 transition-colors duration-300"
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
          style={{ background: `radial-gradient(circle at center, ${product.accent_color}15, transparent 70%)` }}
        />

        {/* Animated border on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cc-blue to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cc-blue to-transparent" />
        </div>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-1">{product.game}</p>
              <h3 className="font-heading text-xl font-bold text-white group-hover:text-cc-blue transition-colors duration-200">{product.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusCfg.pulseClass}`} style={{ backgroundColor: statusCfg.color }} />
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: statusCfg.color }}>
                {statusCfg.label}
              </span>
            </div>
          </div>

          {/* Tier badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-[10px] font-mono uppercase tracking-widest border"
              style={{
                borderColor: product.accent_color + '40',
                color: product.accent_color,
                backgroundColor: product.accent_color + '10'
              }}
            >
              {product.tier}
            </span>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.features.slice(0, 4).map((f, i) => (
              <span key={i} className="text-[11px] font-mono text-gray-500 bg-white/5 px-2 py-1">{f}</span>
            ))}
            {product.features.length > 4 && (
              <span className="text-[11px] font-mono text-gray-600 px-2 py-1">+{product.features.length - 4}</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end justify-between pt-4 border-t border-white/5">
            <div>
              <span className="text-xs text-gray-600 font-mono uppercase tracking-widest">From</span>
              <p className="font-heading text-2xl font-bold text-white">
                ${product.price}
                <span className="text-xs text-gray-600 font-mono ml-1">/mo</span>
              </p>
            </div>
            <div className="px-4 py-2 bg-cc-blue/10 border border-cc-blue/30 text-cc-blue text-xs font-heading uppercase tracking-widest group-hover:bg-cc-blue group-hover:text-black transition-colors duration-300">
              View
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
