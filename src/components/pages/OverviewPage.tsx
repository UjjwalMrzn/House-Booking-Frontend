import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { propertyService } from '../../api/propertyService';
import { getIcon } from '../../utils/iconMap';
import AmenityItem from '../ui/AmenityItem';
import FeatureCard from '../ui/FeatureCard';
import { 
  Users, Bed, Bath, ChevronRight, Clock, ShieldCheck, 
  Info, MapPin 
} from 'lucide-react';
import DatePicker from '../ui/DatePicker';
import GuestSelector from '../ui/GuestSelector';
import Button from '../ui/Button';
import { useState } from 'react';
import { format } from 'date-fns';

const OverviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyDetails(id || '3'),
    enabled: !!id,
  });

  if (isLoading) return <div className="pt-40 text-center font-bold text-gray-400 uppercase tracking-widest">Loading...</div>;
  if (error) return <div className="pt-40 text-center text-red-500 font-bold uppercase">Connection Error</div>;

  const displayImages = property.images?.slice(0, 6) || [];

  const formatDescription = (text: string) => {
    if (!text) return null;
    return text.split('.').map((sentence, index) => 
      sentence.trim() ? (
        <span key={index} className="block mb-1">
          {sentence.trim()}.
        </span>
      ) : null
    );
  };

  return (
    <main className="pt-24 bg-white min-h-screen font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        <div className="grid lg:grid-cols-3 gap-16 items-start">
          
          <div className="lg:col-span-2 space-y-16">
            <section id="description">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">
                <MapPin size={14} /> {property.address}
              </div>
              <h1 className="text-4xl font-extrabold mb-6 capitalize text-gray-900">{property.title}</h1>
              
              <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-500 mb-8 pb-8 border-b border-gray-100">
                <span className="flex items-center gap-2"><Users size={18} className="text-brand-green"/> {property.max_guests} Guests</span>
                <span className="flex items-center gap-2"><Bed size={18} className="text-brand-green"/> {property.bedrooms} Bedrooms</span>
                <span className="flex items-center gap-2"><Bath size={18} className="text-brand-green"/> {property.bathroom} Bathrooms</span>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed">{property.description}</p>
            </section>

            <section id="pictures">
              <h2 className="text-2xl font-bold mb-8">Pictures</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayImages.map((img: any) => (
                  <FeatureCard key={img.id} image={img.image} />
                ))}
              </div>
              {property.images?.length > 6 && (
                <button className="mt-8 text-brand-green font-bold text-sm hover:underline flex items-center gap-1">
                  Explore all pictures ({property.images.length - 6} more) <ChevronRight size={16}/>
                </button>
              )}
            </section>

            <section id="amenities" className="pt-12 border-t border-gray-100">
              <h2 className="text-2xl font-bold mb-8">Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                {property.amenities?.length > 0 ? (
                  property.amenities.map((amenity: any, index: number) => (
                    <AmenityItem 
                      key={index}
                      icon={getIcon(amenity.icon) || <Info size={20}/>} 
                      label={amenity.name} 
                      value={amenity.description} 
                    />
                  ))
                ) : (
                  <div className="text-gray-400 italic text-sm">No specific amenities listed.</div>
                )}
              </div>
            </section>

            <section className="pt-12 border-t border-gray-100 pb-20">
              <h2 className="text-2xl font-bold mb-10">Policy and notes</h2>
              <div className="grid md:grid-cols-2 gap-16">
                {property.checkInOutRules?.length > 0 && (
                  <div className="space-y-6">
                     <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                      <Clock size={18} className="text-brand-green"/> Schedule
                    </h4>
                     <div className="space-y-2 text-sm text-gray-500 font-bold">
                       {property.checkInOutRules.map((rule: any, index: number) => (
                         <div key={index} className="space-y-1">
                           <p>Check in: {rule.check_in}</p>
                           <p>Check out: {rule.check_out}</p>
                         </div>
                       ))}
                     </div>
                  </div>
                )}

                {property.policies?.length > 0 && (
                  property.policies.map((policy: any, index: number) => (
                    <div key={index} className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-brand-green"/> {policy.name}
                      </h4>
                      <div className="text-sm text-gray-500 leading-relaxed font-bold">
                        {formatDescription(policy.description)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1 sticky top-32">
            <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-2xl shadow-gray-100">
              <div className="mb-6">
                <span className="text-3xl font-black text-gray-900">${property.base_price_per_night}</span>
                <span className="text-gray-400 font-bold text-sm ml-1">/ night</span>
              </div>
              <div className="space-y-4">
                <DatePicker 
                  value={{ checkIn, checkOut }}
                  onChange={(range: any) => {
                    setCheckIn(range?.from ? format(range.from, 'yyyy-MM-dd') : '');
                    setCheckOut(range?.to ? format(range.to, 'yyyy-MM-dd') : '');
                  }}
                />
                <GuestSelector value={guests} onChange={setGuests} />
              </div>
              <Button 
                onClick={() => navigate(`/book/${id || '3'}?checkin=${checkIn}&checkout=${checkOut}&guests=${guests}`)}
                className="w-full h-16 bg-brand-green text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-green-100 mt-8 hover:bg-emerald-600 transition-all"
              >
                Book Now
              </Button>
              <div className="mt-6 text-center">
                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No charge yet</span>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
};

export default OverviewPage;