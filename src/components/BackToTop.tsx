import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 400px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div 
      className={`fixed bottom-8 right-8 z-[90] transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        className="w-12 h-12 bg-brand-green text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200/50 hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Back to top"
      >
        <ChevronUp 
          size={24} 
          className="transition-transform duration-300 group-hover:-translate-y-1" 
          strokeWidth={3} 
        />
      </button>
    </div>
  );
};

export default BackToTop;