import React, { useState } from 'react';
import { DetailedPlan } from '../types';
import { CheckCircleIcon, SparklesIcon, SunIcon, MoonIcon, ClockIcon, UtensilsIcon, TruckIcon, LanguageIcon, BriefcaseIcon, MapPinIcon, PaperAirplaneIcon, UsersIcon } from './icons/Icons';
import { useAuth } from '../contexts/AuthContext';

interface DetailedPlanViewProps {
  plan: DetailedPlan;
  onInitiateCollaboration?: () => void;
  isCollaborative?: boolean;
  onPlanUpdated?: (newPlan: DetailedPlan) => void;
}

const DetailedPlanView: React.FC<DetailedPlanViewProps> = ({ plan, onInitiateCollaboration, isCollaborative, onPlanUpdated }) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  const { user } = useAuth();

  const handleBookNow = async () => {
    if (!user) return;
    setIsSending(true);
    setSendError('');
    setSendSuccess(false);

    let htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #F27D26;">Your Aither Travel Itinerary</h1>
        <p>Hello ${user.name || 'Traveler'},</p>
        <p>Here is your detailed travel itinerary for <strong>${plan.country}</strong> (${plan.startDate} to ${plan.endDate}).</p>
        
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #F27D26; padding-bottom: 5px;">Flight Information</h2>
        <ul>
          <li><strong>Airline:</strong> ${plan.flightDetails.airline}</li>
          <li><strong>Route:</strong> ${plan.flightDetails.route}</li>
          <li><strong>Estimated Price:</strong> ${plan.flightDetails.estimatedPrice}</li>
        </ul>
        <a href="https://www.google.com/flights?q=${encodeURIComponent(plan.flightDetails.route)}" style="display: inline-block; background-color: #F27D26; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Book Flights</a>

        <h2 style="color: #1a1a1a; border-bottom: 2px solid #F27D26; padding-bottom: 5px; margin-top: 30px;">Accommodation</h2>
        <ul>
          <li><strong>Hotel:</strong> ${plan.hotelDetails.name}</li>
          <li><strong>Location:</strong> ${plan.hotelDetails.location}</li>
          <li><strong>Price per night:</strong> ${plan.hotelDetails.estimatedPricePerNight}</li>
        </ul>
        <a href="https://www.google.com/travel/hotels?q=${encodeURIComponent(plan.hotelDetails.name + ' ' + plan.hotelDetails.location)}" style="display: inline-block; background-color: #F27D26; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Book Hotel</a>

        <h2 style="color: #1a1a1a; border-bottom: 2px solid #F27D26; padding-bottom: 5px; margin-top: 30px;">Itinerary</h2>
    `;

    plan.itinerary.forEach(day => {
      htmlBody += `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="margin-top: 0; color: #F27D26;">Day ${day.day} (${day.date}): ${day.title}</h3>
          <p><strong>Morning (${day.morning.time}):</strong> ${day.morning.activity} at ${day.morning.location}</p>
          <p><strong>Afternoon (${day.afternoon.time}):</strong> ${day.afternoon.activity} at ${day.afternoon.location}</p>
          <p><strong>Evening (${day.evening.time}):</strong> ${day.evening.activity} at ${day.evening.location}</p>
        </div>
      `;
    });

    htmlBody += `
        <p style="margin-top: 30px;">Safe travels!</p>
        <p><strong>- Aither AI Travel Assistant</strong></p>
      </div>
    `;

    try {
      const response = await fetch('/api/email/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, htmlBody })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send email');
      }

      setSendSuccess(true);
    } catch (err: any) {
      setSendError(err.message || 'An error occurred while sending the email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-white/5 p-6 md:p-8 text-white border-b border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-2">{plan.country}</h2>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {plan.hobbies.map((hobby) => (
                  <span key={hobby} className="bg-brand-secondary/20 border border-brand-secondary/30 text-brand-secondary px-2.5 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm">
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <SparklesIcon className="w-8 h-8 md:w-12 md:h-12 text-brand-secondary opacity-80" />
              {!isCollaborative && onInitiateCollaboration && (
                <button
                  onClick={onInitiateCollaboration}
                  className="bg-brand-secondary text-brand-dark px-4 py-2 flex items-center rounded-xl font-bold shadow-lg shadow-brand-secondary/30 hover:scale-105 transition-all text-sm md:text-base w-auto"
                >
                  <UsersIcon className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                  Co-plan
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8 space-y-8">
          <section>
            <h3 className="text-xl font-bold text-white mb-3">Trip Summary</h3>
            <p className="text-white/80 leading-relaxed font-light">{plan.summary}</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h4 className="text-sm font-bold text-brand-secondary uppercase tracking-wider mb-2">Estimated Budget</h4>
              <p className="text-lg font-bold text-white">{plan.estimatedBudget}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h4 className="text-sm font-bold text-brand-secondary uppercase tracking-wider mb-2">Best Time to Visit</h4>
              <p className="text-lg font-bold text-white">{plan.bestTimeToVisit}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Flight Details */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <h4 className="text-xl font-bold text-white mb-4 flex items-center">
            <PaperAirplaneIcon className="w-6 h-6 mr-2 text-brand-secondary transform -rotate-45" />
            Flight Information
          </h4>
          <div className="space-y-3 text-white/90 font-light">
            <p><span className="font-bold text-white">Airline:</span> {plan.flightDetails.airline}</p>
            <p><span className="font-bold text-white">Route:</span> {plan.flightDetails.route}</p>
            <p><span className="font-bold text-white">Estimated Price:</span> {plan.flightDetails.estimatedPrice}</p>
            <div className="mt-4 bg-brand-secondary/20 p-3 rounded-xl border border-brand-secondary/30">
              <p className="text-sm text-brand-secondary italic"><span className="font-bold">Tip:</span> {plan.flightDetails.bookingTip}</p>
            </div>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <h4 className="text-xl font-bold text-white mb-4 flex items-center">
            <BriefcaseIcon className="w-6 h-6 mr-2 text-brand-secondary" />
            Accommodation
          </h4>
          <div className="space-y-3 text-white/90 font-light">
            <p>
              <span className="font-bold text-white">Hotel:</span>{' '}
              <a 
                href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(plan.hotelDetails.name + ' ' + plan.hotelDetails.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-secondary hover:underline transition-colors"
                title="View photos on Google"
              >
                {plan.hotelDetails.name}
              </a>
            </p>
            <p className="flex items-start">
              <MapPinIcon className="w-4 h-4 mr-1 mt-1 flex-shrink-0 text-white/60" /> 
              <a 
                href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(plan.hotelDetails.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-secondary hover:underline transition-colors"
                title="View photos on Google"
              >
                {plan.hotelDetails.location}
              </a>
            </p>
            <p><span className="font-bold text-white">Price per night:</span> {plan.hotelDetails.estimatedPricePerNight}</p>
            <p className="text-sm mt-2">{plan.hotelDetails.description}</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto mt-16 pb-12">
        <h3 className="text-4xl font-bold text-white text-center mb-2">Your {plan.itinerary.length}-Day Itinerary</h3>
        <p className="text-center text-white/60 mb-16 text-lg">{plan.startDate} to {plan.endDate}</p>

        {/* Central Line */}
        <div className="absolute left-6 md:left-1/2 top-32 bottom-0 w-1 bg-white/10 transform md:-translate-x-1/2 rounded-full hidden md:block"></div>
        <div className="absolute left-5 top-32 bottom-0 w-1 bg-white/10 transform -translate-x-1/2 rounded-full md:hidden"></div>

        <div className="space-y-12">
          {plan.itinerary.map((day, index) => {
            const isEven = index % 2 !== 0;
            const isExpanded = expandedDay === day.day;

            return (
              <div key={`${day.day}-${index}`} className="relative flex flex-col md:flex-row w-full items-start">
                {/* Timeline Dot */}
                <div className={`absolute left-5 md:left-1/2 w-7 h-7 rounded-full border-4 border-[#1a1a1a] transform -translate-x-1/2 mt-6 z-10 transition-colors duration-300 ${isExpanded ? 'bg-brand-secondary shadow-[0_0_15px_rgba(255,193,7,0.6)]' : 'bg-white/30'}`}></div>

                {/* Card Wrapper */}
                <div className={`w-full pl-11 pr-2 md:px-0 md:w-1/2 flex flex-col ${isEven ? 'md:pl-12 md:ml-auto' : 'md:pr-12 md:mr-auto'}`}>
                  {/* Card */}
                  <div 
                    onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                    className={`bg-white/10 backdrop-blur-md rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden ${isExpanded ? 'border-brand-secondary/50 shadow-[0_8px_32px_rgba(255,193,7,0.15)]' : 'border-white/10 hover:border-white/30 hover:bg-white/15'}`}
                  >
                    {/* Summary Header */}
                    <div className="p-6 flex items-center justify-between">
                      <div>
                        <span className="text-brand-secondary font-bold tracking-wider uppercase text-sm mb-1 block">Day {day.day} • {day.date}</span>
                        <h4 className="text-xl font-bold text-white">{day.title}</h4>
                      </div>
                      <div className={`ml-4 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'text-brand-secondary rotate-180' : 'text-white/50 rotate-0'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="p-6 pt-0 border-t border-white/10 mt-2 space-y-6">
                          
                          {/* Sustainability Tip */}
                          <div className="bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 flex items-start">
                            <SparklesIcon className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-emerald-100/90 leading-relaxed">{day.sustainabilityTip}</span>
                          </div>

                          {/* Activities Timeline */}
                          <div className="relative pl-6 border-l-2 border-white/10 space-y-6 mt-6">
                            {/* Morning */}
                            <div className="relative">
                              <div className="absolute -left-[33px] bg-[#2a2a2a] p-1 rounded-full border border-white/20">
                                <SunIcon className="w-4 h-4 text-yellow-400" />
                              </div>
                              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center text-brand-secondary mb-1 text-xs font-bold uppercase tracking-wider">
                                  <ClockIcon className="w-3 h-3 mr-1" />
                                  {day.morning.time}
                                </div>
                                <p className="text-white font-bold mb-1">{day.morning.activity}</p>
                                <p className="text-white/70 font-light text-sm mb-2 leading-relaxed">{day.morning.description}</p>
                                <p className="text-white/40 text-xs flex items-center">
                                  <MapPinIcon className="w-3 h-3 mr-1" />
                                  <a 
                                    href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(day.morning.location)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-brand-secondary hover:underline transition-colors"
                                    title="View photos on Google"
                                  >
                                    {day.morning.location}
                                  </a>
                                </p>
                              </div>
                            </div>
                            {/* Afternoon */}
                            <div className="relative">
                              <div className="absolute -left-[33px] bg-[#2a2a2a] p-1 rounded-full border border-white/20">
                                <SunIcon className="w-4 h-4 text-orange-400" />
                              </div>
                              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center text-brand-secondary mb-1 text-xs font-bold uppercase tracking-wider">
                                  <ClockIcon className="w-3 h-3 mr-1" />
                                  {day.afternoon.time}
                                </div>
                                <p className="text-white font-bold mb-1">{day.afternoon.activity}</p>
                                <p className="text-white/70 font-light text-sm mb-2 leading-relaxed">{day.afternoon.description}</p>
                                <p className="text-white/40 text-xs flex items-center">
                                  <MapPinIcon className="w-3 h-3 mr-1" />
                                  <a 
                                    href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(day.afternoon.location)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-brand-secondary hover:underline transition-colors"
                                    title="View photos on Google"
                                  >
                                    {day.afternoon.location}
                                  </a>
                                </p>
                              </div>
                            </div>
                            {/* Evening */}
                            <div className="relative">
                              <div className="absolute -left-[33px] bg-[#2a2a2a] p-1 rounded-full border border-white/20">
                                <MoonIcon className="w-4 h-4 text-indigo-300" />
                              </div>
                              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center text-brand-secondary mb-1 text-xs font-bold uppercase tracking-wider">
                                  <ClockIcon className="w-3 h-3 mr-1" />
                                  {day.evening.time}
                                </div>
                                <p className="text-white font-bold mb-1">{day.evening.activity}</p>
                                <p className="text-white/70 font-light text-sm mb-2 leading-relaxed">{day.evening.description}</p>
                                <p className="text-white/40 text-xs flex items-center">
                                  <MapPinIcon className="w-3 h-3 mr-1" />
                                  <a 
                                    href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(day.evening.location)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-brand-secondary hover:underline transition-colors"
                                    title="View photos on Google"
                                  >
                                    {day.evening.location}
                                  </a>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Logistics */}
                          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/10">
                            {/* Dining */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                              <h5 className="text-brand-secondary font-bold mb-3 flex items-center text-xs uppercase tracking-wider">
                                <UtensilsIcon className="w-3 h-3 mr-2" />
                                Dining
                              </h5>
                              <ul className="space-y-2 text-sm">
                                <li className="flex flex-col">
                                  <span className="text-white/40 text-[10px] font-bold uppercase">Breakfast</span>
                                  <span className="text-white/80 font-light">{day.dining.breakfast}</span>
                                </li>
                                <li className="flex flex-col">
                                  <span className="text-white/40 text-[10px] font-bold uppercase">Lunch</span>
                                  <span className="text-white/80 font-light">{day.dining.lunch}</span>
                                </li>
                                <li className="flex flex-col">
                                  <span className="text-white/40 text-[10px] font-bold uppercase">Dinner</span>
                                  <span className="text-white/80 font-light">{day.dining.dinner}</span>
                                </li>
                              </ul>
                            </div>

                            {/* Transit */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                              <h5 className="text-brand-secondary font-bold mb-2 flex items-center text-xs uppercase tracking-wider">
                                <TruckIcon className="w-3 h-3 mr-2" />
                                Transit
                              </h5>
                              <p className="text-sm text-white/80 font-light">{day.transit}</p>
                            </div>

                            {/* Phrase */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                              <h5 className="text-brand-secondary font-bold mb-2 flex items-center text-xs uppercase tracking-wider">
                                <LanguageIcon className="w-3 h-3 mr-2" />
                                Phrase of the Day
                              </h5>
                              <p className="text-base font-bold text-white mb-1">"{day.phraseOfTheDay.phrase}"</p>
                              <p className="text-xs text-white/60 font-light italic">{day.phraseOfTheDay.meaning}</p>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Book Now Button */}
      <div className="flex flex-col items-center justify-center mt-12 mb-8">
        <button 
          onClick={handleBookNow}
          disabled={isSending || sendSuccess}
          className={`px-10 py-4 rounded-full font-bold text-lg transition-all flex items-center ${
            sendSuccess 
              ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
              : 'bg-brand-secondary text-brand-dark shadow-[0_0_20px_rgba(255,193,7,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,193,7,0.6)]'
          } disabled:opacity-70 disabled:hover:scale-100`}
        >
          {isSending ? (
            <div className="w-6 h-6 mr-3 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
          ) : sendSuccess ? (
            <CheckCircleIcon className="w-6 h-6 mr-3" />
          ) : (
            <PaperAirplaneIcon className="w-6 h-6 mr-3 transform -rotate-45" />
          )}
          {isSending ? 'Sending Email...' : sendSuccess ? 'Email Sent!' : 'Book Now & Email Itinerary'}
        </button>
        
        {sendError && (
          <p className="text-red-400 mt-4 text-sm font-medium bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
            {sendError}
          </p>
        )}
        {sendSuccess && (
          <p className="text-emerald-400 mt-4 text-sm font-medium bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
            Check your inbox! We've sent the full itinerary and booking links to {user?.email}.
          </p>
        )}
      </div>
    </div>
  );
};

export default DetailedPlanView;
