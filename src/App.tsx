import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletContextProvider } from './contexts/WalletContextProvider';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Why from './pages/Why';
import Contact from './pages/Contact';
import Signup from './pages/Signup';
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import Debug from './pages/Debug';
import Transactions from './pages/Transactions';
import Investments from './pages/Investments';
import Plans from './pages/Plans';
import Profile from './pages/Profile';
import BuyCrypto from './pages/BuyCrypto';
import Traders from './pages/Traders';
import AdminCron from './pages/AdminCron';

function App() {
  return (
    <WalletContextProvider>
      <Router>
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/transactions" element={<Transactions />} />
          <Route path="/dashboard/investments" element={<Investments />} />
          <Route path="/dashboard/plans" element={<Plans />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/buy-crypto" element={<BuyCrypto />} />
          {/* Admin routes */}
          <Route path="/admin/cron" element={<AdminCron />} />
          {/* Debug page */}
          <Route path="/debug" element={<Debug />} />
        </Routes>
      </Router>
    </WalletContextProvider>
  );
}

export default App;
