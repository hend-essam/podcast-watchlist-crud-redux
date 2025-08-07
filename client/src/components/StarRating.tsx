import { useState } from "react";
import Star from "../icons/Star";

interface StarRatingProps {
  rating?: number;
  value?: number;
  onRatingChange?: (rating: number) => void;
  onChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
  showLabel?: boolean;
}

const StarRating = ({
  rating,
  value,
  onRatingChange,
  onChange,
  size = 20,
  readOnly = false,
  showLabel = true,
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const currentRating = rating ?? value ?? 0;
  const handleRatingChange = onRatingChange ?? onChange;

  const renderStar = (star: number) => {
    const isActive = (hoverRating || currentRating) >= star;

    const starElement = (
      <div
        className={`p-1 rounded-full transition-colors ${
          isActive
            ? "border-2 border-yellow-400 bg-yellow-50"
            : "border-2 border-gray-300"
        }`}
      >
        <div style={{ width: size, height: size }}>
          <Star
            fill={isActive ? "#F9B618" : "none"}
            stroke="#F9B618"
            className="transition-colors duration-200"
          />
        </div>
      </div>
    );

    if (readOnly || !handleRatingChange) {
      return (
        <div key={star} className="cursor-default">
          {starElement}
        </div>
      );
    }

    return (
      <button
        key={star}
        type="button"
        className="focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-full"
        onClick={() => handleRatingChange(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
      >
        {starElement}
      </button>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(renderStar)}
      {showLabel && (
        <span className="ml-2 text-sm text-gray-600">
          {currentRating
            ? `${currentRating} star${currentRating !== 1 ? "s" : ""}`
            : "Not rated"}
        </span>
      )}
    </div>
  );
};

export default StarRating;
