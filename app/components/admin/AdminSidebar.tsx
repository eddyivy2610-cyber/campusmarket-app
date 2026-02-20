'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import {
    LayoutDashboard,
    List,
    CheckCircle,
    Flag,
    Users,
    Settings,
    LogOut,
    X,
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    Sun,
    Moon
} from 'lucide-react';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const AdminSidebar = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: AdminSidebarProps) => {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false); // Added mounted state

    React.useEffect(() => { // Added useEffect
        setMounted(true);
    }, []);

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Listings', href: '/admin/listings', icon: List },
        { name: 'Seller Approvals', href: '/admin/sellers', icon: CheckCircle },
        { name: 'Reports', href: '/admin/reports', icon: Flag },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    // Smooth transition class for text elements
    const textClass = `whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0 translate-x-4' : 'w-32 opacity-100 translate-x-0 ml-3'
        }`;

    // Smooth transition class for the sidebar container
    const sidebarClass = `fixed left-0 top-0 z-50 h-screen bg-background border-r border-border flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        ${isCollapsed ? 'w-20' : 'w-64'}
    `;

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Prevent hydration mismatch by rendering a placeholder or null until mounted
    const renderThemeIcon = () => {
        if (!mounted) return <Sun size={18} className="shrink-0 opacity-0" />; // Invisible placeholder
        return theme === 'dark' ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />;
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={sidebarClass}>
                {/* Admin Profile Section */}
                <div className={`border-b border-border flex items-center ${isCollapsed ? 'justify-center p-4' : 'p-6'} gap-0 transition-all duration-300 overflow-hidden`}>
                    <div className="h-10 w-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20 transition-transform duration-300 hover:scale-105">
                        A
                    </div>
                    <div className={`flex flex-col justify-center ${textClass}`}>
                        <span className="text-sm font-medium text-foreground leading-tight">Admin User</span>
                        <span className="text-xs text-muted-foreground">Moderator</span>
                    </div>

                    {/* Close Button (Mobile Only) */}
                    <button
                        onClick={onClose}
                        className="md:hidden ml-auto p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={20} />
                    </button>
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
                                onClick={() => onClose()}
                                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${isActive
                                    ? 'bg-blue-600/10 text-blue-500'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Icon size={18} className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-blue-500' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                <span className={textClass.replace('ml-3', 'ml-3')}>
                                    {item.name}
                                </span>

                                {/* Hover Tooltip for Collapsed State */}
                                {isCollapsed && (
                                    <div className="absolute left-14 top-1.5 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[100] transition-opacity duration-200 shadow-md border border-border">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Toggle Section */}
                <div className="p-4 border-t border-border flex flex-col gap-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`hidden md:flex items-center px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors group relative ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        {renderThemeIcon()}
                        <span className={textClass}>
                            {mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </span>

                        {/* Tooltip */}
                        {isCollapsed && (
                            <div className="absolute left-14 top-1.5 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[100] transition-opacity duration-200 shadow-md border border-border">
                                {mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </div>
                        )}
                    </button>

                    {/* Collapse Toggle (Desktop Only) */}
                    <button
                        onClick={onToggleCollapse}
                        className={`hidden md:flex items-center px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors group relative ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        {isCollapsed ? <PanelLeftOpen size={18} className="shrink-0" /> : <PanelLeftClose size={18} className="shrink-0" />}
                        <span className={textClass}>
                            Collapse
                        </span>

                        {/* Tooltip */}
                        {isCollapsed && (
                            <div className="absolute left-14 top-1.5 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[100] transition-opacity duration-200 shadow-md border border-border">
                                Expand
                            </div>
                        )}
                    </button>

                    <button className={`flex items-center px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors group relative ${isCollapsed ? 'justify-center' : ''}`}>
                        <LogOut size={18} className="shrink-0" />
                        <span className={textClass}>
                            Log Out
                        </span>

                        {/* Tooltip */}
                        {isCollapsed && (
                            <div className="absolute left-14 top-1.5 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[100] transition-opacity duration-200 shadow-md border border-border">
                                Log Out
                            </div>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
