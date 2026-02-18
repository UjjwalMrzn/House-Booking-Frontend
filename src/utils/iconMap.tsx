import { Wifi, PawPrint, Users, Bed, Bath, Car, Tv, Utensils, Globe } from 'lucide-react';

export const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    wifi: <Wifi size={20} />,
    pet: <PawPrint size={20} />,
    users: <Users size={20} />,
    bed: <Bed size={20} />,
    bath: <Bath size={20} />,
    car: <Car size={20} />,
    tv: <Tv size={20} />,
    kitchen: <Utensils size={20} />,
    globe: <Globe size={20} />,
  };
  return icons[iconName.toLowerCase()] || <Globe size={20} />;
};