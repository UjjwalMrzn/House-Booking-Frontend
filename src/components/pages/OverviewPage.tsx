import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const propertyId = id || '1';

  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getPropertyDetails(id || "1"),
    enabled: !!id,
  });

  useEffect(() => {
    if (error) toast.error("Connection Error");
  }, [error, toast]);

  const formatDescription = (text: string) => {
    if (!text) return null;
    return text.split('.').map((sentence, index) => 
      sentence.trim() ? (
        <span key={index} className="block mb-2">
          {sentence.trim()}.
        </span>
      ) : null
    );
  };

  return (
    <main className="pt-24 bg-white min-h-screen font-sans text-brand-dark animate-fade-in px-6 max-w-7xl mx-auto pb-20">
      <div className="grid lg:grid-cols-3 gap-16 items-start">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 space-y-16">
          <section>
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
          <section>
            <h2 className="text-2xl font-bold mb-8 tracking-tight">
              {isLoading ? (
                <Skeleton variant="text" className="w-32" />
              ) : (
                "Pictures"
              )}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {isLoading
                ? [1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton
                      key={i}
                      variant="card"
                      className="aspect-square"
                    />
                  ))
                : property?.images
                    ?.slice(0, 6)
                    .map((img: any) => (
                      <FeatureCard key={img.id} image={img.image} />
                    ))}
            </div>
          </section>

          {/* AMENITIES SECTION */}
          <section className="pt-12 border-t border-gray-100">
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
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="lg:col-span-1 sticky top-32">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-2xl shadow-gray-50 space-y-6">
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
                <Button onClick={() => navigate(`/book/${id}`)} fullWidth>
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
