import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "gold" | "success";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: StatsCardProps) {
  const iconColors = {
    default: "text-slate-600",
    gold: "text-slate-600",
    success: "text-slate-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <Icon className={cn("h-5 w-5", iconColors[variant])} />
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm font-medium text-slate-500">{subtitle}</p>}
    </div>
  );
}
