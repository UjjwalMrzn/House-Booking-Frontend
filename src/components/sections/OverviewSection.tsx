import SectionHeader from '../ui/SectionHeader';
import FeatureCard from '../ui/FeatureCard';
import { useQuery } from '@tanstack/react-query';
import { propertyService } from '../../api/propertyService';
import { DEFAULT_PROPERTY_ID } from '../../utils/constants';

const OverviewSection = () => {
  // Uses the actual Property's gallery, keeping it strictly separated from the Hero Banners
  const { data: property } = useQuery({
    queryKey: ['property-strict-overview', DEFAULT_PROPERTY_ID],
    queryFn: () => propertyService.getPropertyDetails(DEFAULT_PROPERTY_ID),
  });

  const propertyImages = property?.images?.filter((img: any) => !img.is_main) || [];
  
  const img1 = propertyImages[0]?.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop";
  const img2 = propertyImages[1]?.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop";

  return (
    <section className="max-w-7xl mx-auto px-6 py-32">
      <div className="grid md:grid-cols-2 gap-20 items-center">
        
        <div className="space-y-10 animate-slide-up">
          <SectionHeader 
            subcite="The Haven Experience"
            title={
              <>
                Welcome to <br />
                <span className="italic text-slate-400 font-serif font-medium">{property?.title || "Jervis Bay Retreats"}</span>
              </>
            }
            description={property?.description || "Experience the ultimate coastal getaway. Designed for comfort and style, this elegant residence offers a private sanctuary for families, professionals, and discerning travellers."}
          />
          
          <div className="pt-4">
            <button className="group flex items-center gap-3 font-bold text-brand-dark hover:text-brand-green transition-all">
              <span className="border-b-2 border-brand-green/20 group-hover:border-brand-green pb-1 transition-all">
                Explore the Property
              </span>
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-all group-hover:translate-x-1 border border-gray-50">
                →
              </div>
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-6">
            <FeatureCard 
              image={img1} 
              className="mt-12 shadow-2xl shadow-gray-200/50"
            />
            <FeatureCard 
              image={img2} 
              className="mb-12 shadow-2xl shadow-gray-200/50"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
        </div>

      </div>
    </section>
  );
};

export default OverviewSection;