import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, User, Phone, LayoutDashboard } from 'lucide-react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export default function BottomNav() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
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

  const isAdmin = profile?.role === 'admin';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 py-3 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          `flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-safari-orange' : 'text-gray-400'}`
        }
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">Home</span>
      </NavLink>
      
      <NavLink 
        to="/trips" 
        className={({ isActive }) => 
          `flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-safari-orange' : 'text-gray-400'}`
        }
      >
        <Search className="w-6 h-6" />
        <span className="text-[10px] font-medium">Book</span>
      </NavLink>

      <NavLink 
        to="/private-hire" 
        className={({ isActive }) => 
          `flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-safari-orange' : 'text-gray-400'}`
        }
      >
        <Calendar className="w-6 h-6" />
        <span className="text-[10px] font-medium">Hire</span>
      </NavLink>

      <NavLink 
        to="/contact" 
        className={({ isActive }) => 
          `flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-safari-orange' : 'text-gray-400'}`
        }
      >
        <Phone className="w-6 h-6" />
        <span className="text-[10px] font-medium">Support</span>
      </NavLink>

      {isAdmin ? (
        <NavLink 
          to="/admin" 
          className={({ isActive }) => 
            `flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-safari-orange' : 'text-gray-400'}`
          }
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Admin</span>
        </NavLink>
      ) : (
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-safari-orange' : 'text-gray-400'}`
          }
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Account</span>
        </NavLink>
      )}
    </nav>
  );
}
