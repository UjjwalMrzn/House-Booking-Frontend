import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/sections/Navbar';
import Hero from './components/sections/Hero';
import OverviewSection from './components/sections/OverviewSection';
import OverviewPage from './components/pages/OverviewPage';
import Footer from './components/sections/Footer';
import ScrollToTop from './components/ScrollToTop';
import ReservationPage from './components/pages/ReservationPage';
import SuccessPage from './components/pages/SuccessPage';
import { ToastProvider } from './components/ui/Toaster'; 
import GalleryPage from './components/pages/GalleryPage';
import MapPage from './components/pages/MapPage';
import ReviewsPage from './components/pages/ReviewsPage';
import ContactPage from './components/pages/ContactPage';
import BackToTop from './components/BackToTop';

import AdminLayout from './components/layouts/AdminLayout';
import DashboardPage from './components/pages/admin/DashboardPage';
import LoginPage from './components/pages/admin/LoginPage';
import PropertyManagementPage from './components/pages/admin/PropertyManagementPage';
import PropertyFormPage from './components/pages/admin/forms/PropertyFormPage';
import AmenitiesManagementPage from './components/pages/admin/AmenitiesManagementPage';
import AdminBookingsPage from './components/pages/admin/AdminBookingPage';
import AdminReviewsPage from './components/pages/admin/AdminReviewPage';
import AdminHomeSection from './components/pages/admin/AdminHomeSection';

const Home = () => (
  <div className="animate-entrance">
    <Hero />
    <OverviewSection />
  </div>
);

const PublicLayout = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const ProtectedAdminRoute = () => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token; 
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <ToastProvider> 
      <Router>
        <ScrollToTop />
        <BackToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            {/* CLEAN ROUTES - NO IDs */}
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/book" element={<ReservationPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          <Route path="/admin/login" element={<LoginPage />} />

          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="properties" element={<PropertyManagementPage />} />
              <Route path="properties/new" element={<PropertyFormPage />} />
              {/* Admin still requires ID to target specific edits */}
              <Route path="properties/edit/:id" element={<PropertyFormPage />} />
              <Route path="/admin/properties/view/:id" element={<PropertyFormPage />} />
              <Route path="amenities" element={<AmenitiesManagementPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="homesection" element={<AdminHomeSection />} />
            </Route>
          </Route>
          
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;