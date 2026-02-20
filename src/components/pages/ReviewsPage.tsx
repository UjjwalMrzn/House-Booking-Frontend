import { useState } from "react";
// FIXED: Changed "react-dom" to "react-router-dom"
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { propertyService } from "../../api/propertyService";
import { reviewService } from "../../api/reviewService";
import { ArrowLeft } from "lucide-react";
import Button from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import StarRating from "../ui/StarRating";
import ReviewModal from "../ui/ReviewModal";

const ReviewsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: property, isLoading: isPropLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getPropertyDetails(id || "1"),
    enabled: !!id,
  });

  const { data: reviews, isLoading: isRevLoading } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => reviewService.getReviewsByProperty(id || "1"),
    enabled: !!id,
  });

  const isLoading = isPropLoading || isRevLoading;

  return (
    <main className="pt-24 bg-white min-h-screen px-6 max-w-5xl mx-auto pb-20 animate-fade-in relative">
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-2 text-gray-400 hover:text-brand-dark font-black text-[10px] uppercase tracking-widest mb-12 transition-all"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> 
        Back to Overview
      </button>

      <div className="mb-12">
        <h1 className="text-3xl font-black tracking-tight text-brand-dark mb-6">Reviews</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-600">{property?.average_rating?.toFixed(1) || "0.0"}</span>
            <StarRating rating={Math.round(property?.average_rating || 0)} size={16} />
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Add a review</Button>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          [1, 2].map(i => <Skeleton key={i} variant="card" className="h-48" />)
        ) : reviews?.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold">No reviews yet. Be the first!</div>
        ) : (
          reviews?.map((review: any) => (
            <div key={review.id} className="bg-white rounded-3xl p-8 md:p-10 border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {review.customer_name || "Guest"}
                </span>
                <StarRating rating={review.rating} size={12} />
              </div>
              <h3 className="text-xl font-black text-brand-dark mb-3">{review.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">{review.comment}</p>
              <div className="text-[10px] font-bold text-gray-400 text-right">
                Stayed on {new Date(review.createdAt).toISOString().split('T')[0]}
              </div>
            </div>
          ))
        )}
      </div>

      <ReviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        propertyId={id || "1"} 
      />
    </main>
  );
};

export default ReviewsPage;