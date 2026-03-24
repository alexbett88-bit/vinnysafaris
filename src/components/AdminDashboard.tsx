import React from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { Trip, Van, PrivateHire, Message, GalleryItem } from '../types';
import { Plus, Trash2, Users, Bus, Calendar, MapPin, Eye, CheckCircle, XCircle, Database, Image as ImageIcon, MessageSquare, Briefcase, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { seedDatabase } from '../lib/seed';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState<'trips' | 'fleet' | 'gallery' | 'hires' | 'messages' | 'bookings'>('trips');
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [vans, setVans] = React.useState<Van[]>([]);
  const [gallery, setGallery] = React.useState<GalleryItem[]>([]);
  const [hires, setHires] = React.useState<PrivateHire[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  
  const [showAddTrip, setShowAddTrip] = React.useState(false);
  const [showAddGallery, setShowAddGallery] = React.useState(false);
  const [showAddVan, setShowAddVan] = React.useState(false);
  const [selectedTrip, setSelectedTrip] = React.useState<Trip | null>(null);

  // Derived bookings for the "Bookings" tab
  const allBookings = React.useMemo(() => {
    const bookings: any[] = [];
    trips.forEach(trip => {
      trip.seats.forEach(seat => {
        if (seat.status !== 'available') {
          bookings.push({
            ...seat,
            tripDestination: trip.destination,
            tripDate: trip.date,
            tripId: trip.id
          });
        }
      });
    });
    return bookings.sort((a, b) => new Date(b.tripDate).getTime() - new Date(a.tripDate).getTime());
  }, [trips]);

  const handleApproveBooking = async (tripId: string, seatNumber: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const updatedSeats = trip.seats.map(s => 
      s.seatNumber === seatNumber ? { ...s, status: 'booked', paymentStatus: 'paid' } : s
    );

    try {
      await updateDoc(doc(db, 'trips', tripId), { seats: updatedSeats });
      toast.success(`Booking for Seat #${seatNumber} approved!`);
    } catch (error) {
      toast.error('Failed to approve booking');
    }
  };

  const handleCancelBooking = async (tripId: string, seatNumber: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const updatedSeats = trip.seats.map(s => 
      s.seatNumber === seatNumber ? { ...s, status: 'available', userName: '', userPhone: '', userId: '', bookedAt: null } : s
    );

    try {
      await updateDoc(doc(db, 'trips', tripId), { seats: updatedSeats });
      toast.success(`Booking for Seat #${seatNumber} cancelled`);
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleManualBook = async (tripId: string, seatNumber: number) => {
    const name = prompt('Enter Passenger Name:');
    const phone = prompt('Enter Passenger Phone:');
    if (!name || !phone) return;

    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const updatedSeats = trip.seats.map(s => 
      s.seatNumber === seatNumber ? { 
        ...s, 
        status: 'booked', 
        userName: name, 
        userPhone: phone, 
        paymentStatus: 'paid',
        bookedAt: new Date().toISOString()
      } : s
    );

    try {
      await updateDoc(doc(db, 'trips', tripId), { seats: updatedSeats });
      toast.success(`Manual booking for Seat #${seatNumber} successful!`);
    } catch (error) {
      toast.error('Failed to book seat');
    }
  };

  React.useEffect(() => {
    const unsubTrips = onSnapshot(query(collection(db, 'trips'), orderBy('date', 'asc')), (snap) => {
      setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() } as Trip)));
    });
    const unsubVans = onSnapshot(query(collection(db, 'vans')), (snap) => {
      setVans(snap.docs.map(d => ({ id: d.id, ...d.data() } as Van)));
    });
    const unsubGallery = onSnapshot(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), (snap) => {
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));
    });
    const unsubHires = onSnapshot(query(collection(db, 'privateHires'), orderBy('createdAt', 'desc')), (snap) => {
      setHires(snap.docs.map(d => ({ id: d.id, ...d.data() } as PrivateHire)));
    });
    const unsubMessages = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });

    return () => {
      unsubTrips(); unsubVans(); unsubGallery(); unsubHires(); unsubMessages();
    };
  }, []);

  // Cleanup expired pending seats (15 minutes)
  React.useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      for (const trip of trips) {
        let hasChanges = false;
        const updatedSeats = trip.seats.map(seat => {
          if (seat.status === 'pending' && seat.bookedAt) {
            const bookedAt = new Date(seat.bookedAt);
            const diff = (now.getTime() - bookedAt.getTime()) / 1000 / 60; // minutes
            if (diff > 15) {
              hasChanges = true;
              return { ...seat, status: 'available', userName: '', userPhone: '', userId: '', bookedAt: null };
            }
          }
          return seat;
        });

        if (hasChanges) {
          try {
            await updateDoc(doc(db, 'trips', trip.id), { seats: updatedSeats });
            console.log(`Cleaned up expired seats for trip ${trip.destination}`);
          } catch (error) {
            console.error('Failed to cleanup expired seats:', error);
          }
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [trips]);

  const handleAddTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTrip = {
      destination: formData.get('destination'),
      date: formData.get('date'),
      pricePerSeat: Number(formData.get('price')),
      vanId: formData.get('vanId'),
      seats: Array.from({ length: 11 }, (_, i) => ({
        seatNumber: i + 1,
        status: 'available',
      })),
    };
    try {
      await addDoc(collection(db, 'trips'), newTrip);
      setShowAddTrip(false);
      toast.success('Trip created successfully!');
    } catch (error) { toast.error('Failed to create trip'); }
  };

  const handleAddGallery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await addDoc(collection(db, 'gallery'), {
        title: formData.get('title'),
        category: formData.get('category'),
        url: formData.get('url'),
        createdAt: new Date().toISOString(),
      });
      setShowAddGallery(false);
      toast.success('Image added to gallery!');
    } catch (error) { toast.error('Failed to add image'); }
  };

  const handleAddVan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await addDoc(collection(db, 'vans'), {
        name: formData.get('name'),
        status: 'active',
      });
      setShowAddVan(false);
      toast.success('Van added to fleet!');
    } catch (error) { toast.error('Failed to add van'); }
  };

  const updateHireStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'privateHires', id), { status });
      toast.success('Status updated');
    } catch (error) { toast.error('Update failed'); }
  };

  const deleteItem = async (col: string, id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, col, id));
        toast.success('Deleted successfully');
      } catch (error) { toast.error('Delete failed'); }
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all",
        activeTab === id ? "bg-safari-orange text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-display font-bold text-safari-grey flex items-center space-x-3">
          <LayoutDashboard className="w-8 h-8 text-safari-orange" />
          <span>Admin Dashboard</span>
        </h1>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border overflow-x-auto">
          <TabButton id="trips" label="Trips" icon={Calendar} />
          <TabButton id="bookings" label="Bookings" icon={Users} />
          <TabButton id="fleet" label="Fleet" icon={Bus} />
          <TabButton id="gallery" label="Gallery" icon={ImageIcon} />
          <TabButton id="hires" label="Hires" icon={Briefcase} />
          <TabButton id="messages" label="Messages" icon={MessageSquare} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'trips' && (
          <motion.div key="trips" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Scheduled Trips</h2>
              <button onClick={() => setShowAddTrip(true)} className="btn-primary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>New Trip</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.map(trip => (
                <div key={trip.id} className="card p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{trip.destination}</h3>
                    <p className="text-sm text-gray-500">{format(new Date(trip.date), 'PPP p')}</p>
                    <div className="mt-2 flex items-center space-x-3">
                      <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">
                        {trip.seats.filter(s => s.status === 'booked').length}/11 Seats
                      </span>
                      <span className="text-xs font-bold text-safari-green">KES {trip.pricePerSeat}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setSelectedTrip(trip)} className="p-2 text-safari-green hover:bg-safari-green/10 rounded-lg"><Eye className="w-5 h-5" /></button>
                    <button onClick={() => deleteItem('trips', trip.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'bookings' && (
          <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                Pending Payments
              </h2>
              <div className="card overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-xs uppercase text-gray-400">
                      <th className="px-6 py-4">Passenger</th>
                      <th className="px-6 py-4">Trip</th>
                      <th className="px-6 py-4">Seat</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allBookings.filter(b => b.status === 'pending').map((booking, idx) => (
                      <tr key={idx} className="hover:bg-yellow-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold">{booking.userName}</p>
                          <p className="text-xs text-gray-500">{booking.userPhone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{booking.tripDestination}</p>
                          <p className="text-xs text-gray-500">{format(new Date(booking.tripDate), 'PP')}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-yellow-600">#{booking.seatNumber}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleApproveBooking(booking.tripId, booking.seatNumber)}
                              className="p-2 bg-safari-green text-white rounded-lg hover:bg-safari-green/90 transition-colors"
                              title="Approve Payment"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleCancelBooking(booking.tripId, booking.seatNumber)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="Cancel Reservation"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allBookings.filter(b => b.status === 'pending').length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No pending payments</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <div className="w-2 h-2 bg-safari-green rounded-full mr-2"></div>
                Confirmed Bookings
              </h2>
              <div className="card overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-xs uppercase text-gray-400">
                      <th className="px-6 py-4">Passenger</th>
                      <th className="px-6 py-4">Trip</th>
                      <th className="px-6 py-4">Seat</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allBookings.filter(b => b.status === 'booked').map((booking, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold">{booking.userName}</p>
                          <p className="text-xs text-gray-500">{booking.userPhone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{booking.tripDestination}</p>
                          <p className="text-xs text-gray-500">{format(new Date(booking.tripDate), 'PP')}</p>
                        </td>
                        <td className="px-6 py-4 font-bold">#{booking.seatNumber}</td>
                        <td className="px-6 py-4">
                          <span className="bg-safari-green/10 text-safari-green px-2 py-1 rounded text-[10px] font-bold uppercase">Paid</span>
                        </td>
                      </tr>
                    ))}
                    {allBookings.filter(b => b.status === 'booked').length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No confirmed bookings</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'fleet' && (
          <motion.div key="fleet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Fleet Management</h2>
              <button onClick={() => setShowAddVan(true)} className="btn-primary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Van</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vans.map(van => (
                <div key={van.id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-safari-green/10 rounded-xl flex items-center justify-center">
                      <Bus className="w-6 h-6 text-safari-green" />
                    </div>
                    <button onClick={() => deleteItem('vans', van.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <h3 className="font-bold text-lg">{van.name}</h3>
                  <p className={cn("text-sm font-bold mt-1", van.status === 'active' ? "text-safari-green" : "text-red-500")}>
                    {van.status === 'active' ? "Operational" : "Maintenance"}
                  </p>
                  <button 
                    onClick={async () => {
                      await updateDoc(doc(db, 'vans', van.id), { status: van.status === 'active' ? 'maintenance' : 'active' });
                    }}
                    className="mt-4 w-full py-2 rounded-lg border-2 text-xs font-bold hover:bg-gray-50"
                  >
                    Toggle Status
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'gallery' && (
          <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gallery Management</h2>
              <button onClick={() => setShowAddGallery(true)} className="btn-primary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Image</span>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map(item => (
                <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-md">
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-white text-xs font-bold mb-2">{item.title}</p>
                    <button onClick={() => deleteItem('gallery', item.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'hires' && (
          <motion.div key="hires" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <h2 className="text-xl font-bold">Private Hire Requests</h2>
            <div className="space-y-4">
              {hires.map(hire => (
                <div key={hire.id} className="card p-6 flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        hire.status === 'pending' ? "bg-yellow-100 text-yellow-700" : 
                        hire.status === 'confirmed' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {hire.status}
                      </span>
                      <span className="text-xs text-gray-400">{format(new Date(hire.createdAt), 'PP')}</span>
                    </div>
                    <h3 className="font-bold text-lg">{hire.pickupPoint} → {hire.destination}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div><p className="text-gray-400 text-xs">Departure</p><p className="font-medium">{format(new Date(hire.departureDate), 'PP')}</p></div>
                      <div><p className="text-gray-400 text-xs">Vans</p><p className="font-medium">{hire.numVans} (11-Seaters)</p></div>
                      <div><p className="text-gray-400 text-xs">User ID</p><p className="font-medium truncate max-w-[100px]">{hire.userId}</p></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateHireStatus(hire.id, 'confirmed')} className="p-2 text-safari-green hover:bg-safari-green/10 rounded-lg" title="Confirm"><CheckCircle className="w-6 h-6" /></button>
                    <button onClick={() => updateHireStatus(hire.id, 'cancelled')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Cancel"><XCircle className="w-6 h-6" /></button>
                    <button onClick={() => deleteItem('privateHires', hire.id)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'messages' && (
          <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <h2 className="text-xl font-bold">Contact Messages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {messages.map(msg => (
                <div key={msg.createdAt} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold">{msg.name}</h3>
                      <p className="text-xs text-safari-orange">{msg.email}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">{format(new Date(msg.createdAt), 'PP p')}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-700 mb-2">{msg.subject}</p>
                  <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg italic">"{msg.message}"</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showAddTrip && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold mb-6">Create New Trip</h3>
              <form onSubmit={handleAddTrip} className="space-y-4">
                <div><label className="block text-sm font-bold mb-1">Destination</label><input name="destination" required className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange" placeholder="e.g. Mombasa" /></div>
                <div><label className="block text-sm font-bold mb-1">Date & Time</label><input name="date" type="datetime-local" required className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange" /></div>
                <div><label className="block text-sm font-bold mb-1">Price per Seat (KES)</label><input name="price" type="number" required className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange" placeholder="3500" /></div>
                <div>
                  <label className="block text-sm font-bold mb-1">Assign Van</label>
                  <select name="vanId" required className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange">
                    {vans.filter(v => v.status === 'active').map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setShowAddTrip(false)} className="flex-1 py-3 rounded-lg border font-bold">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary py-3">Create Trip</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddGallery && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold mb-6">Add to Gallery</h3>
              <form onSubmit={handleAddGallery} className="space-y-4">
                <div><label className="block text-sm font-bold mb-1">Image Title</label><input name="title" required className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange" placeholder="e.g. Sunset in Mombasa" /></div>
                <div>
                  <label className="block text-sm font-bold mb-1">Category</label>
                  <select name="category" required className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange">
                    <option value="Fleet">Fleet</option>
                    <option value="Tours">Tours</option>
                    <option value="Team">Team</option>
                  </select>
                </div>
                <div><label className="block text-sm font-bold mb-1">Image URL</label><input name="url" required className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange" placeholder="https://..." /></div>
                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setShowAddGallery(false)} className="flex-1 py-3 rounded-lg border font-bold">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary py-3">Add Image</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddVan && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold mb-6">Add New Van</h3>
              <form onSubmit={handleAddVan} className="space-y-4">
                <div><label className="block text-sm font-bold mb-1">Van Name/Plate</label><input name="name" required className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange" placeholder="e.g. KDA 123X" /></div>
                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setShowAddVan(false)} className="flex-1 py-3 rounded-lg border font-bold">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary py-3">Add Van</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {selectedTrip && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b flex justify-between items-center bg-safari-grey text-white">
                <div><h3 className="text-xl font-bold">Passenger Manifest</h3><p className="text-sm opacity-80">{selectedTrip.destination} - {format(new Date(selectedTrip.date), 'PPP')}</p></div>
                <button onClick={() => setSelectedTrip(null)} className="p-2 hover:bg-white/10 rounded-full"><XCircle className="w-6 h-6" /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                <table className="w-full text-left">
                  <thead><tr className="text-xs uppercase text-gray-400 border-b"><th className="pb-2">Seat</th><th className="pb-2">Name</th><th className="pb-2">Phone</th><th className="pb-2">Status</th><th className="pb-2">Action</th></tr></thead>
                  <tbody className="divide-y">
                    {selectedTrip.seats.map(seat => (
                      <tr key={seat.seatNumber} className="text-sm">
                        <td className="py-3 font-bold">#{seat.seatNumber}</td>
                        <td className="py-3">{seat.userName || '-'}</td>
                        <td className="py-3">{seat.userPhone || '-'}</td>
                        <td className="py-3">
                          <span className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase",
                            seat.status === 'booked' ? "bg-safari-green/10 text-safari-green" : 
                            seat.status === 'pending' ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-400"
                          )}>
                            {seat.status === 'booked' ? 'Paid' : seat.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {seat.status === 'available' ? (
                            <button 
                              onClick={() => handleManualBook(selectedTrip.id, seat.seatNumber)}
                              className="text-xs font-bold text-safari-orange hover:underline"
                            >
                              Manual Book
                            </button>
                          ) : seat.status === 'pending' ? (
                            <div className="flex space-x-2">
                              <button onClick={() => handleApproveBooking(selectedTrip.id, seat.seatNumber)} className="text-safari-green"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => handleCancelBooking(selectedTrip.id, seat.seatNumber)} className="text-red-500"><XCircle className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => handleCancelBooking(selectedTrip.id, seat.seatNumber)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
