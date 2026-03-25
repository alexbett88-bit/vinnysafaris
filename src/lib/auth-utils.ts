import { UserProfile } from '../types';

export const ADMIN_EMAIL = 'alexbett88@gmail.com';

export const checkIsAdmin = (user: any, profile: UserProfile | null): boolean => {
  if (!user) return false;
  
  // Check if profile has admin role
  if (profile?.role === 'admin') return true;
  
  // Fallback: Check email directly (useful if profile hasn't loaded or is out of sync)
  if (user.email === ADMIN_EMAIL) return true;
  
  return false;
};
