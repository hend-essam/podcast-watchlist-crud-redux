import { useState } from "react";
import Star from "../icons/Star";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
}

const StarRating = ({ value, onChange, size = 32 }: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`p-1 focus:outline-none rounded-full ${
            (hoverRating || value) >= star
              ? "bg-yellow-100 border-2 border-yellow-400"
              : "border-2 border-transparent"
          }`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
        >
          <div style={{ width: size, height: size }}>
            <Star
              fill={(hoverRating || value) >= star ? "#F9B618" : "none"}
              stroke="#F9B618"
              className="transition-colors duration-200"
            />
          </div>
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {value ? `${value} star${value !== 1 ? "s" : ""}` : "Not rated"}
      </span>
    </div>
  );
};

export default StarRating;
