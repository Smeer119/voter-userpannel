import axios from 'axios';
import { supabase } from '../lib/supabase';
import { mockNewsArticles, mockAiResponse } from './mockData';
import { Block } from '../utils/blockchain.js';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

// --- ELECTION SERVICES ---

export const fetchElections = async () => {
  try {
    const { data, error } = await supabase
      .from('elections')
      .select(`
        *,
        candidates:election_candidates(
          candidate:candidates(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(election => ({
      ...election,
      candidates: election.candidates.map(c => c.candidate)
    }));
  } catch (error) {
    console.error('Error fetching elections:', error);
    throw error;
  }
};

export const fetchElectionById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('elections')
      .select(`
        *,
        candidates:election_candidates(
          candidate:candidates(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      candidates: data.candidates.map(c => c.candidate)
    };
  } catch (error) {
    console.error('Error fetching election details:', error);
    throw error;
  }
};

export const createElection = async (electionData) => {
  try {
    const { data, error } = await supabase
      .from('elections')
      .insert([electionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating election:', error);
    throw error;
  }
};

// --- AUTH SERVICES ---

export const signupUser = async (fullName, email, password) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          full_name: fullName,
          email: email.toLowerCase()
        }]);
      if (dbError) console.warn('Could not update profile:', dbError.message);
    }

    return authData;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const updateVerification = async (userId, voterHash, voterId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_verified: true, 
        voter_hash: voterHash,
        voter_id: voterId
      })
      .eq('id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Verification sync error:', error);
    throw error;
  }
};

// --- VOTING SERVICES ---

export const submitVote = async (voteData) => {
  try {
    const { electionId, candidateId, userId, voterId } = voteData;

    // 1. Initial Validation
    if (!voterId) throw new Error("Voter ID missing from payload");

    // 2. Check if user already voted (Double Vote Prevention)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('voted_election')
      .eq('id', userId)
      .single();

    if (user && user.voted_election === electionId) {
       // Only block if they voted in THIS exact election
       throw new Error('You have already cast your vote in this election');
    }

    // 3. Mark User as HAVING VOTED (Identity Layer - No Candidate link saved here)
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ 
        voted_election: electionId
      })
      .eq('id', userId);

    if (updateUserError) throw updateUserError;

    // 4. Increment Candidate Votes (Aggregator Layer)
    const { data: candidate, error: candError } = await supabase
      .from('candidates')
      .select('votes_count')
      .eq('id', candidateId)
      .single();

    if (candError) throw candError;

    const { error: updateCandError } = await supabase
      .from('candidates')
      .update({ votes_count: (candidate.votes_count || 0) + 1 })
      .eq('id', candidateId);

    if (updateCandError) throw updateCandError;

    // 5. BLOCKCHAIN IMMUTABILITY LOGGING (The Hackathon Feature)
    const { data: latestBlock, error: latestError } = await supabase
      .from('blockchain_votes')
      .select('*')
      .order('index', { ascending: false })
      .limit(1)
      .maybeSingle();

    let prevHash = "0";
    let newIndex = 0;
    if (latestBlock) {
      prevHash = latestBlock.hash;
      newIndex = latestBlock.index + 1;
    }

    const newBlock = new Block(newIndex, voterId, candidateId, prevHash);

    const { error: blockchainError } = await supabase
      .from('blockchain_votes')
      .insert([{
        index: newBlock.index,
        timestamp: newBlock.timestamp,
        voter_id: newBlock.voterId,
        candidate: newBlock.candidate,
        previous_hash: newBlock.previousHash,
        hash: newBlock.hash
      }]);

    if (blockchainError) throw blockchainError;

    // 6. Log Anonymous Vote (Audit Layer - No User ID)
    const { error: auditError } = await supabase
      .from('anonymous_votes')
      .insert([{
        election_id: electionId,
        candidate_id: candidateId
      }]);

    if (auditError) console.warn('Audit log skip:', auditError.message);

    return { success: true, message: 'Vote successfully recorded' };

  } catch (error) {
    console.error('Vote submission error:', error);
    throw error;
  }
};

// --- AI SERVICES powered by Supabase Context ---

export const getAiResponse = async (userInput) => {
  try {
    // Fetch real candidates to provide context to the "AI"
    const { data: candidates } = await supabase
      .from('candidates')
      .select('name, party_name, manifesto')
      .limit(5);

    if (candidates && candidates.length > 0) {
      const candidateList = candidates.map(c => `- ${c.name} (${c.party_name}): ${c.manifesto?.substring(0, 50)}...`).join('\n');
      
      return { 
        response: `Based on your query "${userInput}", here are some candidates you might be interested in:\n\n${candidateList}\n\nYou can find more details in the Elections tab.` 
      };
    }
  } catch (err) {
    console.warn("AI context fetch failed, using generic response");
  }
  
  return { response: mockAiResponse };
};

// --- NEWS SERVICES ---

export const fetchNews = async (searchQuery = 'elections', page = 1) => {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'YOUR_REAL_NEWS_API_KEY_HERE') {
    return { articles: mockNewsArticles };
  }
  try {
     let response;
     if (NEWS_API_KEY.startsWith('pub_')) {
       response = await axios.get('https://newsdata.io/api/1/news', {
         params: { apikey: NEWS_API_KEY, q: searchQuery, language: 'en', page: page !== 1 ? page : undefined }
       });
       if (response.data.status === 'success') {
         return {
           articles: response.data.results.map(item => ({
             title: item.title, description: item.description, urlToImage: item.image_url, publishedAt: item.pubDate, 
             source: { name: item.source_id }, url: item.link
           })),
           nextPage: response.data.nextPage
         };
       }
     }
  } catch (e) {
    console.warn('News Fetch Error');
  }
  return { articles: mockNewsArticles };
};
// Export the supabase client for direct use in components if needed
export { supabase };