import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Eye, Crosshair, Star } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HERO_IMAGES = [
  { src: 'https://cheatvault.net/images/index/rust_disconnect.webp', label: 'Disconnect Rust' },
  { src: 'https://bucket.cheatvault.net/products/rust-fluent-cheat/f4.png', label: 'Fluent Rust' },
  { src: 'https://bucket.cheatvault.net/products/rust-serenity-cheat/s4.jpg', label: 'Serenity Rust' },
];

const FEATURES = [
  { icon: Shield, title: 'Undetected', desc: 'All tools are tested against major anti-cheat systems before release.', color: '#39FF14' },
  { icon: Zap, title: 'Instant Access', desc: 'Automated delivery. Get your license key within seconds of purchase.', color: '#00D4FF' },
  { icon: Eye, title: 'Transparency', desc: 'Real-time status page. We never hide detections or downtime.', color: '#FFD600' },
  { icon: Crosshair, title: 'Precision', desc: 'Fine-tuned aimbot, ESP, and utility features for competitive play.', color: '#FF0055' },
];

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/stats`).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/reviews`).then(r => setReviews(r.data)).catch(() => {});
    axios.get(`${API}/products`).then(r => {
      const premium = r.data.filter(p => p.tier === 'Premium').slice(0, 4);
      setFeaturedProducts(premium);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div data-testid="home-page" className="min-h-screen bg-cc-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Fluid dark background */}
        <div className="absolute inset-0 bg-cc-bg">
          <div className="absolute inset-0 grid-overlay" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cc-blue/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cc-green/[0.02] rounded-full blur-[120px]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cc-bg" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-green mb-6" data-testid="hero-tagline">
                  // Premium Gaming Enhancement
                </p>
                <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none mb-6">
                  <span className="text-white">Dominate</span>
                  <br />
                  <span className="text-white">Every </span>
                  <span className="text-cc-blue neon-blue">Match</span>
                </h1>
                <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-lg mb-10">
                  Premium tools built for players who demand results. Stable, undetected, and feature-rich software for competitive gaming.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/products"
                    data-testid="hero-shop-btn"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-cc-blue text-black font-heading font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-shadow duration-300 skew-x-[-8deg]"
                  >
                    <span className="inline-flex items-center gap-2 skew-x-[8deg]">
                      Shop Now <ArrowRight size={16} />
                    </span>
                  </Link>
                  <Link
                    to="/status"
                    data-testid="hero-status-btn"
                    className="inline-flex items-center gap-2 px-8 py-3 border border-cc-green text-cc-green font-heading font-bold uppercase tracking-widest text-sm hover:bg-cc-green/10 transition-colors duration-300 skew-x-[-8deg]"
                  >
                    <span className="inline-flex items-center gap-2 skew-x-[8deg]">
                      View Status
                    </span>
                  </Link>
                </div>
              </motion.div>

              {/* Stats row */}
              {stats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex gap-10 mt-16 pt-8 border-t border-white/10"
                >
                  <div>
                    <p className="font-heading text-3xl font-bold text-white">{stats.total_products}+</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">Products</p>
                  </div>
                  <div>
                    <p className="font-heading text-3xl font-bold text-cc-green">{stats.undetected_count}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">Undetected</p>
                  </div>
                  <div>
                    <p className="font-heading text-3xl font-bold text-white">{stats.total_games}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">Games</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right - 3D Tilt Card Stack */}
            <motion.div
              ref={heroRef}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-[4/3]">
                {HERO_IMAGES.map((img, i) => {
                  const offset = ((i - heroIndex + HERO_IMAGES.length) % HERO_IMAGES.length);
                  return (
                    <motion.div
                      key={i}
                      className="absolute inset-0 overflow-hidden border border-white/10"
                      animate={{
                        rotateY: offset === 0 ? 0 : offset === 1 ? 15 : -15,
                        rotateX: offset === 0 ? 0 : -5,
                        scale: offset === 0 ? 1 : 0.85,
                        x: offset === 0 ? 0 : offset === 1 ? 60 : -60,
                        z: offset === 0 ? 0 : -100,
                        opacity: offset === 0 ? 1 : 0.4,
                      }}
                      transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
                      style={{
                        perspective: '1000px',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cc-bg/80 to-transparent" />
                      {offset === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-cc-green status-undetected" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-cc-green">Undetected</span>
                          </div>
                          <p className="font-heading text-sm font-bold text-white">{img.label}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              {/* Glow underneath */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-cc-blue/20 blur-3xl rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-24 md:py-32 relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-blue mb-4">// Featured</p>
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-12">
                Top Products
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p, i) => (
                <motion.div
                  key={p.product_id}
                  data-testid={`featured-${p.product_id}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    to={`/products/${p.product_id}`}
                    className="group block relative overflow-hidden bg-cc-paper border border-white/10 hover:border-cc-blue/50 transition-colors duration-300 p-6"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
                      style={{ background: `radial-gradient(circle at center, ${p.accent_color}15, transparent 70%)` }}
                    />
                    <div className="relative">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-2">{p.game}</p>
                      <h3 className="font-heading text-lg font-bold text-white group-hover:text-cc-blue transition-colors duration-200 mb-3">{p.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-xl font-bold text-white">${p.price}</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-cc-green">{p.status_label}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 md:py-32 relative" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-green mb-4">// Why Cheatcore</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-16">
              Built Different
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group bg-black/40 backdrop-blur-md border border-white/5 p-8 hover:bg-white/5 transition-colors duration-300"
              >
                <div className="w-10 h-10 flex items-center justify-center border mb-6"
                  style={{ borderColor: feat.color + '40', color: feat.color }}
                >
                  <feat.icon size={20} />
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 md:py-32 relative" data-testid="reviews-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-blue mb-4">// Testimonials</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-16">
              What Players Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((review, i) => (
              <motion.div
                key={review.review_id}
                data-testid={`review-${review.review_id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-cc-paper border border-white/10 p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} size={14} className="fill-cc-yellow text-cc-yellow" />
                  ))}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">"{review.text}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-sm text-white font-heading">{review.user_name}</span>
                  <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">{review.product_name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 grid-overlay" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Ready to <span className="text-cc-blue neon-blue">Dominate</span>?
            </h2>
            <p className="text-base text-gray-400 max-w-lg mx-auto mb-10">
              Join thousands of players using Cheatcore to elevate their gameplay.
            </p>
            <Link
              to="/products"
              data-testid="cta-shop-btn"
              className="inline-flex items-center gap-2 px-10 py-4 bg-cc-blue text-black font-heading font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] transition-shadow duration-300 skew-x-[-8deg]"
            >
              <span className="inline-flex items-center gap-2 skew-x-[8deg]">
                Browse Products <ArrowRight size={16} />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-heading text-lg font-bold tracking-tighter uppercase">
                <span className="text-white">Cheat</span><span className="text-cc-blue">core</span>
              </h3>
              <p className="text-xs text-gray-600 font-mono mt-1">Premium Gaming Enhancement</p>
            </div>
            <div className="flex gap-8">
              <Link to="/products" className="text-xs text-gray-500 hover:text-white transition-colors duration-200 font-mono uppercase tracking-widest">Products</Link>
              <Link to="/status" className="text-xs text-gray-500 hover:text-white transition-colors duration-200 font-mono uppercase tracking-widest">Status</Link>
            </div>
            <p className="text-xs text-gray-700 font-mono">&copy; 2026 Cheatcore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
