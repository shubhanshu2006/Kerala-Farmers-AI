import { Home, Cloud, Sprout, TrendingUp, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

const navItems = [
  { icon: Home, label: "home", path: "/" },
  { icon: Cloud, label: "weather", path: "/weather" },
  { icon: Sprout, label: "crops", path: "/crops" },
  { icon: TrendingUp, label: "market", path: "/market" },
  { icon: User, label: "profile", path: "/profile" },
];

export function BottomNavigation() {
  const [location] = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link 
            key={path} 
            href={path}
            className={cn(
              "flex flex-col items-center p-3 text-muted-foreground hover:text-primary transition-colors",
              location === path && "text-primary"
            )}
            data-testid={`nav-${label}`}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs capitalize">{t(label as any)}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
