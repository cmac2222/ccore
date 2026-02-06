import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Monitor, Shield, Wifi, AlertTriangle, FileText, Download, Settings, HelpCircle } from 'lucide-react';

const SECTIONS = [
  {
    id: 'getting-started',
    icon: Settings,
    title: 'Getting Started',
    color: '#00D4FF',
    description: 'Before you begin, ensure that your system meets the necessary requirements.',
    items: [
      { title: 'Clean Windows Installation', text: 'A clean Windows installation is recommended for security and stability. Fresh installs reduce the chance of conflicts with anti-cheat software.' },
      { title: 'Disable Windows Defender', text: 'Disable Windows Defender or add exceptions for the loader and cheat files. Windows Defender may flag files as false positives and delete them.' },
      { title: 'Use a VPN or Mobile Hotspot', text: 'A reliable VPN or mobile hotspot adds an extra layer of security. This helps protect your IP address and adds anonymity.' },
      { title: 'Run as Administrator', text: 'Always run the loader and cheat as Administrator. Right-click the file and select "Run as administrator" to ensure proper permissions.' },
      { title: 'Close Unnecessary Programs', text: 'Close any unnecessary background programs before launching. Anti-virus software, overlays, and screen recorders can interfere with injection.' },
    ]
  },
  {
    id: 'installation',
    icon: Download,
    title: 'Installation Guide',
    color: '#39FF14',
    description: 'Each product has a specific setup process. Follow the steps below for a smooth installation.',
    items: [
      { title: 'Step 1: Purchase a License', text: 'Select your desired product and duration from the Products page. Complete checkout via Stripe. Your license key will be delivered instantly to your Dashboard.' },
      { title: 'Step 2: Download the Loader', text: 'After purchase, download the loader from the link provided in your Dashboard. Save it to a location you can easily find (e.g., Desktop).' },
      { title: 'Step 3: Prepare Your System', text: 'Disable Windows Defender, close all overlays (Discord overlay, GeForce Experience, etc.), and ensure your game is completely closed.' },
      { title: 'Step 4: Run the Loader', text: 'Right-click the loader and select "Run as administrator". Enter your license key when prompted. The loader will verify your key and prepare the injection.' },
      { title: 'Step 5: Launch Your Game', text: 'Once the loader confirms it\'s ready, launch your game. The cheat menu will appear in-game. Use the designated hotkey (usually INSERT) to toggle the menu.' },
      { title: 'Step 6: Configure Settings', text: 'Customize your settings using the in-game menu. We recommend starting with a legit config and adjusting from there. Save your config for future sessions.' },
    ]
  },
  {
    id: 'troubleshooting',
    icon: AlertTriangle,
    title: 'Troubleshooting',
    color: '#FFD600',
    description: 'If you encounter issues during setup or use, try the following solutions.',
    items: [
      { title: 'Game crashes on injection', text: 'Ensure you\'re running the cheat with administrator privileges. Also verify that Windows Defender is fully disabled — not just "paused". Try restarting your PC and running the loader before opening the game.' },
      { title: 'Loader says "Invalid Key"', text: 'Double-check that you\'re copying the full license key from your Dashboard. Ensure there are no extra spaces before or after the key. If the issue persists, your key may have expired.' },
      { title: 'Detected after a few days', text: 'Change your IP address, use a new game account, and clear all residual files. Consider using a HWID spoofer before creating a new account. Check the Status page to verify if the product is still Undetected.' },
      { title: 'Hardware bans (HWID ban)', text: 'You will need a hardware ID spoofer before attempting to play again. Simply creating a new account without spoofing will result in another ban. Contact support for spoofer recommendations.' },
      { title: 'Cheat not showing in-game', text: 'Make sure you\'re using the correct overlay software (Overwolf for AMD, NVIDIA App for NVIDIA). Verify the loader is still running in the background. Try pressing the menu toggle key (INSERT by default).' },
      { title: 'Low FPS or lag', text: 'Reduce the number of active ESP elements. Disable features you\'re not using (e.g., World ESP items you don\'t need). Close background applications that consume resources.' },
      { title: 'Windows Defender keeps re-enabling', text: 'Use a tool like "Defender Control" to permanently disable Windows Defender. Simply toggling it off in Settings is not sufficient — it will re-enable after a restart.' },
    ]
  },
  {
    id: 'safety',
    icon: Shield,
    title: 'Safety & Best Practices',
    color: '#39FF14',
    description: 'Follow these guidelines to minimize risk and maximize your experience.',
    items: [
      { title: 'Use a separate gaming account', text: 'Never use cheats on your main account. Always purchase or create an alternate account for enhanced gameplay. This protects your main account\'s skins, rank, and history.' },
      { title: 'Don\'t be obvious', text: 'Playing with obvious settings (rage aimbot, blatant ESP callouts) increases report frequency. Use legit settings to blend in with normal gameplay.' },
      { title: 'Monitor the Status page', text: 'Always check the Cheatcore Status page before playing. If a product status changes to "Testing" or "Updating", wait until it returns to "Undetected" before using it.' },
      { title: 'Keep your loader updated', text: 'Always use the latest version of the loader. Updates often include critical security patches and anti-cheat bypasses. Old versions may be detected.' },
      { title: 'Clear traces after sessions', text: 'Delete the loader and any temporary files after each session. Clear your DNS cache and restart your router if you want extra security.' },
    ]
  },
  {
    id: 'terms',
    icon: FileText,
    title: 'Terms & Disclaimer',
    color: '#FF0055',
    description: 'Important legal information regarding the use of Cheatcore products.',
    items: [
      { title: 'Use at your own risk', text: 'You are solely responsible for any consequences resulting from the use of game modifications. This includes but is not limited to account bans, hardware bans, and game restrictions.' },
      { title: 'No refund on detection', text: 'If a product becomes detected during your active subscription, we will work to update it as quickly as possible. However, detections are an inherent risk and are not grounds for a refund.' },
      { title: 'No sharing of license keys', text: 'License keys are tied to your hardware ID and account. Sharing keys will result in immediate revocation without refund.' },
      { title: 'Compliance with game policies', text: 'Ensure you understand and accept the risks of violating game Terms of Service. Cheatcore does not support or encourage illegal activities.' },
    ]
  },
];

