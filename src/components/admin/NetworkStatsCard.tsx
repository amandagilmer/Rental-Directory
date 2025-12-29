import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetworkStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'warning' | 'success';
}

const variants = {
  default: {
    bg: 'bg-card',
    border: 'border-border',
    icon: 'bg-muted text-muted-foreground',
  },
  primary: {
    bg: 'bg-primary/5',
    border: 'border-primary/20',
    icon: 'bg-primary text-primary-foreground',
  },
  accent: {
    bg: 'bg-accent/5',
    border: 'border-accent/20',
    icon: 'bg-accent text-accent-foreground',
  },
  warning: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    icon: 'bg-amber-500 text-white',
  },
  success: {
    bg: 'bg-green-600/5',
    border: 'border-green-600/20',
    icon: 'bg-green-600 text-white',
  },
};

export default function NetworkStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: NetworkStatsCardProps) {
  const styles = variants[variant];

  return (
    <div className={cn(
      "rounded-lg border p-5 transition-all duration-300 hover:shadow-lg",
      styles.bg,
      styles.border
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
        <div className={cn("p-3 rounded-lg", styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
