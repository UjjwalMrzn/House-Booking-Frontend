import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { propertyService } from "../../api/propertyService";
import { bookingService } from "../../api/bookingApi"; 
import FeatureCard from "../ui/FeatureCard";
import DatePicker from "../ui/DatePicker";
import GuestSelector from "../ui/GuestSelector";
import Button from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { useToast } from "../ui/Toaster";
import { format, parseISO } from "date-fns"; 
import { Users, Bed, Bath, MapPin, BedSingle, ChevronDown, ChevronUp } from "lucide-react";
import DynamicIcon from "../ui/DynamicIcon";
import { holidayService } from "../../api/holidayService";

const OverviewPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || "");
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || "");
  
  const [adults, setAdults] = useState(() => {
    const adultsParam = searchParams.get('adults');
    if (adultsParam) return parseInt(adultsParam);
    const guestsParam = searchParams.get('guests');
    return guestsParam ? parseInt(guestsParam) : 1;
  });
  
  const [kids, setKids] = useState(() => {
    const kidsParam = searchParams.get('kids');
    return kidsParam ? parseInt(kidsParam) : 0;
  });

  const [activeTab, setActiveTab] = useState("description");
  const [hasShownError, setHasShownError] = useState(false);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllPolicies, setShowAllPolicies] = useState(false);

  const tabContainerRef = useRef<HTMLDivElement>(null);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["main-property"],
    queryFn: propertyService.getMainProperty,
  });

  const { data: bookedRanges = [] } = useQuery({
    queryKey: ["booked-dates", property?.id],
    queryFn: async () => {
      const bookings = await bookingService.getConfirmedBookings();
      return bookings
        .filter((b: any) => String(b.property) === String(property?.id))
        .map((b: any) => ({ from: parseISO(b.check_in), to: parseISO(b.check_out) }));
    },
    enabled: !!property?.id,
  });

  const { data: allHolidaysData } = useQuery({
    queryKey: ['admin-holidays', 'all'],
    queryFn: () => holidayService.getAllHolidays(1, 500),
  });

  const holidayDates = useMemo(() => {
    if (!allHolidaysData) return [];
    const list = Array.isArray(allHolidaysData) ? allHolidaysData : (allHolidaysData.results || []);
    return list.filter((h: any) => h.is_active).map((h: any) => parseISO(h.date));
  }, [allHolidaysData]);

  useEffect(() => {
    if (error && !hasShownError) {
      toast.error("Connection Error: Property not found");
      setHasShownError(true);
    }
    if (!error) setHasShownError(false);
  }, [error, toast, hasShownError]);

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: "description", label: "Description" },
      { id: "pictures", label: "Pictures" },
      { id: "amenities", label: "Amenities" },
    ];
    if (property?.policies?.length > 0 || property?.checkInOutRules?.length > 0) {
      baseTabs.push({ id: "policies", label: "Policy and notes" });
    }
    return baseTabs;
  }, [property]);

  useEffect(() => {
    if (tabContainerRef.current) {
      const activeBtn = tabContainerRef.current.querySelector(`button[data-tab-id="${activeTab}"]`) as HTMLButtonElement;
      if (activeBtn) {
        const scrollLeft = activeBtn.offsetLeft - tabContainerRef.current.clientWidth / 2 + activeBtn.clientWidth / 2;
        tabContainerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      if (isBottom && tabs.length > 0) {
        setActiveTab(tabs[tabs.length - 1].id);
        return;
      }
      const triggerPoint = window.innerHeight / 3;
      for (let i = tabs.length - 1; i >= 0; i--) {
        const section = document.getElementById(tabs[i].id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= triggerPoint) {
            setActiveTab(tabs[i].id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); 
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tabs]);

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId); 
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -140; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToBookingWidget = () => {
    const element = document.getElementById("booking-widget");
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const manageChatWidget = () => {
      if (window.innerWidth < 1024) {
        if ((window as any).Tawk_API?.hideWidget) {
          (window as any).Tawk_API.hideWidget();
        }
      } else {
        if ((window as any).Tawk_API?.showWidget) {
          (window as any).Tawk_API.showWidget();
        }
      }
    };

    const timeoutId = setTimeout(manageChatWidget, 1000);
    window.addEventListener('resize', manageChatWidget);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', manageChatWidget);
      if ((window as any).Tawk_API?.showWidget) {
        (window as any).Tawk_API.showWidget();
      }
    };
  }, []);

  const descriptionText = property?.description || "";
  const isDescriptionLong = descriptionText.length > 350;
  const displayDescription = isDescriptionLong && !showFullDescription 
    ? descriptionText.substring(0, 350) + "..." 
    : descriptionText;

  const amenitiesList = property?.amenities || [];
  const displayAmenities = showAllAmenities ? amenitiesList : amenitiesList.slice(0, 4);
  const hasMoreAmenities = amenitiesList.length > 4;

  const policiesList = property?.policies || [];
  const displayPolicies = showAllPolicies ? policiesList : policiesList.slice(0, 2);
  const hasMorePolicies = policiesList.length > 2; 

  return (
    <main className="pt-24 bg-white min-h-screen font-sans text-brand-dark animate-fade-in px-6 max-w-7xl mx-auto pb-32 lg:pb-20 relative">
      <div className="grid lg:grid-cols-3 gap-16 items-start">
        <div className="lg:col-span-2 space-y-16 min-w-0">
          {!isLoading && (
            <div className="relative sticky top-[80px] bg-white z-40 mb-12">
              <div 
                ref={tabContainerRef}
                className="flex items-center gap-8 border-b border-gray-200 pt-4 overflow-x-auto whitespace-nowrap scrollbar-hide"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    data-tab-id={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className={`pb-4 text-[15px] font-bold transition-all border-b-[3px] -mb-[1.5px] shrink-0 ${
                      activeTab === tab.id
                        ? "border-brand-green text-brand-dark"
                        : "border-transparent text-gray-400 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <section id="description">
            <div className="flex items-center gap-2 mb-4">
              {isLoading ? <Skeleton variant="text" className="w-32" /> : (
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  <MapPin size={14} /> {property?.address}
                </div>
              )}
            </div>

            <h1 className="text-4xl font-extrabold mb-6 tracking-tight">
              {isLoading ? <Skeleton variant="text" className="h-12 w-3/4" /> : property?.title}
            </h1>

           <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-gray-100">
              {isLoading ? (
                <>
                  <Skeleton variant="text" className="w-24" />
                  <Skeleton variant="text" className="w-24" />
                  <Skeleton variant="text" className="w-24" />
                  <Skeleton variant="text" className="w-24" />
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                    <Users size={18} className="text-brand-green" /> {property?.max_guests} Guests
                  </span>
                  <span className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                    <Bed size={18} className="text-brand-green" /> {property?.bedrooms} Bedrooms
                  </span>
                  <span className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                    <BedSingle size={18} className="text-brand-green" /> {property?.beds} Beds
                  </span>
                  <span className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                    <Bath size={18} className="text-brand-green" /> {property?.bathroom} Bathrooms
                  </span>
                </>
              )}
            </div>

            <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" className="w-2/3" />
                </div>
              ) : (
                <>
                  {displayDescription}
                  {isDescriptionLong && (
                    <button 
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-brand-dark font-bold text-sm flex items-center gap-1 mt-3 hover:text-brand-green transition-colors"
                    >
                      {showFullDescription ? "Show less" : "Read more"}
                      {showFullDescription ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                </>
              )}
            </div>
          </section>

          <section id="pictures">
            <h2 className="text-2xl font-bold mb-8 tracking-tight">
              {isLoading ? <Skeleton variant="text" className="w-32" /> : "Pictures"}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {isLoading
                ? [1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} variant="card" className="aspect-square" />)
                : property?.images?.slice(0, 6).map((img: any, index: number) => (
                    <FeatureCard 
                      key={img.id} 
                      image={img.image} 
                      noZoom={true} 
                      className="cursor-pointer"
                      onClick={() => navigate(`/gallery`, { state: { imageIndex: index } })}
                    />
                  ))}
            </div>

            {!isLoading && (
              <div className="mt-8">
                <button 
                  onClick={() => navigate(`/gallery`)}
                  className="text-brand-dark font-bold text-sm hover:text-brand-green transition-colors flex items-center gap-1"
                >
                  Explore all pictures
                </button>
              </div>
            )}
          </section>

          <section id="amenities" className="pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold mb-8 tracking-tight">
              {isLoading ? <Skeleton variant="text" className="w-32" /> : "Amenities"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading
                ? [1, 2, 3, 4].map((i) => <Skeleton key={i} variant="input" />)
                : displayAmenities.map((amenity: any, index: number) => (
                  <FeatureCard
                    key={index}
                    icon={<DynamicIcon name={amenity.icon || 'Info'} size={20} />} 
                    title={amenity.name}
                    description={amenity.description}
                  />
                ))}
            </div>
            {!isLoading && hasMoreAmenities && (
              <button 
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-6 border border-gray-900 rounded-lg px-6 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                {showAllAmenities ? "Show fewer amenities" : `Show all ${amenitiesList.length} amenities`}
              </button>
            )}
          </section>

          {(isLoading || property?.policies?.length > 0 || property?.checkInOutRules?.length > 0) && (
            <section id="policies" className="pt-12 border-t border-gray-100">
              <h2 className="text-2xl font-bold mb-8 tracking-tight">
                {isLoading ? <Skeleton variant="text" className="w-32" /> : "Policy and notes"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isLoading ? (
                  <>
                    <Skeleton variant="text" className="h-16" />
                    <Skeleton variant="text" className="h-16" />
                  </>
                ) : (
                  <>
                    {/* SURGICAL FIX: Tightened gap and container spacing for House Rules */}
                    {property?.checkInOutRules?.map((rule: any, idx: number) => (
                      <div key={`rule-${idx}`} className="space-y-1">
                        <h4 className="font-bold text-gray-900">House Rules</h4>
                        <div className="text-sm text-gray-500 flex flex-col">
                          <span>Check-in: {rule.check_in}</span>
                          <span>Check-out: {rule.check_out}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* SURGICAL FIX: Standardized line spacing by removing mb-2 and leading-relaxed */}
                    {displayPolicies.map((policy: any, index: number) => {
                      const sentences = policy.description?.split('.').filter((s: string) => s.trim().length > 0) || [];
                      return (
                        <div key={`policy-${index}`} className="space-y-1">
                          <h4 className="font-bold text-gray-900">{policy.name}</h4>
                          <div className="text-sm text-gray-500">
                            {sentences.map((s: string, i: number) => (
                                <span key={i} className="block">{s.trim()}.</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              
              {!isLoading && hasMorePolicies && (
                <button 
                  onClick={() => setShowAllPolicies(!showAllPolicies)}
                  className="text-brand-dark font-bold text-sm flex items-center gap-1 mt-6 hover:text-brand-green transition-colors"
                >
                  {showAllPolicies ? "Show fewer policies" : "View all policies"}
                  {showAllPolicies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </section>
          )}
        </div>

        <aside id="booking-widget" className="lg:col-span-1 sticky top-32">
          <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton variant="text" className="h-10 w-32" />
                <Skeleton variant="input" />
                <Skeleton variant="input" />
                <Skeleton variant="button" />
              </div>
            ) : (
              <>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-brand-dark">${property?.base_price_per_night}</span>
                  <span className="text-gray-400 font-bold text-sm mb-1">/ night</span>
                </div>
                
                <DatePicker
                  value={{ checkIn, checkOut }}
                  disabledDates={bookedRanges}
                  holidayDates={holidayDates}
                  onChange={(range: any) => {
                    setCheckIn(range?.from ? format(range.from, "yyyy-MM-dd") : "");
                    setCheckOut(range?.to ? format(range.to, "yyyy-MM-dd") : "");
                  }}
                />
                
                <GuestSelector 
                  adults={adults} 
                  kids={kids} 
                  onAdultsChange={setAdults} 
                  onKidsChange={setKids} 
                  max={property?.max_guests} 
                />
                
                <Button 
                  onClick={() => navigate(`/book?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&kids=${kids}`)} 
                  fullWidth
                >
                  Book Now
                </Button>
                
                <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  No charge yet
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {!isLoading && (
        <div 
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pt-4 pb-6 px-6 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.1)] lg:hidden"
          style={{ zIndex: 2147483647 }}
        >
          <div className="flex flex-col">
            <div className="flex items-end gap-1">
              <span className="text-xl font-black text-brand-dark">${property?.base_price_per_night}</span>
              <span className="text-gray-400 font-bold text-xs mb-1">/ night</span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select dates</span>
          </div>
          <Button onClick={scrollToBookingWidget} size="sm" className="px-6 rounded-lg">
            Book Now
          </Button>
        </div>
      )}
    </main>
  );
};

export default OverviewPage;