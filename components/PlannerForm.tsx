import React, { useState } from 'react';
import { MapPinIcon, SparklesIcon, CurrencyDollarIcon, CalendarIcon } from './icons/Icons';

interface PlannerFormProps {
  onPlan: (country: string, hobbies: string[], budget: number, startDate: string, endDate: string, departurePlace: string) => void;
  isLoading: boolean;
}

const PlannerForm: React.FC<PlannerFormProps> = ({ onPlan, isLoading }) => {
  const [country, setCountry] = useState('');
  const [departurePlace, setDeparturePlace] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [budget, setBudget] = useState<number>(1500);
  
  // Default to 1 week from now
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 7);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultEnd.getDate() + 7);

  const [startDate, setStartDate] = useState(defaultStart.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!country || !hobbies || !startDate || !endDate || !departurePlace) return;
    const hobbyList = hobbies.split(',').map(h => h.trim()).filter(h => h !== '');
    onPlan(country, hobbyList, budget, startDate, endDate, departurePlace);
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl p-5 md:p-12 border border-white/20 max-w-2xl mx-auto w-full">
      <h3 className="text-3xl font-bold text-white mb-8 flex items-center justify-center">
        <SparklesIcon className="w-8 h-8 mr-3 text-brand-secondary" />
        Custom Adventure Planner
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1 text-brand-secondary" />
              Where are you flying from?
            </label>
            <input
              type="text"
              value={departurePlace}
              onChange={(e) => setDeparturePlace(e.target.value)}
              placeholder="e.g. New York, London, Tokyo..."
              className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:bg-white/10 outline-none transition-all text-white placeholder-white/40"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1 text-brand-secondary" />
              Where do you want to go?
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Japan, France, Costa Rica..."
              className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:bg-white/10 outline-none transition-all text-white placeholder-white/40"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            What are your hobbies? (comma separated)
          </label>
          <textarea
            value={hobbies}
            onChange={(e) => setHobbies(e.target.value)}
            placeholder="e.g. Photography, Hiking, Cooking, Surfing..."
            className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:bg-white/10 outline-none transition-all h-32 resize-none text-white placeholder-white/40"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
              <CurrencyDollarIcon className="w-4 h-4 mr-1 text-brand-secondary" />
              Total Budget ($)
            </label>
            <input
              type="number"
              min="100"
              step="100"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
              className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:bg-white/10 outline-none transition-all text-white placeholder-white/40"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1 text-brand-secondary" />
              Departure Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:bg-white/10 outline-none transition-all text-white placeholder-white/40"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1 text-brand-secondary" />
              Return Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:bg-white/10 outline-none transition-all text-white placeholder-white/40"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-secondary text-brand-dark font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,193,7,0.3)] flex items-center justify-center text-lg mt-8"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin mr-2"></div>
              Planning your dream trip...
            </>
          ) : (
            'Generate Detailed Plan'
          )}
        </button>
      </form>
    </div>
  );
};

export default PlannerForm;
