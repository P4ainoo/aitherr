
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BookingModal from './components/BookingModal';
import BookedTripCard from './components/BookedTripCard';
import PlannerForm from './components/PlannerForm';
import DetailedPlanView from './components/DetailedPlanView';
import LandingPage from './components/LandingPage';
import ChatAssistant from './components/ChatAssistant';
import SafetyGuide from './components/SafetyGuide';
import TimeTravel from './components/TimeTravel';
import CollaborativeSession from './components/CollaborativeSession';
import { Destination, Booking, DetailedPlan } from './types';
import { getDetailedPlan } from './services/geminiService';
import { ArrowPathIcon, BriefcaseIcon, SparklesIcon, ShieldCheckIcon, GlobeAltIcon, UsersIcon } from './components/icons/Icons';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user, addBooking, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'timetravel' | 'planner' | 'safety' | 'collaborate'>('timetravel');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [detailedPlan, setDetailedPlan] = useState<DetailedPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDestination, setBookingDestination] = useState<Destination | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkApiKey();

    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');
    if (sessionParam) {
      setSessionId(sessionParam);
      setActiveTab('collaborate');
    }
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerateDetailedPlan = async (country: string, hobbies: string[], budget: number, startDate: string, endDate: string, departurePlace: string) => {
    setIsLoading(true);
    setError(null);
    setDetailedPlan(null);

    try {
      const plan = await getDetailedPlan(country, hobbies, budget, startDate, endDate, departurePlace);
      setDetailedPlan(plan);
    } catch (err) {
      setError('Failed to generate your detailed plan. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async (details: { name: string; email: string }) => {
    if (bookingDestination) {
      const newBooking: Booking = {
        bookingId: `${bookingDestination.name}-${new Date().getTime()}`,
        destination: bookingDestination,
        ...details,
      };
      
      if (user) {
        await addBooking(newBooking);
      }
    }
  };
  
  const initiateCollaboration = async () => {
    if (!detailedPlan) return;
    try {
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: detailedPlan })
      });
      const data = await response.json();
      const newSessionId = data.sessionId;
      
      // Update URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.set('session', newSessionId);
      window.history.pushState({}, '', url);
      
      setSessionId(newSessionId);
      setActiveTab('collaborate');
    } catch (err) {
      console.error('Failed to create session', err);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const WelcomeMessage = () => (
    <div className="text-center p-12 bg-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl max-w-3xl mx-auto mt-10 border border-white/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-secondary to-yellow-300"></div>
      <GlobeAltIcon className="w-16 h-16 text-brand-secondary/80 mx-auto mb-6" />
      <h2 className="text-4xl font-bold text-white mb-4">Welcome to Aither, {user.name}!</h2>
      <p className="text-white/80 text-xl leading-relaxed font-light">
        Your dashboard for sustainable adventure planning.
      </p>
      <div className="flex justify-center space-x-4 mt-8">
        <button 
          onClick={() => setActiveTab('timetravel')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'timetravel' ? 'bg-brand-secondary text-brand-dark shadow-[0_0_15px_rgba(255,193,7,0.4)]' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}
        >
          Time Travel
        </button>
        <button 
          onClick={() => setActiveTab('planner')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'planner' ? 'bg-brand-secondary text-brand-dark shadow-[0_0_15px_rgba(255,193,7,0.4)]' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}
        >
          Custom Planner
        </button>
      </div>
    </div>
  );
  
  const ErrorDisplay = () => (
    <div className="text-center p-8 bg-red-50 rounded-2xl shadow-lg max-w-2xl mx-auto mt-10 border border-red-200">
      <h3 className="text-2xl font-bold text-red-800 mb-3">Oops! Something went wrong.</h3>
      <p className="text-red-700 mb-6">{error}</p>
      <button
        onClick={() => activeTab === 'timetravel' ? null : null}
        className="bg-brand-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-dark transition-all flex items-center mx-auto shadow-lg shadow-brand-primary/20"
      >
        <ArrowPathIcon className="w-5 h-5 mr-2" />
        Try Again
      </button>
    </div>
  );

  const bookedTrips = user.bookedTrips || [];

  return (
    <div className="min-h-screen font-sans text-white relative pb-32">
      {/* Immersive Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2518]/65 via-[#07130c]/35 to-[#030906]/70 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        
        {!hasApiKey && (
          <div className="bg-red-500/90 text-white p-4 text-center backdrop-blur-md sticky top-0 z-50">
            <p className="font-bold inline-block mr-4">
              A paid Gemini API Key is required for high-quality image generation.
            </p>
            <button 
              onClick={handleSelectApiKey}
              className="bg-white text-red-600 px-4 py-1 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              Select API Key
            </button>
          </div>
        )}

        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex flex-col items-center mb-6">
            {/* Main view screens depending on tab */}
            {activeTab === 'timetravel' && (
              <TimeTravel />
            )}
            
            {activeTab === 'planner' && (
              <PlannerForm onPlan={handleGenerateDetailedPlan} isLoading={isLoading} />
            )}
            
            {activeTab === 'safety' && (
              <SafetyGuide />
            )}
            
            {activeTab === 'collaborate' && sessionId && (
              <CollaborativeSession sessionId={sessionId} />
            )}
          </div>
          
          <div className="mt-6">
            {error && <ErrorDisplay />}
            
            {activeTab === 'planner' && detailedPlan && !isLoading && (
              <DetailedPlanView plan={detailedPlan} onInitiateCollaboration={initiateCollaboration} />
            )}
          </div>

          {bookedTrips.length > 0 && (
            <section className="mt-20 pt-12 border-t border-white/5">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center">
                  <BriefcaseIcon className="w-8 h-8 mr-3 text-[#FFCC00]" />
                  My Adventures
                </h2>
                <p className="text-white/60 font-light text-sm">Your journey of learning and discovery</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bookedTrips.map((trip: any) => (
                  <BookedTripCard key={trip.bookingId} booking={trip} />
                ))}
              </div>
            </section>
          )}
        </main>

        <footer className="text-center py-8 text-white/30 text-xs border-t border-white/5 mb-16 md:mb-20">
          <p className="mb-1">Powered by AI for a sustainable world.</p>
          <p>Aither &copy; {new Date().getFullYear()}</p>
        </footer>

        {bookingDestination && (
           <BookingModal 
            destination={bookingDestination}
            onClose={() => setBookingDestination(null)}
            onConfirm={handleConfirmBooking}
          />
        )}
        
        {activeTab !== 'collaborate' && (
          <ChatAssistant currentPlan={detailedPlan} onUpdatePlan={setDetailedPlan} />
        )}

        {/* Fixed Premium Glassmorphic Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#09100a]/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-4 pb-[calc(10px+env(safe-area-inset-bottom,12px))] pt-3 md:pb-5">
          <div className="max-w-md mx-auto flex items-center justify-around gap-1.5">
            <button
              onClick={() => { setActiveTab('timetravel'); setDetailedPlan(null); }}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 gap-1.5 ${activeTab === 'timetravel' ? 'bg-[#FFCC00] text-black font-extrabold shadow-lg shadow-yellow-500/10' : 'text-white/60 hover:text-white'}`}
            >
              <ArrowPathIcon className={`w-5 h-5 shrink-0 ${activeTab === 'timetravel' ? 'text-black' : 'text-white/60'}`} />
              <span className="text-[10px] md:text-xs">Time Travel</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('planner'); setDestinations([]); }}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 gap-1.5 ${activeTab === 'planner' ? 'bg-[#FFCC00] text-black font-extrabold shadow-lg shadow-yellow-500/10' : 'text-white/60 hover:text-white'}`}
            >
              <SparklesIcon className={`w-5 h-5 shrink-0 ${activeTab === 'planner' ? 'text-black' : 'text-white/60'}`} />
              <span className="text-[10px] md:text-xs">Custom Planner</span>
            </button>

            <button
              onClick={() => { setActiveTab('safety'); setDestinations([]); setDetailedPlan(null); }}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 gap-1.5 ${activeTab === 'safety' ? 'bg-[#FFCC00] text-black font-extrabold shadow-lg shadow-yellow-500/10' : 'text-white/60 hover:text-white'}`}
            >
              <ShieldCheckIcon className={`w-5 h-5 shrink-0 ${activeTab === 'safety' ? 'text-black' : 'text-white/60'}`} />
              <span className="text-[10px] md:text-xs">Safety Guide</span>
            </button>

            {sessionId && (
              <button
                onClick={() => setActiveTab('collaborate')}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 gap-1.5 ${activeTab === 'collaborate' ? 'bg-[#FFCC00] text-black font-extrabold shadow-lg shadow-yellow-500/10' : 'text-white/60 hover:text-white'}`}
              >
                <UsersIcon className={`w-5 h-5 shrink-0 ${activeTab === 'collaborate' ? 'text-black' : 'text-white/60'}`} />
                <span className="text-[10px] md:text-xs">Group Session</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default App;
