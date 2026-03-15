import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "../../../api/customerService";
import { Users, Mail, Phone, MapPin, Calendar, ArrowUpDown, ChevronUp, ChevronDown, Eye } from "lucide-react";
import TableToolbar from "../../ui/TableToolbar";
import { Skeleton } from "../../ui/Skeleton";
import FormModal from "../../ui/FormModal";
import AdminPageContainer from "../../layouts/AdminPageContainer";

type SortConfig = { key: string; direction: "asc" | "desc" } | null;

const ACTION_OPTIONS = [
  { value: "all", label: "All Sources" },
  { value: "booking", label: "Bookings" },
  { value: "review", label: "Reviews" },
];

const AdminCustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const [viewModal, setViewModal] = useState<{ isOpen: boolean; customer: any | null }>({ isOpen: false, customer: null });

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["admin-customers", page, Number(pageSize), actionFilter],
    queryFn: () => customerService.getCustomers(page, Number(pageSize), actionFilter),
  });

  const customers = useMemo(() => {
    if (!paginatedData) return [];
    return Array.isArray(paginatedData) ? paginatedData : paginatedData.results || [];
  }, [paginatedData]);

  const totalCount = paginatedData?.count || customers.length;

  const processedCustomers = useMemo(() => {
    let result = [...customers];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (c: any) =>
          (c.firstName || "").toLowerCase().includes(lowerSearch) ||
          (c.lastName || "").toLowerCase().includes(lowerSearch) ||
          (c.email || "").toLowerCase().includes(lowerSearch) ||
          String(c.id).includes(lowerSearch)
      );
    }
    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === "id") {
          aValue = Number(aValue); bValue = Number(bValue);
        } else {
          aValue = String(aValue || "").toLowerCase(); bValue = String(bValue || "").toLowerCase();
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [customers, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={12} className="text-brand-green" /> : <ChevronDown size={12} className="text-brand-green" />;
  };

  return (
    <>
      <AdminPageContainer
        title="Customer Database"
        subtitle="View and filter people who booked or left reviews."
        icon={<Users size={32} />}
        headerAction={
          <span className="hidden xs:inline-block text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white shadow-sm px-2.5 py-1 rounded-md border border-gray-100">
            {totalCount} Total
          </span>
        }
      >
        <TableToolbar
          searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchPlaceholder="Search ID, name, or email..."
          filterOptions={ACTION_OPTIONS} activeFilter={actionFilter} setActiveFilter={setActionFilter}
          page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} hasNextPage={!!paginatedData?.next}
        />

        <div className="overflow-x-auto scrollbar-hide rounded-b-[2rem]">
          <table className="w-full text-left border-separate border-spacing-y-2 min-w-full lg:min-w-[950px] px-2 md:px-4">
            <thead>
              <tr>
                {/* SURGICAL FIX: Added S.N. Header */}
                <th className="py-2 px-4 text-[9px] font-black uppercase tracking-widest text-gray-400 w-12">S.N.</th>
                <th className="py-2 px-4"><button onClick={() => handleSort("id")} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Customer ID {renderSortIcon("id")}</button></th>
                <th className="py-2 px-4"><button onClick={() => handleSort("firstName")} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Guest Name {renderSortIcon("firstName")}</button></th>
                <th className="hidden sm:table-cell py-2 px-4"><button onClick={() => handleSort("email")} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Contact Info {renderSortIcon("email")}</button></th>
                <th className="hidden md:table-cell py-2 px-4"><button onClick={() => handleSort("country")} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Location {renderSortIcon("country")}</button></th>
                
                {/* FIXED: Restored the "Source" title text that was accidentally deleted */}
                <th className="py-2 px-4"><button onClick={() => handleSort("action")} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Source {renderSortIcon("action")}</button></th>
                
                <th className="hidden lg:table-cell py-2 px-4"><button onClick={() => handleSort("createdAt")} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Joined Date {renderSortIcon("createdAt")}</button></th>
                <th className="py-2 px-4 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-brand-dark">
              {isLoading ? (
                /* SURGICAL FIX: Changed colSpan from 7 to 8 to match new column count */
                <tr><td colSpan={8} className="py-12 px-4"><div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} variant="button" className="h-14" />)}</div></td></tr>
              ) : processedCustomers.length === 0 ? (
                /* SURGICAL FIX: Changed colSpan from 7 to 8 to match new column count */
                <tr><td colSpan={8} className="py-12 text-center text-sm font-bold text-gray-400">No customers found.</td></tr>
              ) : (
                processedCustomers.map((customer: any, index: number) => {
                  /* SURGICAL FIX: Calculate continuous serial number */
                  const serialNumber = (page - 1) * Number(pageSize) + index + 1;
                  return (
                    <tr key={customer.id} className="bg-white hover:bg-gray-50/50 transition-colors group">
                      {/* SURGICAL FIX: Added S.N. Cell and shifted rounded-l-2xl here */}
                      <td className="py-4 px-4 rounded-l-2xl whitespace-nowrap text-sm font-bold text-gray-500">{serialNumber}</td>
                      <td className="py-4 px-4 md:rounded-none whitespace-nowrap"><div className="font-mono text-[10px] md:text-xs font-bold text-brand-dark bg-gray-100 px-2 py-1 rounded-md w-fit">#{customer.id}</div></td>
                      
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-black text-brand-dark text-sm truncate max-w-[150px]">{customer.firstName} {customer.lastName}</div>
                        <div className="sm:hidden text-[10px] font-medium text-gray-500 mt-0.5 truncate max-w-[150px]">{customer.email}</div>
                      </td>

                      <td className="hidden sm:table-cell py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-xs text-gray-500"><Mail size={12} className="text-amber-400"/> {customer.email}</span>
                          {customer.phoneNumber && customer.phoneNumber !== "0000000000" && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-500"><Phone size={12} className="text-brand-green"/> {customer.phoneNumber}</span>
                          )}
                        </div>
                      </td>

                      <td className="hidden md:table-cell py-4 px-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin size={12} className="text-indigo-400"/> {customer.country || "Unknown"}</span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          customer.action === 'booking' ? 'bg-blue-50 text-blue-500 border border-blue-100' : 
                          customer.action === 'review' ? 'bg-purple-50 text-purple-500 border border-purple-100' : 
                          'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                          {customer.action || "Unknown"}
                        </span>
                      </td>

                      <td className="hidden lg:table-cell py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-brand-dark text-sm flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right rounded-r-2xl">
                        <button 
                          onClick={() => setViewModal({ isOpen: true, customer })} 
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-brand-green/10 hover:text-brand-green hover:border-brand-green/30 transition-all shadow-sm"
                          title="View Profile"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminPageContainer>

      <FormModal 
        isOpen={viewModal.isOpen} 
        onClose={() => setViewModal({ isOpen: false, customer: null })} 
        title="Customer Profile"
      >
        {viewModal.customer && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">CUSTOMER ID</p>
                <p className="text-xl font-black text-brand-dark mt-1">#{viewModal.customer.id}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                viewModal.customer.action === 'booking' ? 'bg-blue-50 text-blue-500 border border-blue-100' : 
                viewModal.customer.action === 'review' ? 'bg-purple-50 text-purple-500 border border-purple-100' : 
                'bg-gray-100 text-gray-500 border border-gray-200'
              }`}>
                {viewModal.customer.action || "Unknown"}
              </span>
            </div>

            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Full Name</p>
                <p className="text-sm font-black text-brand-dark">{viewModal.customer.firstName} {viewModal.customer.lastName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email Address</p>
                <p className="text-sm font-medium text-brand-dark break-all">{viewModal.customer.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Phone Number</p>
                <p className="text-sm font-medium text-brand-dark">{viewModal.customer.phoneNumber && viewModal.customer.phoneNumber !== "0000000000" ? viewModal.customer.phoneNumber : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Location</p>
                <p className="text-sm font-medium text-brand-dark">{viewModal.customer.country || 'Unknown'}</p>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-gray-200">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Joined Date</p>
                <p className="text-sm font-medium text-brand-dark flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  {viewModal.customer.createdAt ? new Date(viewModal.customer.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </>
  );
};

export default AdminCustomersPage;