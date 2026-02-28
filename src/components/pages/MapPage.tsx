import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { propertyService } from "../../api/propertyService";
import { mapService } from "../../api/mapService";
import { ArrowLeft, MapPin, Map as MapIcon } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";

const MapPage = () => {
  const navigate = useNavigate();

  const { data: property, isLoading: isPropertyLoading } = useQuery({
    queryKey: ["main-property"],
    queryFn: propertyService.getMainProperty,
  });

  // FETCH DIRECTLY FROM /mainMaps/
  const { data: mapData, isLoading: isMapLoading } = useQuery({
    queryKey: ["main-map"],
    queryFn: mapService.getMainMap,
  });

  const isLoading = isPropertyLoading || isMapLoading;
  const hasValidCoordinates = mapData?.latitude && mapData?.longitude;

  return (
    <main className="pt-24 bg-white min-h-screen px-6 max-w-6xl mx-auto pb-20 animate-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-2 text-gray-400 hover:text-brand-dark font-black text-[10px] uppercase tracking-widest mb-8 transition-all"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> Back to Overview
      </button>

      <div className="mb-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton variant="text" className="h-4 w-32" />
            <Skeleton variant="text" className="h-10 w-3/4" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">
              <MapPin size={14} /> {property?.address || "Location"}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-brand-dark">Map view of {property?.title}</h1>
          </>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <div className="w-full h-[60vh] min-h-[500px] rounded-[2rem] overflow-hidden bg-[#F9F9F7] relative flex items-center justify-center">
          {isLoading ? (
            <Skeleton variant="card" className="w-full h-full rounded-[2rem]" />
          ) : hasValidCoordinates ? (
            <iframe 
              width="100%" height="100%" className="absolute inset-0" style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${mapData.latitude},${mapData.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                <MapIcon size={40} />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">Map coordinates not available</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MapPage;