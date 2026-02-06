import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Key, ShoppingCart, User, Copy, Eye, EyeOff, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../App';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_COLORS = {
  active: '#39FF14',
  expired: '#FF0055',
  revoked: '#FF0055',
};

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('licenses');
  const [licenses, setLicenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [visibleKeys, setVisibleKeys] = useState({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    if (user) {
      axios.get(`${API}/licenses`, { withCredentials: true }).then(r => setLicenses(r.data)).catch(() => {});
      axios.get(`${API}/transactions`, { withCredentials: true }).then(r => setTransactions(r.data)).catch(() => {});
    }
  }, [user, authLoading, navigate]);

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('License key copied to clipboard');
  };

  if (authLoading) return (
    <div className="min-h-screen bg-cc-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-cc-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const TABS = [
    { key: 'licenses', label: 'License Keys', icon: Key, count: licenses.length },
    { key: 'history', label: 'Purchase History', icon: ShoppingCart, count: transactions.length },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-cc-bg pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cc-blue mb-4">// Account</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tighter uppercase text-white mb-2">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">Welcome back, <span className="text-white">{user.name}</span></p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mt-10 mb-8 border-b border-white/10">
          {TABS.map(tab => (
            <button
              key={tab.key}
              data-testid={`dashboard-tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-mono uppercase tracking-widest border-b-2 transition-colors duration-200 ${
                activeTab === tab.key
                  ? 'border-cc-blue text-cc-blue'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 px-2 py-0.5 bg-white/5 text-[10px]">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* License Keys Tab */}
        {activeTab === 'licenses' && (
          <motion.div
            data-testid="licenses-tab-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {licenses.length === 0 ? (
              <div className="text-center py-20 bg-cc-paper border border-white/10">
                <Key size={32} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-mono text-sm">No license keys yet</p>
                <p className="text-gray-700 text-xs mt-1">Purchase a product to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {licenses.map((lic, i) => (
                  <motion.div
                    key={lic.license_id}
                    data-testid={`license-card-${lic.license_id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-cc-paper border border-white/10 p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading text-base font-bold text-white">{lic.product_name}</h3>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">{lic.game}</span>
                          <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border"
                            style={{
                              borderColor: (STATUS_COLORS[lic.status] || '#39FF14') + '40',
                              color: STATUS_COLORS[lic.status] || '#39FF14',
                            }}
                          >
                            {lic.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/50 px-3 py-2 border border-white/5">
                          <span className="font-mono text-sm text-gray-300 flex-1">
                            {visibleKeys[lic.license_id] ? lic.license_key : lic.license_key.replace(/[A-Z0-9]/g, '*')}
                          </span>
                          <button
                            data-testid={`toggle-key-${lic.license_id}`}
                            onClick={() => toggleKeyVisibility(lic.license_id)}
                            className="text-gray-500 hover:text-white transition-colors duration-200"
                          >
                            {visibleKeys[lic.license_id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            data-testid={`copy-key-${lic.license_id}`}
                            onClick={() => copyKey(lic.license_key)}
                            className="text-gray-500 hover:text-cc-blue transition-colors duration-200"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Expires</p>
                        <p className="text-sm text-gray-400 font-mono">{new Date(lic.expires_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Purchase History Tab */}
        {activeTab === 'history' && (
          <motion.div
            data-testid="history-tab-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {transactions.length === 0 ? (
              <div className="text-center py-20 bg-cc-paper border border-white/10">
                <ShoppingCart size={32} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-mono text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-gray-600">Product</th>
                      <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn, i) => (
                      <tr key={txn.transaction_id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                        <td className="py-3 px-4">
                          <span className="text-sm text-white font-heading">{txn.product_name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-gray-300">${txn.amount} {txn.currency?.toUpperCase()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-mono text-[10px] uppercase tracking-widest ${
                            txn.payment_status === 'paid' ? 'text-cc-green' : txn.payment_status === 'pending' ? 'text-cc-yellow' : 'text-cc-red'
                          }`}>
                            {txn.payment_status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs text-gray-600">{new Date(txn.created_at).toLocaleDateString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            data-testid="profile-tab-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-md">
              <div className="bg-cc-paper border border-white/10 p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-16 h-16 rounded-full border border-white/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-cc-blue/20 border border-cc-blue/50 flex items-center justify-center">
                      <User size={24} className="text-cc-blue" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-heading text-xl font-bold text-white">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-600">Member Since</span>
                    <span className="text-sm text-gray-400">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-600">Active Licenses</span>
                    <span className="text-sm text-cc-green">{licenses.filter(l => l.status === 'active').length}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-600">Total Purchases</span>
                    <span className="text-sm text-gray-400">{transactions.filter(t => t.payment_status === 'paid').length}</span>
                  </div>
                </div>
              </div>

              <button
                data-testid="dashboard-logout-btn"
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-2 px-5 py-3 border border-cc-red/30 text-cc-red font-heading text-xs uppercase tracking-widest hover:bg-cc-red/10 transition-colors duration-200"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
