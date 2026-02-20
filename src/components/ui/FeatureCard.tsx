import React from 'react';

interface FeatureCardProps {
  title?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  image?: string;
  aspect?: 'square' | 'video' | 'portrait';
  noZoom?: boolean;
  // FIXED: Added onClick to the interface
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  image, 
  aspect = 'square', 
  className = "",
  noZoom = false,
  onClick // Added here
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  };

  const boxStyles = "group overflow-hidden rounded-[2rem] border border-gray-100 bg-white transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-gray-200";

  return (
    /* FIXED: Applied onClick to the wrapper div */
    <div 
      className={`${boxStyles} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {image && (
        <img 
          src={image} 
          alt={title || "Feature"}
          className={`w-full h-full object-cover transition-transform duration-700 ${!noZoom ? 'group-hover:scale-105' : ''} ${aspectClasses[aspect]}`}
        />
      )}

      {!image && (
        <div className="p-6 flex items-start gap-4">
          {icon && (
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green">
              {icon}
            </div>
          )}
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
              {title}
            </h4>
            {description && (
              <p className="text-sm font-bold text-brand-dark leading-snug">
                {description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;