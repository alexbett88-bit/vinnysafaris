import React from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function Contact() {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await addDoc(collection(db, 'messages'), {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        createdAt: new Date().toISOString()
      });
      toast.success('Message sent! We will get back to you soon.');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-display font-bold text-safari-grey mb-4">Get in Touch</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Have questions about a trip or need a custom quote? We're here to help you plan your perfect journey.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="card p-8">
            <h3 className="text-xl font-bold mb-6">Contact Details</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-safari-red/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-safari-red" />
                </div>
                <div>
                  <h4 className="font-bold text-safari-dark">Phone</h4>
                  <p className="text-sm text-gray-500">
                    <a href="tel:+254729770411" className="hover:text-safari-red transition-colors">+254 729 770 411</a>
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-safari-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-safari-green" />
                </div>
                <div>
                  <h4 className="font-bold text-safari-dark">Email</h4>
                  <p className="text-sm text-gray-500">bookings@vinnysafaris.co.ke</p>
                  <p className="text-sm text-gray-500">info@vinnysafaris.co.ke</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-safari-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-safari-orange" />
                </div>
                <div>
                  <h4 className="font-bold text-safari-dark">Location</h4>
                  <p className="text-sm text-gray-500">Main Stage, Eldama Ravine</p>
                  <p className="text-sm text-gray-500">Baringo County, Kenya</p>
                </div>
              </div>
            </div>
          </div>

          <a 
            href="https://wa.me/254729770411" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-3 bg-[#25D366] text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-opacity-90 transition-all active:scale-95"
          >
            <MessageCircle className="w-6 h-6" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Map & Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card h-[400px] overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.434456578504!2d35.722222!3d0.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1780e55555555555%3A0x5555555555555555!2sEldama%20Ravine!5e0!3m2!1sen!2ske!4v1620000000000!5m2!1sen!2ske" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              title="Vinny Safaris Location"
            ></iframe>
          </div>

          <div className="card p-8">
            <h3 className="text-xl font-bold mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" required placeholder="Your Name" className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange" />
                <input name="email" required placeholder="Your Email" type="email" className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange" />
              </div>
              <input name="subject" required placeholder="Subject" className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange" />
              <textarea name="message" required placeholder="Message" rows={4} className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-safari-orange"></textarea>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
