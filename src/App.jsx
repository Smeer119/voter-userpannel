import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from './pages/Signup'
import AccountPage from "./pages/Account";
import { Provider } from "react-redux";
import { store } from "../store/store";
import Navbar from "./components/Navbar";
import Research from "./pages/Research";
import Elections from "./pages/Elections";
import ElectionDetails from "./pages/ElectionDetails";
import News from "./pages/News";

import Verification from "./pages/Verification";

import { useEffect } from "react";
import { supabase } from "./services/api";

import { useDispatch } from "react-redux";
import { login } from "../store/userSlice";

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Self-healing Session Sync: Ensure LocalStorage is ALWAYS in sync with Supabase Cloud
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        localStorage.setItem("userId", session.user.id);
        localStorage.setItem("userEmail", session.user.email);
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("userName", session.user.user_metadata?.full_name || "Voter");
        dispatch(login());
      }
    };

    syncSession();

    // Listen for Auth Changes (e.g. Logout on and device)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem("userId", session.user.id);
        localStorage.setItem("userEmail", session.user.email);
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("userName", session.user.user_metadata?.full_name || "Voter");
        dispatch(login());
      } else if (event === 'SIGNED_OUT') {
        localStorage.clear();
        // optionally dispatch a logout action here if you have one
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/elections" element={<Elections />} />
        <Route path="/elections/:id" element={<ElectionDetails />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/research" element={<Research />} />
        <Route path="/news" element={<News />} />
        <Route path="/verify" element={<Verification />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;


