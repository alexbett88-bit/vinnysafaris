import { db } from '../firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

export const seedDatabase = async () => {
  try {
    // Check if already seeded
    const vanSnap = await getDocs(query(collection(db, 'vans'), limit(1)));
    if (!vanSnap.empty) {
      return { success: false, message: 'Database already has data' };
    }

    // 1. Add Vans
    const vanData = [
      { name: 'Safari Cruiser 01', status: 'active', capacity: 11 },
      { name: 'Safari Cruiser 02', status: 'active', capacity: 11 },
      { name: 'Safari Cruiser 03', status: 'maintenance', capacity: 11 },
    ];

    const vanIds: string[] = [];
    for (const van of vanData) {
      const docRef = await addDoc(collection(db, 'vans'), van);
      vanIds.push(docRef.id);
    }

    // 2. Add Trips
    const now = new Date();
    const tripData = [
      {
        destination: 'Mombasa Coastal Tour',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        pricePerSeat: 3500,
        vanId: vanIds[0],
        seats: Array.from({ length: 11 }, (_, i) => ({
          seatNumber: i + 1,
          status: 'available',
        })),
        imageUrl: 'https://images.unsplash.com/photo-1589197331516-4d8458bb8a5e?auto=format&fit=crop&q=80&w=800',
      },
      {
        destination: 'Maasai Mara Safari',
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        pricePerSeat: 5500,
        vanId: vanIds[1],
        seats: Array.from({ length: 11 }, (_, i) => ({
          seatNumber: i + 1,
          status: 'available',
        })),
        imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
      },
      {
        destination: 'Amboseli National Park',
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        pricePerSeat: 4800,
        vanId: vanIds[0],
        seats: Array.from({ length: 11 }, (_, i) => ({
          seatNumber: i + 1,
          status: 'available',
        })),
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800',
      }
    ];

    for (const trip of tripData) {
      await addDoc(collection(db, 'trips'), trip);
    }

    // 3. Add Admin User if not exists
    // Note: We use addDoc but ideally we'd use setDoc with a specific UID
    // For seeding purposes, we'll just add a record to the 'users' collection
    // The ProtectedRoute logic will check this collection
    await addDoc(collection(db, 'users'), {
      email: 'alexbett88@gmail.com',
      displayName: 'Alex Bett',
      role: 'admin',
      createdAt: now.toISOString(),
    });

    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, message: 'Failed to seed database' };
  }
};
