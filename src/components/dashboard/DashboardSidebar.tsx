import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Truck,
    Building2,
    Settings,
    LogOut,
    Shield,
    Home,
    MessageSquare,
    BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';

const sidebarItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'My Fleet', href: '/dashboard/listing', icon: Truck },
    { name: 'Messages', href: '/dashboard/leads', icon: MessageSquare },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Business Info', href: '/dashboard/business-info', icon: Building2 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
    const location = useLocation();
    const { signOut } = useAuth();
    const { isAdmin } = useAdminCheck();

    const isActive = (path: string, exact = false) => {
        return exact ? location.pathname === path : location.pathname.startsWith(path);
    };

    return (
        <div className="hidden md:flex flex-col w-64 bg-[#0A0F1C] border-r border-white/5 h-screen sticky top-0 left-0">
            {/* Logo Area */}
            <div className="p-6">
                <div className="mb-8 pl-1">
                    <div className="flex flex-col items-start w-fit">
                        <h1 className="font-display font-black text-white text-2xl tracking-tighter uppercase italic leading-none">
                            PATRIOT HAULS
                        </h1>
                        <div className="h-1.5 w-full bg-red-600 mt-1 -skew-x-12 origin-left" />
                        <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-2 font-bold w-full text-center">Command Center</span>
                    </div>
                </div>
                <Link to="/dashboard/listing">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
                        <Truck className="mr-2 h-4 w-4" /> LIST NEW ASSET
                    </Button>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                            isActive(item.href, item.exact)
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", isActive(item.href, item.exact) ? "text-primary" : "text-gray-500 group-hover:text-gray-300")} />
                        {item.name}
                    </Link>
                ))}

                <div className="pt-4 mt-4 border-t border-white/5">
                    <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">System</p>
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <Shield className="h-5 w-5 text-indigo-500" />
                            HQ Admin
                        </Link>
                    )}
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <Home className="h-5 w-5 text-gray-500" />
                        Public Site
                    </Link>
                </div>
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
                    onClick={() => signOut()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
