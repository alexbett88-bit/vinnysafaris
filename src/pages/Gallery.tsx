import React from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  url: string;
  seed?: string;
}

const STATIC_IMAGES = [
  { id: '1', title: 'Our Modern Fleet', category: 'Fleet', url: 'https://lh3.googleusercontent.com/d/1kSAiISGaIMxEznkecltsLP-aLmvBEi8N' },
  { id: '10', title: 'Safari Adventure', category: 'Tours', url: 'https://lh3.googleusercontent.com/d/1YUZZ8-lIzQA2kknaA8-qeLH5OPAsx_aI' },
  { id: '11', title: 'Fleet Showcase', category: 'Fleet', url: 'https://lh3.googleusercontent.com/d/1Pj5Zsbpi1b2_rb8ZxqLcARZItRNBMJD6' },
  { id: '12', title: 'Interior Comfort', category: 'Fleet', url: 'https://lh3.googleusercontent.com/d/1CENiV9X-jLPUf_Kbj1WPiqmEcAlQVjrG' },
  { id: '13', title: 'On the Road', category: 'Fleet', url: 'https://lh3.googleusercontent.com/d/1P8NK9a-AVA0N-X2P24DGTD28DkbbeRYj' },
  { id: '14', title: 'Scenic Route', category: 'Tours', url: 'https://lh3.googleusercontent.com/d/1nHn92KOQc4Y1A1L3rHxQt93EpSyoUTFI' },
  { id: '15', title: 'Group Excursion', category: 'Tours', url: 'https://lh3.googleusercontent.com/d/1drMZO8wpdVvArNJO8CopswpYTSuj5pm7' },
  { id: '16', title: 'Safari Moments', category: 'Tours', url: 'https://lh3.googleusercontent.com/d/1vUaG7ErHHDGQWVGZztHaeoOQ-PLygUjq' },
  { id: '17', title: 'Coastal Trip', category: 'Tours', url: 'https://lh3.googleusercontent.com/d/1Rfm0sjijd7fyG1FL8TQYp42MqAmoG806' },
  { id: '18', title: 'Our Professional Team', category: 'Team', url: 'https://lh3.googleusercontent.com/d/1BVyAkgFjeYcHR2gZ3eY7fDCXrmTUQmWV' },
];

export default function Gallery() {
  const [images, setImages] = React.useState<GalleryItem[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedImages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
      if (fetchedImages.length > 0) {
        setImages(fetchedImages);
      } else {
        setImages(STATIC_IMAGES);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-display font-bold text-safari-grey mb-4">Our Gallery</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Take a look at our modern fleet and some of the incredible memories we've created with our travelers across Kenya.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group relative h-72 overflow-hidden rounded-2xl shadow-lg"
          >
            <img 
              src={img.url || `https://picsum.photos/seed/${img.seed}/800/600`} 
              alt={img.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-safari-dark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <span className="text-safari-yellow text-xs font-bold uppercase tracking-widest mb-1">{img.category}</span>
              <h3 className="text-white font-bold text-lg">{img.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
