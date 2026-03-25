import React from 'react';
import { motion } from 'motion/react';
import { Seat } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VanSeatMapProps {
  seats: Seat[];
  onSeatClick: (seatNumber: number) => void;
  selectedSeat: number | null;
}

export default function VanSeatMap({ seats, onSeatClick, selectedSeat }: VanSeatMapProps) {
  // 11-seater layout:
  // Row 0: Seat 1 (Left), Seat 2 (Middle) | Driver (Right)
  // Row 1: Seat 3, 4, 5
  // Row 2: Seat 6, 7, 8
  // Row 3: Seat 9, 10, 11 (Back Row)

  const getSeatStatus = (seatNumber: number) => {
    const seat = seats.find((s) => s.seatNumber === seatNumber);
    if (!seat) return 'available';
    return seat.status;
  };

  const SeatIcon = ({ number }: { number: number }) => {
    const status = getSeatStatus(number);
    const isSelected = selectedSeat === number;

    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => status === 'available' && onSeatClick(number)}
        disabled={status !== 'available'}
        className={cn(
          "w-14 h-14 md:w-12 md:h-12 rounded-xl md:rounded-lg flex items-center justify-center text-sm md:text-xs font-bold transition-all shadow-sm border-2",
          status === 'available' && !isSelected && "bg-white border-gray-200 text-gray-600 hover:border-safari-green",
          status === 'available' && isSelected && "bg-safari-green border-safari-green text-white",
          status === 'pending' && "bg-yellow-400 border-yellow-500 text-white cursor-not-allowed",
          status === 'booked' && "bg-red-500 border-red-600 text-white cursor-not-allowed"
        )}
      >
        {number}
      </motion.button>
    );
  };

  return (
    <div className="bg-gray-100 p-6 rounded-3xl border-4 border-gray-300 max-w-[340px] mx-auto relative shadow-inner">
      {/* Front Section */}
      <div className="flex justify-between mb-8 px-2">
        <div className="flex space-x-3 md:space-x-2">
          <SeatIcon number={1} />
          <SeatIcon number={2} />
        </div>
        <div className="w-14 h-14 md:w-12 md:h-12 bg-gray-400 rounded-xl md:rounded-lg flex items-center justify-center text-white text-[10px] opacity-50">
          Driver
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-5 md:space-y-4">
        {/* Row 1 */}
        <div className="flex justify-between px-2">
          <SeatIcon number={3} />
          <SeatIcon number={4} />
          <SeatIcon number={5} />
        </div>
        {/* Row 2 */}
        <div className="flex justify-between px-2">
          <SeatIcon number={6} />
          <SeatIcon number={7} />
          <SeatIcon number={8} />
        </div>
        {/* Back Row */}
        <div className="flex justify-between px-2">
          <SeatIcon number={9} />
          <SeatIcon number={10} />
          <SeatIcon number={11} />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-wider">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-safari-green rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}
