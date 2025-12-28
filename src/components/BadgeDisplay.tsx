import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ShieldCheck,
  Medal,
  Star,
  Zap,
  Shield,
  Truck,
  Flag,
  Award,
  LucideIcon,
} from "lucide-react";

interface BadgeDefinition {
  badge_key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface OperatorBadge {
  badge_key: string;
  badge_definitions: BadgeDefinition;
}

interface BadgeDisplayProps {
  listingId: string;
  size?: "sm" | "md" | "lg";
  maxDisplay?: number;
  showTooltips?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  medal: Medal,
  star: Star,
  zap: Zap,
  shield: Shield,
  truck: Truck,
  flag: Flag,
  award: Award,
};

const colorMap: Record<string, string> = {
  green: "text-green-500 bg-green-500/10",
  blue: "text-blue-500 bg-blue-500/10",
  yellow: "text-yellow-500 bg-yellow-500/10",
  orange: "text-orange-500 bg-orange-500/10",
  purple: "text-purple-500 bg-purple-500/10",
  primary: "text-primary bg-primary/10",
  red: "text-red-500 bg-red-500/10",
  gold: "text-amber-500 bg-amber-500/10",
};

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const containerSizeMap = {
  sm: "p-1",
  md: "p-1.5",
  lg: "p-2",
};

export const BadgeDisplay = ({
  listingId,
  size = "md",
  maxDisplay = 5,
  showTooltips = true,
}: BadgeDisplayProps) => {
  const [badges, setBadges] = useState<OperatorBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!listingId) return;

      const { data, error } = await supabase
        .from("operator_badges")
        .select(`
          badge_key,
          badge_definitions (
            badge_key,
            name,
            description,
            icon,
            color
          )
        `)
        .eq("listing_id", listingId)
        .eq("is_active", true);

      if (!error && data) {
        setBadges(data as unknown as OperatorBadge[]);
      }
      setLoading(false);
    };

    fetchBadges();
  }, [listingId]);

  if (loading || badges.length === 0) return null;

  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  const renderBadge = (badge: OperatorBadge, index: number) => {
    const def = badge.badge_definitions;
    const Icon = iconMap[def.icon] || Shield;
    const colorClass = colorMap[def.color] || colorMap.primary;

    const badgeElement = (
      <div
        key={index}
        className={`rounded-full ${containerSizeMap[size]} ${colorClass} flex items-center justify-center`}
      >
        <Icon className={sizeMap[size]} />
      </div>
    );

    if (!showTooltips) return badgeElement;

    return (
      <Tooltip key={index}>
        <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold">{def.name}</p>
          <p className="text-xs text-muted-foreground">{def.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {displayBadges.map((badge, index) => renderBadge(badge, index))}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`rounded-full ${containerSizeMap[size]} bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium`}
              >
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{remainingCount} more badges</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

// Static badge component for displaying a single badge by key
interface StaticBadgeProps {
  badgeKey: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const StaticBadge = ({
  badgeKey,
  size = "md",
  showLabel = false,
}: StaticBadgeProps) => {
  const [badge, setBadge] = useState<BadgeDefinition | null>(null);

  useEffect(() => {
    const fetchBadge = async () => {
      const { data } = await supabase
        .from("badge_definitions")
        .select("*")
        .eq("badge_key", badgeKey)
        .single();

      if (data) {
        setBadge(data as BadgeDefinition);
      }
    };

    fetchBadge();
  }, [badgeKey]);

  if (!badge) return null;

  const Icon = iconMap[badge.icon] || Shield;
  const colorClass = colorMap[badge.color] || colorMap.primary;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${showLabel ? "" : ""}`}>
            <div
              className={`rounded-full ${containerSizeMap[size]} ${colorClass} flex items-center justify-center`}
            >
              <Icon className={sizeMap[size]} />
            </div>
            {showLabel && (
              <span className="text-sm font-medium text-foreground">
                {badge.name}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold">{badge.name}</p>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BadgeDisplay;
