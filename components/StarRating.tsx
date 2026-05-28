
import React, { useState } from 'react';
import { StarIcon } from './icons/Icons';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            type="button"
            className="focus:outline-none"
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
          >
            <StarIcon
              className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                starValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
