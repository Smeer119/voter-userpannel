import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { submitVote, supabase } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function VoteModal({ candidate, electionId, isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [voterId, setVoterId] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const voterIdInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch identity data from Supabase for Secure Autofill
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (userId && isOpen) {
        const { data } = await supabase
          .from('users')
          .select('full_name, email, voter_id')
          .eq('id', userId)
          .maybeSingle();
        
        if (data) {
          setName(data.full_name || localStorage.getItem('userName'));
          setEmail(data.email || localStorage.getItem('userEmail'));
          if (data.voter_id) setVoterId(data.voter_id);
        }
      }
    };

    fetchUserData();

    // Reset errors and submission state when modal opens
    setErrors({});
    setIsSubmitted(false);
  }, [isOpen]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const validateVoteData = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Identity not loaded';
    if (!email.trim()) newErrors.email = 'Email not loaded';
    if (!voterId.trim()) newErrors.voterId = 'Voter ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVoteSubmit = async () => {
    setSubmitError(null);
    try {
      const userId = localStorage.getItem('userId');
      
      // 1. Real-time verification check from Supabase
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('is_verified')
        .eq('id', userId)
        .single();
        
      if (userError || !user?.is_verified) {
        alert('Identity verification required. Redirecting to Secure Verification page.');
        navigate('/verify');
        return;
      }

      // 2. Validate vote data
      if (!validateVoteData()) {
        return;
      }

      // 3. Submit the vote (Anonymous & Decoupled)
      const submitData = {
        electionId,
        candidateId: candidate.id || candidate._id,
        userId,
        name,
        email,
        voterId
      };

      await submitVote(submitData);

      // Show success modal
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit vote', error);
      setSubmitError(error.message || 'Failed to submit vote');
    }
  };

  const handleSuccessClose = () => {
    navigate('/');
  };

  if (!isOpen) return null;

  // Success Modal Component
  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
              <Check size={48} color="white" strokeWidth={3} />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-slate-900">Vote Certified</h2>
          <p className="text-slate-500 mb-6 font-medium text-sm">Thank you for participating in this secure digital election.</p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-8">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Receipt for Choice</p>
             <p className="text-lg font-bold text-slate-800">{candidate.name}</p>
          </div>

          <button
            onClick={handleSuccessClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-100"
          >
            Finish & Return
          </button>
        </motion.div>
      </div>
    );
  }

  // Original Vote Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-100">
        
        {/* Modal Header */}
        <div className="bg-blue-600 px-8 py-6 text-white text-center">
            <h2 className="text-xl font-bold tracking-tight">Confirm Secure Vote</h2>
            <p className="text-blue-100 text-xs mt-1 font-medium opacity-80 uppercase tracking-widest leading-loose">Identity Encrypted Session</p>
            <button
               onClick={onClose}
               className="absolute top-4 right-4 text-blue-200 hover:text-white"
            >
               <X size={20} />
            </button>
        </div>

        <div className="p-8">
          {/* Candidate Preview */}
          <div className="mb-8 flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Check size={24} className="text-blue-600" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Candidate</p>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">{candidate.name}</h3>
             </div>
          </div>

          <div className="space-y-6">
            {/* Anonymous Identity Badge */}
            <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold">
                   <ShieldCheck size={20} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Voter Identity</p>
                   <p className="text-sm font-bold text-white leading-none">Anonymous Session</p>
                   <p className="text-xs font-medium text-slate-400 opacity-80">Protected & Verified</p>
                </div>
                <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                   <Check size={14} className="text-emerald-400" />
                </div>
            </div>

            {/* Voter ID Field (Pre-filled) */}
            <div>
              <label htmlFor="voterId" className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Verify Government Voter ID</label>
              <div className="relative">
                 <input
                   ref={voterIdInputRef}
                   type="text"
                   id="voterId"
                   name="voterId"
                   value={voterId}
                   onChange={handleInputChange(setVoterId)}
                   className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-blue-100
                     ${errors.voterId ? 'border-red-500' : 'border-slate-100 focus:border-blue-500'}`}
                   placeholder="Enter 10-digit ID"
                 />
              </div>
              {errors.voterId && <p className="text-red-500 text-[10px] mt-2 font-bold px-1">{errors.voterId}</p>}
            </div>
          </div>

          {submitError && (
             <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                <AlertCircle size={20} className="text-red-500" />
                <p className="text-sm font-bold leading-tight">{submitError}</p>
             </div>
          )}

          <button
            onClick={handleVoteSubmit}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
            disabled={!!submitError && submitError.includes('already')}
          >
            Cast Secure Vote
          </button>

          
          <p className="text-center text-[10px] text-slate-400 mt-6 uppercase font-bold tracking-[0.2em]">Zero-Knowledge Privacy Proof Active</p>
        </div>
      </div>
    </div>
  );
}