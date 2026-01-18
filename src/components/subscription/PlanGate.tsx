import React from 'react';
import { useSubscription, PlanTier } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Zap, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PlanGateProps {
    children: React.ReactNode;
    feature?: string;
    minPlan?: PlanTier;
    fallback?: 'hide' | 'lock' | 'inline';
    className?: string;
}

export const PlanGate: React.FC<PlanGateProps> = ({
    children,
    feature,
    minPlan = 'Pro',
    fallback = 'lock',
    className
}) => {
    const { plan, hasFeature, loading } = useSubscription();

    if (loading) return null;

    const planHierarchy: PlanTier[] = ['Free', 'Pro', 'Premium', 'Enterprise'];
    const userPlanIndex = planHierarchy.indexOf(plan);
    const minPlanIndex = planHierarchy.indexOf(minPlan);

    const hasAccess = feature
        ? hasFeature(feature)
        : userPlanIndex >= minPlanIndex;

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback === 'hide') {
        return null;
    }

    if (fallback === 'lock') {
        return (
            <div className={cn("relative group", className)}>
                <div className="filter blur-[2px] pointer-events-none opacity-50">
                    {children}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-lg border border-dashed border-white/20 transition-all group-hover:bg-black/60">
                    <div className="bg-zinc-900/90 p-4 rounded-xl border border-zinc-800 shadow-2xl text-center max-w-[280px]">
                        <div className="flex justify-center mb-3">
                            <div className="p-2 bg-orange-500/20 rounded-full">
                                <Lock className="h-5 w-5 text-orange-500" />
                            </div>
                        </div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-tight mb-1">Premium Feature</h4>
                        <p className="text-zinc-400 text-xs mb-4">
                            Upgrade to the <span className="text-orange-400 font-bold">{minPlan}</span> plan to unlock this tool.
                        </p>
                        <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-9" asChild>
                            <Link to="/pricing">
                                <Zap className="h-3 w-3 mr-2 fill-current" />
                                Upgrade Now
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-center justify-between", className)}>
            <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-zinc-500" />
                <p className="text-xs text-zinc-400">
                    Upgrade to <span className="text-white font-medium">{minPlan}</span> to enable <span className="text-white font-medium">{feature || 'this feature'}</span>.
                </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-orange-400 hover:text-orange-500 hover:bg-orange-500/10" asChild>
                <Link to="/pricing">Upgrade</Link>
            </Button>
        </div>
    );
};
