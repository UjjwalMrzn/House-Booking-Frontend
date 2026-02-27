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
import { DEFAULT_PROPERTY_ID } from './utils/constants';
import BackToTop from './components/BackToTop';

// ADMIN
import AdminLayout from './components/layouts/AdminLayout';
import DashboardPage from './components/pages/admin/DashboardPage';
import LoginPage from './components/pages/admin/LoginPage';
// PropertyManagementPage
import PropertyManagementPage from './components/pages/admin/PropertyManagementPage';
import PropertyFormPage from './components/pages/admin/forms/PropertyFormPage';
import AmenitiesManagementPage from './components/pages/admin/AmenitiesManagementPage';
import AdminBookingsPage from './components/pages/admin/AdminBookingPage';
import AdminReviewsPage from './components/pages/admin/AdminReviewPage';

const Home = () => (
  <div className="animate-entrance">
    <Hero />
    <OverviewSection />
  </div>
);

// LOCKED PUBLIC SHELL
const PublicLayout = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// FIXED: Authentication Guard now checks for a real token instead of a dummy string
const ProtectedAdminRoute = () => {
  // We check if the token exists (is not null or empty)
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
          {/* ----- PUBLIC SQUAD ----- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/overview" element={<Navigate to={`/overview/${DEFAULT_PROPERTY_ID}`} replace />} />
            <Route path="/overview/:id" element={<OverviewPage />} />
            <Route path="/book/:id" element={<ReservationPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/gallery/:id" element={<GalleryPage />} />
            <Route path="/map/:id" element={<MapPage />} />
            <Route path="/reviews/:id" element={<ReviewsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* ----- ADMIN AUTH ----- */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* ----- ADMIN SQUAD (PROTECTED) ----- */}
          {/* FIXED: Wrapped the Admin Layout in the Protected Route Guard */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="properties" element={<PropertyManagementPage />} />
              <Route path="properties/new" element={<PropertyFormPage />} />
              <Route path="properties/edit/:id" element={<PropertyFormPage />} />
              <Route path="/admin/properties/view/:id" element={<PropertyFormPage />} />
              <Route path="amenities" element={<AmenitiesManagementPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
            </Route>
          </Route>
          
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;