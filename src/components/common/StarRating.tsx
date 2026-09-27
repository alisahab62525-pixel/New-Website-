import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewsCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewsCount,
  size = 'sm',
  showNumber = true,
}) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half = !filled && rating >= star - 0.5;

          return (
            <Star
              key={star}
              className={`${iconSize} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-stone-300 dark:text-stone-700'
              }`}
            />
          );
        })}
      </div>

      {showNumber && (
        <span className="text-xs font-semibold tabular-nums text-stone-800 dark:text-stone-200">
          {rating.toFixed(1)}
        </span>
      )}

      {reviewsCount !== undefined && (
        <span className="text-xs text-stone-400 dark:text-stone-500">
          ({reviewsCount})
        </span>
      )}
    </div>
  );
};
