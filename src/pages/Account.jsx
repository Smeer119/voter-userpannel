import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiLogOut } from "react-icons/fi";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/userSlice";

import { supabase } from "../services/api";

const Account = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          setError("User profile not found. Please re-login or run the SQL setup.");
          setIsLoading(false);
          return;
        }

        setUser(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(logout());
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to logout");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Please log in
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 mt-16 font-sans">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Welcome Text */}
        <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Voter Dashboard</h1>
            <p className="text-slate-500 mt-2">Oversee your digital identity and secure credentials</p>
        </div>

        {/* PREMIUM DIGITAL VOTER CARD */}
        <div className="relative overflow-hidden group">
          {/* Card Shine Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
            {/* Card Header (Blue Gradient) */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 flex justify-between items-center text-white">
               <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] opacity-80">Electronic Voter Identity</h2>
                  <p className="text-xs opacity-60">Election Commission Cloud ID</p>
               </div>
               <ShieldCheck className="w-8 h-8 opacity-40" />
            </div>

            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                {/* Photo & Badge */}
                <div className="relative">
                  <div className="w-40 h-48 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                    <img
                      src={user.image}
                      onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"; }}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {user.is_verified && (
                    <div className="absolute -bottom-4 -right-4 bg-white p-2 rounded-full shadow-lg border-4 border-blue-50">
                        <CheckCircle2 className="text-blue-600 fill-blue-50" size={32} />
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 space-y-5 w-full">
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Legal Name</label>
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight">{user.full_name}</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Authenticated Email</label>
                        <p className="text-sm font-medium text-slate-700">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">VOTER ID NUMBER</label>
                        <p className="text-lg font-mono font-bold text-blue-700 tracking-wider">
                           {user.voter_id ? user.voter_id : "NOT REGISTERED"}
                        </p>
                      </div>
                   </div>

                   {/* Biometric Hash (The Digital Signature) */}
                   {user.is_verified && (
                    <div className="pt-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Cloud Biometric Fingerprint (Encrypted)</label>
                       <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <p className="text-[10px] font-mono text-slate-600 break-all">
                             {user.voter_hash}
                          </p>
                       </div>
                    </div>
                   )}

                   {/* Voting Participation Status */}
                   <div className="pt-4 mt-4 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Electoral Participation Status</label>
                      {user.voted_election ? (
                         <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold text-sm border border-emerald-200 shadow-sm">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            BALLOT CAST SUCCESSFULLY
                         </div>
                      ) : (
                         <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-500 px-4 py-2 rounded-lg font-bold text-sm border border-slate-200 shadow-sm">
                            AWAITING SECURE VOTE
                         </div>
                      )}
                   </div>
                </div>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className={`p-3 text-center text-xs font-bold uppercase tracking-[0.3em] font-sans ${user.is_verified ? 'bg-blue-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
               {user.is_verified ? 'IDENTITY SECURELY VERIFIED' : 'IDENTITY VERIFICATION PENDING'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
           {!user.is_verified && (
              <button 
                onClick={() => window.location.href = '/verify'}
                className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
              >
                 <ShieldCheck size={20} /> Verify Identity Now
              </button>
           )}
           <button
            onClick={handleLogout}
            className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl font-bold transition shadow-md flex items-center justify-center gap-2"
           >
            <FiLogOut size={18} /> Logout Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;