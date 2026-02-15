import React from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
            <AdminSidebar />
            <main className="flex-1 ml-64 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
