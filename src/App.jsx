import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import News from './pages/News';
import NewsArticle from './pages/NewsArticle';
import Quotes from './pages/Quotes';
import MyCosmos from './pages/MyCosmos';
import PlanetLab from './pages/PlanetLab';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';

function App() {
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsArticle />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/my-cosmos" element={<ProtectedRoute><MyCosmos /></ProtectedRoute>} />
          <Route path="/planet-lab" element={<PlanetLab />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
