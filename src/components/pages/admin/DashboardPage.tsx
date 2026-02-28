import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../../api/bookingApi';
import { DollarSign, CalendarCheck, Clock, User, ArrowRight, TrendingUp, Plus, Settings, Activity } from 'lucide-react';
import { Skeleton } from '../../ui/Skeleton';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: bookingService.getAllBookings,
  });

  // NEW: State for the dynamic revenue target
  const [targetGoal, setTargetGoal] = useState(300000);
  
  useEffect(() => {
    const savedGoal = localStorage.getItem('admin_revenue_goal');
    if (savedGoal) {
      setTargetGoal(Number(savedGoal));
    }
  }, []);

  const bookings = Array.isArray(bookingsData) 
    ? bookingsData 
    : (bookingsData?.results || []);

  const totalRevenue = bookings
    .filter((b: any) => b.status === 'confirmed')
    .reduce((sum: number, b: any) => sum + Number(b.total_price), 0);
    
  const pendingCount = bookings.filter((b: any) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b: any) => b.status === 'confirmed').length;

  const StatCard = ({ title, value, icon: Icon, colorClass, trend }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] flex flex-col gap-4 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${colorClass}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-black text-brand-green bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
            <TrendingUp size={12} strokeWidth={3} /> {trend}
          </div>
        )}
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</h4>
        {isLoading ? (
          <Skeleton variant="text" className="w-24 h-8" />
        ) : (
          <div className="text-3xl font-black text-brand-dark tracking-tight">{value}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight mb-2">Dashboard Overview</h1>
          <p className="text-sm font-bold text-gray-400">Welcome back. Here is what's happening today.</p>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white px-5 py-2.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
          <CalendarCheck size={14} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          colorClass="bg-brand-green/10 text-brand-green" 
          trend="+12%"
        />
        <StatCard 
          title="Confirmed" 
          value={confirmedCount} 
          icon={CalendarCheck} 
          colorClass="bg-indigo-50 text-indigo-500" 
          trend="+4%"
        />
        <StatCard 
          title="Pending Actions" 
          value={pendingCount} 
          icon={Clock} 
          colorClass="bg-amber-50 text-amber-500" 
        />
        <StatCard 
          title="Total Bookings" 
          value={bookings.length} 
          icon={Activity} 
          colorClass="bg-purple-50 text-purple-500" 
          trend="+8%"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Column: Recent Bookings Table */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black text-brand-dark tracking-tight">Recent Bookings</h3>
              <Link to="/admin/bookings" className="text-[10px] font-black text-brand-green uppercase tracking-widest hover:opacity-70 transition-opacity flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="p-4 flex-1">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="button" className="h-16" />)}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                     <CalendarCheck size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-brand-dark mb-1">No recent bookings</h4>
                  <p className="text-xs text-gray-400">When guests book your properties, they will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="px-6 pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Guest</th>
                        <th className="px-6 pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Property & Dates</th>
                        <th className="px-6 pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                        <th className="px-6 pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-brand-dark">
                      {bookings.slice(0, 5).map((booking: any) => (
                        <tr key={booking.id} className="group transition-colors hover:bg-gray-50/80 cursor-default">
                          <td className="p-4 px-6 rounded-l-2xl">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User size={16} />
                              </div>
                              {booking.customer_name || 'Guest'}
                            </div>
                          </td>
                          <td className="p-4 px-6">
                            <div className="flex flex-col">
                              <span>{booking.property_title}</span>
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                                {booking.check_in} — {booking.check_out}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 px-6">
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                              booking.status === 'confirmed' ? 'bg-green-50 text-brand-green border border-green-100' :
                              booking.status === 'pending' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                              'bg-red-50 text-red-500 border border-red-100'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-4 px-6 text-right rounded-r-2xl text-base">
                            ${Number(booking.total_price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="flex flex-col gap-8 h-full">
          
          {/* Quick Actions Widget */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.05)] shrink-0">
            <h3 className="text-xl font-black text-brand-dark tracking-tight mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/admin/properties" className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-brand-green hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={18} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-bold text-brand-dark">Add Property</span>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-green group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link to="/admin/settings" className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Settings size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-bold text-brand-dark">Platform Settings</span>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          {/* Premium "Monthly Target" Widget */}
          <div className="bg-brand-dark rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.2)] relative overflow-hidden group h-fit">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-brand-green/20 rounded-full blur-[50px] group-hover:bg-brand-green/30 transition-colors duration-700 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-white text-xl font-black tracking-tight mb-1">Monthly Target</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6">Revenue Goal</p>

              <div className="flex justify-between items-end mb-3">
                <span className="text-3xl font-black text-white">
                  ${totalRevenue.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-gray-500 mb-1">
                  / ${targetGoal.toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-white/10 rounded-full h-3 mb-2 overflow-hidden border border-white/5 relative">
                <div 
                  className="bg-brand-green h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                  style={{ width: `${Math.min((totalRevenue / targetGoal) * 100, 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-end mt-2">
                <span className="text-brand-green text-[10px] font-black uppercase tracking-widest">
                  {((totalRevenue / targetGoal) * 100).toFixed(1)}% Achieved
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;