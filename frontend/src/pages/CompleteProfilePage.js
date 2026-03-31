import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon, PhoneIcon, CreditCardIcon, BuildingLibraryIcon, BanknotesIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    panNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    Object.keys(formData).forEach(key => {
      if (!formData[key].trim()) {
        newErrors[key] = `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });

    // PAN validation
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = 'PAN must be in format ABCDE1234F';
    }

    // Phone validation (basic)
    if (formData.phoneNumber && !/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // IFSC validation (basic)
    if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Please enter a valid IFSC code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Store profile data in localStorage
      localStorage.setItem('kycData', JSON.stringify(formData));

      // Update user context to mark KYC as completed
      updateUser({ kycCompleted: true });

      toast.success('KYC Completed Successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white";
  const errorClasses = "text-red-500 text-sm mt-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div className="w-16 h-1 bg-slate-300 rounded"></div>
              <div className="w-8 h-8 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-center text-slate-600">
            Finish KYC to unlock full features
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && <p className={errorClasses}>{errors.fullName}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10`}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
              </div>
              {errors.phoneNumber && <p className={errorClasses}>{errors.phoneNumber}</p>}
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                PAN Number
              </label>
              <div className="relative">
                <CreditCardIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.value.toUpperCase() } })}
                  className={`${inputClasses} pl-10 uppercase`}
                  placeholder="ABCDE1234F"
                  maxLength="10"
                />
              </div>
              {errors.panNumber && <p className={errorClasses}>{errors.panNumber}</p>}
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bank Name
              </label>
              <div className="relative">
                <BuildingLibraryIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10`}
                  placeholder="Enter your bank name"
                />
              </div>
              {errors.bankName && <p className={errorClasses}>{errors.bankName}</p>}
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Account Number
              </label>
              <div className="relative">
                <BanknotesIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10`}
                  placeholder="Enter your account number"
                  maxLength="12"
                />
              </div>
              {errors.accountNumber && <p className={errorClasses}>{errors.accountNumber}</p>}
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                IFSC Code
              </label>
              <div className="relative">
                <CodeBracketIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.value.toUpperCase() } })}
                  className={`${inputClasses} pl-10 uppercase`}
                  placeholder="ABCD0123456"
                  maxLength="11"
                />
              </div>
              {errors.ifscCode && <p className={errorClasses}>{errors.ifscCode}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Completing Profile...</span>
                </>
              ) : (
                <span>Complete Profile</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;