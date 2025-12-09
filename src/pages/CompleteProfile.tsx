import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { User, Mail, Calendar, ArrowRight, Search, AlertCircle } from 'lucide-react';
import { countries, getCountryByCode, getFlagUrl } from '../data/countries';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createUserProfile } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    phoneCode: '+93',
    phoneNumber: '',
    dateOfBirth: null as Date | null,
    countryCode: 'AF', // Afghanistan as default
  });

  const [phoneSearchTerm, setPhoneSearchTerm] = useState('');
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ageError, setAgeError] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Calculate max date for 18+ requirement (18 years ago from today)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  // Set a reasonable min date (100 years ago)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);

  // Filter countries based on search
  const filteredCountriesForPhone = countries.filter(country =>
    country.name.toLowerCase().includes(phoneSearchTerm.toLowerCase()) ||
    country.phoneCode.includes(phoneSearchTerm)
  );

  const filteredCountriesForCountry = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  // When phone code is selected, auto-select country
  const handlePhoneCodeSelect = (phoneCode: string, countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      phoneCode,
      countryCode, // Auto-select country
    }));
    setShowPhoneDropdown(false);
    setPhoneSearchTerm('');
  };

  // When country is selected, auto-select phone code
  const handleCountrySelect = (countryCode: string, phoneCode: string) => {
    setFormData(prev => ({
      ...prev,
      countryCode,
      phoneCode, // Auto-select phone code
    }));
    setShowCountryDropdown(false);
    setCountrySearchTerm('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgeError('');
    setError('');

    // Validate all required fields
    if (!formData.username || !formData.displayName || !formData.email || !formData.phoneNumber || !formData.dateOfBirth || !formData.countryCode) {
      setAgeError('All fields are required. Please fill in all information.');
      return;
    }

    // Validate age (must be 18+)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      // Adjust age if birthday hasn't occurred this year
      const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;

      if (actualAge < 18) {
        setAgeError('You must be at least 18 years old to create an account.');
        return;
      }
    }

    setIsSubmitting(true);

    // Combine phone code and number
    const fullPhone = formData.phoneCode && formData.phoneNumber
      ? `${formData.phoneCode} ${formData.phoneNumber}`
      : '';

    const selectedCountry = getCountryByCode(formData.countryCode);
    const walletAddress = publicKey?.toString() || '';

    // Save to backend database
    const { error: saveError } = await createUserProfile({
      wallet_address: walletAddress,
      username: formData.username,
      display_name: formData.displayName,
      email: formData.email,
      phone: fullPhone,
      date_of_birth: formData.dateOfBirth ? formData.dateOfBirth : undefined,
      country: selectedCountry?.name || '',
      country_code: formData.countryCode,
      profile_complete: true,
    });

    if (saveError) {
      setError('Failed to save profile. Please try again.');
      setIsSubmitting(false);
      return;
    }

    // Success - create JWT session by logging in
    try {
      const loginResult = await login();

      if (loginResult.success) {
        // Successfully authenticated, redirect to dashboard
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSubmitting(false);
        navigate('/dashboard');
      } else {
        // Login failed, but profile was created - redirect anyway
        setIsSubmitting(false);
        navigate('/dashboard');
      }
    } catch (error) {
      // Continue to dashboard even if login fails
      setIsSubmitting(false);
      navigate('/dashboard');
    }
  };

  // Redirect if wallet not connected
  if (!connected || !publicKey) {
    navigate('/signup');
    return null;
  }

  const selectedCountryForPhone = getCountryByCode(formData.countryCode);
  const selectedCountryForCountry = getCountryByCode(formData.countryCode);

  return (
    <div className="min-h-screen pt-20 bg-slate-50 flex items-center justify-center">
      <div className="container-custom py-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white border-2 border-slate-200 rounded-2xl p-10 shadow-sm"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-yellow-500" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Complete Your Profile
              </h1>
              <p className="text-slate-600">
                Tell us a bit about yourself to get started
              </p>
            </div>

            {/* Wallet Info */}
            <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Connected Wallet:</p>
              <p className="text-xs font-mono text-slate-900 break-all">
                {publicKey.toString()}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username & Display Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-yellow-500 focus:outline-none transition-colors"
                      placeholder="username123"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Used for login</p>
                </div>

                <div>
                  <label htmlFor="displayName" className="block text-sm font-semibold text-slate-700 mb-2">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-yellow-500 focus:outline-none transition-colors"
                    placeholder="Your Name"
                  />
                  <p className="text-xs text-slate-500 mt-1">How others see you</p>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-yellow-500 focus:outline-none transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone Number with Country Code */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Country Code Selector */}
                  <div className="relative col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPhoneDropdown(!showPhoneDropdown);
                        setShowCountryDropdown(false);
                      }}
                      className="w-full px-3 py-3 rounded-lg border-2 border-slate-200 focus:border-yellow-500 focus:outline-none transition-colors text-left flex items-center justify-between bg-white"
                    >
                      {selectedCountryForPhone ? (
                        <span className="flex items-center space-x-2">
                          <img
                            src={getFlagUrl(selectedCountryForPhone.code)}
                            alt={selectedCountryForPhone.name}
                            className="w-6 h-4 object-cover rounded"
                          />
                          <span className="text-sm font-medium">{selectedCountryForPhone.phoneCode}</span>
                        </span>
                      ) : (
                        <span className="text-sm">Code</span>
                      )}
                      <Search className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Phone Code Dropdown */}
                    {showPhoneDropdown && (
                      <div className="absolute z-50 w-80 mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                        <div className="p-2 border-b border-slate-200">
                          <input
                            type="text"
                            placeholder="Search country or code..."
                            value={phoneSearchTerm}
                            onChange={(e) => setPhoneSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-yellow-500 focus:outline-none text-sm"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {filteredCountriesForPhone.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => handlePhoneCodeSelect(country.phoneCode, country.code)}
                              className="w-full px-4 py-2.5 hover:bg-slate-50 text-left flex items-center space-x-3 transition-colors"
                            >
                              <img
                                src={getFlagUrl(country.code)}
                                alt={country.name}
                                className="w-8 h-5 object-cover rounded flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900">{country.name}</div>
                                <div className="text-xs text-slate-500">{country.phoneCode}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone Number Input */}
                  <div className="col-span-2">
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-yellow-500 focus:outline-none transition-colors"
                      placeholder="123 456 7890"
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth & Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-2">You must be at least 18 years old</p>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                    <DatePicker
                      selected={formData.dateOfBirth}
                      onChange={(date) => {
                        setFormData(prev => ({ ...prev, dateOfBirth: date }));
                        setAgeError('');
                      }}
                      maxDate={maxDate}
                      minDate={minDate}
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      dateFormat="MMMM d, yyyy"
                      placeholderText="Select your date of birth"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-yellow-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Country Selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCountryDropdown(!showCountryDropdown);
                        setShowPhoneDropdown(false);
                      }}
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-yellow-500 focus:outline-none transition-colors text-left flex items-center justify-between bg-white"
                    >
                      {selectedCountryForCountry ? (
                        <span className="flex items-center space-x-2">
                          <img
                            src={getFlagUrl(selectedCountryForCountry.code)}
                            alt={selectedCountryForCountry.name}
                            className="w-6 h-4 object-cover rounded"
                          />
                          <span className="text-sm">{selectedCountryForCountry.name}</span>
                        </span>
                      ) : (
                        <span className="text-sm">Select your country</span>
                      )}
                      <Search className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Country Dropdown */}
                    {showCountryDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                        <div className="p-2 border-b border-slate-200">
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={countrySearchTerm}
                            onChange={(e) => setCountrySearchTerm(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-yellow-500 focus:outline-none text-sm"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {filteredCountriesForCountry.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => handleCountrySelect(country.code, country.phoneCode)}
                              className="w-full px-4 py-2.5 hover:bg-slate-50 text-left flex items-center space-x-3 transition-colors"
                            >
                              <img
                                src={getFlagUrl(country.code)}
                                alt={country.name}
                                className="w-8 h-5 object-cover rounded flex-shrink-0"
                              />
                              <span className="text-sm font-medium text-slate-900">{country.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {(ageError || error) && (
                <div className="flex items-start space-x-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{ageError || error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.countryCode}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Saving Profile...' : 'Complete Profile'}</span>
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
