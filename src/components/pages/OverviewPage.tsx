import { useEffect, useState, useMemo } from "react";
// FIXED: Added useSearchParams to grab data from the Hero redirect
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { propertyService } from "../../api/propertyService";
import { getIcon } from "../../utils/iconMap";
import FeatureCard from "../ui/FeatureCard";
import DatePicker from "../ui/DatePicker";
import GuestSelector from "../ui/GuestSelector";
import Button from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { useToast } from "../ui/Toaster";
import { format } from "date-fns";
import { Users, Bed, Bath, MapPin, Info } from "lucide-react";

const OverviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  // FIXED: Access search parameters (?checkIn=...&guests=...)
  const [searchParams] = useSearchParams();

  // SINGLE SOURCE OF TRUTH ID Logic
  const DEFAULT_ID = import.meta.env.VITE_DEFAULT_PROPERTY_ID || "1";

  // FIXED: Initialize state with URL data if it exists, otherwise use defaults
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || "");
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || "");
  const [guests, setGuests] = useState(() => {
    const guestsFromUrl = searchParams.get('guests');
    return guestsFromUrl ? parseInt(guestsFromUrl) : 1;
  });
  
  const [activeTab, setActiveTab] = useState("description");
  const [hasShownError, setHasShownError] = useState(false);

  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property", id],
    // FIXED: Uses the dynamic environment fallback instead of hardcoded "1"
    queryFn: () => propertyService.getPropertyDetails(id || DEFAULT_ID),
    enabled: !!id || !!DEFAULT_ID,
  });

  // FIXED: Loop-guarded error notification
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
    const handleScroll = () => {
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      if (isBottom && tabs.length > 0) {
        setActiveTab(tabs[tabs.length - 1].id);
        return;
      }

      const scrollPosition = window.scrollY + 150; 
      for (let i = tabs.length - 1; i >= 0; i--) {
        const section = document.getElementById(tabs[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(tabs[i].id);
          break;
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
      const y = element.getBoundingClientRect().top + window.scrollY - 120; 
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <main className="pt-24 bg-white min-h-screen font-sans text-brand-dark animate-fade-in px-6 max-w-7xl mx-auto pb-20">
      <div className="grid lg:grid-cols-3 gap-16 items-start">
        
        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* THE DYNAMIC STICKY BAR */}
          {!isLoading && (
            <div className="flex items-center gap-8 border-b border-gray-200 sticky top-[80px] bg-white z-40 pt-4 mb-12">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`pb-4 text-[15px] font-bold transition-all border-b-[3px] -mb-[1.5px] ${
                    activeTab === tab.id
                      ? "border-brand-green text-brand-dark"
                      : "border-transparent text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* DESCRIPTION SECTION */}
          <section id="description">
            <div className="flex items-center gap-2 mb-4">
              {isLoading ? (
                <Skeleton variant="text" className="w-32" />
              ) : (
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  <MapPin size={14} /> {property?.address}
                </div>
              )}
            </div>

            <h1 className="text-4xl font-extrabold mb-6 tracking-tight">
              {isLoading ? (
                <Skeleton variant="text" className="h-12 w-3/4" />
              ) : (
                property?.title
              )}
            </h1>

            <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-gray-100">
              {isLoading ? (
                <>
                  <Skeleton variant="text" className="w-24" />
                  <Skeleton variant="text" className="w-24" />
                  <Skeleton variant="text" className="w-24" />
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                    <Users size={18} className="text-brand-green" />{" "}
                    {property?.max_guests} Guests
                  </span>
                  <span className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                    <Bed size={18} className="text-brand-green" />{" "}
                    {property?.bedrooms} Bedrooms
                  </span>
                  <span className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                    <Bath size={18} className="text-brand-green" />{" "}
                    {property?.bathroom} Bathrooms
                  </span>
                </>
              )}
            </div>

            <div className="text-lg text-gray-600 leading-relaxed">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" className="w-2/3" />
                </div>
              ) : (
                property?.description
              )}
            </div>
          </section>

          {/* PICTURES SECTION */}
          <section id="pictures">
            <h2 className="text-2xl font-bold mb-8 tracking-tight">
              {isLoading ? <Skeleton variant="text" className="w-32" /> : "Pictures"}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {isLoading
                ? [1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} variant="card" className="aspect-square" />
                  ))
                : property?.images?.slice(0, 6).map((img: any, index: number) => (
                    <FeatureCard 
                      key={img.id} 
                      image={img.image} 
                      noZoom={true} 
                      className="cursor-pointer"
                      onClick={() => navigate(`/gallery/${id || DEFAULT_ID}`, { state: { imageIndex: index } })}
                    />
                  ))}
            </div>

            {!isLoading && property?.images?.length > 6 && (
              <div className="mt-8">
                <button 
                  onClick={() => navigate(`/gallery/${id || DEFAULT_ID}`)}
                  className="text-brand-green font-black text-xs uppercase tracking-widest hover:opacity-70 transition-opacity flex items-center gap-1"
                >
                  Explore all pictures
                </button>
              </div>
            )}
          </section>

          {/* AMENITIES SECTION */}
          <section id="amenities" className="pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold mb-8 tracking-tight">
              {isLoading ? <Skeleton variant="text" className="w-32" /> : "Amenities"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading
                ? [1, 2, 3, 4].map((i) => <Skeleton key={i} variant="input" />)
                : property?.amenities?.map((amenity: any, index: number) => (
                    <FeatureCard
                      key={index}
                      icon={getIcon(amenity.icon) || <Info size={20} />}
                      title={amenity.name}
                      description={amenity.description}
                    />
                  ))}
            </div>
          </section>

          {/* POLICIES SECTION */}
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
                    {property?.checkInOutRules?.map((rule: any, idx: number) => (
                      <div key={`rule-${idx}`} className="space-y-2">
                        <h4 className="font-bold text-gray-900">House Rules</h4>
                        <div className="text-sm text-gray-500 flex flex-col gap-1">
                          <span>Check-in: {rule.check_in}</span>
                          <span>Check-out: {rule.check_out}</span>
                        </div>
                      </div>
                    ))}
                    
                    {property?.policies?.map((policy: any, index: number) => (
                      <div key={`policy-${index}`} className="space-y-2">
                        <h4 className="font-bold text-gray-900">{policy.name}</h4>
                        <div className="text-sm text-gray-500 leading-relaxed">
                          {policy.description
                            ?.split('.')
                            .filter((sentence: string) => sentence.trim().length > 0)
                            .map((sentence: string, i: number) => (
                              <span key={i} className="block mb-2">
                                {sentence.trim()}.
                              </span>
                            ))
                          }
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="lg:col-span-1 sticky top-32">
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
                  <span className="text-3xl font-black text-brand-dark">
                    ${property?.base_price_per_night}
                  </span>
                  <span className="text-gray-400 font-bold text-sm mb-1">
                    / night
                  </span>
                </div>
                <DatePicker
                  value={{ checkIn, checkOut }}
                  onChange={(range: any) => {
                    setCheckIn(
                      range?.from ? format(range.from, "yyyy-MM-dd") : "",
                    );
                    setCheckOut(
                      range?.to ? format(range.to, "yyyy-MM-dd") : "",
                    );
                  }}
                />
                <GuestSelector value={guests} onChange={setGuests} />
                
                {/* FIXED: Query parameters added so data carries over to ReservationPage */}
                <Button 
                  onClick={() => navigate(`/book/${id || DEFAULT_ID}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)} 
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
    </main>
  );
};

export default OverviewPage;