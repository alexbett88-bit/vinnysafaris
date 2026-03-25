import React from 'react';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Compass, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';

import { ADMIN_EMAIL } from '../lib/auth-utils';

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const newUser: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || 'User',
          role: user.email === ADMIN_EMAIL ? 'admin' : 'customer',
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', user.uid), newUser);
      }
      navigate('/');
    } catch (error) {
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-safari-cream px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-40 h-40 bg-safari-orange/10 rounded-full mb-4">
            {!logoError ? (
              <img 
                src="https://lh3.googleusercontent.com/d/1ogiO1Um4hOw4uCs6z9FOdHXUtixjDyQU" 
                alt="Vinny Safaris Logo" 
                className="w-32 h-32 object-contain"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Compass className="w-14 h-14 text-safari-orange" />
            )}
          </div>
          <h2 className="text-3xl font-display font-bold text-safari-grey">Join Vinny Safaris</h2>
          <p className="text-gray-500 mt-2">Sign in or create an account to book your next adventure</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 mb-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-safari-orange rounded-full animate-spin"></div>
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span>Login or Sign Up with Google</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            const demoUser = {
              uid: 'demo-admin-123',
              email: 'alexbett88@gmail.com',
              displayName: 'Demo Admin',
              role: 'admin',
              createdAt: new Date().toISOString()
            };
            localStorage.setItem('demo_user', JSON.stringify(demoUser));
            window.location.href = '/admin';
          }}
          className="w-full flex items-center justify-center space-x-3 bg-safari-orange/10 border-2 border-safari-orange/20 text-safari-orange font-bold py-3 px-4 rounded-xl hover:bg-safari-orange/20 transition-all active:scale-95 mb-4"
        >
          <Compass className="w-5 h-5" />
          <span>Quick Demo (Admin Access)</span>
        </button>

        <button
          onClick={() => {
            const demoUser = {
              uid: 'demo-user-456',
              email: 'traveler@example.com',
              displayName: 'Demo Traveler',
              role: 'customer',
              createdAt: new Date().toISOString()
            };
            localStorage.setItem('demo_user', JSON.stringify(demoUser));
            window.location.href = '/trips';
          }}
          className="w-full flex items-center justify-center space-x-3 bg-safari-dark/5 border-2 border-safari-dark/10 text-safari-dark font-bold py-3 px-4 rounded-xl hover:bg-safari-dark/10 transition-all active:scale-95"
        >
          <Compass className="w-5 h-5" />
          <span>Quick Demo (User Access)</span>
        </button>

        <p className="mt-8 text-center text-xs text-gray-400 uppercase tracking-widest font-bold">
          Secure Safari Booking
        </p>
      </motion.div>
    </div>
  );
}