function GuideSection({ section, index }) {
  const [expandedItems, setExpandedItems] = useState({});
  const toggleItem = (i) => setExpandedItems(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <motion.div
      id={section.id}
      data-testid={`guide-section-${section.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="scroll-mt-28"
    >
      {/* Section header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 flex items-center justify-center border"
          style={{ borderColor: section.color + '30', color: section.color }}
        >
          <section.icon size={20} />
        </div>
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">{section.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{section.description}</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-16">
        {section.items.map((item, i) => (
          <div key={i} className="bg-cc-paper border border-white/10 overflow-hidden">
            <button
              data-testid={`guide-item-${section.id}-${i}`}
              onClick={() => toggleItem(i)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors duration-200 text-left"
            >
              <span className="font-heading text-sm font-bold text-white pr-4">{item.title}</span>
              <ChevronDown size={16} className={`text-gray-600 flex-shrink-0 transition-transform duration-200 ${expandedItems[i] ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {expandedItems[i] && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 border-t border-white/5">
                    <p className="text-sm text-gray-400 leading-relaxed pt-3">{item.text}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function GuidesPage() {
  return (
    <div data-testid="guides-page" className="min-h-screen bg-cc-bg pt-28 pb-24">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-overlay" />
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-cc-blue/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-cc-green/[0.015] rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-green mb-4">// Documentation</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase text-white mb-4">
            Guides
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-xl">
            Everything you need to set up, install, and use Cheatcore products safely and efficiently. Read through each section carefully.
          </p>
        </motion.div>

        {/* Quick nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-14 pb-8 border-b border-white/10"
        >
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-4 py-2 text-xs font-mono uppercase tracking-widest border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-colors duration-200"
            >
              {s.title}
            </a>
          ))}
        </motion.div>

        {/* Sections */}
        {SECTIONS.map((section, i) => (
          <GuideSection key={section.id} section={section} index={i} />
        ))}

        {/* Help CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass p-8 text-center"
        >
          <HelpCircle size={32} className="text-cc-blue mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-white mb-2">Still Need Help?</h3>
          <p className="text-sm text-gray-500 mb-6">Join our Discord community for real-time support from our team and other users.</p>
          <a
            href="https://discord.gg/cheatcore"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="guides-discord-link"
            className="inline-flex items-center gap-3 px-8 py-3 bg-[#5865F2] text-white font-heading font-bold uppercase tracking-widest text-sm hover:bg-[#4752C4] transition-colors duration-200"
          >
            <svg width="20" height="16" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.5 37.5 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.6 8.9.2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.8 41.8 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4c-1.8 1-3.6 1.8-5.5 2.6a.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1c1.4-15-2.3-28-9.8-39.5a.2.2 0 00-.1-.1zM23.7 37.3c-3.4 0-6.3-3.1-6.3-7s2.8-7 6.3-7 6.3 3.2 6.3 7-2.8 7-6.3 7zm23.2 0c-3.4 0-6.2-3.1-6.2-7s2.8-7 6.2-7 6.3 3.2 6.3 7-2.8 7-6.3 7z"/>
            </svg>
            Join Our Discord
          </a>
        </motion.div>
      </div>
    </div>
  );
}
