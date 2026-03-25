import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Trip, Seat } from '../types';
import VanSeatMap from '../components/VanSeatMap';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, CreditCard, Phone, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Booking() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [selectedSeat, setSelectedSeat] = React.useState<number | null>(null);
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [fullName, setFullName] = React.useState('');

  React.useEffect(() => {
    if (!tripId) return;
    const unsubscribe = onSnapshot(doc(db, 'trips', tripId), (doc) => {
      if (doc.exists()) {
        setTrip({ id: doc.id, ...doc.data() } as Trip);
      }
    });
    return () => unsubscribe();
  }, [tripId]);

  const handleSeatClick = (seatNumber: number) => {
    setSelectedSeat(seatNumber);
  };

  const handleInitiatePayment = async () => {
    if (!trip || !selectedSeat || !phoneNumber || !fullName) {
      toast.error('Please fill in all details');
      return;
    }

    setLoading(true);
    try {
      // 1. Mark seat as pending in Firestore
      const updatedSeats = trip.seats.map(s => 
        s.seatNumber === selectedSeat 
          ? { 
              ...s, 
              status: 'pending', 
              userId: auth.currentUser?.uid || 'guest', 
              userName: fullName, 
              userPhone: phoneNumber,
              bookedAt: new Date().toISOString()
            } 
          : s
      );
      await updateDoc(doc(db, 'trips', trip.id), { seats: updatedSeats });
      
      // 2. Move to instruction step
      setStep(3);
      toast.success('Seat reserved! Please follow payment instructions.');
    } catch (error) {
      console.error('Booking Error:', error);
      toast.error('Failed to reserve seat');
    } finally {
      setLoading(false);
    }
  };

  function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
  }

  if (!trip) return <div className="p-20 text-center">Loading trip details...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-12">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8 md:hidden">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
              step >= s ? "bg-safari-orange text-white" : "bg-gray-200 text-gray-500"
            )}>
              {s}
            </div>
            {s < 3 && (
              <div className={cn(
                "w-8 h-0.5 mx-1",
                step > s ? "bg-safari-orange" : "bg-gray-200"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Left: Seat Map */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-safari-grey mb-2">Select Your Seat</h1>
            <p className="text-sm md:text-base text-gray-500">Pick your favorite spot for the journey to {trip.destination}</p>
          </div>
          
          <VanSeatMap 
            seats={trip.seats} 
            onSeatClick={handleSeatClick} 
            selectedSeat={selectedSeat} 
          />
        </div>

        {/* Right: Booking Details */}
        <div className="space-y-6 pb-24 md:pb-0">
          <div className="card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">{trip.destination}</h2>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{format(new Date(trip.date), 'PPP p')}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase">Price</p>
                <p className="text-2xl font-bold text-safari-orange">KES {trip.pricePerSeat.toLocaleString()}</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="bg-safari-orange/10 p-4 rounded-xl mb-6">
                    <p className="text-sm font-medium text-safari-orange">
                      {selectedSeat 
                        ? `You have selected Seat #${selectedSeat}` 
                        : "Please select a seat from the map to continue"}
                    </p>
                  </div>
                  <div className="md:hidden fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-100 z-40">
                    <button 
                      disabled={!selectedSeat}
                      onClick={() => setStep(2)}
                      className="w-full btn-primary disabled:opacity-50 py-4 shadow-xl"
                    >
                      Continue to Details
                    </button>
                  </div>
                  <button 
                    disabled={!selectedSeat}
                    onClick={() => setStep(2)}
                    className="hidden md:block w-full btn-primary disabled:opacity-50"
                  >
                    Continue to Details
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-bold text-lg mb-4">Passenger Information</h3>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-gray-600">Full Name (As on ID)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-safari-orange"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-gray-600">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-safari-orange"
                        placeholder="0712345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex space-x-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border-2 font-bold">Back</button>
                    <button 
                      onClick={handleInitiatePayment}
                      disabled={loading}
                      className="flex-1 btn-primary flex items-center justify-center"
                    >
                      {loading ? "Processing..." : "Pay to Confirm"}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                   key="step3"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="space-y-6 py-4"
                >
                  <div className="bg-yellow-50 border-2 border-yellow-100 p-6 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-yellow-800 mb-2">Payment Instructions</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      To reserve <span className="font-bold">Seat #{selectedSeat}</span>, please send <span className="font-bold">Ksh {trip.pricePerSeat.toLocaleString()}</span> to:
                    </p>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Payment Number</p>
                      <p className="text-2xl font-black text-safari-green">0729770411</p>
                      <p className="text-sm font-bold text-gray-500">(Vinny Safaris)</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Reference Code</p>
                      <p className="text-xl font-black text-safari-orange uppercase">{trip.destination.split(' ')[0]}{selectedSeat}</p>
                    </div>

                    <p className="text-xs text-red-500 font-bold italic">
                      * Your seat will be held for 15 minutes.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-center text-sm text-gray-500">Once you have paid, the admin will approve your booking and you will receive a confirmation.</p>
                    <button 
                      onClick={() => navigate('/trips')}
                      className="w-full btn-secondary"
                    >
                      Back to Trips
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-safari-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-safari-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-safari-green mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-500 mb-8">Your seat #{selectedSeat} is secured. A ticket has been sent to your phone via WhatsApp/SMS.</p>
                  <button 
                    onClick={() => navigate('/trips')}
                    className="btn-secondary w-full"
                  >
                    Back to Trips
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="card p-6 bg-gray-50 border-dashed">
            <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Trip Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Route</span>
                <span className="font-bold">Eldama Ravine → {trip.destination}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Seat Number</span>
                <span className="font-bold">{selectedSeat || 'Not selected'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vehicle</span>
                <span className="font-bold">Safari Van (11-Seater)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
