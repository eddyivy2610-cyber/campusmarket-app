'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    List,
    CheckCircle,
    Flag,
    Users,
    Settings,
    LogOut
} from 'lucide-react';

const AdminSidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Listings', href: '/admin/listings', icon: List },
        { name: 'Seller Approvals', href: '/admin/sellers', icon: CheckCircle },
        { name: 'Reports', href: '/admin/reports', icon: Flag },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col">
            {/* Admin Profile Section */}
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    A
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">Admin User</span>
                    <span className="text-xs text-gray-400">Moderator</span>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-blue-600/10 text-blue-500'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Section */}
            <div className="p-4 border-t border-white/5">
                <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={18} />
                    Log Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
