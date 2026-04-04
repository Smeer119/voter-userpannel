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

function App() {
  return (
    <Provider store={store}>
      <Router>
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
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;


