import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: 'primary' | 'accent' | 'gold' | 'success';
}

const accentColors = {
  primary: 'border-l-primary bg-primary/5',
  accent: 'border-l-accent bg-accent/5',
  gold: 'border-l-amber-500 bg-amber-500/5',
  success: 'border-l-green-600 bg-green-600/5',
};

const iconColors = {
  primary: 'text-primary',
  accent: 'text-accent',
  gold: 'text-amber-500',
  success: 'text-green-600',
};

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  accentColor = 'primary' 
}: StatsCardProps) {
  return (
    <div className={cn(
      "relative bg-card rounded-lg border border-border p-5 transition-all duration-300 hover:shadow-lg border-l-4",
      accentColors[accentColor]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            {title}
          </p>
          <p className="text-3xl font-display font-bold text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-500"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs last week
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg bg-card border border-border", iconColors[accentColor])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
