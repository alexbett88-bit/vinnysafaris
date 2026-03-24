import React from 'react';
import { Trip } from '../types';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const bookedSeats = trip.seats.filter((s) => s.status === 'booked').length;
  const totalSeats = 11;
  const progress = (bookedSeats / totalSeats) * 100;

  return (
    <div className="card group hover:shadow-2xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={`/images/van-rubis.jpg`}
          alt={trip.destination}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${trip.destination}/600/400`;
          }}
        />
        <div className="absolute top-4 right-4 bg-safari-red text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          KES {trip.pricePerSeat.toLocaleString()}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-safari-orange transition-colors">
              {trip.destination}
            </h3>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Eldama Ravine Departure</span>
            </div>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-6 space-x-4">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-safari-green" />
            <span>{format(new Date(trip.date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-2 text-safari-green" />
            <span>{totalSeats - bookedSeats} Left</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider text-gray-400">
            <span>Booking Progress</span>
            <span>{bookedSeats}/{totalSeats} Seats</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
            <div 
              className="vinny-gradient h-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <Link 
          to={`/book/${trip.id}`}
          className="w-full btn-secondary flex items-center justify-center group/btn"
        >
          <span>Book Now</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
