import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    // FIXED: Replaced yellowish #FCFBF9 with a crisp, pure bg-gray-50
    <div className="min-h-screen bg-gray-50 flex font-sans animate-entrance">
      <AdminSidebar />

      <main className="flex-1 lg:pl-80 p-6 lg:p-10 min-h-screen flex flex-col overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;