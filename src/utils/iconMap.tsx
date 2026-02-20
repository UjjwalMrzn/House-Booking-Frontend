import React from 'react';
import { 
  Snowflake, 
  PawPrint, 
  SquareParking, 
  Wifi, 
  Tv, 
  Coffee,
  Waves,
  Flame,
  // Info 
} from 'lucide-react';

export const getIcon = (iconString: string): React.ReactNode | null => {
  if (!iconString) return null;

  // Standardize the backend string to lowercase to prevent matching errors (e.g., "Pet" vs "pet")
  const normalized = iconString.toLowerCase().trim();

  switch (normalized) {
    case 'ac':
    case 'air conditioning':
    case 'aircon':
      return <Snowflake size={20} />;
    
    case 'pet':
    case 'pets':
      return <PawPrint size={20} />;
    
    case 'park':
    case 'parking':
      return <SquareParking size={20} />;
      
    case 'wifi':
    case 'internet':
      return <Wifi size={20} />;
      
    case 'tv':
    case 'television':
    case 'cable':
      return <Tv size={20} />;
      
    case 'pool':
    case 'swimming pool':
      return <Waves size={20} />;
      
    case 'kitchen':
    case 'cooking':
      return <Coffee size={20} />;
      
    case 'heating':
    case 'heater':
      return <Flame size={20} />;

    // Add any other specific backend strings here as your app grows
      
    default:
      return null; // OverviewPage will fallback to <Info size={20} /> if null is returned
  }
};