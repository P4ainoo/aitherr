
import React, { useState } from 'react';
import { Destination, Feedback } from '../types';
import { CheckBadgeIcon, SparklesIcon, TicketIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon, StarIcon } from './icons/Icons';
import StarRating from './StarRating';

interface DestinationCardProps {
  destination: Destination;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onBook: () => void;
  feedback?: Feedback;
  onFeedbackSubmit: (feedback: Feedback) => void;
}

const SustainabilityMeter: React.FC<{ score: number }> = ({ score }) => {
  const getMeterColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
      <div
        className={`${getMeterColor()} h-2.5 rounded-full`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
  );
};

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, isHovered, onMouseEnter, onMouseLeave, onBook, feedback, onFeedbackSubmit }) => {
  const randomImageId = Math.floor(Math.random() * 1000);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmitFeedback = () => {
    if (rating > 0) {
      onFeedbackSubmit({ rating, comment });
      setShowFeedbackForm(false);
    }
  };
  
  return (
    <div 
      className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] ${isHovered ? 'scale-[1.02] ring-2 ring-brand-secondary' : 'hover:scale-[1.02]'}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      >
      <img className="w-full h-48 object-cover opacity-90" src={`https://picsum.photos/id/${randomImageId}/400/300`} alt={destination.name} />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-white mb-2">{destination.name}</h3>
        <p className="text-white/70 mb-4 flex-grow font-light">{destination.description}</p>
        
        <div className="mt-auto">
          <div className="mb-4">
            <div className="flex justify-between items-center text-sm font-semibold text-white/80">
                <span>Sustainability Score</span>
                <span className={`font-bold ${destination.sustainabilityScore >= 80 ? 'text-emerald-400' : destination.sustainabilityScore >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>{destination.sustainabilityScore}/100</span>
            </div>
            <SustainabilityMeter score={destination.sustainabilityScore} />
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-white mb-2 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-brand-secondary" />
              Learning Opportunities
            </h4>
            <ul className="list-none space-y-2">
              {destination.learningOpportunities.map((opp, index) => (
                <li key={index} className="flex items-start text-sm text-white/70 font-light">
                  <CheckBadgeIcon className="w-5 h-5 mr-2 text-brand-secondary flex-shrink-0 mt-0.5" />
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6 bg-white/5 border border-white/10 p-4 rounded-xl">
            {feedback ? (
              <div>
                <h4 className="font-bold text-white mb-2">Your Feedback</h4>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-5 h-5 ${i < feedback.rating ? 'text-brand-secondary' : 'text-white/20'}`} fill="currentColor" />
                  ))}
                </div>
                {feedback.comment && <p className="text-sm text-white/60 italic font-light">"{feedback.comment}"</p>}
              </div>
            ) : showFeedbackForm ? (
              <div className="space-y-3">
                <h4 className="font-bold text-white">Rate this recommendation</h4>
                <StarRating rating={rating} onRatingChange={setRating} />
                 <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Optional: Tell us why..."
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-brand-secondary outline-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                   <button onClick={() => setShowFeedbackForm(false)} className="text-sm text-white/60 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                   <button onClick={handleSubmitFeedback} disabled={rating === 0} className="text-sm bg-brand-secondary text-brand-dark font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors">
                     <PaperAirplaneIcon className="w-4 h-4 mr-1.5" />
                     Submit
                   </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowFeedbackForm(true)} className="w-full text-sm text-brand-secondary font-semibold p-2 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                Leave Feedback
              </button>
            )}
          </div>

          <button 
            onClick={onBook}
            className="w-full bg-brand-secondary text-brand-dark font-bold py-4 px-4 rounded-xl flex items-center justify-center hover:bg-yellow-400 transition-all transform hover:scale-[1.02] shadow-[0_0_15px_rgba(255,193,7,0.3)]"
          >
            <TicketIcon className="w-6 h-6 mr-2" />
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
