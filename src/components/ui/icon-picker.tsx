import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    Search,
    Truck,
    Tractor,
    Weight,
    Trash2,
    Wrench,
    Flame,
    Headphones,
    Anchor,
    Briefcase,
    Bus,
    Car,
    Container,
    Fan,
    Folder,
    Hammer,
    HardHat,
    Home,
    MapPin,
    Navigation,
    Package,
    Phone,
    Settings,
    Ship,
    ShoppingBag,
    Snowflake,
    Timer,
    User,
    Users,
    Zap
} from 'lucide-react';

const ICONS = {
    Truck,
    Tractor,
    Weight,
    Trash2,
    Wrench,
    Flame,
    Headphones,
    Anchor,
    Briefcase,
    Bus,
    Car,
    Container,
    Fan,
    Folder,
    Hammer,
    HardHat,
    Home,
    MapPin,
    Navigation,
    Package,
    Phone,
    Settings,
    Ship,
    ShoppingBag,
    Snowflake,
    Timer,
    // Tool, - Not in this version of lucide-react
    // Trailer: Truck, - Handled below
    User,
    Users,
    Zap
};

// Add fallback manually for missing keys if needed, or just remove them from the list
// We will just use the available ones.
const AVAILABLE_ICONS = { ...ICONS, Trailer: Truck, Tool: Wrench };

interface IconPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredIcons = Object.entries(AVAILABLE_ICONS).filter(([name]) =>
        name.toLowerCase().includes(search.toLowerCase())
    );

    const SelectedIcon = AVAILABLE_ICONS[value as keyof typeof AVAILABLE_ICONS] || Folder;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 h-10 px-3 font-normal">
                    <SelectedIcon className="h-4 w-4" />
                    <span>{value || 'Select icon...'}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search icons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-xs"
                        />
                    </div>
                    <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pt-1">
                        {filteredIcons.map(([name, Icon]) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => {
                                    onChange(name);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors",
                                    value === name && "bg-primary/10 text-primary"
                                )}
                                title={name}
                            >
                                <Icon className="h-5 w-5" />
                            </button>
                        ))}
                        {filteredIcons.length === 0 && (
                            <div className="col-span-5 text-center py-4 text-xs text-muted-foreground">
                                No icons found
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
