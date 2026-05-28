import React, { useState } from 'react';
import { SafetyAdvisory } from '../types';
import { getSafetyAdvisories } from '../services/geminiService';
import SafetyMap from './SafetyMap';
import { ShieldCheckIcon, MapPinIcon, SparklesIcon } from './icons/Icons';

const SafetyGuide: React.FC = () => {
  const [location, setLocation] = useState('');
  const [advisories, setAdvisories] = useState<SafetyAdvisory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredAdvisory, setHoveredAdvisory] = useState<SafetyAdvisory | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;

    setIsLoading(true);
    setError('');
    setAdvisories([]);

    try {
      const results = await getSafetyAdvisories(location);
      setAdvisories(results);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch safety advisories.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
          <ShieldCheckIcon className="w-10 h-10 mr-4 text-red-500" />
          Travel Safety Guide
        </h2>
        <p className="text-white/60 font-light max-w-2xl mx-auto">
          Stay informed about potential risks. Enter a destination to see safety advisories and areas to avoid.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl p-8 border border-white/20 mb-12 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter a city or country (e.g., Paris, Mexico City)"
              className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white/10 outline-none transition-all text-white placeholder-white/40"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Check Safety'
            )}
          </button>
        </form>
        {error && (
          <p className="text-red-400 mt-4 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
            {error}
          </p>
        )}
      </div>

      {advisories.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-hidden h-[350px] lg:h-[600px] relative">
               <SafetyMap 
                 advisories={advisories} 
                 hoveredAdvisory={hoveredAdvisory} 
                 onHoverAdvisory={setHoveredAdvisory} 
               />
            </div>
          </div>
          
          <div className="space-y-4 h-[400px] lg:h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-xl font-bold text-white mb-4 sticky top-0 bg-[#1a1a1a]/90 backdrop-blur-md p-4 rounded-xl z-10 border border-white/10">
              Safety Advisories ({advisories.length})
            </h3>
            {advisories.map((advisory) => (
              <div 
                key={advisory.locationName}
                onMouseEnter={() => setHoveredAdvisory(advisory)}
                onMouseLeave={() => setHoveredAdvisory(null)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  hoveredAdvisory?.locationName === advisory.locationName 
                    ? 'bg-white/10 border-red-500/50 transform scale-[1.02]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-lg">{advisory.locationName}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    advisory.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    advisory.severity === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {advisory.severity} Risk
                  </span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  {advisory.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyGuide;
