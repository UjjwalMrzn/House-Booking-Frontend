interface FeatureCardProps {
  image: string;
  aspect?: 'square' | 'video' | 'portrait';
  className?: string;
}

const FeatureCard = ({ image, aspect = 'square', className = "" }: FeatureCardProps) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  };

  return (
    <div className={`rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200 ${className}`}>
      <img 
        src={image} 
        alt="Property feature"
        className={`w-full h-full object-cover ${aspectClasses[aspect]}`} // Zoom removed
      />
    </div>
  );
};

export default FeatureCard;