import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onHover?: (rating: number) => void;
  onClick?: (rating: number) => void;
}

const StarRating = ({ rating, size = 14, interactive = false, onHover, onClick }: StarRatingProps) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          onMouseEnter={() => interactive && onHover && onHover(star)}
          onClick={() => interactive && onClick && onClick(star)}
          className={`transition-colors ${interactive ? 'cursor-pointer' : ''} ${
            star <= rating ? "fill-brand-green text-brand-green" : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
};

export default StarRating;