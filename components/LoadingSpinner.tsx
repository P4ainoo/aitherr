
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-10">
      <div className="w-16 h-16 border-4 border-brand-primary border-t-brand-secondary rounded-full animate-spin"></div>
      <p className="mt-4 text-brand-dark font-semibold">Finding amazing destinations for you...</p>
    </div>
  );
};

export default LoadingSpinner;
