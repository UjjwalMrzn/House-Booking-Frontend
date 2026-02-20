import { Link } from 'react-router-dom';
import { Star, MapPin, Users } from 'lucide-react';
import Button from './Button';

interface PropertyCardProps {
  id: number;
  title: string;
  image: string;
  price: number;
  location: string;
  rating: number;
  guests: number;
}

const PropertyCard = ({ id, title, image, price, location, rating, guests }: PropertyCardProps) => {
  return (
    <div className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
          <Star size={12} className="fill-brand-green text-brand-green" />
          <span className="text-[10px] font-black text-brand-dark">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <MapPin size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{location}</span>
            </div>
            <h3 className="text-xl font-black text-brand-dark leading-tight">{title}</h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-brand-green">${price}</span>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ night</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Users size={14} />
            <span className="text-xs font-medium">{guests} Guests</span>
          </div>
        </div>

        <Link to={`/overview/${id}`}>
          <Button fullWidth variant="outline" className="group-hover:bg-brand-green group-hover:text-white group-hover:border-brand-green">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;