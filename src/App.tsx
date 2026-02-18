import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/sections/Navbar';
import Hero from './components/sections/Hero';
import OverviewSection from './components/sections/OverviewSection';
import OverviewPage from './components/pages/OverviewPage';
import Footer from './components/sections/Footer';
import ScrollToTop from './components/ScrollToTop';
import ReservationPage from './components/pages/ReservationPage';

const Home = () => (
  <div className="animate-entrance">
    <Hero />
    <OverviewSection />
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/overview" element={<Navigate to="/overview/3" replace />} />
            <Route path="/overview/:id" element={<OverviewPage />} />
            <Route path="/book/:id" element={<ReservationPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;