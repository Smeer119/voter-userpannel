import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isChainValid } from '../utils/blockchain';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlockchainAuditor() {
  const [status, setStatus] = useState('idle'); // idle, loading, valid, invalid
  const [logs, setLogs] = useState([]);

  const verifyChain = async () => {
    setStatus('loading');
    setLogs(['Connecting to Supabase ledger...']);
    
    try {
      // Small artificial delay for dramatic effect in presentation
      await new Promise(r => setTimeout(r, 600));
      setLogs(prev => [...prev, 'Fetching all immutable blocks...']);

      const { data, error } = await supabase
        .from('blockchain_votes')
        .select('*')
        .order('index', { ascending: true });

      if (error) throw error;

      await new Promise(r => setTimeout(r, 600));
      setLogs(prev => [...prev, `Auditing ${data.length} blocks using SHA-256...`]);

      await new Promise(r => setTimeout(r, 1000));
      
      const valid = isChainValid(data);
      
      if (valid) {
        setStatus('valid');
        setLogs(prev => [...prev, 'Verification passed. Cryptographic links intact.']);
      } else {
        setStatus('invalid');
        setLogs(prev => [...prev, '🚨 ERROR: Cryptographic mismatch detected in block sequence.']);
      }
      
    } catch (err) {
      console.error(err);
      setStatus('invalid');
      setLogs(prev => [...prev, `System error: ${err.message}`]);
    }
  };

  return (
    <div className="my-8 mx-auto w-full max-w-4xl bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800 text-white font-mono">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold flex items-center mb-2">
            <Shield className="mr-3 text-blue-400" size={32} />
            Ledger Integrity Verification
          </h2>
          <p className="text-gray-400 text-sm">
            Powered by SHA-256 immutable block linkage. Test the system resilience.
          </p>
        </div>

        <button
          onClick={verifyChain}
          disabled={status === 'loading'}
          className={`px-6 py-4 rounded-xl font-bold flex items-center transition-all ${
            status === 'loading'
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] text-white shadow-lg'
          }`}
        >
          {status === 'loading' ? (
            <Loader2 className="animate-spin mr-2" size={20} />
          ) : (
            <Shield className="mr-2" size={20} />
          )}
          {status === 'loading' ? 'Auditing Ledger...' : 'Verify Blockchain Integrity'}
        </button>
      </div>

      {logs.length > 0 && (
        <div className="mt-6 bg-black rounded-lg p-4 font-mono text-sm text-green-400 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
          {logs.map((log, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-1 opacity-90"
            >
              $ {log}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {status === 'valid' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 rounded-xl bg-green-500/10 border-2 border-green-500 text-center shadow-[0_0_30px_rgba(34,197,94,0.3)]"
          >
            <h3 className="text-3xl font-extrabold text-green-400 flex items-center justify-center tracking-tight">
              <ShieldCheck className="mr-3" size={40} />
              ✅ ELECTION SECURE: 0 TAMPERING DETECTED
            </h3>
          </motion.div>
        )}

        {status === 'invalid' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 rounded-xl bg-red-500/10 border-2 border-red-500 text-center shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-pulse"
          >
            <h3 className="text-3xl font-extrabold text-red-500 flex items-center justify-center tracking-tight">
              <ShieldAlert className="mr-3 animate-bounce" size={40} />
              🚨 BREACH DETECTED: DATA TAMPERED
            </h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
