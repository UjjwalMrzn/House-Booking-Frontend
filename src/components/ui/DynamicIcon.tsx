import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 18, className = "" }) => {
  // We look up the icon by its string name. If it doesn't exist, fallback to ListChecks
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.ListChecks;
  
  return <IconComponent size={size} className={className} />;
};

export default DynamicIcon;