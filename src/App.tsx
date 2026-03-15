import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/sections/Navbar';
import Hero from './components/sections/Hero';
import OverviewSection from './components/sections/OverviewSection';
import Footer from './components/sections/Footer';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import { ToastProvider } from './components/ui/Toaster'; 
import TawkChat from './components/ui/TawkChat';

// ==========================================
// 1. LAZY LOAD PUBLIC PAGES
// ==========================================
const OverviewPage = lazy(() => import('./components/pages/OverviewPage'));
const ReservationPage = lazy(() => import('./components/pages/ReservationPage'));
const SuccessPage = lazy(() => import('./components/pages/SuccessPage'));
const GalleryPage = lazy(() => import('./components/pages/GalleryPage'));
const MapPage = lazy(() => import('./components/pages/MapPage'));
const ReviewsPage = lazy(() => import('./components/pages/ReviewsPage'));
const ContactPage = lazy(() => import('./components/pages/ContactPage'));

// ==========================================
// 2. LAZY LOAD ADMIN PAGES
// ==========================================
const AdminLayout = lazy(() => import('./components/layouts/AdminLayout'));
const LoginPage = lazy(() => import('./components/pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./components/pages/admin/DashboardPage'));
const PropertyManagementPage = lazy(() => import('./components/pages/admin/PropertyManagementPage'));
const PropertyFormPage = lazy(() => import('./components/pages/admin/forms/PropertyFormPage'));
const AmenitiesManagementPage = lazy(() => import('./components/pages/admin/AmenitiesManagementPage'));
const AdminBookingsPage = lazy(() => import('./components/pages/admin/AdminBookingPage'));
const AdminReviewsPage = lazy(() => import('./components/pages/admin/AdminReviewPage'));
const AdminHomeSection = lazy(() => import('./components/pages/admin/AdminHomeSection'));
const AdminPaymentPage = lazy(() => import('./components/pages/admin/AdminPaymentPage'));
const AdminSettingsPage = lazy(() => import('./components/pages/admin/AdminSettingsPage'));
const AdminHolidayPage = lazy(() => import('./components/pages/admin/AdminHolidayPage'));
const AdminContactsPage = lazy(() => import('./components/pages/admin/AdminContactsPage'));
const AdminCustomersPage = lazy(() => import('./components/pages/admin/AdminCustomersPage'));

// ==========================================
// STATIC COMPONENTS (Load instantly)
// ==========================================
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

const RedirectIfAuthenticated = () => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  return isAuthenticated ? <Navigate to="/admin" replace /> : <Outlet />;
};

// Seamless fallback spinner for lazy-loaded chunks
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9]">
    <div className="w-12 h-12 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <ToastProvider> 
      <Router>
        <ScrollToTop />
        <BackToTop />
        <TawkChat />
        
        <Suspense fallback={<PageLoader />}>
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
                <Route path="holidays" element={<AdminHolidayPage />} />
                <Route path="contacts" element={<AdminContactsPage />} /> 
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
              </Route>
            </Route>
            
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  );
}

export default App;