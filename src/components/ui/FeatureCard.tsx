import React from 'react';

interface FeatureCardProps {
  // Common Props
  title?: string;
  description?: string;
  className?: string;
  
  // Variant 1: Icon (for Amenities)
  icon?: React.ReactNode;
  
  // Variant 2: Image (for Gallery/Features)
  image?: string;
  aspect?: 'square' | 'video' | 'portrait';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  image, 
  aspect = 'square', 
  className = "" 
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  };

  // The "Universal Box" CSS - Defined ONCE here
  const boxStyles = "group overflow-hidden rounded-[2rem] border border-gray-100 bg-white transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-gray-200";

  return (
    <div className={`${boxStyles} ${className}`}>
      {/* IMAGE VARIANT */}
      {image && (
        <img 
          src={image} 
          alt={title || "Feature"}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${aspectClasses[aspect]}`}
        />
      )}

      {/* ICON/TEXT VARIANT (Amenities) */}
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