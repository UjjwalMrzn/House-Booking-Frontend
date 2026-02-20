import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Button from '../ui/Button';

const ContactPage = () => {
  const inputStyles = "w-full bg-gray-50 border border-gray-200 focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10 rounded-xl px-5 py-3 text-sm outline-none transition-all placeholder:text-gray-400 font-medium text-brand-dark";

  return (
    <main className="pt-32 pb-20 bg-white min-h-screen px-6 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Left Side: Contact Cards (Fixed Width) */}
          <div className="w-full lg:w-80 space-y-4 shrink-0">
            <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
              <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green mb-4">
                <Phone size={20} />
              </div>
              <h3 className="text-sm font-black text-brand-dark mb-1">Call us</h3>
              <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Available 24/7</p>
              <a href="tel:+9779800000000" className="text-sm font-black hover:text-brand-green transition-colors text-brand-dark block">
                +977 980 000 0000
              </a>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
              <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green mb-4">
                <Mail size={20} />
              </div>
              <h3 className="text-sm font-black text-brand-dark mb-1">Email us</h3>
              <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Support Team</p>
              <a href="mailto:support@podamibenepal.com" className="text-sm font-black hover:text-brand-green transition-colors text-brand-dark block">
                support@podamibenepal.com
              </a>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
              <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green mb-4">
                <MapPin size={20} />
              </div>
              <h3 className="text-sm font-black text-brand-dark mb-1">Visit us</h3>
              <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Our Office</p>
              <p className="text-sm font-black text-brand-dark">Kathmandu, Nepal</p>
            </div>
          </div>

          {/* Right Side: Contact Form (Flexible but constrained) */}
          <div className="flex-1 w-full">
            <div className="bg-white border border-gray-200 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <div className="mb-8">
                <h1 className="text-2xl font-black text-brand-dark tracking-tight mb-2">Get in touch</h1>
                <p className="text-sm text-gray-400 font-medium">Fill out the form below and we'll get back to you shortly.</p>
              </div>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" placeholder="David Smith" className={inputStyles} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input type="email" placeholder="david@podamibenepal.com" className={inputStyles} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                  <input type="text" placeholder="How can we help?" className={inputStyles} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                  <textarea 
                    placeholder="Write your message here..." 
                    rows={5} 
                    className={`${inputStyles} resize-none`}
                  ></textarea>
                </div>

                <div className="pt-2">
                  <Button fullWidth className="h-14 text-sm group">
                    Send Message 
                    <Send size={16} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default ContactPage;