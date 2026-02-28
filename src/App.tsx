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
import AdminPaymentPage from './components/pages/admin/AdminPaymentPage';
import AdminSettingsPage from './components/pages/admin/AdminSettingsPage';

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

// Keeps logged-out users OUT of the Admin Panel
const ProtectedAdminRoute = () => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token; 
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

// NEW FIX: Keeps logged-in users AWAY from the Login Page
const RedirectIfAuthenticated = () => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  return isAuthenticated ? <Navigate to="/admin" replace /> : <Outlet />;
};

function App() {
  return (
    <ToastProvider> 
      <Router>
        <ScrollToTop />
        <BackToTop />
        <Routes>
          {/* ----- PUBLIC SQUAD ----- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/book" element={<ReservationPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* ----- ADMIN AUTH ----- */}
          {/* Wrapped the login page in the new redirect guard */}
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/admin/login" element={<LoginPage />} />
          </Route>

          {/* ----- ADMIN SQUAD (PROTECTED) ----- */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="properties" element={<PropertyManagementPage />} />
              <Route path="properties/new" element={<PropertyFormPage />} />
              <Route path="properties/edit/:id" element={<PropertyFormPage />} />
              <Route path="/admin/properties/view/:id" element={<PropertyFormPage />} />
              <Route path="amenities" element={<AmenitiesManagementPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="payments" element={<AdminPaymentPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="homesection" element={<AdminHomeSection />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
          
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;