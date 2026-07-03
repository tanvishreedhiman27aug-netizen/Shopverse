import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded overflow-hidden shadow-myntra animate-pulse flex flex-col justify-between">
      {/* Image box placeholder */}
      <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-800 w-full" />

      {/* Info details placeholder */}
      <div className="p-4 space-y-3">
        {/* Brand placeholder */}
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        {/* Title placeholder */}
        <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-4/5" />
        {/* Pricing placeholder */}
        <div className="flex gap-2 pt-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/6" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
