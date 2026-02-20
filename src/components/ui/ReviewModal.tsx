import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { reviewService } from "../../api/reviewService";
// FIXED: Using the new universal customerService
import { customerService } from "../../api/customerService"; 
import { X } from "lucide-react";
import Button from "./Button";
import { useToast } from "./Toaster";
import StarRating from "./StarRating";
import Dropdown from "./DropDown";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
}

const MONTHS = [
  { value: "01", label: "January" }, { value: "02", label: "February" },
  { value: "03", label: "March" }, { value: "04", label: "April" },
  { value: "05", label: "May" }, { value: "06", label: "June" },
  { value: "07", label: "July" }, { value: "08", label: "August" },
  { value: "09", label: "September" }, { value: "10", label: "October" },
  { value: "11", label: "November" }, { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = String(currentYear - i);
  return { value: year, label: year };
});

const GUEST_TYPES = [
  { value: "couple", label: "Couple" }, { value: "family", label: "Family" }, 
  { value: "group", label: "Group" }, { value: "solo", label: "Solo" }
];

const ReviewModal = ({ isOpen, onClose, propertyId }: ReviewModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0, name: "", email: "", location: "", month: "", year: "", guestType: "", title: "", comments: "", phoneNumber: ""
  });

  const handleSubmit = async () => {
    if (formData.rating === 0 || !formData.title || !formData.comments || !formData.email || !formData.name) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = formData.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "Guest";

      // FIXED: Switched to centralized customerService
      const customerResponse = await customerService.createCustomer({
        firstName,
        lastName,
        email: formData.email,
        country: formData.location || "Not Specified",
        phoneNumber: formData.phoneNumber || "0000000000"
      });

      // FIXED: Using ID from axios response data
      await reviewService.createReview({
        property: Number(propertyId),
        rating: formData.rating,
        title: formData.title,
        comment: formData.comments,
        customer: customerResponse.data.id
      });

      queryClient.invalidateQueries({ queryKey: ["reviews", propertyId] });
      toast.success("Review posted successfully!");
      onClose();
      
      setFormData({
        rating: 0, name: "", email: "", location: "", month: "", year: "", guestType: "", title: "", comments: "", phoneNumber: ""
      });

    } catch (error: any) {
      console.error("Submission Error:", error);
      const backendError = error.response?.data?.non_field_errors?.[0];
      toast.error(backendError || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputStyles = "w-full bg-gray-50 border border-gray-200 focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10 rounded-xl px-5 py-3.5 text-sm outline-none transition-all placeholder:text-gray-400 font-medium text-brand-dark";

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      
      <div className={`
        bg-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10 animate-scale-up 
        max-h-[90vh] overflow-y-auto
        [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
      `}>
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors">
          <X size={24} />
        </button>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-brand-dark tracking-tight mb-2">Write a review</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Share your experience with others</p>
          </div>

          <hr className="border-gray-100" />
          
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Your Rating</label>
            <div onMouseLeave={() => setHoverRating(0)}>
              <StarRating 
                rating={hoverRating || formData.rating} 
                size={28} 
                interactive={true} 
                onHover={setHoverRating} 
                onClick={(val: number) => setFormData({...formData, rating: val})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" className={inputStyles} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="Email Address" className={inputStyles} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Phone" className={inputStyles} value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
            <input type="text" placeholder="Your Location" className={inputStyles} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Dropdown placeholder="Month of stay" options={MONTHS} value={formData.month} onChange={val => setFormData({...formData, month: val})} />
            <Dropdown placeholder="Year of stay" options={YEARS} value={formData.year} onChange={val => setFormData({...formData, year: val})} />
          </div>

          <Dropdown placeholder="Traveler type" options={GUEST_TYPES} value={formData.guestType} onChange={val => setFormData({...formData, guestType: val})} />

          <input type="text" placeholder="Review Title" className={inputStyles} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          
          <textarea placeholder="Write your review here..." rows={4} className={`${inputStyles} resize-none`} value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})}></textarea>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting} fullWidth>
              {isSubmitting ? "Posting Review..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;