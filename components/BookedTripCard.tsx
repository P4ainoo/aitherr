
import React from 'react';
import { Booking } from '../types';
import { SKILLS } from '../constants';
import { CheckCircleIcon } from './icons/Icons';

interface BookedTripCardProps {
  booking: Booking;
}

const BookedTripCard: React.FC<BookedTripCardProps> = ({ booking }) => {
  const { destination, name } = booking;
  const skillInfo = SKILLS.find(s => s.name === destination.skill);
  const SkillIcon = skillInfo?.icon || 'div';
  const randomImageId = Math.floor(Math.random() * 200); // Different image range for variety

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
      <div className="relative">
        <img className="w-full h-40 object-cover opacity-90" src={`https://picsum.photos/id/${randomImageId + 1000}/400/300`} alt={destination.name} />
        <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            BOOKED
        </div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4 w-full">
            <h3 className="text-white text-xl font-bold">{destination.name}</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center mb-4">
            <div className="p-3 bg-white/10 rounded-xl mr-4 border border-white/20">
                <SkillIcon className="w-6 h-6 text-brand-secondary" />
            </div>
            <div>
                <p className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1">Learning Skill</p>
                <p className="font-bold text-white">{destination.skill}</p>
            </div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1">Traveler</p>
            <p className="font-semibold text-white">{name}</p>
        </div>
      </div>
    </div>
  );
};

export default BookedTripCard;
