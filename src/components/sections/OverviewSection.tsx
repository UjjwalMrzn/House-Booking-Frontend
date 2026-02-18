import SectionHeader from '../ui/SectionHeader';
import FeatureCard from '../ui/FeatureCard';

const OverviewSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-32">
      <div className="grid md:grid-cols-2 gap-20 items-center">
        
        {/* Content Side */}
        <div className="space-y-10">
          <SectionHeader 
            subcite="The Haven Experience"
            title={
              <>
                Escape to the <br />
                <span className="italic text-slate-400 font-serif font-medium">British Countryside</span>
              </>
            }
            description="Cozy holiday cottage tucked deep in the British countryside. Dating back to the 18th Century, this detached cottage is situated in the tranquil village of Cirencester. A short walk to the center of the village with a fast train to central London."
          />
          
          <div className="pt-4">
            <button className="group flex items-center gap-3 font-bold text-brand-dark hover:text-brand-green transition-all">
              <span className="border-b-2 border-brand-green/20 group-hover:border-brand-green pb-1 transition-all">
                Explore the History
              </span>
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-all group-hover:translate-x-1">
                →
              </div>
            </button>
          </div>
        </div>

        {/* Visual Grid Side */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-6">
            <FeatureCard 
              image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop" 
              className="mt-12"
            />
            <FeatureCard 
              image="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop" 
              className="mb-12"
            />
          </div>
          {/* Squad-level decorative glow */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
        </div>

      </div>
    </section>
  );
};

export default OverviewSection;