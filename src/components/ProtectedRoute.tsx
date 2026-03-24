import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const [loading, setLoading] = React.useState(true);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const user = auth.currentUser;

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  if (loading) return <div className="p-20 text-center">Checking permissions...</div>;

  if (!user) return <Navigate to="/login" />;

  if (adminOnly && userProfile?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
