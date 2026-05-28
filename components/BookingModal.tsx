
import React, { useState, useEffect } from 'react';
import { Destination } from '../types';
import { CheckCircleIcon, XMarkIcon } from './icons/Icons';

interface BookingModalProps {
  destination: Destination;
  onClose: () => void;
  onConfirm: (details: { name: string; email: string }) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ destination, onClose, onConfirm }) => {
  const [bookingStep, setBookingStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when modal opens for a new destination
    setBookingStep('form');
    setName('');
    setEmail('');
    setFormError(null);
  }, [destination]);

  const handleConfirmBooking = () => {
    if (!name.trim() || !email.trim()) {
      setFormError('Please fill in both your name and email.');
      return;
    }
    // Simple email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        setFormError('Please enter a valid email address.');
        return;
    }

    setFormError(null);
    onConfirm({ name, email });
    setBookingStep('success');
  };
  
  useEffect(() => {
    // Automatically close the modal after showing the success message
    let timer: NodeJS.Timeout;
    if (bookingStep === 'success') {
      timer = setTimeout(() => {
        onClose();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [bookingStep, onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md transform transition-transform duration-300 scale-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {bookingStep === 'form' && (
          <>
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-bold text-white">Book Your Trip</h2>
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-lg text-white/80 mb-6 font-light">You're booking a trip to <span className="font-bold text-brand-secondary">{destination.name}</span> to learn <span className="font-bold text-brand-secondary">{destination.skill}</span>!</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    placeholder="Jane Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:bg-white/10 transition-all" 
                   />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="jane.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:bg-white/10 transition-all"
                  />
                </div>
              </div>
              {formError && <p className="text-sm text-red-400 mt-4 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{formError}</p>}
            </div>
            <div className="px-6 py-4 bg-black/20 flex justify-end space-x-3 border-t border-white/10">
              <button onClick={onClose} className="px-5 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors">Cancel</button>
              <button onClick={handleConfirmBooking} className="px-5 py-2.5 bg-brand-secondary text-brand-dark font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(255,193,7,0.3)]">Confirm Booking</button>
            </div>
          </>
        )}

        {bookingStep === 'success' && (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-500/20 p-4 rounded-full mb-6 border border-emerald-500/30">
              <CheckCircleIcon className="w-16 h-16 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">Booking Confirmed!</h3>
            <p className="text-white/80 font-light text-lg">Your amazing learning adventure to <span className="font-bold text-brand-secondary">{destination.name}</span> is all set.</p>
            <p className="text-sm text-white/50 mt-6">This window will close automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
