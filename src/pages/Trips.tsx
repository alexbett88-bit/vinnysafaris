import React from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, orderBy, addDoc } from 'firebase/firestore';
import { Trip } from '../types';
import TripCard from '../components/TripCard';
import { Search, MapPin, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Trips() {
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSeeding, setIsSeeding] = React.useState(false);
  const user = auth.currentUser;
  const isAdmin = user?.email === 'alexbett88@gmail.com';

  React.useEffect(() => {
    const q = query(collection(db, 'trips'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip)));
    });
    return () => unsubscribe();
  }, []);

  const seedDemoTrip = async () => {
    setIsSeeding(true);
    try {
      const newTrip = {
        destination: 'Nyahururu (Thomson Falls)',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        pricePerSeat: 2500,
        vanId: 'van-001',
        seats: Array.from({ length: 11 }, (_, i) => ({
          seatNumber: i + 1,
          status: 'available'
        }))
      };
      await addDoc(collection(db, 'trips'), newTrip);
      alert('Demo trip to Nyahururu added successfully!');
    } catch (error) {
      console.error('Error seeding trip:', error);
      alert('Failed to add demo trip. Check console for details.');
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredTrips = trips.filter(trip => 
    trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden mb-8 md:mb-12 shadow-xl">
        <img 
          src="https://lh3.googleusercontent.com/d/1YUZZ8-lIzQA2kknaA8-qeLH5OPAsx_aI" 
          alt="Join-In Trips" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-4 md:p-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 md:mb-4">Join-In Trips</h1>
            <p className="text-gray-100 max-w-2xl mx-auto text-sm md:text-lg">
              Book a single seat and join a group of adventurers.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="flex justify-center mb-6 md:mb-8">
          <button 
            onClick={seedDemoTrip}
            disabled={isSeeding}
            className="flex items-center space-x-2 bg-safari-green text-white px-5 py-3 md:px-6 md:py-3 rounded-xl font-bold hover:bg-safari-leaf transition-all shadow-lg disabled:opacity-50 text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span>{isSeeding ? 'Adding...' : 'Add Demo Trip'}</span>
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-8 md:mb-12 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search destination..."
          className="w-full pl-12 pr-4 py-3.5 md:py-4 rounded-2xl border-2 border-gray-100 focus:border-safari-orange focus:ring-0 transition-all shadow-sm text-sm md:text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTrips.map((trip, i) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <TripCard trip={trip} />
          </motion.div>
        ))}
        {filteredTrips.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <MapPin className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold">No trips found matching "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-safari-orange font-bold mt-2 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
