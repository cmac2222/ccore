import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle, Key } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../App';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('checking'); // checking, paid, failed
  const [paymentData, setPaymentData] = useState(null);
  const hasPolled = useRef(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId || hasPolled.current) return;
    hasPolled.current = true;

    const pollStatus = async (attempts = 0) => {
      const maxAttempts = 5;
      const pollInterval = 2000;

      if (attempts >= maxAttempts) {
        setStatus('failed');
        return;
      }

      try {
        const res = await axios.get(`${API}/checkout/status/${sessionId}`, { withCredentials: true });
        setPaymentData(res.data);

        if (res.data.payment_status === 'paid') {
          setStatus('paid');
          return;
        } else if (res.data.status === 'expired') {
          setStatus('failed');
          return;
        }

        setStatus('checking');
        setTimeout(() => pollStatus(attempts + 1), pollInterval);
      } catch {
        if (attempts < maxAttempts - 1) {
          setTimeout(() => pollStatus(attempts + 1), pollInterval);
        } else {
          setStatus('failed');
        }
      }
    };

    pollStatus();
  }, [sessionId]);

  return (
    <div data-testid="checkout-success-page" className="min-h-screen bg-cc-bg flex items-center justify-center pt-20">
      <div className="max-w-md w-full mx-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 text-center"
        >
          {status === 'checking' && (
            <>
              <Loader2 size={48} className="text-cc-blue animate-spin mx-auto mb-6" />
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Processing Payment</h2>
              <p className="text-sm text-gray-500">Verifying your payment...</p>
            </>
          )}

          {status === 'paid' && (
            <>
              <div className="w-16 h-16 rounded-full bg-cc-green/20 border border-cc-green/50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-cc-green" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Payment Successful</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your license key has been generated and is ready to use.
              </p>
              {paymentData?.metadata && (
                <div className="bg-cc-paper border border-white/10 p-4 mb-6 text-left">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-2">Order Details</p>
                  <p className="text-sm text-white">{paymentData.metadata.product_name} - {paymentData.metadata.game}</p>
                  <p className="text-sm text-gray-400">Duration: {paymentData.metadata.duration}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Link
                  to="/dashboard"
                  data-testid="goto-dashboard-btn"
                  className="flex-1 py-3 bg-cc-blue text-black font-heading font-bold uppercase tracking-widest text-xs text-center hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-shadow duration-300 flex items-center justify-center gap-2"
                >
                  <Key size={14} /> View License
                </Link>
                <Link
                  to="/products"
                  data-testid="goto-products-btn"
                  className="flex-1 py-3 border border-white/10 text-white font-heading font-bold uppercase tracking-widest text-xs text-center hover:bg-white/5 transition-colors duration-200"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-16 h-16 rounded-full bg-cc-red/20 border border-cc-red/50 flex items-center justify-center mx-auto mb-6">
                <XCircle size={32} className="text-cc-red" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Payment Issue</h2>
              <p className="text-sm text-gray-500 mb-6">
                There was an issue verifying your payment. Please check your dashboard or contact support.
              </p>
              <Link
                to="/dashboard"
                data-testid="goto-dashboard-after-fail"
                className="inline-block px-6 py-3 border border-white/10 text-white font-heading text-xs uppercase tracking-widest hover:bg-white/5 transition-colors duration-200"
              >
                Go to Dashboard
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
