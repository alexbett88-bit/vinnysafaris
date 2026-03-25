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
    <div className="card group hover:shadow-2xl transition-all duration-300 active:scale-[0.98]">
      <div className="relative h-40 md:h-48 overflow-hidden">
        <img
          src={`/images/van-rubis.jpg`}
          alt={trip.destination}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${trip.destination}/600/400`;
          }}
        />
        <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-safari-red text-white px-3 py-1 rounded-full text-xs md:sm font-bold shadow-lg">
          KES {trip.pricePerSeat.toLocaleString()}
        </div>
      </div>
      
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-1 group-hover:text-safari-orange transition-colors">
              {trip.destination}
            </h3>
            <div className="flex items-center text-gray-500 text-xs md:text-sm">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span>Eldama Ravine Departure</span>
            </div>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-4 md:mb-6 space-x-4">
          <div className="flex items-center text-xs md:text-sm">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-2 text-safari-green" />
            <span>{format(new Date(trip.date), 'MMM dd')}</span>
          </div>
          <div className="flex items-center text-xs md:text-sm">
            <Users className="w-3 h-3 md:w-4 md:h-4 mr-2 text-safari-green" />
            <span>{totalSeats - bookedSeats} Left</span>
          </div>
        </div>

        <div className="mb-4 md:mb-6">
          <div className="flex justify-between text-[10px] md:text-xs font-bold mb-1 uppercase tracking-wider text-gray-400">
            <span>Progress</span>
            <span>{bookedSeats}/{totalSeats}</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 md:h-2 rounded-full overflow-hidden border border-gray-200">
            <div 
              className="vinny-gradient h-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <Link 
          to={`/book/${trip.id}`}
          className="w-full btn-secondary py-3 md:py-2 flex items-center justify-center group/btn text-sm md:text-base"
        >
          <span>Book Now</span>
          <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
