import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    Compass,
    Building2,
    FileCheck,
    Users,
    FolderTree,
    Award,
    Upload,
    MessageSquare,
    Star,
    BarChart3,
    Ticket,
    MessagesSquare,
    FileText,
    HelpCircle,
    BookOpen,
    Mail,
    Shield,
    Home,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const adminNavigation = [
    { name: 'HQ Overview', href: '/admin', icon: Compass, exact: true },
    { name: 'Operators', href: '/admin/listings', icon: Building2 },
    { name: 'Claims', href: '/admin/claims', icon: FileCheck },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Badges', href: '/admin/badges', icon: Award },
    { name: 'Bulk Import', href: '/admin/import', icon: Upload },
    { name: 'Contacts', href: '/admin/leads', icon: MessageSquare },
    { name: 'Field Reports', href: '/admin/reviews', icon: Star },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Support', href: '/admin/support', icon: Ticket },
    { name: 'Chat', href: '/admin/live-chat', icon: MessagesSquare },
    { name: 'Pages', href: '/admin/pages', icon: FileText },
    { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
    { name: 'Blog', href: '/admin/blog', icon: BookOpen },
    { name: 'Messages', href: '/admin/contacts', icon: Mail },
];

export function AdminSidebar() {
    const location = useLocation();
    const { signOut } = useAuth();
    const { user } = useAuth();

    const isActive = (path: string, exact = false) => {
        return exact ? location.pathname === path : location.pathname.startsWith(path);
    };

    return (
        <div className="hidden lg:flex flex-col w-64 bg-[#0A0F1C] border-r border-white/5 h-screen sticky top-0 left-0">
            {/* HUD Logo Area */}
            <div className="p-6">
                <div className="mb-8 pl-1">
                    <div className="flex flex-col items-start w-fit">
                        <h1 className="font-display font-black text-white text-2xl tracking-tighter uppercase italic leading-none">
                            PATRIOT HQ
                        </h1>
                        <div className="h-1.5 w-full bg-blue-600 mt-1 -skew-x-12 origin-left" />
                        <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-2 font-bold w-full text-center">Super Admin</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {adminNavigation.map((item) => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all group",
                            isActive(item.href, item.exact)
                                ? "bg-blue-600/10 text-blue-500 shadow-sm border border-blue-600/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                        )}
                    >
                        <item.icon className={cn("h-4 w-4", isActive(item.href, item.exact) ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300")} />
                        {item.name}
                    </Link>
                ))}

                <div className="pt-4 mt-4 border-t border-white/5">
                    <p className="px-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Network</p>
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <Building2 className="h-4 w-4 text-gray-500" />
                        Operator Console
                    </Link>
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <Home className="h-4 w-4 text-gray-500" />
                        Public Directory
                    </Link>
                </div>
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="px-2 pb-2 text-xs text-gray-500 truncate mb-2">
                    Logged in as: <span className="text-gray-300">{user?.email}</span>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider"
                    onClick={() => signOut()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
