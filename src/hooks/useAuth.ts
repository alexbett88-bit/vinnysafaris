import React from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { ADMIN_EMAIL } from '../lib/auth-utils';

export function useAuth() {
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isDemo, setIsDemo] = React.useState(false);

  React.useEffect(() => {
    // 1. Check for demo user in localStorage
    const demoUserStr = localStorage.getItem('demo_user');
    if (demoUserStr) {
      try {
        const demoUser = JSON.parse(demoUserStr);
        setUser(demoUser);
        setProfile(demoUser);
        setIsDemo(true);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Error parsing demo user:', e);
        localStorage.removeItem('demo_user');
      }
    }

    // 2. Fallback to Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        try {
          const docRef = doc(db, 'users', authUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create profile if it doesn't exist (e.g., first time login)
            const newProfile: UserProfile = {
              uid: authUser.uid,
              email: authUser.email || '',
              displayName: authUser.displayName || 'Traveler',
              role: authUser.email === ADMIN_EMAIL ? 'admin' : 'customer',
              createdAt: new Date().toISOString(),
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching/creating user profile:', error);
        }
      } else {
        setProfile(null);
        setIsDemo(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (isDemo || localStorage.getItem('demo_user')) {
      localStorage.removeItem('demo_user');
      setUser(null);
      setProfile(null);
      setIsDemo(false);
      window.location.href = '/';
    } else {
      await auth.signOut();
    }
  };

  return { user, profile, loading, isDemo, logout };
}
