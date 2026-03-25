import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, Heart, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import TripCard from '../components/TripCard';
import { db } from '../firebase';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { Trip } from '../types';

export default function Home() {
  const [featuredTrips, setFeaturedTrips] = React.useState<Trip[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, 'trips'), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFeaturedTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip)));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://lh3.googleusercontent.com/d/1kSAiISGaIMxEznkecltsLP-aLmvBEi8N" 
            alt="Safari Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://picsum.photos/seed/safari-van/1920/1080?blur=2";
            }}
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="https://lh3.googleusercontent.com/d/1ogiO1Um4hOw4uCs6z9FOdHXUtixjDyQU" 
              alt="Vinny Safaris Logo" 
              className="w-64 md:w-96 h-auto object-contain mx-auto mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              referrerPolicy="no-referrer"
            />
            <span className="inline-block bg-safari-red px-4 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 shadow-lg shadow-safari-red/20">
              Adventure Awaits
            </span>
            <h1 className="text-4xl md:text-7xl font-display font-bold mb-4 md:mb-6 leading-tight">
              Experience Kenya with <span className="bg-gradient-to-r from-safari-red via-safari-yellow to-safari-green bg-clip-text text-transparent">Vinny Safaris</span>
            </h1>
            <p className="text-base md:text-xl text-gray-200 mb-8 md:mb-10 max-w-2xl mx-auto">
              From Eldama Ravine to the coast, we provide the most comfortable and secure 
              travel experience in our brand new 11-seater fleet.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
              <Link to="/trips" className="btn-primary w-full sm:w-auto text-lg px-10 py-4 sm:py-3">
                Book a Seat
              </Link>
              <Link to="/private-hire" className="bg-white text-safari-grey px-10 py-4 sm:py-3 rounded-lg font-bold hover:bg-gray-100 transition-all w-full sm:w-auto text-lg">
                Private Hire
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats / Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {[
          { icon: ShieldCheck, title: "Safety First", desc: "Our drivers are highly trained and our fleet is monitored 24/7 for your peace of mind." },
          { icon: Zap, title: "Modern Fleet", desc: "Travel in style with our brand new 11-seater vans equipped with AC and charging ports." },
          { icon: Heart, title: "Local Expertise", desc: "Born and raised in Baringo, we know the best routes and hidden gems across Kenya." }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card p-6 md:p-8 text-center group hover:border-safari-orange transition-all active:scale-[0.98]"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-safari-orange/10 rounded-2xl mb-4 md:mb-6 group-hover:bg-safari-orange group-hover:text-white transition-all">
              <item.icon className="w-7 h-7 md:w-8 md:h-8 text-safari-orange group-hover:text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{item.title}</h3>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Featured Trips */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-safari-grey">Upcoming Trips</h2>
            <p className="text-gray-500 mt-2">Join organized tours and share the fun with fellow travelers.</p>
          </div>
          <Link to="/trips" className="hidden md:flex items-center text-safari-orange font-bold hover:underline">
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTrips.map(trip => (
            <div key={trip.id}>
              <TripCard trip={trip} />
            </div>
          ))}
          {featuredTrips.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 italic">
              Loading amazing adventures...
            </div>
          )}
        </div>
      </section>

      {/* Adventure Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative h-[50vh] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
          <img 
            src="https://lh3.googleusercontent.com/d/1YUZZ8-lIzQA2kknaA8-qeLH5OPAsx_aI" 
            alt="Safari Adventure" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-safari-dark/80 via-safari-dark/40 to-transparent flex items-center p-8 md:p-16">
            <div className="max-w-xl text-white">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Create Unforgettable Memories</h2>
              <p className="text-lg text-gray-200 mb-8">
                Whether it's a family reunion, a school trip, or a solo adventure, 
                we ensure every mile is filled with joy and comfort.
              </p>
              <Link to="/contact" className="btn-primary inline-block">
                Start Planning
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Showcase */}
      <section className="bg-safari-grey text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Our New Ride</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              We've recently upgraded our fleet to ensure you travel in maximum comfort. 
              Our new 11-seater vans feature ergonomic seating, ample legroom, 
              and large windows for the perfect safari view.
            </p>
            <ul className="space-y-4">
              {['Air Conditioning', 'USB Charging Ports', 'First Aid Kit', 'Professional Driver'].map((feature, i) => (
                <li key={i} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-safari-orange rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src="https://lh3.googleusercontent.com/d/1CENiV9X-jLPUf_Kbj1WPiqmEcAlQVjrG" 
              alt="Vinny Safaris Fleet Interior" 
              className="rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://picsum.photos/seed/van-interior/800/600";
              }}
            />
            <div className="absolute -bottom-6 -left-6 bg-safari-orange p-6 rounded-2xl shadow-xl hidden md:block">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-xs uppercase font-bold tracking-widest opacity-80">Comfort Guaranteed</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
