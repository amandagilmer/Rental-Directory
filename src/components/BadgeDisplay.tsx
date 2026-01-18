import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  size?: "xs" | "sm" | "md" | "lg";
  maxDisplay?: number;
  showTooltips?: boolean;
}

const sizeMap = {
  xs: "h-8 w-8",
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20",
  xl: "h-32 w-32",
  "2xl": "h-40 w-40",
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

    const badgeElement = (
      <div
        key={index}
        className="relative group/badge flex-shrink-0 bg-white rounded-full overflow-hidden border border-black/5 shadow-sm badge-glisten-container badge-glisten-perpetual"
      >
        <img
          src={def.icon}
          alt={def.name}
          className={`${sizeMap[size]} object-cover mix-blend-multiply scale-100 transition-all duration-300 group-hover/badge:scale-110`}
        />
      </div>
    );

    if (!showTooltips) return badgeElement;

    return (
      <Tooltip key={index}>
        <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3">
          <p className="font-bold text-base mb-1">{def.name}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{def.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {displayBadges.map((badge, index) => renderBadge(badge, index))}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`h-8 w-8 text-white/40 flex items-center justify-center text-[10px] font-black font-display cursor-help hover:text-white/60 transition-colors`}
              >
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{remainingCount} more badges earned</p>
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
  size?: "xs" | "sm" | "md" | "lg";
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
        .maybeSingle();

      if (data) {
        setBadge(data as BadgeDefinition);
      }
    };

    fetchBadge();
  }, [badgeKey]);

  if (!badge) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-3`}>
            <div
              className={`flex items-center justify-center transition-all duration-300 hover:scale-110 group/static`}
            >
              <img
                src={badge.icon}
                alt={badge.name}
                className={`${sizeMap[size]} object-contain drop-shadow-[0_4px_20px_rgba(255,255,255,0.1)] group-hover/static:drop-shadow-[0_8px_30px_rgba(255,255,255,0.2)]`}
              />
            </div>
            {showLabel && (
              <span className="text-base font-bold text-white uppercase italic tracking-tight font-display drop-shadow-md">
                {badge.name}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3">
          <p className="font-bold text-base mb-1">{badge.name}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BadgeDisplay;
