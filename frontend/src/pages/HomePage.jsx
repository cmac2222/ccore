import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Eye, Crosshair, Star, ChevronDown } from 'lucide-react';
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

const FAQ_ITEMS = [
  { q: 'Is this safe to use?', a: 'All Cheatcore products are externally loaded, tested daily against current anti-cheat systems, and designed to minimize detection risk. We update immediately when needed. Check our real-time Status page for current detection status.' },
  { q: 'How do I receive my product?', a: 'After successful payment through Stripe, your license key is generated instantly and delivered to your Dashboard. No waiting, no emails — just login and grab your key.' },
  { q: 'What happens if a product gets detected?', a: 'We monitor detection status 24/7. If a product gets detected, we pause sales and push an update as quickly as possible. Your subscription time is not extended for detections, so always check the Status page before playing.' },
  { q: 'Can I use this on multiple PCs?', a: 'License keys are typically locked to one hardware ID (HWID). If you need to transfer your key to a new device, contact our support team via Discord.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards through Stripe, our secure payment processor. All transactions are encrypted and processed safely.' },
  { q: 'Do I need a USB or special hardware?', a: 'No. Our products are software-based and run directly on your PC. No USB drives, custom firmware, or external hardware is required.' },
  { q: 'Is there a refund policy?', a: 'Due to the digital nature of our products, all sales are final once the license key has been generated. Please review product details and the Status page before purchasing.' },
  { q: 'How do I get support?', a: 'Join our Discord server for real-time support from our team. You can also check the Guides page for troubleshooting common issues.' },
];

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section className="py-24 md:py-32 relative" data-testid="faq-section">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-green mb-4">// Got Questions?</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-12">
            Frequently Asked Questions
          </h2>
        </motion.div>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              data-testid={`faq-item-${i}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="bg-cc-paper border border-white/10"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors duration-200"
              >
                <span className="font-heading text-sm md:text-base font-bold text-white pr-4">{item.q}</span>
                <ChevronDown size={18} className={`text-gray-500 flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-cc-blue' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 border-t border-white/5">
                      <p className="text-sm text-gray-400 leading-relaxed pt-4">{item.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
                {/* Blue glow outline BEHIND the images */}
                <div className="absolute -inset-3 bg-cc-blue/15 blur-2xl rounded-lg pointer-events-none" />

                {HERO_IMAGES.map((img, i) => {
                  const offset = ((i - heroIndex + HERO_IMAGES.length) % HERO_IMAGES.length);
                  const isActive = offset === 0;
                  return (
                    <motion.div
                      key={i}
                      className="absolute inset-0 overflow-hidden border border-white/10"
                      animate={{
                        rotateY: isActive ? 0 : offset === 1 ? 15 : -15,
                        rotateX: isActive ? 0 : -5,
                        scale: isActive ? 1 : 0.85,
                        x: isActive ? 0 : offset === 1 ? 60 : -60,
                        z: isActive ? 0 : -100,
                        opacity: isActive ? 1 : 0,
                      }}
                      transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
                      style={{
                        perspective: '1000px',
                        transformStyle: 'preserve-3d',
                        zIndex: isActive ? 10 : 1,
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        className="w-full h-full object-cover"
                        style={{ opacity: 1 }}
                      />
                      {/* Subtle bottom fade for text readability only */}
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
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
              {/* Blue glow outline underneath - behind everything */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-16 bg-cc-blue/15 blur-2xl rounded-full pointer-events-none" style={{ zIndex: 0 }} />
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
                    to={`/product/${p.product_id}`}
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

      {/* Discord CTA - prominent */}
      <section className="py-20 md:py-28 relative" data-testid="discord-section">
        <div className="absolute inset-0 bg-[#5865F2]/[0.04]" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[#5865F2]/20 border border-[#5865F2]/40">
              <svg width="28" height="22" viewBox="0 0 71 55" fill="#5865F2">
                <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.5 37.5 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.6 8.9.2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.8 41.8 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4c-1.8 1-3.6 1.8-5.5 2.6a.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1c1.4-15-2.3-28-9.8-39.5a.2.2 0 00-.1-.1zM23.7 37.3c-3.4 0-6.3-3.1-6.3-7s2.8-7 6.3-7 6.3 3.2 6.3 7-2.8 7-6.3 7zm23.2 0c-3.4 0-6.2-3.1-6.2-7s2.8-7 6.2-7 6.3 3.2 6.3 7-2.8 7-6.3 7z"/>
              </svg>
            </div>
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Join the <span className="text-[#5865F2]">Community</span>
            </h2>
            <p className="text-base text-gray-400 max-w-lg mx-auto mb-8">
              Get live support, product updates, giveaways, and connect with thousands of players.
            </p>
            <a
              href="https://discord.gg/cheatcore"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="discord-join-btn"
              className="inline-flex items-center gap-3 px-10 py-4 bg-[#5865F2] text-white font-heading font-bold uppercase tracking-widest text-sm hover:bg-[#4752C4] hover:shadow-[0_0_40px_rgba(88,101,242,0.4)] transition-all duration-300"
            >
              <svg width="22" height="17" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.5 37.5 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.6 8.9.2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.8 41.8 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4c-1.8 1-3.6 1.8-5.5 2.6a.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1c1.4-15-2.3-28-9.8-39.5a.2.2 0 00-.1-.1zM23.7 37.3c-3.4 0-6.3-3.1-6.3-7s2.8-7 6.3-7 6.3 3.2 6.3 7-2.8 7-6.3 7zm23.2 0c-3.4 0-6.2-3.1-6.2-7s2.8-7 6.2-7 6.3 3.2 6.3 7-2.8 7-6.3 7z"/>
              </svg>
              Join Our Discord
            </a>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />

      {/* Footer */}
      <footer className="border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="font-heading text-lg font-bold tracking-tighter uppercase mb-3">
                <span className="text-white">Cheat</span><span className="text-cc-blue">core</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">Premium gaming enhancement software. Trusted by thousands of players worldwide.</p>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="font-heading text-xs uppercase tracking-widest text-white mb-4">Products</h4>
              <div className="space-y-2">
                <Link to="/products/rust" className="block text-xs text-gray-500 hover:text-white transition-colors duration-200">Rust</Link>
                <Link to="/products/valorant" className="block text-xs text-gray-500 hover:text-white transition-colors duration-200">Valorant</Link>
                <Link to="/products/cs2" className="block text-xs text-gray-500 hover:text-white transition-colors duration-200">CS2</Link>
                <Link to="/products/overwatch" className="block text-xs text-gray-500 hover:text-white transition-colors duration-200">Overwatch</Link>
                <Link to="/products/minecraft" className="block text-xs text-gray-500 hover:text-white transition-colors duration-200">Minecraft</Link>
              </div>
            </div>
            {/* Resources */}
            <div>
              <h4 className="font-heading text-xs uppercase tracking-widest text-white mb-4">Resources</h4>
              <div className="space-y-2">
                <Link to="/status" className="block text-xs text-gray-500 hover:text-white transition-colors duration-200">Status Page</Link>
                <Link to="/guides" className="block text-xs text-gray-500 hover:text-white transition-colors duration-200">Guides</Link>
                <Link to="/products" className="block text-xs text-gray-500 hover:text-white transition-colors duration-200">All Products</Link>
                <Link to="/dashboard" className="block text-xs text-gray-500 hover:text-white transition-colors duration-200">Dashboard</Link>
              </div>
            </div>
            {/* Community */}
            <div>
              <h4 className="font-heading text-xs uppercase tracking-widest text-white mb-4">Community</h4>
              <a
                href="https://discord.gg/cheatcore"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-discord-btn"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5865F2] text-white font-heading font-bold uppercase tracking-widest text-xs hover:bg-[#4752C4] transition-colors duration-200"
              >
                <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor">
                  <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.5 37.5 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.6 8.9.2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.8 41.8 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4c-1.8 1-3.6 1.8-5.5 2.6a.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1c1.4-15-2.3-28-9.8-39.5a.2.2 0 00-.1-.1zM23.7 37.3c-3.4 0-6.3-3.1-6.3-7s2.8-7 6.3-7 6.3 3.2 6.3 7-2.8 7-6.3 7zm23.2 0c-3.4 0-6.2-3.1-6.2-7s2.8-7 6.2-7 6.3 3.2 6.3 7-2.8 7-6.3 7z"/>
                </svg>
                Discord
              </a>
              <p className="text-[10px] text-gray-700 mt-3">Join for support & updates</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-gray-700 font-mono">&copy; 2026 Cheatcore. All rights reserved.</p>
            <p className="text-[10px] text-gray-700 font-mono">Use of game modifications is at your own risk.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
