"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { CircleHelp, X } from "lucide-react";

type TipItem = {
  title: string;
  description: string;
  controls: string[];
};

const DASHBOARD_TIPS: Record<string, TipItem> = {
  "/dashboard": {
    title: "Overview dashboard",
    description: "Track your store health from one place before diving into detailed pages.",
    controls: [
      "Stat cards summarize revenue, orders, disputes, and conversion at a glance.",
      "Charts show sales and dispute trends so you can spot changes quickly.",
      "Top products and distribution sections help prioritize inventory and delivery focus."
    ]
  },
  "/dashboard/products": {
    title: "Products controls",
    description: "Manage inventory and listing performance from the products table.",
    controls: [
      "Use search and filters to find listings by status, category, or stock.",
      "Row actions let you edit, pause, or promote individual products.",
      "Table columns surface views, saves, and sales signals for better decisions."
    ]
  },
  "/dashboard/orders": {
    title: "Orders workflow",
    description: "Stay on top of order progress and fulfillment tasks.",
    controls: [
      "Filter by status to focus on pending, shipped, or completed orders.",
      "Open row details to review buyer info, payment state, and shipping needs.",
      "Use bulk actions to mark updates faster when handling many orders."
    ]
  },
  "/dashboard/messages": {
    title: "Messages workspace",
    description: "Handle buyer conversations and negotiations in one thread view.",
    controls: [
      "Inbox on the left keeps unread chats and latest activity easy to scan.",
      "Thread panel shows messages, listing cards, and negotiation context.",
      "Composer actions let you send text, offers, and listing shares quickly."
    ]
  },
  "/dashboard/alerts": {
    title: "Alerts center",
    description: "Monitor market events and saved search matches in real time.",
    controls: [
      "Create Alert builds custom watch rules for products and price targets.",
      "Filter chips switch between matches, messages, sold updates, and system notices.",
      "Mark all as read to clear your queue once alerts are reviewed."
    ]
  }
};

const STORAGE_KEY = "dashboard-onboarding-dismissed-routes";

export function DashboardOnboarding() {
  const pathname = usePathname();
  const [dismissedRoutes, setDismissedRoutes] = useState<string[]>([]);
  const [manualOpenForRoute, setManualOpenForRoute] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDismissedRoutes(parsed.filter((value): value is string => typeof value === "string"));
        }
      }
    } catch (error) {
      console.error("Failed to load onboarding state", error);
    }
  }, []);

  const tip = useMemo(() => {
    const route = Object.keys(DASHBOARD_TIPS).find((item) => pathname === item || pathname.startsWith(`${item}/`));
    return route ? { route, content: DASHBOARD_TIPS[route] } : null;
  }, [pathname]);

  if (!tip) return null;

  const isDismissedForRoute = dismissedRoutes.includes(tip.route);
  const isVisible = manualOpenForRoute === tip.route || !isDismissedForRoute;

  const dismissForRoute = () => {
    if (isDismissedForRoute) {
      setManualOpenForRoute(null);
      return;
    }

    const next = [...dismissedRoutes, tip.route];
    setDismissedRoutes(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setManualOpenForRoute(null);
  };

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-8 z-50 w-[min(92vw,360px)] rounded-2xl border border-border/70 bg-background/95 backdrop-blur shadow-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Dashboard onboarding</p>
              <h2 className="text-sm font-bold mt-1">{tip.content.title}</h2>
            </div>
            <button
              onClick={dismissForRoute}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close onboarding popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">{tip.content.description}</p>

          <ul className="space-y-2">
            {tip.content.controls.map((item) => (
              <li key={item} className="text-xs leading-relaxed text-foreground/90 flex gap-2">
                <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={dismissForRoute}
            className="w-full rounded-full bg-foreground text-background py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      )}

      {!isVisible && (
        <button
          onClick={() => setManualOpenForRoute(tip.route)}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-8 z-40 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/90 backdrop-blur px-3 py-2 text-xs font-semibold text-foreground shadow-md hover:bg-secondary transition-colors"
        >
          <CircleHelp className="w-4 h-4 text-primary" />
          Show page tips
        </button>
      )}
    </>
  );
}
