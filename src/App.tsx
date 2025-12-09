import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletContextProvider } from './contexts/WalletContextProvider';

// Eager load critical components
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';

// Lazy load non-critical pages
const About = lazy(() => import('./pages/About'));
const Why = lazy(() => import('./pages/Why'));
const Contact = lazy(() => import('./pages/Contact'));
const Signup = lazy(() => import('./pages/Signup'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Debug = lazy(() => import('./pages/Debug'));
import ProtectedRoute from './components/ProtectedRoute';
const Transactions = lazy(() => import('./pages/Transactions'));
const Investments = lazy(() => import('./pages/Investments'));
const Plans = lazy(() => import('./pages/Plans'));
const Profile = lazy(() => import('./pages/Profile'));
const BuyCrypto = lazy(() => import('./pages/BuyCrypto'));
const Traders = lazy(() => import('./pages/Traders'));
const AdminCron = lazy(() => import('./pages/AdminCron'));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <WalletContextProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="why" element={<Why />} />
              <Route path="contact" element={<Contact />} />
              <Route path="traders" element={<Traders />} />
            </Route>
            {/* Auth routes - no layout */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            {/* Dashboard routes - separate layout */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/dashboard/investments" element={<ProtectedRoute><Investments /></ProtectedRoute>} />
            <Route path="/dashboard/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard/buy-crypto" element={<BuyCrypto />} />
            {/* Admin routes */}
            <Route path="/admin/cron" element={<AdminCron />} />
            {/* Debug page */}
            <Route path="/debug" element={<Debug />} />
          </Routes>
        </Suspense>
      </Router>
    </WalletContextProvider>
  );
}

export default App;
