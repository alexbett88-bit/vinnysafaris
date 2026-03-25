import React from 'react';
import { motion } from 'motion/react';
import { Bus, Calendar, MapPin, Send, CheckCircle } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function PrivateHire() {
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const hireRequest = {
      userId: auth.currentUser?.uid || 'guest',
      customerName: formData.get('fullName'),
      customerPhone: formData.get('phone'),
      pickupPoint: formData.get('pickup'),
      destination: formData.get('destination'),
      departureDate: formData.get('departure'),
      returnDate: formData.get('return'),
      numVans: Number(formData.get('vans')),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      const sanitizedRequest = JSON.parse(JSON.stringify(hireRequest));
      await addDoc(collection(db, 'privateHires'), sanitizedRequest);
      setSubmitted(true);
      toast.success('Request sent successfully!');
    } catch (error) {
      console.error('Private Hire Error:', error);
      try {
        handleFirestoreError(error, OperationType.CREATE, 'privateHires');
      } catch (e) {
        // Error already logged
      }
      toast.error('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100"
        >
          <div className="w-20 h-20 bg-safari-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-safari-green" />
          </div>
          <h2 className="text-3xl font-display font-bold text-safari-grey mb-4">Request Received!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Thank you for choosing Vinny Safaris. Our team will review your request 
            and contact you within 24 hours with a custom quote and availability.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="btn-secondary w-full"
          >
            New Request
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Info Section */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              <img 
                src="https://lh3.googleusercontent.com/d/1kSAiISGaIMxEznkecltsLP-aLmvBEi8N" 
                alt="Vinny Safaris Private Hire" 
                className="w-full h-64 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-4xl font-display font-bold text-safari-grey mb-6">Private Van Hire</h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              Planning a school trip, wedding, or group excursion? Hire our entire fleet 
              for a private, customized experience. We offer flexible pickup points 
              and professional drivers to make your journey seamless.
            </p>
            
            <div className="space-y-6">
              {[
                { title: "Flexible Routes", desc: "You decide the stops and the schedule." },
                { title: "Group Discounts", desc: "Special rates for hiring multiple vans (up to 3)." },
                { title: "Door-to-Door", desc: "We pick you up from your preferred location." }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-safari-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bus className="w-5 h-5 text-safari-orange" />
                  </div>
                  <div>
                    <h4 className="font-bold text-safari-grey">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 md:p-10"
        >
          <h3 className="text-2xl font-bold mb-8 flex items-center space-x-2">
            <Send className="w-6 h-6 text-safari-orange" />
            <span>Request a Quote</span>
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-600">Full Name</label>
                <div className="relative">
                  <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input name="fullName" required className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-safari-orange" placeholder="John Doe" defaultValue={auth.currentUser?.displayName || ''} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-600">Phone Number</label>
                <div className="relative">
                  <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input name="phone" required className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-safari-orange" placeholder="0712345678" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-600">Pickup Point</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input name="pickup" required className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-safari-orange" placeholder="e.g. Eldama Ravine" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-600">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input name="destination" required className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-safari-orange" placeholder="e.g. Lake Nakuru" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-600">Departure Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input name="departure" type="date" required className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-safari-orange" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-600">Return Date (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input name="return" type="date" className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-safari-orange" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-600">Number of Vans (11-Seaters)</label>
              <div className="relative">
                <Bus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select name="vans" required className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-safari-orange appearance-none">
                  <option value="1">1 Van (11 Seats)</option>
                  <option value="2">2 Vans (22 Seats)</option>
                  <option value="3">3 Vans (33 Seats)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-4 text-lg shadow-lg shadow-safari-orange/20"
            >
              {loading ? "Sending Request..." : "Submit Request"}
            </button>
            <p className="text-center text-xs text-gray-400">
              By submitting, you agree to our terms of service and privacy policy.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
