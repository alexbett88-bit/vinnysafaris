import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X, LogOut, Compass, LayoutDashboard } from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

import { checkIsAdmin } from '../lib/auth-utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [user, setUser] = React.useState<any>(null);
  const location = useLocation();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const docRef = doc(db, 'users', authUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Trips', path: '/trips' },
    { name: 'Private Hire', path: '/private-hire' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  const isAdmin = checkIsAdmin(user, profile);

  return (
    <nav className="hidden md:block bg-safari-dark/98 backdrop-blur-xl text-white sticky top-0 z-50 shadow-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo */}
          <Link to="/" className="group flex items-center shrink-0">
            {!logoError ? (
              <img 
                src="https://lh3.googleusercontent.com/d/1ogiO1Um4hOw4uCs6z9FOdHXUtixjDyQU" 
                alt="Vinny Safaris Logo" 
                className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Compass className="w-6 h-6 text-safari-yellow" />
                <span className="text-lg font-display font-bold tracking-tight">Vinny Safaris</span>
              </div>
            )}
          </Link>

          {/* Right: Navigation & Actions */}
          <div className="flex items-center space-x-12">
            <div className="hidden xl:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[10px] font-bold uppercase tracking-[0.25em] whitespace-nowrap transition-all hover:text-safari-yellow relative py-2 group ${
                    location.pathname === link.path ? 'text-safari-yellow' : 'text-gray-400'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 w-full h-[1px] bg-safari-yellow transition-transform duration-500 origin-left ${
                    location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </Link>
              ))}
            </div>

            <div className="flex items-center pl-8 border-l border-white/10 space-x-4">
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`p-2.5 bg-safari-orange/10 hover:bg-safari-orange/20 rounded-full transition-all border border-safari-orange/20 group ${
                    location.pathname === '/admin' ? 'bg-safari-orange/30 border-safari-orange/40' : ''
                  }`}
                  title="Admin Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 text-safari-orange group-hover:scale-110 transition-transform" />
                </Link>
              )}
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link 
                    to="/profile" 
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 group"
                    title="My Account"
                  >
                    <User className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </Link>
                  <button
                    onClick={() => signOut(auth)}
                    className="p-2.5 text-gray-500 hover:text-safari-red transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary py-2 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-safari-orange/10 hover:shadow-safari-orange/30 transition-all">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
