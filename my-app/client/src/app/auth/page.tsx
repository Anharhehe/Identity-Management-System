'use client';

import { useState } from 'react';
import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { FaCheckCircle } from 'react-icons/fa';

export default function AuthPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors = [];

    if (!isLogin) {
      if (!formData.firstName.trim()) {
        newErrors.push('First name is required');
      }
      if (!formData.lastName.trim()) {
        newErrors.push('Last name is required');
      }
    }

    if (!formData.email.trim()) {
      newErrors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('Please enter a valid email address');
    }

    if (!formData.password) {
      newErrors.push('Password is required');
    } else if (formData.password.length < 8) {
      newErrors.push('Password must be at least 8 characters long');
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.push('Passwords do not match');
      }
      if (!termsAccepted) {
        newErrors.push('You must agree to the Terms & Conditions to sign up');
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (formErrors.length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { 
            firstName: formData.firstName, 
            lastName: formData.lastName, 
            email: formData.email, 
            password: formData.password, 
            confirmPassword: formData.confirmPassword 
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Check content type and parse accordingly
      const contentType = response.headers.get('content-type');
      let data;
      
      try {
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error('Server response is not JSON:', text);
          setErrors(['Server returned an invalid response. Please check if the server is running properly.']);
          return;
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        setErrors(['Failed to parse server response. Please try again.']);
        return;
      }

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.error) {
          setErrors([data.error]);
        } else {
          setErrors(['An error occurred']);
        }
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccessMessage(data.message);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Auth error:', error);
      setErrors(['Network error. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Image/Branding */}
          <div className="hidden lg:flex flex-col justify-center items-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-75"></div>
              <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
                {/* Network/Identity Icon */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Center circle */}
                      <circle cx="100" cy="100" r="30" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2"/>
                      <circle cx="100" cy="100" r="20" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.5"/>
                      {/* User icon in center */}
                      <circle cx="100" cy="85" r="8" fill="white"/>
                      <path d="M 90 105 Q 100 110 110 105" stroke="white" strokeWidth="2" fill="none"/>
                      
                      {/* Connected nodes */}
                      <circle cx="60" cy="60" r="6" fill="white" opacity="0.8"/>
                      <circle cx="140" cy="60" r="6" fill="white" opacity="0.8"/>
                      <circle cx="50" cy="100" r="6" fill="white" opacity="0.8"/>
                      <circle cx="150" cy="100" r="6" fill="white" opacity="0.8"/>
                      <circle cx="70" cy="140" r="6" fill="white" opacity="0.8"/>
                      <circle cx="130" cy="140" r="6" fill="white" opacity="0.8"/>
                      
                      {/* Connection lines */}
                      <line x1="100" y1="100" x2="60" y2="60" stroke="white" strokeWidth="1" opacity="0.5"/>
                      <line x1="100" y1="100" x2="140" y2="60" stroke="white" strokeWidth="1" opacity="0.5"/>
                      <line x1="100" y1="100" x2="50" y2="100" stroke="white" strokeWidth="1" opacity="0.5"/>
                      <line x1="100" y1="100" x2="150" y2="100" stroke="white" strokeWidth="1" opacity="0.5"/>
                      <line x1="100" y1="100" x2="70" y2="140" stroke="white" strokeWidth="1" opacity="0.5"/>
                      <line x1="100" y1="100" x2="130" y2="140" stroke="white" strokeWidth="1" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-center mb-2">Identity Management System</h2>
                <p className="text-center text-lg opacity-90">Unify Your Digital Self.</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {isLogin ? 'Welcome Back' : 'Create Your Account'}
              </h1>

              {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <ul className="text-red-700 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          placeholder="Your first name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          placeholder="Your last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-12"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 text-xl"
                      disabled={isLoading}
                    >
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-12"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 text-xl"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      </button>
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          setTermsAccepted(false);
                        } else {
                          setShowTermsModal(true);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      disabled={isLoading}
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-600 cursor-pointer">
                      I agree the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-purple-600 hover:text-purple-800 font-semibold underline cursor-pointer"
                      >
                        Terms & Conditions
                      </button>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-red-500 hover:from-blue-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center mt-6 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    isLogin ? 'Sign In' : 'Sign Up'
                  )}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-medium rounded-lg transition-colors duration-200 border border-gray-300 mt-6 cursor-pointer"
                >
                  <FcGoogle className="text-lg" />
                  <span className="text-sm">Sign in with Google</span>
                </button>

                <p className="text-center text-sm text-gray-600 mt-6">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors([]);
                      setSuccessMessage('');
                      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
                    }}
                    className="text-purple-600 hover:text-purple-800 font-semibold cursor-pointer"
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 to-purple-600 px-8 py-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-white text-2xl" />
                <h2 className="text-2xl font-bold text-white">Terms & Conditions</h2>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-white hover:bg-purple-400 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6 text-gray-700">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Welcome to the Identity Management System</h3>
                <p className="text-sm leading-relaxed">
                  By creating an account, you agree to the following terms regarding how we handle your personal identity information.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Data Collection and Storage</h3>
                <p className="text-sm leading-relaxed">
                  We collect and store various forms of your identity information including but not limited to legal names, preferred names, nicknames, and contextual identity profiles. All information you provide is stored securely in encrypted databases and is only accessible through authenticated access. You have full control over what information you choose to share with our system.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Purpose of Data Usage</h3>
                <p className="text-sm leading-relaxed">
                  The information you provide will be used solely for the purpose of managing your multiple identities across different contexts. We will return appropriate identity information based on the context in which it is requested. Your data will not be sold, shared with third parties, or used for marketing purposes without your explicit consent.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Your Rights and Control</h3>
                <p className="text-sm leading-relaxed">
                  You maintain complete ownership of all identity information stored in our system. You have the right to view, edit, update, or delete any of your identity profiles at any time. You can request complete deletion of your account and all associated data by contacting us or using the account deletion feature. You have the right to know who accesses your information and in what context.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Privacy and Confidentiality</h3>
                <p className="text-sm leading-relaxed">
                  We understand that identity information is deeply personal and sensitive. All data is treated with the highest level of confidentiality. Access to your identity profiles is restricted based on the context and authorization level of the requesting party. We implement industry standard security measures including password hashing, token based authentication, and encrypted data transmission to protect your information from unauthorized access.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Context Based Information Sharing</h3>
                <p className="text-sm leading-relaxed">
                  Our system is designed to share different versions of your identity based on context such as professional, personal, family, or online use. You define what information is appropriate for each context. When someone requests your information, they will only receive the identity profile relevant to their context and authorization level. You can modify these settings at any time to control what information is shared in each situation.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Data Retention and Security</h3>
                <p className="text-sm leading-relaxed">
                  Your data will be retained for as long as your account remains active. If you delete your account, all personal information will be permanently removed from our systems within thirty days. We regularly update our security measures to protect against data breaches and unauthorized access. In the unlikely event of a security incident, you will be notified immediately.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Cultural and Personal Sensitivity</h3>
                <p className="text-sm leading-relaxed">
                  We recognize that naming conventions and identity presentation vary across cultures, religions, and personal circumstances. Our system is designed to respect and accommodate these differences. You are free to add identity information that reflects your cultural background, religious practices, gender identity, chosen names, and any other aspects of how you wish to present yourself in different contexts.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Consent and Agreement</h3>
                <p className="text-sm leading-relaxed">
                  By checking the box below and creating an account, you acknowledge that you have read, understood, and agree to these terms and conditions. You confirm that the information you provide is accurate to the best of your knowledge. You understand that you are responsible for maintaining the confidentiality of your account credentials. You agree to use this system in a manner that respects the privacy and security of others.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Changes to Terms</h3>
                <p className="text-sm leading-relaxed">
                  We reserve the right to update these terms and conditions as our system evolves and as legal requirements change. You will be notified of any significant changes and may be required to accept updated terms to continue using the service. Continued use of the system after changes are made constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Academic and Research Purpose</h3>
                <p className="text-sm leading-relaxed">
                  Please note that this system is currently operating as an academic project prototype. While we implement professional security standards, the system is still under development and testing. Your participation helps improve identity management solutions for diverse users. Feedback and suggestions for improvement are always welcome.
                </p>
              </section>

              <section className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-purple-900">
                  By clicking "I Agree" you consent to these terms and conditions and authorize the Identity Management System to store and manage your identity information as described above.
                </p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-4 flex gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTermsModal(false);
                }}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaCheckCircle />
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
