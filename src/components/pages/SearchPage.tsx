// import { useSearchParams } from 'react-router-dom';
// import PropertyCard from '../ui/PropertyCard';

// const SearchPage = () => {
//   const [searchParams] = useSearchParams();
//   const guests = searchParams.get('guests') || '1';

//   // This would eventually come from your propertyService
//   const properties = [
//     { id: 1, title: "Heritage Alpine Cottage", location: "Kathmandu", price: 120, rating: 4.8, guests: 4, image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233" },
//     { id: 2, title: "Modern Glass Villa", location: "Pokhara", price: 350, rating: 5.0, guests: 6, image: "https://images.unsplash.com/photo-1449156001103-f2419b8cc3a8" },
//     // ... more results
//   ];

//   return (
//     <main className="pt-32 pb-20 bg-[#FCFBF9] min-h-screen px-6 animate-fade-in">
//       <div className="max-w-7xl mx-auto">
        
//         {/* Results Header */}
//         <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
//           <div>
//             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green mb-3">Available Stays</h4>
//             <h1 className="text-3xl font-black text-brand-dark tracking-tight">
//               Found {properties.length} results for {guests} {Number(guests) > 1 ? 'Guests' : 'Guest'}
//             </h1>
//           </div>
          
//           <div className="flex items-center gap-4">
//             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sort by:</span>
//             <select className="bg-transparent text-xs font-black text-brand-dark uppercase tracking-widest outline-none cursor-pointer">
//               <option>Price: Low to High</option>
//               <option>Price: High to Low</option>
//               <option>Highest Rated</option>
//             </select>
//           </div>
//         </div>

//         {/* Property Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {properties.map((property) => (
//             <PropertyCard key={property.id} {...property} />
//           ))}
//         </div>

//       </div>
//     </main>
//   );
// };

// export default SearchPage;