import React from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { UserProfile, PrivateHire } from '../types';
import { User, Mail, Phone, Shield, Calendar, MapPin, Clock, Edit2, LogOut, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [myHires, setMyHires] = React.useState<PrivateHire[]>([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editPhone, setEditPhone] = React.useState('');
  const [editName, setEditName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const user = auth.currentUser;

  React.useEffect(() => {
    if (!user) return;
    
    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        setProfile(data);
        setEditPhone(data.phoneNumber || '');
        setEditName(data.displayName || '');
      }
    });

    const q = query(collection(db, 'privateHires'), where('userId', '==', user.uid));
    const unsubscribeHires = onSnapshot(q, (snapshot) => {
      setMyHires(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrivateHire)));
    });

    return () => {
      unsubscribeProfile();
      unsubscribeHires();
    };
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: editName,
        phoneNumber: editPhone
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="card p-12">
          <User className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold text-safari-grey mb-4">Guest Access</h2>
          <p className="text-gray-500 mb-8">Please login to view your profile and booking history.</p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full">Login / Sign Up</button>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="p-20 text-center">Loading profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card p-8 text-center relative overflow-hidden">
            <div className="absolute top-4 right-4 flex space-x-2">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Edit Profile"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>

            <div className="w-24 h-24 bg-safari-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-safari-orange" />
            </div>

            {isEditing ? (
              <div className="space-y-4 mb-6">
                <input 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 border rounded-lg text-center font-bold"
                  placeholder="Full Name"
                />
                <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">{profile.role}</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-display font-bold text-safari-grey mb-1">{profile.displayName}</h2>
                <p className="text-gray-500 text-sm mb-6 uppercase tracking-widest font-bold">{profile.role}</p>
              </>
            )}
            
            <div className="space-y-4 text-left border-t pt-6">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{profile.email}</span>
              </div>
              
              {isEditing ? (
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <input 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="flex-grow p-1 border-b focus:border-safari-orange outline-none"
                    placeholder="Phone Number"
                  />
                </div>
              ) : (
                profile.phoneNumber && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{profile.phoneNumber}</span>
                  </div>
                )
              )}

              <div className="flex items-center space-x-3 text-sm">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>Verified Account</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {isEditing && (
                <button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="w-full py-3 rounded-xl border-2 border-gray-100 text-red-500 font-bold flex items-center justify-center space-x-2 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-2xl font-display font-bold text-safari-grey">Your Private Hire Requests</h3>
          <div className="space-y-4">
            {myHires.map(hire => (
              <motion.div 
                key={hire.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-safari-orange" />
                    <span className="font-bold">{hire.pickupPoint} → {hire.destination}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{format(new Date(hire.departureDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{hire.numVans} Van(s)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    hire.status === 'confirmed' ? 'bg-safari-green/10 text-safari-green' :
                    hire.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                    'bg-yellow-400/10 text-yellow-600'
                  }`}>
                    {hire.status}
                  </span>
                </div>
              </motion.div>
            ))}
            {myHires.length === 0 && (
              <div className="card p-12 text-center text-gray-400 italic">
                No private hire requests yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
