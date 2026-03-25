import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

import { checkIsAdmin } from '../lib/auth-utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, profile: userProfile, loading } = useAuth();

  if (loading) return <div className="p-20 text-center">Checking permissions...</div>;

  if (!user) return <Navigate to="/login" />;

  const isAdmin = checkIsAdmin(user, userProfile);

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
