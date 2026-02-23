// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; 
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to ensure social logins get a Firestore profile document
  const ensureUserProfile = async (user, additionalData = {}) => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        personalInfo: {
          fullName: user.displayName || additionalData.fullName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
        },
        createdAt: new Date()
      });
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Authenticating...");
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!", { id: toastId });
        navigate('/home'); 
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName) {
          await updateProfile(userCredential.user, { displayName: fullName });
        }
        await ensureUserProfile(userCredential.user, { fullName });
        toast.success("Account created! Let's build your profile.", { id: toastId });
        navigate('/onboarding');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.code.split('/')[1].replace(/-/g, ' ').toUpperCase(), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName) => {
    setLoading(true);
    const toastId = toast.loading(`Connecting to ${providerName}...`);
    
    try {
      const provider = providerName === 'Google' 
        ? new GoogleAuthProvider() 
        : new GithubAuthProvider();
        
      const result = await signInWithPopup(auth, provider);
      await ensureUserProfile(result.user);
      
      toast.success("Authentication successful!", { id: toastId });
      navigate('/home');
    } catch (err) {
      console.error(err);
      toast.error("Social login failed. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfb] p-4 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#eff1ec]">
        
        {/* Branding Side */}
        <div className="md:w-1/2 bg-[#556b2f] p-12 flex flex-col justify-center text-white relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold tracking-tighter mb-2">KARVEX</h1>
            <p className="text-sm opacity-80 font-medium tracking-wide uppercase">Editorial Resume Core</p>
            <div className="mt-8 w-16 h-1 bg-white/30 rounded-full"></div>
            <p className="mt-6 text-white/70 text-sm leading-relaxed max-w-xs">
              Craft your professional narrative with AI-powered precision and botanical design aesthetics.
            </p>
          </div>
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
        </div>

        {/* Form Side */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-extrabold text-[#556b2f] tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Create an account to start building your future.'}
            </p>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => handleSocialLogin('Google')}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm text-gray-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button 
                onClick={() => handleSocialLogin('GitHub')}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm text-gray-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                GitHub
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute w-full h-px bg-gray-200"></div>
              <span className="relative bg-white px-4 text-xs font-bold uppercase tracking-wider text-gray-400">Or continue with email</span>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#556b2f]/20 focus:border-[#556b2f] outline-none transition-all text-sm"
                    placeholder="e.g. Alex Rivera"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#556b2f]/20 focus:border-[#556b2f] outline-none transition-all text-sm"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">Password</label>
                  {isLogin && <button type="button" className="text-[10px] font-bold text-[#556b2f] hover:underline uppercase tracking-wider">Forgot?</button>}
                </div>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#556b2f]/20 focus:border-[#556b2f] outline-none transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 bg-[#556b2f] text-white font-bold rounded-xl transform transition-all active:scale-95 shadow-lg shadow-[#556b2f]/20 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#3e4f22]'}`}
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                {isLogin ? "New to Karvex?" : "Already have an account?"} {' '}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#556b2f] font-bold hover:underline"
                >
                  {isLogin ? 'Join the Core' : 'Log In Instead'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;