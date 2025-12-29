import { Link } from 'react-router-dom';
import { Plus, Send, Link as LinkIcon, Star, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    title: 'Add Rig',
    description: 'Add new equipment to your fleet',
    icon: Plus,
    href: '/dashboard/listing',
    color: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  },
  {
    title: 'Request Review',
    description: 'Send field report request',
    icon: Send,
    href: '/dashboard/reviews',
    color: 'bg-accent hover:bg-accent/90 text-accent-foreground',
  },
  {
    title: 'Trigger Link',
    description: 'Create trackable link',
    icon: LinkIcon,
    href: '/dashboard/trigger-links',
    color: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
  },
];

const secondaryActions = [
  { title: 'View Field Reports', icon: Star, href: '/dashboard/reviews' },
  { title: 'Edit Business Profile', icon: FileText, href: '/dashboard/business-info' },
  { title: 'Account Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function QuickActions() {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4">
        Quick Actions
      </h3>
      
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            to={action.href}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group",
              action.color
            )}
          >
            <action.icon className="w-5 h-5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{action.title}</p>
              <p className="text-xs opacity-80">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border space-y-1">
        {secondaryActions.map((action) => (
          <Link
            key={action.title}
            to={action.href}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
          >
            <action.icon className="w-4 h-4" />
            {action.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
