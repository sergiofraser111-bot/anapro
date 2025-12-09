import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Receipt,
  TrendingUp,
  User,
  Wallet as WalletIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Bell,
  Lock,
  Edit2,
  Save,
  CheckCircle,
  XCircle,
  Globe,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../services/api';

interface ProfileData {
  username: string;
  display_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  country: string;
  country_code: string;
  wallet_address: string;
  profile_complete: boolean;
  created_at?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { publicKey, disconnect, connected } = useWallet();
  const [userData, setUserData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editedData, setEditedData] = useState<ProfileData | null>(null);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    investmentUpdates: true,
    marketingEmails: false,
  });
  const [copiedWallet, setCopiedWallet] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      navigate('/');
      return;
    }

    const storedData = localStorage.getItem('profitAnalysisUser');
    if (storedData) {
      setUserData(JSON.parse(storedData));
      fetchProfile();
    } else {
      navigate('/complete-profile');
    }
  }, [connected, publicKey, navigate]);

  const fetchProfile = async () => {
    if (!publicKey) return;

    try {
      const { data } = await getUserProfile(publicKey.toString());
      if (data) {
        // Convert UserProfile (Date objects) to ProfileData (strings)
        const mappedData: ProfileData = {
          username: data.username,
          display_name: data.display_name,
          email: data.email || '', // Fallback to empty string if undefined
          phone: data.phone || '',
          date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '', // Convert Date to YYYY-MM-DD string
          country: data.country || '',
          country_code: data.country_code || '',
          wallet_address: data.wallet_address,
          profile_complete: data.profile_complete,
          created_at: data.created_at ? new Date(data.created_at).toISOString() : undefined
        };
        setProfileData(mappedData);
        setEditedData(mappedData);
      } else {
        // Fallback to localStorage if Supabase is not configured
        const storedData = localStorage.getItem('profitAnalysisUser');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          const fallbackData: ProfileData = {
            username: parsed.username || '',
            display_name: parsed.displayName || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            date_of_birth: parsed.dateOfBirth || '',
            country: parsed.country || '',
            country_code: parsed.countryCode || '',
            wallet_address: publicKey.toString(),
            profile_complete: true,
            created_at: new Date().toISOString(),
          };
          setProfileData(fallbackData);
          setEditedData(fallbackData);
        }
      }
    } catch (error) {
    }
  };

  const handleLogout = async () => {
    await disconnect();
    localStorage.removeItem('profitAnalysisUser');
    navigate('/');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!publicKey || !editedData) return;

    setIsSaving(true);
    try {
      // Map ProfileData back to partial UserProfile structure expected by update API
      // Note: updateUserProfile likely expects specific fields
      const updatePayload = {
        username: editedData.username,
        display_name: editedData.display_name,
        email: editedData.email,
        phone: editedData.phone,
        // If the API expects a string/date for date_of_birth, ensure it is passed correctly.
        // Assuming the API handles string dates or we need to cast.
        date_of_birth: editedData.date_of_birth ? new Date(editedData.date_of_birth) : undefined,
        country: editedData.country,
        country_code: editedData.country_code
      };

      const { error } = await updateUserProfile(publicKey.toString(), updatePayload as any);

      if (error) {
        throw new Error(error);
      }

      // Update localStorage
      const updatedUserData = {
        ...userData,
        username: editedData.username,
        displayName: editedData.display_name,
        email: editedData.email,
        phone: editedData.phone,
        dateOfBirth: editedData.date_of_birth,
        country: editedData.country,
        countryCode: editedData.country_code,
      };
      localStorage.setItem('profitAnalysisUser', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);

      setProfileData(editedData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert('Failed to update profile: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      [field]: value,
    });
  };

  const copyWalletAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  if (!userData || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-600">Loading...</div>
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Receipt, label: 'Transactions', path: '/dashboard/transactions' },
    { icon: TrendingUp, label: 'Investments', path: '/dashboard/investments' },
    { icon: WalletIcon, label: 'Our Plans', path: '/dashboard/plans' },
    { icon: User, label: 'My Profile', path: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 lg:hidden"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center space-x-3">
              <img src="/logo.jpg" alt="Profit Analysis" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold text-slate-900">Profit Analysis</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <div className="text-xs text-slate-500">Verified</div>
              <div className="text-sm font-semibold text-slate-900">{userData.displayName}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
              {userData.displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <nav className="p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 px-2">Menu</div>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${item.path === '/dashboard/profile'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <Link
            to="/"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors mb-2"
          >
            <span className="text-sm font-medium">Go to Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Disconnect Wallet</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        <div className="p-6 max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
            <p className="text-slate-600">Manage your account information and preferences</p>
          </motion.div>

          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-white text-3xl font-bold">
                  {profileData.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{profileData.display_name}</h2>
                  <p className="text-slate-600">@{profileData.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {profileData.profile_complete ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Verified Account
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" />
                        Profile Incomplete
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Account Created */}
            {profileData.created_at && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                Member since {new Date(profileData.created_at).toLocaleDateString()}
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                {isEditing && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border-2 border-slate-200 hover:border-slate-300 text-slate-900 rounded-lg font-semibold transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Display Name */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                    <User className="w-3 h-3" />
                    Display Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData?.display_name || ''}
                      onChange={(e) => handleInputChange('display_name', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none"
                    />
                  ) : (
                    <div className="text-sm text-slate-900">{profileData.display_name}</div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                    <User className="w-3 h-3" />
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData?.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none"
                    />
                  ) : (
                    <div className="text-sm text-slate-900">@{profileData.username}</div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                    <Mail className="w-3 h-3" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedData?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none"
                    />
                  ) : (
                    <div className="text-sm text-slate-900">{profileData.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                    <Phone className="w-3 h-3" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedData?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none"
                    />
                  ) : (
                    <div className="text-sm text-slate-900">{profileData.phone || 'Not provided'}</div>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                    <Calendar className="w-3 h-3" />
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedData?.date_of_birth || ''}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none"
                    />
                  ) : (
                    <div className="text-sm text-slate-900">
                      {profileData.date_of_birth
                        ? new Date(profileData.date_of_birth).toLocaleDateString()
                        : 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                    <MapPin className="w-3 h-3" />
                    Country
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData?.country || ''}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900">{profileData.country}</span>
                      {profileData.country_code && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {profileData.country_code}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Sidebar Cards */}
            <div className="space-y-6">
              {/* Wallet Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border-2 border-slate-200 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <WalletIcon className="w-5 h-5 text-slate-700" />
                  <h3 className="text-lg font-bold text-slate-900">Wallet</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-2">Connected Wallet</div>
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-900 font-mono break-all flex-1">
                        {publicKey?.toString().slice(0, 4)}...
                        {publicKey?.toString().slice(-4)}
                      </div>
                      <button
                        onClick={copyWalletAddress}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        {copiedWallet ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <a
                    href={`https://solscan.io/account/${publicKey?.toString()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 border-2 border-slate-200 hover:border-slate-300 text-slate-900 rounded-lg font-semibold transition-colors text-sm"
                  >
                    View on Solscan
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>

              {/* Account Security */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border-2 border-slate-200 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-slate-700" />
                  <h3 className="text-lg font-bold text-slate-900">Security</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-900">Wallet Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-900">Profile Verified</span>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-2 border-2 border-slate-200 hover:border-slate-300 text-slate-900 rounded-lg font-semibold transition-colors text-sm">
                    <Lock className="w-4 h-4" />
                    Security Settings
                  </button>
                </div>
              </motion.div>

              {/* Notification Preferences */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border-2 border-slate-200 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-slate-700" />
                  <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-900">Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) =>
                        setNotifications({ ...notifications, emailNotifications: e.target.checked })
                      }
                      className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-900">SMS Notifications</span>
                    <input
                      type="checkbox"
                      checked={notifications.smsNotifications}
                      onChange={(e) =>
                        setNotifications({ ...notifications, smsNotifications: e.target.checked })
                      }
                      className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-900">Investment Updates</span>
                    <input
                      type="checkbox"
                      checked={notifications.investmentUpdates}
                      onChange={(e) =>
                        setNotifications({ ...notifications, investmentUpdates: e.target.checked })
                      }
                      className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-900">Marketing Emails</span>
                    <input
                      type="checkbox"
                      checked={notifications.marketingEmails}
                      onChange={(e) =>
                        setNotifications({ ...notifications, marketingEmails: e.target.checked })
                      }
                      className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                    />
                  </label>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
